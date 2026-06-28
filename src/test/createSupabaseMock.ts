/**
 * A minimal in-memory fake of the slice of the Supabase query builder that
 * decksApi/cardsApi actually use (select/insert/update/delete, eq, order,
 * single/maybeSingle, count+head). Exists so the repository tests exercise
 * real code paths — column mapping, filtering, error propagation — against
 * something that behaves like Postgrest, instead of asserting nothing more
 * than "the mock was called." Not a general-purpose Postgrest mock; extend
 * deliberately if a repository starts using another method shape.
 */

type Row = Record<string, unknown> & { id?: string }

export interface SupabaseMockError {
  message: string
}

function matchesFilters(row: Row, filters: [string, unknown][]): boolean {
  return filters.every(([column, value]) => row[column] === value)
}

export function createSupabaseMock() {
  let tables: Record<string, Row[]> = {}

  const from = (tableName: string) => {
    const filters: [string, unknown][] = []
    let mode: 'select' | 'insert' | 'update' | 'delete' = 'select'
    let insertPayload: Row | null = null
    let updatePayload: Row | null = null
    let orderBy: { column: string; ascending: boolean } | null = null
    let countOptions: { head: boolean } | null = null
    let single = false
    let maybeSingle = false

    function table(): Row[] {
      return (tables[tableName] ??= [])
    }

    function execute(): { data: unknown; error: SupabaseMockError | null; count?: number } {
      if (mode === 'insert') {
        const row: Row = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...insertPayload,
        }
        table().push(row)
        return { data: single ? row : [row], error: null }
      }

      if (mode === 'update') {
        const matches = table().filter((row) => matchesFilters(row, filters))
        matches.forEach((row) =>
          Object.assign(row, updatePayload, { updated_at: new Date().toISOString() }),
        )
        if (single) {
          const row = matches[0]
          return row
            ? { data: row, error: null }
            : { data: null, error: { message: 'no rows found' } }
        }
        return { data: matches, error: null }
      }

      if (mode === 'delete') {
        const remaining = table().filter((row) => !matchesFilters(row, filters))
        tables[tableName] = remaining
        return { data: null, error: null }
      }

      // select
      let result = table().filter((row) => matchesFilters(row, filters))
      if (orderBy) {
        const { column, ascending } = orderBy
        result = [...result].sort((a, b) => {
          const cmp = String(a[column]).localeCompare(String(b[column]))
          return ascending ? cmp : -cmp
        })
      }
      if (countOptions) {
        return { data: countOptions.head ? null : result, count: result.length, error: null }
      }
      if (maybeSingle) {
        return { data: result[0] ?? null, error: null }
      }
      if (single) {
        const row = result[0]
        return row
          ? { data: row, error: null }
          : { data: null, error: { message: 'no rows found' } }
      }
      return { data: result, error: null }
    }

    const builder = {
      select(_columns?: string, options?: { count?: 'exact'; head?: boolean }) {
        if (options) countOptions = { head: Boolean(options.head) }
        return builder
      },
      insert(payload: Row) {
        mode = 'insert'
        insertPayload = payload
        return builder
      },
      update(payload: Row) {
        mode = 'update'
        updatePayload = payload
        return builder
      },
      delete() {
        mode = 'delete'
        return builder
      },
      eq(column: string, value: unknown) {
        filters.push([column, value])
        return builder
      },
      order(column: string, options?: { ascending?: boolean }) {
        orderBy = { column, ascending: options?.ascending ?? true }
        return builder
      },
      single() {
        single = true
        return builder
      },
      maybeSingle() {
        maybeSingle = true
        return builder
      },
      then<TResult1, TResult2>(
        onfulfilled?: ((value: ReturnType<typeof execute>) => TResult1) | null,
        onrejected?: ((reason: unknown) => TResult2) | null,
      ) {
        return Promise.resolve(execute()).then(onfulfilled, onrejected)
      },
    }

    return builder
  }

  return {
    client: { from },
    /** Reset between tests, optionally pre-seeding one or more tables. */
    reset(seed: Record<string, Row[]> = {}) {
      tables = structuredClone(seed)
    },
    getTable(tableName: string): Row[] {
      return tables[tableName] ?? []
    },
  }
}
