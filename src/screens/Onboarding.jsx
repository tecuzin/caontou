import { useState } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey.js'

/**
 * Assistant de configuration au premier lancement (onboarding).
 *
 * Overlay plein écran, non fermable au clic sur le fond (contrairement aux
 * feuilles modales) : on ne sort que par les boutons explicites « Passer » ou
 * « Terminer ». La touche Échap déclenche « Passer » (équivalent clavier
 * accessible, pas un clic fortuit). Le but : quand l'app est réutilisée pour un
 * autre séjour, on n'est plus bloqué sur les données d'exemple du Cantal.
 *
 * Le composant ne collecte que des valeurs locales et les remonte via
 * `onFinish` / `onSkip` — toute l'écriture du store reste dans App.jsx.
 */

// Sous-ensemble curé de fonctionnalités optionnelles proposées à la dernière
// étape. Le réglage fin complet reste dans l'écran Réglages.
const FEATURE_HINTS = [
  { key: 'mod_trajet', label: 'Trajet' },
  { key: 'mod_meteo', label: 'Météo' },
  { key: 'mod_souvenirs', label: 'Souvenirs' },
  { key: 'extra_vote', label: 'Vote familial' },
]

function Toggle({ sx, on, onClick, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      style={sx(`flex:0 0 auto;width:46px;height:28px;border-radius:16px;border:none;cursor:pointer;padding:3px;display:flex;justify-content:${on ? 'flex-end' : 'flex-start'};background:${on ? '#5b7042' : '#d8cbb0'};transition:background 0.15s;`)}
    >
      <span style={sx('width:22px;height:22px;border-radius:50%;background:#fffdf8;box-shadow:0 1px 3px rgba(0,0,0,0.2);display:block;')} />
    </button>
  )
}

const fieldLabel = 'font-size:12px;font-weight:700;color:#6b6354;'
const fieldInput = 'width:100%;margin-top:6px;margin-bottom:14px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;'

export function Onboarding({ sx, trip, isOn, toggleFeature, onFinish, onSkip }) {
  const [step, setStep] = useState(0)
  const [start, setStart] = useState(trip?.start || '')
  const [end, setEnd] = useState(trip?.end || '')
  const [origin, setOrigin] = useState(trip?.origin || '')
  const [etape, setEtape] = useState(trip?.etape || '')
  const [dest, setDest] = useState(trip?.destination || '')
  const [budget, setBudget] = useState('')

  useEscapeKey(onSkip)

  const STEPS = 4
  const isLast = step === STEPS - 1
  const next = () => setStep((n) => Math.min(n + 1, STEPS - 1))
  const back = () => setStep((n) => Math.max(n - 1, 0))
  const finish = () => onFinish({ start, end, origin, etape, destination: dest, budget })

  return (
    <div
      data-testid="onboarding-overlay"
      role="presentation"
      style={sx('position:fixed;inset:0;z-index:400;background:rgba(40,30,18,0.42);display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}
    >
      <div role="dialog" aria-modal="true" aria-label="Configuration du séjour" style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 32px;max-height:88vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />

        {/* Progression */}
        <div style={sx('display:flex;gap:6px;margin-bottom:14px;')}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={sx(`flex:1;height:4px;border-radius:4px;background:${i <= step ? '#5b7042' : '#d8cbb0'};`)} />
          ))}
        </div>

        {step === 0 && (
          <div data-testid="onboarding-step-dates">
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Bienvenue 👋</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Quelques réglages pour adapter l'app à votre séjour. Vous pourrez tout modifier plus tard.</div>
            <div style={sx('display:flex;gap:10px;')}>
              <div style={sx('flex:1;')}>
                <div style={sx(fieldLabel)}>Date de départ</div>
                <input data-testid="onboarding-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={sx(fieldInput)} />
              </div>
              <div style={sx('flex:1;')}>
                <div style={sx(fieldLabel)}>Date de retour</div>
                <input data-testid="onboarding-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={sx(fieldInput)} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div data-testid="onboarding-step-trajet">
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Le trajet</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>D'où partez-vous et où allez-vous ?</div>
            <div style={sx(fieldLabel)}>Ville de départ</div>
            <input data-testid="onboarding-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex : Beauvais" style={sx(fieldInput)} />
            <div style={sx(fieldLabel)}>Étape (nuit) — optionnel</div>
            <input data-testid="onboarding-etape" value={etape} onChange={(e) => setEtape(e.target.value)} placeholder="Ex : Laschamps" style={sx(fieldInput)} />
            <div style={sx(fieldLabel)}>Destination</div>
            <input data-testid="onboarding-dest" value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Ex : Vezels-Roussy (Cantal)" style={sx(fieldInput)} />
          </div>
        )}

        {step === 2 && (
          <div data-testid="onboarding-step-budget">
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Le budget</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Une enveloppe totale pour suivre les dépenses (optionnel).</div>
            <div style={sx(fieldLabel)}>Budget total (€)</div>
            <input data-testid="onboarding-budget" type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ex : 1500" style={sx(fieldInput)} />
          </div>
        )}

        {step === 3 && (
          <div data-testid="onboarding-step-features">
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Les fonctionnalités</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-bottom:16px;')}>Activez ce qui vous sert. Le réglage complet reste disponible dans Réglages.</div>
            <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
              {FEATURE_HINTS.map((f, i) => (
                <div key={f.key} data-testid={`onboarding-feature-${f.key}`} style={sx(`display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;${i > 0 ? 'border-top:1px solid #f1e9da;' : ''}`)}>
                  <span style={sx('font-size:15px;')}>{f.label}</span>
                  <Toggle sx={sx} on={isOn(f.key)} onClick={() => toggleFeature(f.key)} label={f.label} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={sx('display:flex;gap:10px;margin-top:20px;')}>
          {step === 0 ? (
            <button data-testid="onboarding-skip" onClick={onSkip} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Passer</button>
          ) : (
            <button data-testid="onboarding-back" onClick={back} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Retour</button>
          )}
          {isLast ? (
            <button data-testid="onboarding-finish" onClick={finish} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Terminer</button>
          ) : (
            <button data-testid="onboarding-next" onClick={next} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Suivant</button>
          )}
        </div>
        {step > 0 && (
          <button data-testid="onboarding-skip-inline" onClick={onSkip} style={sx('width:100%;margin-top:10px;border:none;background:transparent;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:13px;cursor:pointer;padding:4px;')}>Passer la configuration</button>
        )}
      </div>
    </div>
  )
}
