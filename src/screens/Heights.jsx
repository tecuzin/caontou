import { useState } from 'react'
import { groupByChild, growthSince, todayIso } from '../heights.js'

const INPUT = 'border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;'

/**
 * Écran « Toise de vacances » — on mesure les enfants pendant le séjour et on
 * garde la trace horodatée (rituel familial).
 * @param {Function} sx        helper de style (s())
 * @param {Array}    heights   mesures { id, name, cm, date }
 * @param {Function} onAdd     ({ name, cm, date }) → ajout (validation dans heights.js)
 * @param {Function} onRemove  (id) → suppression
 */
export function Heights({ sx, heights = [], onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [cm, setCm] = useState('')
  const [date, setDate] = useState(todayIso())

  const submit = () => {
    const clean = name.trim()
    if (!clean || !cm || !date) return
    onAdd?.({ name: clean, cm: Number(cm), date })
    setCm('')
  }

  const children = groupByChild(heights)

  return (
    <div data-testid="screen-heights" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#4a5d3a;border-radius:20px;padding:18px;color:#f3ecda;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>📏 Toise de vacances</div>
        <div style={sx('font-size:13px;color:#dbe2c9;margin-top:4px;')}>On mesure les enfants pendant le séjour : dos au mur, talons collés, et on note !</div>
      </div>

      <div style={sx('margin-top:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Nouvelle mesure</div>
        <div style={sx('margin-top:10px;display:flex;flex-direction:column;gap:8px;')}>
          <input
            data-testid="height-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Prénom" aria-label="Prénom"
            style={sx(INPUT)}
          />
          <div style={sx('display:flex;gap:8px;')}>
            <input
              data-testid="height-cm" type="number" inputMode="decimal" min="30" max="250" step="0.5"
              value={cm} onChange={(e) => setCm(e.target.value)}
              placeholder="Taille (cm)" aria-label="Taille en centimètres"
              style={sx(`flex:1;min-width:0;${INPUT}`)}
            />
            <input
              data-testid="height-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              aria-label="Date de la mesure"
              style={sx(`flex:1;min-width:0;${INPUT}`)}
            />
          </div>
          <button
            data-testid="height-add" onClick={submit}
            style={sx('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:12px;padding:12px 18px;cursor:pointer;')}
          >
            + Enregistrer la mesure
          </button>
        </div>
      </div>

      {children.length === 0 && (
        <div data-testid="heights-empty" style={sx('margin-top:22px;text-align:center;color:#9a917f;font-size:14px;')}>
          Aucune mesure pour l'instant. La première fait le rituel !
        </div>
      )}

      {children.map((c) => {
        const growth = growthSince(c.measures)
        const last = c.measures[c.measures.length - 1]
        return (
          <div key={c.name} data-testid={`height-child-${c.name}`} style={sx('margin-top:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
            <div style={sx('display:flex;align-items:baseline;gap:8px;')}>
              <div style={sx('flex:1;min-width:0;font-family:Quicksand;font-weight:700;font-size:15px;')}>{c.name}</div>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;color:#4a5d3a;')}>{last.cm} cm</div>
            </div>
            <div style={sx('margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;')}>
              <span data-testid={`height-growth-${c.name}`} style={sx(`font-size:12px;font-weight:700;border-radius:20px;padding:4px 10px;${growth > 0 ? 'background:#e7ecdf;color:#4a5d3a;' : 'background:#f1e4d4;color:#9c6b4a;'}`)}>
                {growth > 0 ? `↑ +${growth} cm depuis la 1re mesure` : 'Première mesure'}
              </span>
              <span style={sx('font-size:12px;color:#6b6354;')}>{c.measures.length} mesure{c.measures.length > 1 ? 's' : ''}</span>
            </div>
            <div style={sx('margin-top:10px;display:flex;flex-direction:column;gap:6px;')}>
              {c.measures.map((m) => (
                <div key={m.id} data-testid={`height-row-${m.id}`} style={sx('display:flex;align-items:center;gap:8px;background:#fbf4e6;border-radius:12px;padding:8px 10px;')}>
                  <span style={sx('flex:1;min-width:0;font-size:13px;color:#6b6354;')}>{m.date}</span>
                  <span style={sx('font-size:14px;font-weight:700;')}>{m.cm} cm</span>
                  <button
                    data-testid={`height-del-${m.id}`} aria-label={`Supprimer la mesure de ${c.name} du ${m.date}`}
                    onClick={() => onRemove?.(m.id)}
                    style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
