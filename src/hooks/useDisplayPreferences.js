import { useState, useEffect, useRef } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'
import { s } from '../utils.js'
import { applyDarkTheme, applySunTheme } from '../theme.js'
import { applyTextScale, scaleFactor } from '../text-scale.js'
import { nextThemeDecision } from '../auto-theme.js'

/**
 * Préférences d'AFFICHAGE — thème sombre, plein soleil, taille de texte,
 * bascule automatique.
 *
 * Toutes sont **locales à l'appareil** (`localStorage` dédié, hors du store
 * `cantou.v1`) : deux téléphones d'une même famille peuvent avoir des
 * réglages différents, et rien de tout ça ne part dans l'export JSON.
 *
 * Le hook expose `sx`, le helper de style que consomme toute l'app : il
 * applique le thème PUIS l'échelle de texte à la chaîne CSS avant parsing
 * (ADR-006).
 */
export function useDisplayPreferences() {
  /* ── Mode sombre ─────────────────────────────────────────────────────
   * Défaut : préférence système, tant que l'utilisateur n'a rien choisi. */
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('cantou.darkMode')
      if (saved !== null) return saved === 'true'
    } catch { }
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('cantou.darkMode', String(darkMode)) } catch { }
    // Barre de statut Android synchronisée avec le thème (crème / bleu nuit).
    // Style.Light = fond clair (icônes sombres), Style.Dark = l'inverse.
    // No-op silencieux hors natif (web/tests : promesse rejetée, catch).
    StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }).catch(() => {})
    StatusBar.setBackgroundColor({ color: darkMode ? '#10162b' : '#f4ecdc' }).catch(() => {})
  }, [darkMode])

  /* ── Bascule automatique selon l'heure ───────────────────────────────
   * Désactivée par défaut : activée d'office, elle écraserait au démarrage
   * la préférence déjà enregistrée. `themeOverrideRef` retient que
   * l'utilisateur a repris la main — on ne lui reprend alors plus son choix. */
  const [autoTheme, setAutoTheme] = useState(() => {
    try { return localStorage.getItem('cantou.autoTheme') === 'true' } catch { return false }
  })
  const themeOverrideRef = useRef(false)

  /** Bascule MANUELLE du thème : désarme l'automatisme. */
  const toggleDarkManual = (v) => { themeOverrideRef.current = true; setDarkMode(v) }

  useEffect(() => { try { localStorage.setItem('cantou.autoTheme', String(autoTheme)) } catch { } }, [autoTheme])

  useEffect(() => {
    const tick = () => {
      const decision = nextThemeDecision({
        hour: new Date().getHours(), darkMode, enabled: autoTheme, userOverride: themeOverrideRef.current,
      })
      if (decision !== null) { themeOverrideRef.current = false; setDarkMode(decision) }
    }
    tick()
    const id = setInterval(tick, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [autoTheme, darkMode])

  /* ── Mode plein soleil ───────────────────────────────────────────────
   * Prioritaire sur le sombre quand il est actif. */
  const [sunMode, setSunMode] = useState(() => {
    try { return localStorage.getItem('cantou.sunMode') === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('cantou.sunMode', String(sunMode)) } catch { }
    if (sunMode) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {})
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {})
    }
  }, [sunMode])

  /* ── Taille de texte ─────────────────────────────────────────────── */
  const [textScale, setTextScale] = useState(() => {
    try { return localStorage.getItem('cantou.textScale') || 'normal' } catch { return 'normal' }
  })
  useEffect(() => { try { localStorage.setItem('cantou.textScale', textScale) } catch { } }, [textScale])

  /** Helper de style de toute l'app : thème appliqué, puis échelle de texte. */
  const sx = (css) => {
    const themed = sunMode ? applySunTheme(css) : darkMode ? applyDarkTheme(css) : css
    return s(applyTextScale(themed, scaleFactor(textScale)))
  }

  return {
    sx,
    darkMode, setDarkMode: toggleDarkManual,
    sunMode, setSunMode,
    textScale, setTextScale,
    autoTheme, setAutoTheme,
  }
}
