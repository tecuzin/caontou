---
name: refactor
description: Refactoriser le code Cantou et augmenter la couverture de tests en sécurité — extraire des modules de App.jsx, ajouter les tests manquants, puis suivre Git Flow, builder et déployer sur Telegram.
---

# Refactor & couverture de tests (Cantou)

Améliore la structure du code et la couverture de tests **sans changer le
comportement visible** de l'app (pixel-fidélité au design, mêmes données,
mêmes `data-testid`). Un refactor qui casse un test existant est un refactor
raté — le test avait raison.

## Point de départ (toujours faire en premier)

```bash
cat TODO.md                                    # contexte, éviter de dupliquer du travail en cours
wc -l src/*.jsx src/*.js                       # repérer les fichiers monolithiques
npm run test:coverage                          # baseline chiffrée avant de toucher au code
```

Repère : `src/App.jsx` est un unique composant qui concentre tout (state,
handlers CRUD, JSX de tous les écrans). C'est la cible n°1 de refactor.
Coverage attendu en juillet 2026 : ~46 % statements, App.jsx sous la moyenne.

## Cibles de refactor (par ordre de priorité)

1. **Extraire les handlers CRUD par domaine** en hooks dédiés
   (`src/hooks/useExpenses.js`, `useMeals.js`, `useTrajets.js`, `useLogi.js`,
   `useCourses.js`, `useMeteo.js`, `useVisits.js`, `usePlanning.js`,
   `useTripConfig.js`) — chacun expose l'état + les actions (save/delete/add),
   testable isolément avec `renderHook()`.
2. **Extraire les gros blocs JSX en composants d'écran**
   (`src/screens/Budget.jsx`, `Repas.jsx`, `Planning.jsx`, `Trajet.jsx`,
   `Logistique.jsx`, `Hebergement.jsx`, `Meteo.jsx`, `Visites.jsx`,
   `Accueil.jsx`) — reçoivent l'état/les handlers en props.
3. **Extraire les modals répétitives** en un composant générique
   (`src/components/EditSheet.jsx`) si le pattern (`showX`/`fadeIn`/`sheetUp`)
   se répète identique — mais seulement si ça simplifie réellement, pas pour
   le principe (voir CLAUDE.md : pas d'abstraction prématurée).
4. **Notifications** (`buildNotificationList`, `dispatch*Notifications`) →
   `src/notifications.js`, déjà pur et facilement testable isolément.
5. **Export/import JSON** (`buildExport`, `parseImport`, `shareExport`) →
   `src/backup.js`.

Ne PAS extraire pour le plaisir : un module qui n'est utilisé qu'à un seul
endroit et fait 5 lignes n'a pas besoin d'exister à part.

## Règles à ne jamais casser pendant le refactor

- **`data-testid` inchangés** : ce sont les points d'ancrage de 58 tests RTL,
  15 tests Playwright et 33 tests Appium. Renommer un testid = casser 3
  suites de tests d'un coup pour zéro bénéfice fonctionnel.
- **Schéma `localStorage` (`cantou.v1`) inchangé** : les clés du store
  (`saved, checks, expenses, meals, …, trip, trajets`) sont sérialisées
  telles quelles ; un refactor qui renomme une clé de state casse la
  persistance des utilisateurs existants sans migration.
- **Le helper `s()`** (parseur CSS→style React) reste le pattern de style de
  tout le projet (ADR-006) — ne pas migrer vers CSS modules/styled-components
  en cours de refactor, ce serait un changement d'architecture, pas un
  nettoyage.
- **Pixel-fidélité** : si un doute existe sur le rendu après extraction,
  vérifier par capture d'écran Playwright avant/après (voir skill `verify`
  ou pattern déjà utilisé dans les sessions précédentes : lancer `vite`,
  screenshot avec Playwright, comparer visuellement).

## Boucle de travail (petits pas, tests verts à chaque étape)

1. Extraire **un seul** module/hook/composant.
2. `npm run test` → doit rester 100 % vert immédiatement après. Si un test
   échoue, c'est le refactor qui a introduit une régression — corriger avant
   de continuer, ne jamais accumuler plusieurs extractions cassées.
3. Ajouter les tests manquants pour ce module isolé (cas qui n'étaient pas
   testables facilement dans le monolithe : cas limites d'un hook, erreurs de
   validation, etc.).
4. `npm run test:coverage` → vérifier que le pourcentage progresse, pas
   régresse.
5. Commit conventionnel ciblé (`refactor(scope): extrait useExpenses de
   App.jsx`), petit et atomique — pas un unique gros commit en fin de
   session.
6. Répéter pour le module suivant.

## Puis suivre le workflow habituel du projet

```bash
git checkout -b refactor/<nom> develop     # skill commit : Git Flow
# ... boucle de travail ci-dessus, plusieurs commits atomiques ...
npm run test                               # suite complète verte avant merge
git checkout develop
git merge --no-ff refactor/<nom>
git branch -d refactor/<nom>
./build-docker.sh --deploy                 # build APK + envoi Telegram (skill build-apk / deploy)
```

Committer `build.number` séparément une fois le build confirmé (`BUILD
SUCCESSFUL`, digest du keystore stable vérifié, "APK envoyé avec succès sur
Telegram" dans les logs) — voir skill **deploy**.

## Objectif de couverture

Pas de seuil arbitraire à atteindre à tout prix (un test qui ne teste rien
pour gonfler un chiffre est pire que pas de test). Mais concrètement : après
extraction, chaque hook/module isolé devrait dépasser 80 % de couverture —
c'est mécaniquement plus facile à tester qu'un composant de 1900 lignes qui
mélange tout.
