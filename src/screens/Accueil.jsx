import { Panorama } from '../Scenery.jsx'
import { KIDS_GAMES, EMERGENCY_NUMBERS } from '../data.js'
import { featureKeyForAction } from '../features.js'
import { CarSpot } from '../components/CarSpot.jsx'
import { TodayCard } from './accueil/TodayCard.jsx'
import { SkyCard } from './accueil/SkyCard.jsx'
import { GamesSection } from './accueil/GamesSection.jsx'
import { SuggestionsSection } from './accueil/SuggestionsSection.jsx'
import { EmergencySection } from './accueil/EmergencySection.jsx'
import { BackupSection } from './accueil/BackupSection.jsx'

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
  { emoji: '🧭', name: 'Itinéraire', sub: 'Sorties par proximité', bg: '#e7ecdf', action: 'sub:itineraire' },
  { emoji: '🗺️', name: 'Carte', sub: 'Séjour & voiture', bg: '#dfeae6', action: 'sub:carte' },
  { emoji: '🧳', name: 'Mes séjours', sub: 'Sauver & réutiliser', bg: '#e7ecdf', action: 'sub:sejours' },
  { emoji: '🔗', name: 'Partager', sub: 'Config vers un autre tél.', bg: '#dfeae6', action: 'sub:partage-config' },
  // Réglages n'a pas de clé feature (mod_reglages inconnue) → toujours visible.
  { emoji: '🎛️', name: 'Réglages', sub: 'Activer / masquer', bg: '#eee7d4', action: 'sub:reglages' },
]

/** Écran Accueil — carte de la prochaine aventure, aujourd'hui, modules, suggestions et sauvegarde. */
export function Accueil({
  sx, darkMode, setDarkMode, openTripEdit, fmtDayShort, fmtMonthYear, trip, countdown, today,
  setTab, setDay, setSub, packDone, packTotal, packPct, openModule,
  newSuggestionText, setNewSuggestionText, submitSuggestion, suggestions, deleteSuggestion, sendSuggestions,
  lastBackupAt, formatLastBackup, setExportCopied, setShowExport, setShowImport, runSelfTestAndShow,
  isDepartureDay, quickPhoto, openMyPosition, openChangelog,
  isCheckoutSoon, departureDone = 0, departureTotal = 0,
  dailyChallenge, challengeDone, markChallengeDone,
  carSpot, parkCar, findCar, forgetCar,
  isOn = () => true, kidsGames = KIDS_GAMES, emergencyNumbers = EMERGENCY_NUMBERS,
  weatherSuggest = null, onOpenVisites,
}) {
  const shownModules = MODULES.filter((m) => {
    const key = featureKeyForAction(m.action)
    return !key || isOn(key)
  })
  return (
    <div data-testid="screen-accueil">
      <div style={sx('margin:54px 18px 14px 18px;border-radius:28px;padding:20px;color:#fffaf0;box-shadow:0 10px 26px rgba(74,93,58,0.24);position:relative;overflow:hidden;min-height:190px;')}>
        <div data-testid="hero-panorama-bg" style={sx('position:absolute;inset:0;z-index:0;')}>
          <Panorama height="100%" />
          <div style={sx('position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,40,25,0.15) 0%,rgba(25,35,20,0.55) 60%,rgba(20,28,16,0.75) 100%);')} />
        </div>
        <button data-testid="btn-quick-photo" onClick={quickPhoto} style={sx('position:absolute;top:14px;right:98px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 10px;font-size:15px;cursor:pointer;')}>📷</button>
        <button data-testid="btn-dark-mode-toggle" onClick={() => setDarkMode((d) => !d)} style={sx('position:absolute;top:14px;right:56px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 10px;font-size:15px;cursor:pointer;')}>{darkMode ? '☀️' : '🌙'}</button>
        <button data-testid="btn-trip-settings" onClick={openTripEdit} style={sx('position:absolute;top:14px;right:14px;z-index:2;border:none;background:rgba(255,255,255,0.2);color:#fffaf0;border-radius:10px;padding:6px 10px;font-size:15px;cursor:pointer;')}>⚙️</button>
        <div style={sx('position:relative;z-index:1;')}>
          <div style={sx('font-size:12px;letter-spacing:1.5px;font-weight:700;color:#efe6d4;')}>{isDepartureDay ? "🎉 C'EST LE GRAND JOUR !" : 'PROCHAINE AVENTURE'}</div>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:30px;line-height:1.08;margin-top:8px;text-shadow:0 2px 8px rgba(0,0,0,0.25);')}>Carladès,<br />Cantal</div>
          <div style={sx('margin-top:10px;font-size:14px;color:#efe6d4;')}>{fmtDayShort(trip.start)} → {fmtDayShort(trip.end)} {fmtMonthYear(trip.end)}</div>
          <div style={sx('display:flex;gap:8px;margin-top:16px;')}>
            <div data-testid="countdown-pill" style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 12px;font-weight:700;font-family:Quicksand;')}>{isDepartureDay ? 'Jour J 🎉' : `J-${countdown}`}</div>
            <div style={sx('background:rgba(255,255,255,0.18);border-radius:12px;padding:8px 12px;font-weight:700;')}>☀️ 24° sur place</div>
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

      {today && <TodayCard sx={sx} today={today} setTab={setTab} setDay={setDay} />}

      {isOn('extra_sky') && <SkyCard sx={sx} />}

      {today && dailyChallenge && (
        <div data-testid="challenge-card" style={sx(`margin:0 18px 14px;background:#fffdf8;border:2px solid #5b7042;border-radius:20px;padding:16px;box-shadow:0 4px 14px rgba(91,112,66,0.16);${challengeDone ? 'opacity:0.75;' : ''}`)}>
          <div style={sx('font-size:12px;letter-spacing:1px;font-weight:700;color:#5b7042;')}>🎯 DÉFI DU JOUR</div>
          <div style={sx('display:flex;align-items:center;gap:12px;margin-top:8px;')}>
            <span style={sx('font-size:30px;flex:0 0 auto;')}>{dailyChallenge.emoji}</span>
            <div style={sx(`flex:1;min-width:0;font-family:Quicksand;font-weight:700;font-size:15px;${challengeDone ? 'text-decoration:line-through;color:#9a917f;' : ''}`)}>{dailyChallenge.label}</div>
          </div>
          {challengeDone ? (
            <div data-testid="challenge-done" style={sx('margin-top:12px;text-align:center;font-size:14px;font-weight:700;color:#5b7042;')}>✅ Défi relevé, bravo !</div>
          ) : (
            <button data-testid="btn-challenge-done" onClick={markChallengeDone} style={sx('margin-top:12px;width:100%;border:none;background:#5b7042;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>C'est fait ! 🎉</button>
          )}
        </div>
      )}

      {today && weatherSuggest && (
        <div data-testid="weather-suggestion" style={sx(`margin:0 18px 14px;background:#fffdf8;border:1px solid ${weatherSuggest.rainy ? '#4f8a86' : '#efe6d4'};border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);`)}>
          <div style={sx('font-size:12px;letter-spacing:1px;font-weight:700;color:#4f8a86;')}>{weatherSuggest.rainy ? '🌧️ MÉTÉO DU JOUR' : '☀️ MÉTÉO DU JOUR'}</div>
          <div style={sx('font-size:14px;color:#6b6354;margin-top:8px;line-height:1.4;')}>{weatherSuggest.message}</div>
          {weatherSuggest.rainy && weatherSuggest.indoor.length > 0 && (
            <div style={sx('display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;')}>
              {weatherSuggest.indoor.slice(0, 4).map((v) => (
                <button key={v.id} data-testid={`weather-indoor-${v.id}`} onClick={onOpenVisites} style={sx('border:none;background:#e7ecdf;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:12px;border-radius:999px;padding:7px 12px;cursor:pointer;')}>{v.emoji} {v.name}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {today && parkCar && <CarSpot sx={sx} carSpot={carSpot} parkCar={parkCar} findCar={findCar} forgetCar={forgetCar} />}

      <div style={sx('margin:0 18px 12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <div style={sx('display:flex;align-items:center;gap:12px;')}>
          <div style={sx('width:44px;height:44px;border-radius:14px;background:#dfeae6;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🚗</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Le grand départ</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{fmtDayShort(trip.start)} · depuis {trip.origin}{trip.etape ? ` · via ${trip.etape}` : ''}</div>
          </div>
        </div>
        <button onClick={() => setSub('trajet')} style={sx('margin-top:12px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Voir le trajet →</button>
      </div>

      <button onClick={() => setSub('logistique')} style={sx('margin:0 18px 14px;width:calc(100% - 36px);text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:16px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;')}>
          <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>🧳 Valises &amp; préparatifs</div>
          <div style={sx('font-size:13px;color:#6b6354;font-weight:700;')}>{packDone}/{packTotal}</div>
        </div>
        <div style={sx('margin-top:12px;height:9px;border-radius:8px;background:#efe6d4;overflow:hidden;')}><div style={sx(`height:100%;border-radius:8px;background:#cf7d3c;width:${packPct}%;`)} /></div>
      </button>

      <div style={sx('padding:6px 18px 10px;font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Tout le séjour</div>
      <div style={sx('padding:0 18px 12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
        {shownModules.map((m) => (
          <button key={m.name} data-testid={`module-${m.action}`} onClick={() => openModule(m.action)} style={sx('text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;cursor:pointer;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
            <div style={sx(`width:42px;height:42px;border-radius:14px;background:${m.bg};display:flex;align-items:center;justify-content:center;font-size:22px;`)}>{m.emoji}</div>
            <div>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{m.name}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>{m.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <GamesSection sx={sx} kidsGames={kidsGames} setSub={setSub} />

      <SuggestionsSection sx={sx} newSuggestionText={newSuggestionText} setNewSuggestionText={setNewSuggestionText} submitSuggestion={submitSuggestion} suggestions={suggestions} deleteSuggestion={deleteSuggestion} sendSuggestions={sendSuggestions} />

      <EmergencySection sx={sx} emergencyNumbers={emergencyNumbers} openMyPosition={openMyPosition} />

      <div style={sx('padding:6px 18px 12px;')}>
        <button data-testid="btn-open-bilan" onClick={() => setSub('bilan')} style={sx('width:100%;text-align:left;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('width:42px;height:42px;flex:0 0 auto;border-radius:14px;background:#f3e2d6;display:flex;align-items:center;justify-content:center;font-size:22px;')}>📊</div>
          <div style={sx('flex:1;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>Bilan du séjour</div>
            <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>Stats & récap à partager</div>
          </div>
          <div style={sx('font-size:14px;color:#6b6354;flex:0 0 auto;')}>›</div>
        </button>
      </div>

      <BackupSection sx={sx} lastBackupAt={lastBackupAt} formatLastBackup={formatLastBackup} setExportCopied={setExportCopied} setShowExport={setShowExport} setShowImport={setShowImport} runSelfTestAndShow={runSelfTestAndShow} openChangelog={openChangelog} />
      <div style={sx('height:16px;')} />
    </div>
  )
}
