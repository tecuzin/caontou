/**
 * Recherche globale dans le contenu du séjour, 100 % locale (parcours du store,
 * aucune API). Indexation légère à la volée + matching insensible à la casse et
 * aux accents. Module pur, testable. Chaque résultat porte un `nav` (onglet ou
 * sous-écran) pour que l'UI aiguille via `setTab` / `setSub`.
 */

/** Minuscule + suppression des accents (NFD). */
export function normalize(str) {
  return (str == null ? '' : String(str)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const itemText = (it) => (typeof it === 'string' ? it : (it && (it.label || it.name)) || '')

/** Construit la liste plate des entrées indexables du store. */
function collect(store) {
  const s = store || {}
  const out = []
  const push = (group, nav, label, sublabel = '', extra = '') => {
    if (!label) return
    out.push({ group, nav, label, sublabel, text: normalize(`${label} ${sublabel} ${extra}`) })
  }

  ;(s.visits || []).forEach((v) => push('Visites', { tab: 'visites' }, v.name, [v.cat, v.dist, v.dur].filter(Boolean).join(' · ')))
  ;(s.meals || []).forEach((m) => push('Repas', { tab: 'repas' }, m.dish, m.day))
  ;(s.days || []).forEach((d, di) => {
    push('Planning', { tab: 'planning', day: di }, d.title, `${d.dow || ''} ${d.num || ''}`.trim() + (d.sub ? ` · ${d.sub}` : ''))
    ;(d.items || []).forEach((it) => push('Planning', { tab: 'planning', day: di }, it.title, `${d.dow || ''} ${d.num || ''} · ${it.time || ''}`.trim(), it.note))
  })
  ;(s.logi || []).forEach((l) => (l.items || []).forEach((it) => push('Préparatifs', { sub: 'logistique' }, itemText(it), l.name)))
  ;(s.courses || []).forEach((c) => (c.items || []).forEach((it) => push('Courses', { tab: 'repas' }, itemText(it), c.name)))
  ;(s.shoppingItems || []).forEach((it) => push('Courses', { tab: 'repas' }, itemText(it)))
  ;(s.restos || []).forEach((r) => push('Restos', { sub: 'restos' }, r.name, r.place))
  const tr = s.trajets || {}
  ;['aller', 'retour'].forEach((dir) => (tr[dir] || []).forEach((st) => push('Trajet', { sub: 'trajet' }, st.place, st.time, st.note)))
  const j = s.journal || {}
  Object.entries(j).forEach(([k, txt]) => { if (txt) push('Journal', { sub: 'souvenirs' }, `Journal — jour ${Number(k) + 1}`, '', txt) })

  return out
}

/**
 * Recherche `query` dans le store. Tous les mots de la requête doivent matcher
 * (ET). Renvoie une liste plate de résultats (`{ group, nav, label, sublabel }`),
 * limitée à `limit`. Requête < 2 caractères → aucun résultat.
 */
export function searchStore(store, query, limit = 40) {
  const q = normalize(query).trim()
  if (q.length < 2) return []
  const terms = q.split(/\s+/)
  return collect(store)
    .filter((r) => terms.every((t) => r.text.includes(t)))
    .slice(0, limit)
    .map(({ group, nav, label, sublabel }) => ({ group, nav, label, sublabel }))
}

/** Regroupe les résultats de `searchStore` par `group` (ordre d'apparition). */
export function groupResults(results) {
  const map = new Map()
  for (const r of results) {
    if (!map.has(r.group)) map.set(r.group, [])
    map.get(r.group).push(r)
  }
  return [...map.entries()].map(([group, items]) => ({ group, items }))
}
