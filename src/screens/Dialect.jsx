import { useMemo, useState } from 'react'
import { pickRound, randomDialectSeed } from '../dialect.js'

const EMPTY = { word: '', meaning: '', note: '', source: '' }

/** Formulaire d'ajout / édition d'un mot du lexique. */
function WordForm({ sx, draft, setDraft, onSave, onCancel, isEdit }) {
  const inputCss = 'width:100%;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:12px 14px;font-size:15px;margin-top:6px;margin-bottom:12px;'
  const labelCss = 'font-size:12px;font-weight:700;color:#6b6354;'
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value })
  return (
    <div data-testid="dialect-form" style={sx('background:#f6efe2;border:1px solid #efe6d4;border-radius:16px;padding:14px;margin-bottom:16px;')}>
      <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;margin-bottom:10px;')}>{isEdit ? '✏️ Modifier le mot' : '＋ Nouveau mot'}</div>
      <div style={sx(labelCss)}>Mot ou expression</div>
      <input data-testid="dialect-input-word" value={draft.word} onChange={set('word')} placeholder="Ex : Cantou" style={sx(inputCss)} />
      <div style={sx(labelCss)}>Ce que ça veut dire</div>
      <input data-testid="dialect-input-meaning" value={draft.meaning} onChange={set('meaning')} placeholder="Ex : le coin du feu" style={sx(inputCss)} />
      <div style={sx(labelCss)}>Petite note (optionnel)</div>
      <input data-testid="dialect-input-note" value={draft.note} onChange={set('note')} placeholder="Ex : de l’occitan « canton » = le coin" style={sx(inputCss)} />
      <div style={sx(labelCss)}>Source (optionnel, mais recommandé)</div>
      <input data-testid="dialect-input-source" value={draft.source} onChange={set('source')} placeholder="Ex : CNRTL, IEO Cantal…" style={sx(inputCss)} />
      <div style={sx('display:flex;gap:10px;')}>
        <button data-testid="dialect-cancel" onClick={onCancel} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Annuler</button>
        <button data-testid="dialect-save" onClick={onSave} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>{isEdit ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </div>
  )
}

/**
 * Sous-écran « Parler d'Auvergne » — flashcards (mot → tap → sens) ET gestion
 * du lexique (ajout / modification / suppression).
 *
 * Le contenu vient du store (`dialectWords`, semé au schéma 6 depuis
 * `DIALECT_WORDS`) : il est donc corrigeable à la main et voyage dans
 * l'export JSON. Sans `setWords`, l'écran reste en lecture seule.
 */
export function Dialect({ sx, words = [], setWords }) {
  const [seed, setSeed] = useState(randomDialectSeed)
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(null)   // index édité, ou 'new'
  const [draft, setDraft] = useState(EMPTY)
  const [manage, setManage] = useState(false)

  const round = useMemo(() => pickRound(words, words.length, seed), [words, seed])
  const total = round.length
  const card = round[i]
  const canEdit = typeof setWords === 'function'

  const go = (delta) => { setI((prev) => (prev + delta + total) % total); setRevealed(false) }
  const shuffleRound = () => { setSeed(randomDialectSeed()); setI(0); setRevealed(false) }

  const startNew = () => { setDraft(EMPTY); setEditing('new') }
  const startEdit = (idx) => { setDraft({ ...EMPTY, ...words[idx] }); setEditing(idx) }
  const cancel = () => { setEditing(null); setDraft(EMPTY) }
  const save = () => {
    const w = { ...draft, word: draft.word.trim(), meaning: draft.meaning.trim() }
    if (!w.word || !w.meaning) return // mot et sens obligatoires
    setWords(editing === 'new' ? [...words, w] : words.map((x, k) => (k === editing ? w : x)))
    cancel(); setI(0); setRevealed(false)
  }
  const remove = (idx) => { setWords(words.filter((_, k) => k !== idx)); setI(0); setRevealed(false) }

  return (
    <div data-testid="screen-dialect" style={sx('padding:16px 18px 40px;')}>
      <div style={sx('background:#8a8b3d;border-radius:20px;padding:18px;color:#f3ecda;box-shadow:0 8px 20px rgba(138,139,61,0.22);')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>🗣️ Parler d’Auvergne</div>
        <div style={sx('font-size:13px;color:#dbe2c9;margin-top:4px;')}>Devine ce que veut dire le mot, puis touche la carte.</div>
      </div>

      {canEdit && (
        <button data-testid="dialect-toggle-manage" onClick={() => { setManage((m) => !m); cancel() }} style={sx(`width:100%;margin-top:14px;border:1px solid ${manage ? '#4a5d3a' : '#ece2cf'};background:${manage ? '#4a5d3a' : '#fffdf8'};color:${manage ? '#fffaf0' : '#6b6354'};font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;`)}>{manage ? '🎴 Revenir aux cartes' : '📝 Gérer le lexique'}</button>
      )}

      {manage && canEdit ? (
        <div style={sx('margin-top:14px;')}>
          {editing !== null
            ? <WordForm sx={sx} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} isEdit={editing !== 'new'} />
            : <button data-testid="dialect-add" onClick={startNew} style={sx('width:100%;margin-bottom:14px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Ajouter un mot</button>}

          <div style={sx('display:flex;flex-direction:column;gap:8px;')}>
            {words.map((w, idx) => (
              <div key={`${w.word}-${idx}`} data-testid={`dialect-row-${idx}`} style={sx('display:flex;align-items:flex-start;gap:10px;background:#fffdf8;border:1px solid #efe6d4;border-radius:14px;padding:12px 14px;')}>
                <div style={sx('flex:1;min-width:0;')}>
                  <div style={sx('font-family:Quicksand;font-weight:700;font-size:15px;')}>{w.word}</div>
                  <div style={sx('font-size:13px;color:#6b6354;margin-top:2px;')}>{w.meaning}</div>
                  {w.source && <div style={sx('font-size:12px;color:#9a917f;margin-top:4px;')}>📚 {w.source}</div>}
                </div>
                <button data-testid={`dialect-edit-${idx}`} onClick={() => startEdit(idx)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;')}>✏️</button>
                <button data-testid={`dialect-del-${idx}`} onClick={() => remove(idx)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
              </div>
            ))}
            {words.length === 0 && <div style={sx('text-align:center;color:#9a917f;font-size:14px;padding:12px;')}>Lexique vide — ajoute un premier mot.</div>}
          </div>
        </div>
      ) : card ? (
        <>
          <div style={sx('display:flex;align-items:center;justify-content:space-between;margin-top:16px;margin-bottom:12px;')}>
            <div style={sx('font-size:13px;font-weight:700;color:#6b6354;')}>{i + 1}/{total}</div>
            <button data-testid="dialect-shuffle" onClick={shuffleRound} style={sx('border:1px solid #ece2cf;background:#fffdf8;color:#6b6354;border-radius:999px;padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer;')}>🔀 Mélanger</button>
          </div>

          <button data-testid="dialect-card" onClick={() => setRevealed(true)} style={sx('width:100%;text-align:left;background:#fffdf8;border:1px solid #efe6d4;border-radius:20px;padding:22px 18px;cursor:pointer;box-shadow:0 4px 14px rgba(74,93,58,0.08);min-height:150px;')}>
            <div style={sx('font-size:12px;font-weight:700;color:#8a8b3d;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;')}>Le mot</div>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:22px;color:#2f2a22;')}>{card.word}</div>
            {revealed ? (
              <div data-testid="dialect-answer" style={sx('margin-top:16px;padding-top:14px;border-top:1px solid #f1e9da;')}>
                <div style={sx('font-size:15px;color:#4a5d3a;font-weight:600;')}>{card.meaning}</div>
                {card.note && <div style={sx('font-size:13px;color:#6b6354;margin-top:8px;')}>💡 {card.note}</div>}
                {card.source && <div style={sx('font-size:12px;color:#9a917f;margin-top:8px;')}>📚 {card.source}</div>}
              </div>
            ) : <div style={sx('margin-top:16px;font-size:13px;color:#9a917f;')}>👆 Touche la carte pour voir la réponse</div>}
          </button>

          <div style={sx('display:flex;gap:10px;margin-top:16px;')}>
            <button data-testid="dialect-prev" onClick={() => go(-1)} style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>‹ Précédent</button>
            <button data-testid="dialect-next" onClick={() => go(1)} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:15px;border-radius:14px;padding:12px;cursor:pointer;')}>Suivant ›</button>
          </div>
        </>
      ) : (
        <div style={sx('margin-top:22px;text-align:center;color:#9a917f;font-size:14px;')}>Lexique vide — ajoute un mot avec « 📝 Gérer le lexique ».</div>
      )}
    </div>
  )
}
