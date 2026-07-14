// ── Partage des dépenses « qui doit combien ? » (façon Tricount) ──────────────
//
// Calcul 100 % pur et hors-ligne (aucune dépendance, aucun état). Une dépense
// peut porter deux champs optionnels, rétro-compatibles avec l'existant :
//   - `paidBy`    : nom du membre qui a payé (dans `familyMembers`) ;
//   - `sharedWith`: membres entre qui la dépense est partagée (défaut = tous).
// Une dépense sans `paidBy` (ou dont le payeur n'est pas un membre connu) est
// simplement ignorée dans les comptes — elle reste dans le total du budget.

/** Arrondi au centime, sans poussière flottante. */
const round2 = (n) => Math.round(n * 100) / 100

/**
 * Solde par membre à partir des dépenses attribuées.
 * @returns [{ member, paid, owed, balance }] — balance>0 : on lui doit ;
 *          balance<0 : il doit. La somme des balances vaut 0 (au centime près).
 */
export function computeBalances(expenses, members) {
  const list = Array.isArray(members) ? members : []
  const paid = new Map(list.map((m) => [m, 0]))
  const owed = new Map(list.map((m) => [m, 0]))

  for (const e of expenses || []) {
    const amt = Number(e?.amt)
    if (!e || !amt || amt <= 0) continue
    if (!paid.has(e.paidBy)) continue // payeur inconnu → dépense non partagée

    // Groupe de partage : sous-ensemble valide de membres, sinon tous.
    let group = Array.isArray(e.sharedWith) ? e.sharedWith.filter((m) => paid.has(m)) : []
    if (group.length === 0) group = list
    if (group.length === 0) continue

    paid.set(e.paidBy, paid.get(e.paidBy) + amt)
    const per = amt / group.length
    for (const m of group) owed.set(m, owed.get(m) + per)
  }

  return list.map((m) => ({
    member: m,
    paid: round2(paid.get(m)),
    owed: round2(owed.get(m)),
    balance: round2(paid.get(m) - owed.get(m)),
  }))
}

/**
 * Suggestions de remboursement minimales (algorithme glouton de flux de
 * trésorerie : à chaque étape, le plus gros débiteur rembourse le plus gros
 * créancier). Produit au plus n-1 virements. Travaille en centimes entiers
 * pour éviter toute dérive flottante.
 * @returns [{ from, to, amount }] — amount en euros (> 0).
 */
export function minimalTransfers(balances) {
  const cents = (balances || [])
    .map((b) => ({ member: b.member, c: Math.round(b.balance * 100) }))
    .filter((b) => b.c !== 0)

  // Problème du centime : des montants indivisibles (10 € à 3) font que les
  // soldes arrondis peuvent sommer à ±1 cent. On absorbe ce résidu sur le
  // membre au plus gros solde pour que les virements règlent exactement.
  const residual = cents.reduce((s, b) => s + b.c, 0)
  if (residual !== 0 && cents.length) {
    const big = cents.reduce((a, b) => (Math.abs(b.c) >= Math.abs(a.c) ? b : a))
    big.c -= residual
  }

  const transfers = []
  // garde-fou : au plus n itérations au-delà du strict nécessaire
  let guard = cents.length * cents.length + 1
  while (guard-- > 0) {
    const maxCred = cents.reduce((a, b) => (b.c > (a?.c ?? -Infinity) ? b : a), null)
    const maxDeb = cents.reduce((a, b) => (b.c < (a?.c ?? Infinity) ? b : a), null)
    if (!maxCred || !maxDeb || maxCred.c <= 0 || maxDeb.c >= 0) break
    const move = Math.min(maxCred.c, -maxDeb.c)
    transfers.push({ from: maxDeb.member, to: maxCred.member, amount: round2(move / 100) })
    maxCred.c -= move
    maxDeb.c += move
  }
  return transfers
}

/** Vue d'ensemble prête pour l'UI : soldes + virements suggérés. */
export function settlement(expenses, members) {
  const balances = computeBalances(expenses, members)
  return { balances, transfers: minimalTransfers(balances) }
}
