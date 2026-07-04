import { describe, it, expect } from 'vitest'
import { applyDarkTheme, DARK_COLOR_MAP } from '../theme.js'

describe('applyDarkTheme()', () => {
  it('remplace une couleur de surface connue par son équivalent sombre', () => {
    expect(applyDarkTheme('background:#fffdf8;')).toBe('background:#242019;')
  })

  it('remplace plusieurs couleurs dans la même chaîne', () => {
    const css = 'background:#fffdf8;color:#2f2a22;border:1px solid #d8cbb0;'
    const result = applyDarkTheme(css)
    expect(result).toContain('#242019')
    expect(result).toContain('#f3ecda')
    expect(result).toContain('#4a4436')
  })

  it('ne touche pas aux couleurs d\'accent non listées (vert, orange, etc.)', () => {
    const css = 'background:#4a5d3a;color:#cf7d3c;'
    expect(applyDarkTheme(css)).toBe(css)
  })

  it('laisse une chaîne sans couleur de surface inchangée', () => {
    const css = 'font-size:14px;font-weight:700;padding:8px;'
    expect(applyDarkTheme(css)).toBe(css)
  })

  it('remplace la couleur translucide de la barre d\'onglets', () => {
    const css = 'background:rgba(255,253,248,0.97);'
    expect(applyDarkTheme(css)).toBe('background:rgba(28,26,22,0.97);')
  })

  it('remplace toutes les occurrences répétées de la même couleur', () => {
    const css = 'color:#6b6354;border-color:#6b6354;'
    const result = applyDarkTheme(css)
    expect(result).toBe('color:#b8ac96;border-color:#b8ac96;')
  })

  it('DARK_COLOR_MAP ne contient que des couleurs de surface neutres (pas de vert/orange de marque)', () => {
    const brandColors = ['#4a5d3a', '#cf7d3c', '#5b7042', '#b8503f']
    for (const brand of brandColors) {
      expect(DARK_COLOR_MAP).not.toHaveProperty(brand)
    }
  })
})
