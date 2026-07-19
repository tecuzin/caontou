import { useState } from 'react'
import { searchStore, groupResults } from '../../search.js'

/**
 * Recherche globale (Accueil) : parcourt tout le store (visites, repas, planning,
 * préparatifs, courses, restos, trajet, journal) 100 % en local. Un tap sur un
 * résultat aiguille vers le bon écran via `setTab` / `setSub` (+ `setDay`).
 */
export function SearchSection({ sx, storeData, setTab, setSub, setDay }) {
  const [query, setQuery] = useState('')
  const results = query.trim().length >= 2 ? groupResults(searchStore(storeData(), query)) : []

  const go = (nav) => {
    if (nav.day != null && setDay) setDay(nav.day)
    if (nav.sub) setSub(nav.sub)
    else if (nav.tab) { setTab(nav.tab); setSub(null) }
    setQuery('')
  }

  return (
    <div style={sx('padding:6px 18px 12px;')}>
      <div style={sx('position:relative;')}>
        <span style={sx('position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:#6b6354;')}>🔎</span>
        <input
          data-testid="global-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher dans le séjour…"
          style={sx('width:100%;box-sizing:border-box;border:1px solid #d8cbb0;background:#fffdf8;border-radius:14px;padding:10px 12px 10px 36px;font-size:14px;')}
        />
        {query && (
          <button data-testid="global-search-clear" onClick={() => setQuery('')} aria-label="Effacer" style={sx('position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:15px;color:#6b6354;padding:4px;')}>✕</button>
        )}
      </div>

      {query.trim().length >= 2 && (
        <div data-testid="global-search-results" style={sx('margin-top:10px;')}>
          {results.length === 0 ? (
            <div style={sx('font-size:13px;color:#6b6354;padding:6px 2px;')}>Aucun résultat pour « {query.trim()} ».</div>
          ) : results.map(({ group, items }) => (
            <div key={group} style={sx('margin-bottom:10px;')}>
              <div style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;margin:0 2px 4px;')}>{group}</div>
              <div style={sx('display:flex;flex-direction:column;gap:6px;')}>
                {items.map((r, i) => (
                  <button key={i} data-testid="global-search-result" onClick={() => go(r.nav)} style={sx('text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:12px;padding:10px 12px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.04);')}>
                    <div style={sx('font-size:14px;font-weight:700;font-family:Quicksand;')}>{r.label}</div>
                    {r.sublabel && <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>{r.sublabel}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
