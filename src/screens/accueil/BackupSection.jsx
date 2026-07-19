/** Section « Sauvegarde » de l'Accueil (export/import JSON + diagnostic + historique). */
export function BackupSection({ sx, lastBackupAt, formatLastBackup, setExportCopied, setShowExport, setShowImport, runSelfTestAndShow, openChangelog }) {
  return (
    <>
      <div style={sx('padding:6px 18px 4px;display:flex;align-items:baseline;justify-content:space-between;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;letter-spacing:0.5px;color:#6b6354;text-transform:uppercase;')}>Sauvegarde</div>
        <div data-testid="last-backup-label" style={sx('font-size:12px;color:#6b6354;')}>Dernière : {formatLastBackup(lastBackupAt)}</div>
      </div>
      <div style={sx('padding:6px 18px 12px;display:flex;gap:12px;')}>
        <button data-testid="btn-export" onClick={() => { setExportCopied(false); setShowExport(true) }} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:12px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#4a5d3a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬇️ Exporter (JSON)</button>
        <button data-testid="btn-import" onClick={() => setShowImport(true)} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;border-radius:16px;padding:12px;cursor:pointer;font-family:Quicksand;font-weight:700;font-size:14px;color:#9c6b4a;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>⬆️ Importer</button>
      </div>
      <div style={sx('padding:0 18px 12px;display:flex;gap:10px;')}>
        <button data-testid="btn-selftest" onClick={runSelfTestAndShow} style={sx('flex:1;border:1px dashed #d8cbb0;background:transparent;border-radius:14px;padding:10px;cursor:pointer;font-family:Quicksand;font-weight:600;font-size:12px;color:#9a917f;')}>🔧 Auto-diagnostic</button>
        <button data-testid="btn-open-historique" onClick={openChangelog} style={sx('flex:1;border:1px dashed #d8cbb0;background:transparent;border-radius:14px;padding:10px;cursor:pointer;font-family:Quicksand;font-weight:600;font-size:12px;color:#9a917f;')}>🗂️ Historique des versions</button>
      </div>
    </>
  )
}
