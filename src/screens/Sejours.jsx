import { useState } from 'react'
import { ModalShell } from '../modals/ModalShell.jsx'
import {
  loadProfiles, saveProfiles, addProfile, renameProfile, removeProfile, findProfile,
} from '../profiles.js'

/** Formate une date ISO de sauvegarde en texte court lisible ("5 août 2026 · 14:30"). */
function fmtSavedAt(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/**
 * Écran Multi-séjours — sauvegarde, restaure et gère des « profils » de séjour.
 *
 * Chaque profil est un instantané complet du store courant (currentStoreData),
 * rangé sous la clé localStorage SÉPARÉE `cantou.profiles` (jamais `cantou.v1`).
 * Toute la logique de tableau vit dans profiles.js ; cet écran orchestre :
 *   - « 💾 Sauvegarder le séjour actuel » → snapshot → nouveau profil nommé
 *   - « ✨ Nouveau séjour vierge » → confirm → reset store + reload (via prop)
 *   - par profil : Charger (réécrit cantou.v1 + reload) / Renommer / Supprimer.
 */
export function Sejours({ sx, trip, fmtDayShort, fmtMonthYear, currentStoreData, resetToDefaults }) {
  const [profiles, setProfiles] = useState(() => loadProfiles())
  // dialog : { type:'save'|'rename'|'delete'|'new'|'load', id?, name? }
  const [dialog, setDialog] = useState(null)
  const [nameInput, setNameInput] = useState('')

  const persist = (next) => { setProfiles(next); saveProfiles(next) }

  const openSave = () => {
    const defName = trip?.destination || 'Nouveau séjour'
    setNameInput(defName)
    setDialog({ type: 'save' })
  }
  const openRename = (p) => { setNameInput(p.name); setDialog({ type: 'rename', id: p.id }) }
  const openDelete = (p) => setDialog({ type: 'delete', id: p.id, name: p.name })
  const openLoad = (p) => setDialog({ type: 'load', id: p.id, name: p.name })
  const openNew = () => setDialog({ type: 'new' })
  const closeDialog = () => { setDialog(null); setNameInput('') }

  const confirmSave = () => {
    persist(addProfile(profiles, { name: nameInput, data: currentStoreData() }))
    closeDialog()
  }
  const confirmRename = () => {
    persist(renameProfile(profiles, dialog.id, nameInput))
    closeDialog()
  }
  const confirmDelete = () => {
    persist(removeProfile(profiles, dialog.id))
    closeDialog()
  }
  const confirmLoad = () => {
    const p = findProfile(profiles, dialog.id)
    if (!p) return closeDialog()
    // Écrit l'instantané dans cantou.v1 puis recharge pour ré-hydrater l'app.
    try { localStorage.setItem('cantou.v1', JSON.stringify(p.data)) } catch { }
    try { window.location.reload() } catch { }
  }
  const confirmNew = () => {
    // Remet le store à ses valeurs par défaut (helper fourni par App) + reload.
    resetToDefaults()
  }

  const dialogTitle = {
    save: 'Sauvegarder le séjour actuel',
    rename: 'Renommer le séjour',
    delete: 'Supprimer ce séjour ?',
    load: 'Charger ce séjour ?',
    new: 'Nouveau séjour vierge ?',
  }

  return (
    <div data-testid="screen-sejours" style={sx('padding:0 18px 24px;')}>
      <div style={sx('font-size:13px;color:#6b6354;margin:2px 0 16px;line-height:1.4;')}>
        Sauvegarde l'état complet de l'app comme un « séjour » réutilisable, puis recharge-le plus tard.
        Chaque séjour est une copie indépendante — charger n'écrase que l'app en cours, jamais tes séjours enregistrés.
      </div>

      {/* Séjour actuel */}
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin-bottom:8px;')}>Séjour actuel</div>
      <div data-testid="current-trip-card" style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:16px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
        <div style={sx('display:flex;align-items:center;gap:12px;')}>
          <div style={sx('width:44px;height:44px;flex:0 0 auto;border-radius:14px;background:#e7ecdf;display:flex;align-items:center;justify-content:center;font-size:22px;')}>🧳</div>
          <div style={sx('flex:1;min-width:0;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{trip?.destination || 'Séjour en cours'}</div>
            <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{fmtDayShort(trip.start)} → {fmtDayShort(trip.end)} {fmtMonthYear(trip.end)}</div>
          </div>
        </div>
        <button data-testid="btn-save-current" onClick={openSave} style={sx('margin-top:12px;width:100%;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>💾 Sauvegarder le séjour actuel</button>
        <button data-testid="btn-new-blank" onClick={openNew} style={sx('margin-top:10px;width:100%;border:1px solid #9c6b4a;background:#fffdf8;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>✨ Nouveau séjour vierge</button>
      </div>

      {/* Séjours enregistrés */}
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;margin:20px 0 8px;')}>Séjours enregistrés</div>
      {profiles.length === 0 ? (
        <div data-testid="profiles-empty" style={sx('background:#fffdf8;border:1px dashed #d8cbb0;border-radius:16px;padding:20px;text-align:center;font-size:13px;color:#6b6354;')}>
          Aucun séjour enregistré pour l'instant. Sauvegarde le séjour actuel pour en créer un.
        </div>
      ) : (
        <div style={sx('display:flex;flex-direction:column;gap:12px;')}>
          {profiles.map((p) => (
            <div key={p.id} data-testid={`profile-${p.id}`} style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
              <div style={sx('font-family:Quicksand;font-weight:700;font-size:16px;')}>{p.name}</div>
              <div style={sx('font-size:12px;color:#6b6354;margin-top:2px;')}>Sauvegardé le {fmtSavedAt(p.savedAt)}</div>
              <div style={sx('display:flex;gap:8px;margin-top:12px;')}>
                <button data-testid={`btn-load-${p.id}`} onClick={() => openLoad(p)} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>📂 Charger</button>
                <button data-testid={`btn-rename-${p.id}`} onClick={() => openRename(p)} style={sx('border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px 14px;cursor:pointer;')}>✏️</button>
                <button data-testid={`btn-delete-${p.id}`} onClick={() => openDelete(p)} style={sx('border:1px solid #d8cbb0;background:#fffdf8;color:#b8503f;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px 14px;cursor:pointer;')}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dialog && (
        <ModalShell onClose={closeDialog} z={200}>
          <div role="dialog" aria-modal="true" data-testid="sejours-dialog" onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s;')}>
            <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>{dialogTitle[dialog.type]}</div>

            {(dialog.type === 'save' || dialog.type === 'rename') && (
              <>
                <div style={sx('font-size:12px;color:#6b6354;margin-bottom:14px;')}>Nom du séjour</div>
                <input data-testid="sejours-name-input" type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Ex : Cantal août 2026…" style={sx('width:100%;border:1px solid #d8cbb0;border-radius:8px;padding:10px;font-size:14px;margin-bottom:14px;')} />
              </>
            )}
            {dialog.type === 'delete' && (
              <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;line-height:1.4;')}>« {dialog.name} » sera supprimé de tes séjours enregistrés. Le séjour actuel n'est pas touché.</div>
            )}
            {dialog.type === 'load' && (
              <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;line-height:1.4;')}>Le séjour actuel sera remplacé par « {dialog.name} ». Pense à le sauvegarder d'abord si tu veux le garder. L'app va se recharger.</div>
            )}
            {dialog.type === 'new' && (
              <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;line-height:1.4;')}>Toutes les données actuelles (favoris, cases, dépenses, photos…) reviennent aux valeurs par défaut. Sauvegarde le séjour actuel d'abord si tu veux le garder. L'app va se recharger.</div>
            )}

            <div style={sx('display:flex;gap:10px;')}>
              <button data-testid="sejours-dialog-cancel" onClick={closeDialog} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>Annuler</button>
              {dialog.type === 'save' && <button data-testid="sejours-dialog-confirm" onClick={confirmSave} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>💾 Sauvegarder</button>}
              {dialog.type === 'rename' && <button data-testid="sejours-dialog-confirm" onClick={confirmRename} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✓ Renommer</button>}
              {dialog.type === 'delete' && <button data-testid="sejours-dialog-confirm" onClick={confirmDelete} style={sx('flex:1;border:none;background:#b8503f;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>🗑️ Supprimer</button>}
              {dialog.type === 'load' && <button data-testid="sejours-dialog-confirm" onClick={confirmLoad} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>📂 Charger</button>}
              {dialog.type === 'new' && <button data-testid="sejours-dialog-confirm" onClick={confirmNew} style={sx('flex:1;border:none;background:#9c6b4a;color:#fffaf0;font-weight:600;border-radius:8px;padding:12px;cursor:pointer;')}>✨ Repartir de zéro</button>}
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}
