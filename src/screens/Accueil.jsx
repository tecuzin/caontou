import { useState } from 'react'
import { Panorama } from '../Scenery.jsx'
import { KIDS_GAMES, EMERGENCY_NUMBERS } from '../data.js'
import { TelLink } from '../components/Links.jsx'

const MODULES = [
  { emoji: '🚗', name: 'Trajet', sub: 'Aller & retour', bg: '#dfeae6', action: 'sub:trajet' },
  { emoji: '🏡', name: 'Hébergement', sub: 'Vezels-Roussy', bg: '#f1e4d4', action: 'sub:hebergement' },
  { emoji: '🧳', name: 'Préparatifs', sub: 'Valises & listes', bg: '#e7ecdf', action: 'sub:logistique' },
  { emoji: '⛅', name: 'Météo', sub: '7 jours sur place', bg: '#eee7d4', action: 'sub:meteo' },
  { emoji: '🍽️', name: 'Repas', sub: 'Menus & courses', bg: '#f3e2d6', action: 'tab:repas' },
  { emoji: '💶', name: 'Budget', sub: '1 800 € prévus', bg: '#e6ece0', action: 'tab:budget' },
  { emoji: '📸', name: 'Souvenirs', sub: 'Photos par journée', bg: '#f3e2d6', action: 'sub:souvenirs' },
  { emoji: '🍴', name: 'Restos', sub: 'Adresses & résas', bg: '#f1e4d4', action: 'sub:restos' },
  { emoji: '🔑', name: 'Départ du gîte', sub: 'Avant de rendre les clés', bg: '#f1e4d4', action: 'sub:departure' },
]

/** Écran Accueil — carte de la prochaine aventure, aujourd'hui, modules, suggestions et sauvegarde. */
export function Accueil({
  sx, darkMode, setDarkMode, openTripEdit, fmtDayShort, fmtMonthYear, trip, countdown, today,
  setTab, setDay, setSub, packDone, packTotal, packPct, openModule,
  newSuggestionText, setNewSuggestionText, submitSuggestion, suggestions, deleteSuggestion, sendSuggestions,
  lastBackupAt, formatLastBackup, setExportCopied, setShowExport, setShowImport, runSelfTestAndShow,
  isDepartureDay, quickPhoto, openMyPosition, openChangelog,
  isCheckoutSoon, departureDone = 0, departureTotal = 0,
}) {
  const [gamesOpen, setGamesOpen] = useState(false)
  return (
    <div data-testid="screen-accueil">
      <div style={sx('margin:54px 18px 14px 18px;border-radius:28px;padding:20px;color:#fffaf0;box-shadow:0 10px 26px rgba(74,93,58,0.24);position:relative;overflow:hidden;min-height:190px;')}>
        <div data-testid="hero-panorama-bg" style={sx('position:absolute;inset:0;z-index:0;')}>
          <Panorama height="100%" />
          <div style={sx('position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,40,25,0.15) 0%,rgba(25,35,20,0.55) 60%,rgba(20,28,16,0.75) 100%);')} />
        </div>
        <button data-testid="btn-quick-photo" onClick={quickPhoto} style={sx('position:absolute;top:14px;right:98px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>📷</button>
        <button data-testid="btn-dark-mode-toggle" onClick={() => setDarkMode((d) => !d)} style={sx('position:absolute;top:14px;right:56px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>{darkMode ? '☀️' : '🌙'}</button>
        <button data-testid="btn-trip-settings" onClick={openTripEdit} style={sx('position:absolute;top:14px;right:14px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 9px;font-size:15px;cursor:pointer;')}>⚙️</button>
        <div style={sx('position:relative;z-index:1;')}>
          <div style={sx('font-size:12px;letter-spacing:1.5px;font-weight:700;color:#efe6d4;')}>{isDepartureDay ? "🎉 C'EST LE GRAND JOUR !" : 'PROCHAINE AVENTURE'}</div>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:30px;line-height:1.08;margin-top:8px;text-shadow:0 2px 8px rgba(0,0,0,0.25);')}>Carladès,<br />Cantal</div>
          <div style={sx('margin-top:9px;font-size:14px;color:#efe6d4;')}>{fmtDayShort(trip.start)} → {fmtDayShort(trip.end)} {fmtMonthYear(trip.end)}</div>
          <div style={sx('display:flex;gap:8px;margin-top:16px;')}>
            <div data-testid="countdown-pill" style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 13px;font-weight:700;font-family:Quicksand;')}>{isDepartureDay ? 'Jour J 🎉' : `J-${countdown}`}</div>
            <div style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 13px;font-weight:700;')}>☀️ 24° sur place</div>
          </div>
        </div>
      </div>

      {/* Bannière du jour du départ — checklist et trajet à portée de main */}
      {isDepartureDay && (
        <div data-testid="jour-j-banner" style={sx('margin:0 18px 14px;background:#fffdf8;border:2px solid #4a5d3a;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(74,93,58,0.18);')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🚗 En route pour le Cantal !</div>
          <div style={sx('font-size:13px;color:#6b6354;margin-top:4px;')}>Un dernier coup d'œil à la checklist avant de fermer la porte ?</div>
          <button onClick={() => setSub('trajet')} style={sx('margin-top:12px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Checklist avant de partir →</button>
        </div>
      )}

      {isCheckoutSoon && (
        <div data-testid="checkout-banner" style={sx('margin:0 18px 14px;background:#fffdf8;border:2px solid #9c6b4a;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(156,107,74,0.18);')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🔑 Départ du gîte</div>
          <div style={sx('font-size:13px;color:#6b6354;margin-top:4px;')}>C'est bientôt la fin du séjour — la checklist pour ne rien oublier avant de rendre les clés{departureTotal ? ` (${departureDone}/${departureTotal})` : ''}.</div>
          <button data-testid="btn-checkout" onClick={() => setSub('departure')} style={sx('margin-top:12px;width:100%;border:none;background:#9c6b4a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Ouvrir la checklist de départ →</button>
        </div>
      )}

      {today && (
        <div data-testid="today-card" style={sx('margin:0 18px 14px;background:#fffdf8;border:2px solid #cf7d3c;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(207,125,60,0.18);')}>
          <div style={sx('display:flex;align-items:center;justify-content:space-between;')}>
            <div style={sx('font-size:12px;letter-spacing:1px;font-weight:700;color:#cf7d3c;')}>🗓️ AUJOURD'HUI · {today.d.dow} {today.d.num}</div>
            {today.w && <div style={sx('font-family:Quicksand;font-weight:700;font-size:14px;')}>{today.w.icon} {today.w.hi}° <span style={sx('color:#6b6354;')}>{today.w.lo}°</span></div>}
          </div>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-top:6px;')}>{today.d.title}</div>
          <div style={sx('font-size:13px;color:#6b6354;margin-top:1px;')}>{today.d.sub}</div>
          {today.d.items.length > 0 && (
            <div style={sx('margin-top:12px;display:flex;flex-direction:column;gap:8px;')}>
              {today.d.items.map((it, i) => (
                <div key={i} style={sx('display:flex;align-items:center;gap:10px;')}>
                  <span style={sx(`width:8px;height:8px;border-radius:50%;background:${it.color};flex:0 0 auto;`)} />
                  <span style={sx('font-size:13px;font-weight:700;color:#9a917f;width:44px;flex:0 0 auto;')}>{it.time}</span>
                  <span style={sx('font-size:14px;flex:1;')}>{it.title}</span>
                </div>
              ))}
            </div>
          )}
          {today.meal && (
            <div style={sx('margin-top:12px;background:#f1e4d4;border-radius:12px;padding:10px 13px;font-size:13px;color:#6b5a45;')}>🍽️ Ce soir : <b>{today.meal.dish}</b></div>
          )}
          <button onClick={() => { setTab('planning'); setDay(today.dayIdx) }} style={sx('margin-top:13px;width:100%;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Voir le planning du jour →</button>
        </div>
      )}

      <div style={sx('margin:0 18px 12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <div style={sx('display:flex;align-items:center;gap:12px;')}>
          <div style={sx('width:44px;height:44px;border-radius:14px;background:#dfeae6;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🚗</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>Le grand départ</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-top:1px;')}>{fmtDayShort(trip.start)} · depuis {trip.origin}{trip.etape ? ` · via ${trip.etape}` : ''}</div>
          </div>
        </div>
        <button onClick={() => setSub('trajet')} style={sx('margin-top:13px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Voir le trajet →</button>
      </div>

      <button onClick={() => setSub('logistique')} style={sx('margin:0 18px 14px;width:calc(100% - 36px);text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>🧳 Valises &amp; préparatifs</div>
          <div style={sx('font-size:13px;color:#6b6354;font-weight:700;')}>{packDone}/{packTotal}</div>
        </div>
        <div style={sx('margin-top:11px;height:9px;border-radius:8px;background:#efe6d4;overflow:hidden;')}><div style={sx(`height:100%;border-radius:8px;background:#cf7d3c;width:${packPct}%;`)} /></div>
      </button>

      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Tout le séjour</div>
      <div style={sx('padding:0 18px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
        {MODULES.map((m) => (
          <button key={m.name} onClick={() => openModule(m.action)} style={sx('text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
            <div style={sx(`width:42px;height:42px;border-radius:14px;background:${m.bg};display:flex;align-items:center;justify-content:center;font-size:21px;`)}>{m.emoji}</div>
            <div>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{m.name}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>{m.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>🎲 Jeux avec les enfants</div>
      <div style={sx('padding:0 18px 12px;')}>
        <button data-testid="btn-open-bingo" onClick={() => setSub('bingo')} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#e7ecdf;display:flex;align-items:center;justify-content:center;font-size:21px;')}>🔍</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Bingo du Cantal</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>16 trésors à repérer · une ligne complète = 🎉</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>›</div>
        </button>
        <button data-testid="btn-toggle-games" onClick={() => setGamesOpen((o) => !o)} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#e7ecdf;display:flex;align-items:center;justify-content:center;font-size:21px;')}>🎲</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Idées de jeux</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>{KIDS_GAMES.length} activités nature, au gîte et le soir</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>{gamesOpen ? '▲' : '▼'}</div>
        </button>
        {gamesOpen && (
          <div data-testid="games-list" style={sx('margin-top:10px;display:flex;flex-direction:column;gap:10px;')}>
            {KIDS_GAMES.map((g, i) => (
              <div key={i} style={sx('display:flex;gap:12px;align-items:flex-start;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                <div style={sx('width:44px;height:44px;flex:0 0 auto;border-radius:14px;background:#f3ece0;display:flex;align-items:center;justify-content:center;font-size:22px;')}>{g.emoji}</div>
                <div style={sx('flex:1;min-width:0;')}>
                  <div style={sx(`font-size:11px;font-weight:700;color:${g.color};text-transform:uppercase;letter-spacing:0.5px;`)}>{g.place}</div>
                  <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;margin-top:2px;')}>{g.name}</div>
                  <div style={sx('font-size:12px;color:#6b6354;margin-top:3px;line-height:1.4;')}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>💡 Suggestions</div>
      <div style={sx('padding:0 18px 12px;')}>
        <div style={sx('font-size:12px;color:#6b6354;margin-bottom:8px;')}>Une idée de fonctionnalité, une consigne pour les prochaines données ? Notez-la ici puis envoyez-la.</div>
        <div style={sx('display:flex;gap:8px;')}>
          <input data-testid="input-suggestion" value={newSuggestionText} onChange={(e) => setNewSuggestionText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSuggestion()} placeholder="Ex : ajouter un mode sombre…" style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
          <button data-testid="btn-add-suggestion" onClick={submitSuggestion} style={sx('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:0 16px;cursor:pointer;')}>+ Ajouter</button>
        </div>
        {suggestions.length > 0 && (
          <div style={sx('display:flex;flex-direction:column;gap:8px;margin-top:10px;')}>
            {suggestions.map((sug) => (
              <div key={sug.id} style={sx('display:flex;align-items:center;gap:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:12px;padding:10px 12px;')}>
                <span style={sx('font-size:13px;flex:1;')}>{sug.text}</span>
                <button onClick={() => deleteSuggestion(sug.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;color:#b8503f;padding:2px 4px;')}>🗑️</button>
              </div>
            ))}
            <button data-testid="btn-send-suggestions" onClick={sendSuggestions} style={sx('width:100%;margin-top:2px;border:1px solid #cf7d3c;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>📤 Envoyer sur Telegram / WhatsApp…</button>
          </div>
        )}
      </div>

      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>🆘 Urgences & repères</div>
      <div style={sx('padding:0 18px 12px;')}>
        <div data-testid="emergency-block" style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:6px 14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          {EMERGENCY_NUMBERS.map((e, i) => (
            <div key={e.num} style={sx(`display:flex;align-items:center;gap:10px;padding:10px 0;${i < EMERGENCY_NUMBERS.length - 1 ? 'border-bottom:1px solid #f1e9da;' : ''}`)}>
              <span style={sx('font-size:18px;flex:0 0 auto;')}>{e.emoji}</span>
              <span style={sx('flex:1;font-size:14px;color:#3a352b;')}>{e.label}</span>
              <TelLink sx={sx} num={e.num} style={'color:#b8503f;font-weight:700;text-decoration:none;font-family:Quicksand;font-size:16px;'}>📞 {e.num}</TelLink>
            </div>
          ))}
        </div>
        <button data-testid="btn-my-position" onClick={openMyPosition} style={sx('width:100%;margin-top:10px;border:1px solid #4f8a86;background:#fffdf8;color:#4f8a86;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>📍 Ma position → Google Maps</button>
      </div>

      <div style={sx('padding:6px 18px 12px;')}>
        <button data-testid="btn-open-bilan" onClick={() => setSub('bilan')} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#f3e2d6;display:flex;align-items:center;justify-content:center;font-size:21px;')}>📊</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Bilan du séjour</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:1px;')}>Stats & récap à partager</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>›</div>
        </button>
      </div>

      <div style={sx('padding:6px 18px 4px;display:flex;align-items:baseline;justify-content:space-between;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Sauvegarde</div>
        <div data-testid="last-backup-label" style={sx('font-size:12px;color:#6b6354;')}>Dernière : {formatLastBackup(lastBackupAt)}</div>
      </div>
      <div style={sx('padding:6px 18px 12px;display:flex;gap:12px;')}>
        <button data-testid="btn-export" onClick={() => { setExportCopied(false); setShowExport(true) }} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#4a5d3a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬇️ Exporter (JSON)</button>
        <button data-testid="btn-import" onClick={() => setShowImport(true)} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:13px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#9c6b4a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬆️ Importer</button>
      </div>
      <div style={sx('padding:0 18px 12px;display:flex;gap:10px;')}>
        <button data-testid="btn-selftest" onClick={runSelfTestAndShow} style={sx('flex:1;border:1px dashed #d8cbb0;background:transparent;border-radius:14px;padding:10px;cursor:pointer;font-family:Quicksand;font-weight:600;font-size:12px;color:#9a917f;')}>🔧 Auto-diagnostic</button>
        <button data-testid="btn-open-historique" onClick={openChangelog} style={sx('flex:1;border:1px dashed #d8cbb0;background:transparent;border-radius:14px;padding:10px;cursor:pointer;font-family:Quicksand;font-weight:600;font-size:12px;color:#9a917f;')}>🗂️ Historique des versions</button>
      </div>
      <div style={sx('height:16px;')} />
    </div>
  )
}
