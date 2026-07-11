import { describe, it, expect } from 'vitest'
import { formatBytes, formatDate } from './utils'

describe('formatBytes', () => {
  it('formats bytes / KB / MB with the project\'s exact output', () => {
    expect(formatBytes(0)).toBe('0B')
    expect(formatBytes(500)).toBe('500B')
    expect(formatBytes(1024)).toBe('1.0KB')
    expect(formatBytes(1536)).toBe('1.5KB')
    expect(formatBytes(1048576)).toBe('1.00MB')
    expect(formatBytes(5242880)).toBe('5.00MB')
  })
})

describe('formatDate', () => {
  it('returns the input unchanged for invalid dates', () => {
    expect(formatDate('not-a-date', 'en-US')).toBe('not-a-date')
  })

  it('formats a valid ISO date (year is timezone-stable)', () => {
    expect(formatDate('2024-01-15', 'en-US')).toContain('2024')
  })
})
