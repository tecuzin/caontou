import { describe, it, expect } from 'vitest'
import { applyDarkTheme, DARK_COLOR_MAP, DARK_TEXT_COLOR_MAP, STARRY_BACKGROUND_IMAGE } from '../theme.js'

describe('applyDarkTheme()', () => {
  it('remplace une couleur de surface connue par son équivalent bleu nuit', () => {
    expect(applyDarkTheme('background:#fffdf8;')).toBe('background:#1a2140;')
  })

  it('remplace plusieurs couleurs dans la même chaîne', () => {
    const css = 'background:#fffdf8;color:#2f2a22;border:1px solid #d8cbb0;'
    const result = applyDarkTheme(css)
    expect(result).toContain('#1a2140')
    expect(result).toContain('#f3ecda')
    expect(result).toContain('#384068')
  })

  it('éclaircit une couleur d\'accent utilisée comme TEXTE (contraste sur fond sombre)', () => {
    expect(applyDarkTheme('color:#4a5d3a;')).toBe('color:#a7d08a;')
    expect(applyDarkTheme('color:#cf7d3c;')).toBe('color:#f5b06e;')
  })

  it('ne touche pas une couleur d\'accent utilisée comme fond/bordure (marqueurs, sélecteur de couleur)', () => {
    const css = 'background:#4a5d3a;border:1px solid #cf7d3c;'
    expect(applyDarkTheme(css)).toBe(css)
  })

  it('applique la surface ET le texte dans une même chaîne (cas du bug rapporté : texte invisible)', () => {
    const css = 'background:#fffdf8;color:#4a5d3a;'
    const result = applyDarkTheme(css)
    expect(result).toBe('background:#1a2140;color:#a7d08a;')
  })

  it('laisse une chaîne sans couleur de surface ni de texte d\'accent inchangée', () => {
    const css = 'font-size:14px;font-weight:700;padding:8px;'
    expect(applyDarkTheme(css)).toBe(css)
  })

  it('remplace la couleur translucide de la barre d\'onglets', () => {
    const css = 'background:rgba(255,253,248,0.97);'
    expect(applyDarkTheme(css)).toBe('background:rgba(16,22,43,0.95);')
  })

  it('remplace toutes les occurrences répétées de la même couleur', () => {
    const css = 'color:#6b6354;border-color:#6b6354;'
    const result = applyDarkTheme(css)
    expect(result).toBe('color:#b8ac96;border-color:#b8ac96;')
  })

  it('DARK_COLOR_MAP ne contient pas les couleurs d\'accent de marque (celles-ci sont dans DARK_TEXT_COLOR_MAP)', () => {
    const brandColors = ['#4a5d3a', '#cf7d3c', '#5b7042', '#b8503f']
    for (const brand of brandColors) {
      expect(DARK_COLOR_MAP).not.toHaveProperty(brand)
    }
  })

  it('DARK_COLOR_MAP ne contient pas de noir pur — palette bleu nuit', () => {
    for (const dark of Object.values(DARK_COLOR_MAP)) {
      expect(dark.toLowerCase()).not.toBe('#000000')
      expect(dark.toLowerCase()).not.toBe('#000')
    }
    expect(DARK_COLOR_MAP['#f4ecdc']).toBe('#10162b')
  })

  it('STARRY_BACKGROUND_IMAGE est une liste de radial-gradient valide', () => {
    expect(STARRY_BACKGROUND_IMAGE).toContain('radial-gradient')
    expect(STARRY_BACKGROUND_IMAGE.split('radial-gradient').length - 1).toBeGreaterThanOrEqual(5)
  })

  it('DARK_TEXT_COLOR_MAP ne mappe vers aucune couleur restée trop sombre', () => {
    for (const dark of Object.values(DARK_TEXT_COLOR_MAP)) {
      const hex = dark.replace('#', '')
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      expect(luminance).toBeGreaterThan(0.5)
    }
  })
})
