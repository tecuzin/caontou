/** Section « Suggestions » de l'Accueil (notes libres à envoyer). */
export function SuggestionsSection({ sx, newSuggestionText, setNewSuggestionText, submitSuggestion, suggestions, deleteSuggestion, sendSuggestions }) {
  return (
    <>
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
    </>
  )
}
