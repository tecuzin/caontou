import { useState } from 'react'
import { s } from '../utils.js'
import { buildExport, downloadExport, shareExport } from '../backup.js'

export function ExportModal({ isOpen, onClose, currentStoreData, STORE_KEY, darkMode, onExportCopied }) {
  const [exportCopied, setExportCopied] = useState(false)
  // Le thème sombre est appliqué globalement via la classe `body.dark` +
  // `color: inherit` (voir index.html), pas par transformation de la chaîne CSS :
  // `sx` est donc un simple alias de `s`. (`darkMode` conservé pour l'API du composant.)
  const sx = s

  if (!isOpen) return null

  const copyExport = () => {
    const json = buildExport(currentStoreData(), STORE_KEY)
    navigator.clipboard.writeText(json).then(() => {
      setExportCopied(true)
      if (onExportCopied) onExportCopied()
      setTimeout(() => setExportCopied(false), 2000)
    })
  }

  const doDownloadExport = () => {
    const json = buildExport(currentStoreData(), STORE_KEY)
    downloadExport(json, `cantou-export-${new Date().toISOString().slice(0, 10)}.json`)
  }

  const doShareExport = () => {
    const json = buildExport(currentStoreData(), STORE_KEY)
    shareExport(json)
  }

  return (
    <div onClick={onClose} style={sx('position:fixed;inset:0;background:rgba(40,30,18,0.42);z-index:200;display:flex;flex-direction:column;justify-content:flex-end;animation:fadeIn 0.2s ease;')}>
      <div onClick={(e) => e.stopPropagation()} style={sx('width:100%;background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 36px;max-height:80vh;overflow-y:auto;animation:sheetUp 0.3s cubic-bezier(0.2,0.8,0.2,1);')}>
        <div style={sx('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;margin-bottom:6px;')}>Exporter les données</div>
        <div style={sx('font-size:13px;color:#6b6354;margin-bottom:14px;')}>Toutes les données de l'app (planning, dépenses, listes, favoris…) au format JSON. À garder en lieu sûr ou à envoyer sur un autre téléphone.</div>
        <textarea data-testid="export-json" readOnly value={buildExport(currentStoreData(), STORE_KEY)} onFocus={(e) => e.target.select()} style={sx('width:100%;height:180px;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:11px;font-family:ui-monospace,monospace;resize:none;')} />
        <button data-testid="btn-share-export" onClick={doShareExport} style={sx('width:100%;margin-top:14px;border:none;background:#cf7d3c;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>📤 Envoyer vers Telegram / WhatsApp…</button>
        <div style={sx('display:flex;gap:10px;margin-top:10px;')}>
          <button onClick={copyExport} style={sx(`flex:1;border:none;background:${exportCopied ? '#5b7042' : '#4a5d3a'};color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;`)}>{exportCopied ? '✓ Copié !' : '📋 Copier'}</button>
          <button onClick={doDownloadExport} style={sx('flex:1;border:1px solid #4a5d3a;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>💾 Télécharger</button>
        </div>
        <button onClick={onClose} style={sx('width:100%;margin-top:10px;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:13px;cursor:pointer;')}>Fermer</button>
      </div>
    </div>
  )
}
