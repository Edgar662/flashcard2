import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const isActive = false
    expect(cn('a', isActive && 'b', undefined, 'c')).toBe('a c')
  })

  it('resolves conflicting Tailwind utilities, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
