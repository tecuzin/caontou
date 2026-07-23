/* ------------------------------------------------------------------ *
 * Fil du jour — rapproche les éléments datés d'une journée du planning.
 * Fonctions pures (testables, sans React). Aucune donnée dupliquée : on
 * lit les stores existants et on croise sur la clé de jour "dow num".
 * ------------------------------------------------------------------ */

/** Clé de jour normalisée d'un jour du planning : "Ven 7". */
export function dayKeyOf(day) {
  return day && day.dow != null && day.num != null ? `${day.dow} ${day.num}` : ''
}

/**
 * Repas planifiés pour un jour du planning (les repas portent `day: "Ven 7"`,
 * qui correspond au `dow`+`num` du jour). Renvoie les repas de ce jour.
 * @param {{dow:string,num:number}} day
 * @param {Array<{day:string, dish:string}>} meals
 */
export function mealsForDay(day, meals = []) {
  const key = dayKeyOf(day)
  if (!key) return []
  return meals.filter((m) => m && m.day === key)
}
