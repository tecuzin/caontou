import { useState, useEffect } from 'react'
import { batteryStatus, readBattery } from '../battery.js'

/**
 * Surveillance de la batterie — en rando, le téléphone porte le planning, la
 * carte hors-ligne et les photos ; tomber à plat sans prévenir coûte cher.
 *
 * Relevé à l'ouverture puis toutes les 5 minutes : assez pour prévenir à
 * temps, assez espacé pour ne rien coûter en énergie. Renvoie `null` quand
 * il n'y a rien à dire — batterie confortable, appareil en charge, ou API
 * indisponible (Safari, WebView selon la version).
 *
 * @param {number} intervalMs  période de relevé (injectable pour les tests)
 * @returns {{level:'warn'|'low', pct:number, message:string}|null}
 */
export function useBatteryAlert(intervalMs = 5 * 60 * 1000) {
  const [battery, setBattery] = useState(null)

  useEffect(() => {
    let alive = true
    const check = async () => {
      const b = await readBattery()
      if (alive) setBattery(b ? batteryStatus(b.level, b.charging) : null)
    }
    check()
    const id = setInterval(check, intervalMs)
    return () => { alive = false; clearInterval(id) }
  }, [intervalMs])

  return [battery, setBattery]
}
