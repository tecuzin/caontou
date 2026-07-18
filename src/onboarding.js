/**
 * Assistant de configuration au premier lancement.
 *
 * `shouldOnboard(store)` décide si le mini-assistant doit s'afficher. On reste
 * volontairement simple et testable : l'assistant ne se montre **qu'une fois**,
 * tant que le flag `onboarded` du store n'est pas passé à `true` (par « Passer »
 * ou « Terminer »). Sur une install neuve, `onboarded` vaut `false` → l'écran
 * apparaît ; ensuite il est mémorisé et ne revient jamais.
 */
export function shouldOnboard(store) {
  return !store || store.onboarded !== true
}
