import { useState } from 'react'

const lines = (arr) => (arr || []).join('\n')
const toList = (txt) => txt.split('\n').map((l) => l.trim()).filter(Boolean)
const nextId = (recipes) => (recipes.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1)

/**
 * Fiches recettes des spécialités du Cantal, consultables hors-ligne et
 * **éditables** (ajout / modification / suppression → store, donc export JSON).
 */
export function Recipes({ sx, recipes = [], setRecipes }) {
  const [openId, setOpenId] = useState(null)
  const [form, setForm] = useState(null) // { id?, emoji, name, desc, ingredients, steps }

  const startAdd = () => setForm({ emoji: '🍽️', name: '', desc: '', ingredients: '', steps: '' })
  const startEdit = (r) => setForm({ id: r.id, emoji: r.emoji || '🍽️', name: r.name, desc: r.desc || '', ingredients: lines(r.ingredients), steps: lines(r.steps) })
  const cancel = () => setForm(null)

  const save = () => {
    if (!form.name.trim()) return
    const rec = { id: form.id ?? nextId(recipes), emoji: form.emoji || '🍽️', name: form.name.trim(), desc: form.desc.trim(), ingredients: toList(form.ingredients), steps: toList(form.steps) }
    setRecipes((list) => (form.id ? list.map((r) => (r.id === form.id ? rec : r)) : [...list, rec]))
    setForm(null)
  }
  const remove = (id) => { setRecipes((list) => list.filter((r) => r.id !== id)); if (openId === id) setOpenId(null) }

  const field = 'width:100%;box-sizing:border-box;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;margin-top:6px;'

  return (
    <div data-testid="screen-recipes" style={sx('padding:0 18px 24px;')}>
      <div style={sx('font-size:13px;color:#6b6354;margin:8px 0 12px;')}>Les spécialités du Cantal à cuisiner en famille — consultables hors-ligne et personnalisables.</div>

      {form ? (
        <div data-testid="recipe-form" style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
          <div style={sx('display:flex;gap:8px;')}>
            <input data-testid="recipe-emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={sx('width:56px;box-sizing:border-box;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px;font-size:19px;text-align:center;')} />
            <input data-testid="recipe-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de la recette" style={sx('flex:1;box-sizing:border-box;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
          </div>
          <input data-testid="recipe-desc" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Courte description" style={sx(field)} />
          <textarea data-testid="recipe-ingredients" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder={'Ingrédients (une ligne par ingrédient)'} rows={5} style={sx(field + 'font-family:inherit;resize:vertical;')} />
          <textarea data-testid="recipe-steps" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} placeholder={'Étapes (une ligne par étape)'} rows={6} style={sx(field + 'font-family:inherit;resize:vertical;')} />
          <div style={sx('display:flex;gap:10px;margin-top:10px;')}>
            <button data-testid="recipe-cancel" onClick={cancel} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;color:#6b6354;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:12px;cursor:pointer;')}>Annuler</button>
            <button data-testid="recipe-save" onClick={save} style={sx('flex:1;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:12px;padding:12px;cursor:pointer;')}>Enregistrer</button>
          </div>
        </div>
      ) : (
        <button data-testid="recipe-add" onClick={startAdd} style={sx('width:100%;border:1px dashed #cf7d3c;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;margin-bottom:12px;')}>＋ Ajouter une recette</button>
      )}

      {!form && (
        <div style={sx('display:flex;flex-direction:column;gap:10px;')}>
          {recipes.map((r) => {
            const open = openId === r.id
            return (
              <div key={r.id} data-testid={`recipe-${r.id}`} style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px 14px;box-shadow:0 2px 8px rgba(74,93,58,0.05);')}>
                <button data-testid={`recipe-toggle-${r.id}`} onClick={() => setOpenId(open ? null : r.id)} style={sx('width:100%;text-align:left;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:12px;')}>
                  <span style={sx('font-size:22px;flex:0 0 auto;')}>{r.emoji}</span>
                  <span style={sx('flex:1;min-width:0;')}>
                    <span style={sx('display:block;font-family:Quicksand;font-weight:700;font-size:15px;')}>{r.name}</span>
                    {r.desc && <span style={sx('display:block;font-size:12px;color:#6b6354;margin-top:2px;')}>{r.desc}</span>}
                  </span>
                  <span style={sx('font-size:14px;color:#6b6354;')}>{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                  <div style={sx('margin-top:10px;')}>
                    <div style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;')}>Ingrédients</div>
                    <ul style={sx('margin:0 0 10px;padding-left:18px;font-size:13px;color:#3a352b;line-height:1.5;')}>
                      {r.ingredients.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                    <div style={sx('font-size:12px;font-weight:700;color:#6b6354;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;')}>Préparation</div>
                    <ol style={sx('margin:0;padding-left:18px;font-size:13px;color:#3a352b;line-height:1.5;')}>
                      {r.steps.map((it, i) => <li key={i} style={sx('margin-bottom:4px;')}>{it}</li>)}
                    </ol>
                    <div style={sx('display:flex;gap:10px;margin-top:12px;')}>
                      <button data-testid={`recipe-edit-${r.id}`} onClick={() => startEdit(r)} style={sx('flex:1;border:1px solid #efe6d4;background:#fffdf8;color:#4a5d3a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px;cursor:pointer;')}>✏️ Modifier</button>
                      <button data-testid={`recipe-delete-${r.id}`} onClick={() => remove(r.id)} style={sx('border:1px solid #efe6d4;background:#fffdf8;color:#b8503f;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:10px 14px;cursor:pointer;')}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
