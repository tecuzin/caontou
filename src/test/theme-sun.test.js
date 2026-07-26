import { describe, it, expect } from 'vitest'
import { applySunTheme, applyDarkTheme, SUN_COLOR_MAP, SUN_TEXT_COLOR_MAP } from '../theme.js'

describe('applySunTheme() — thème plein soleil', () => {
  it('pousse les surfaces au blanc pur', () => {
    expect(applySunTheme('background:#fffdf8;')).toBe('background:#ffffff;')
    expect(applySunTheme('background:#f4ecdc;')).toBe('background:#ffffff;')
    expect(applySunTheme('background:#f6efe2;')).toBe('background:#ffffff;')
  })

  it('ramène les textes atténués au brun très foncé', () => {
    expect(applySunTheme('color:#6b6354;')).toBe('color:#2f2a22;')
    expect(applySunTheme('color:#9a917f;')).toBe('color:#2f2a22;')
  })

  it('épaissit ET assombrit les séparateurs', () => {
    expect(applySunTheme('border:1px solid #efe6d4;')).toBe('border:2px solid #6b6354;')
    expect(applySunTheme('border:1px solid #d8cbb0;')).toBe('border:2px solid #6b6354;')
  })

  it('supprime les ombres portées (elles mangent le contraste au soleil)', () => {
    expect(applySunTheme('box-shadow:0 2px 8px rgba(74,93,58,0.05);')).toBe('')
    expect(applySunTheme('padding:4px;box-shadow:0 8px 20px rgba(0,0,0,0.2);margin:2px;'))
      .toBe('padding:4px;margin:2px;')
  })

  it('ne touche PAS #fffaf0 : c’est du texte clair sur bouton coloré, jamais un fond', () => {
    // Même piège qu'en mode sombre : le remplacer rendrait illisible le texte
    // des boutons/onglets actifs.
    expect(applySunTheme('background:#4a5d3a;color:#fffaf0;')).toBe('background:#4a5d3a;color:#fffaf0;')
  })

  it('préserve les couleurs de marque (vert, ambre, rouge)', () => {
    const css = 'background:#4a5d3a;color:#e8c07a;border-color:#b8503f;'
    expect(applySunTheme(css)).toBe(css)
  })

  it('est idempotent et mis en cache (même entrée → même sortie)', () => {
    const css = 'background:#fffdf8;color:#6b6354;'
    const once = applySunTheme(css)
    expect(applySunTheme(css)).toBe(once)
    expect(applySunTheme(once)).toBe(once) // déjà transformé : rien à refaire
  })

  it('n’introduit aucune couleur absente de la palette existante', () => {
    const targets = [...Object.values(SUN_COLOR_MAP), ...Object.values(SUN_TEXT_COLOR_MAP)]
    expect(new Set(targets)).toEqual(new Set(['#ffffff', '#2f2a22']))
  })

  it('reste indépendant du mode sombre', () => {
    const css = 'background:#fffdf8;'
    expect(applySunTheme(css)).not.toBe(applyDarkTheme(css))
  })
})
