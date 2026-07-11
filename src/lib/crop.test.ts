import { describe, it, expect } from 'vitest'
import { getCropRect } from './crop'

describe('getCropRect', () => {
  it('uses the full image for a matching aspect ratio', () => {
    expect(getCropRect(1000, 1000, 1080, 1080)).toEqual({
      sx: 0, sy: 0, cropW: 1000, cropH: 1000,
    })
  })

  it('centers a width crop when the image is wider than the preset', () => {
    expect(getCropRect(2000, 1000, 1080, 1080)).toEqual({
      sx: 500, sy: 0, cropW: 1000, cropH: 1000,
    })
  })

  it('centers a height crop when the image is taller than the preset', () => {
    expect(getCropRect(1000, 2000, 1080, 1080)).toEqual({
      sx: 0, sy: 500, cropW: 1000, cropH: 1000,
    })
  })

  it('honors a non-square preset ratio', () => {
    expect(getCropRect(1920, 1080, 1200, 900)).toEqual({
      sx: 240, sy: 0, cropW: 1440, cropH: 1080,
    })
  })
})
