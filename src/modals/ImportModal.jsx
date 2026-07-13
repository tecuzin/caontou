import { s } from '../utils.js'
import { ModalShell } from './ModalShell.jsx'
import { parseImport } from '../backup.js'

export function ImportModal({ isOpen, onClose, importText, setImportText, importError, importPreview, applyImport, doParseImport, darkMode }) {
  const sx = (css) => s(css)

  if (!isOpen) return null

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setImportText(text)
    doParseImport(text)
  }

  const closeImport = () => {
    onClose()
  }

  return (
    <ModalShell onClose={closeImport} z={200} fade={true}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Importer des données</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Coller un export Cantou ci-dessous, ou choisir le fichier JSON.</div>
        <textarea data-testid="import-textarea" value={importText} onChange={(e) => { setImportText(e.target.value); doParseImport(e.target.value) }} placeholder='{"app":"cantou", …}' style={sx('width:100%;height:140px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
        <label style={sx('display:block;margin-top:10px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;text-align:center;')}>
          📂 Choisir un fichier…
          <input type="file" accept=".json,application/json" onChange={handleImportFile} style={sx('display:none;')} />
        </label>
        {importError && <div style={sx('margin-top:10px;background:#f7e2dc;border-radius:12px;padding:11px 13px;font-size:13px;color:#b8503f;font-weight:600;')}>⚠️ {importError}</div>}
        {importPreview && (
          <div data-testid="import-preview" style={sx('margin-top:10px;background:#e7ecdf;border-radius:12px;padding:11px 13px;font-size:13px;color:#4a5d3a;')}>
            ✓ Export Cantou valide — {Array.isArray(importPreview.expenses) ? importPreview.expenses.length : 0} dépenses, {Array.isArray(importPreview.meals) ? importPreview.meals.length : 0} repas, {Array.isArray(importPreview.visits) ? importPreview.visits.length : 0} visites, {Array.isArray(importPreview.days) ? importPreview.days.length : 0} jours de planning.
          </div>
        )}
        <div style={sx('display:flex;gap:10px;margin-top:14px;')}>
          <button onClick={closeImport} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Annuler</button>
          <button data-testid="btn-apply-import" onClick={applyImport} disabled={!importPreview} style={sx(`flex:1;border:none;background:${importPreview ? '#b8503f' : '#d8cbb0'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:${importPreview ? 'pointer' : 'not-allowed'};`)}>Remplacer mes données</button>
        </div>
        <div style={sx('margin-top:10px;font-size:12px;color:#6b6354;text-align:center;')}>⚠️ Remplace toutes les données actuelles de l'app.</div>
      </div>
    </ModalShell>
  )
}
