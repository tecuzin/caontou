---
name: commit
description: Versionner avec des commits conventionnels (Conventional Commits) en suivant Git Flow. À utiliser pour committer, créer une branche feature/release/hotfix, ou faire une release.
---

# Commit conventionnel + Git Flow

## Format des messages (Conventional Commits)
```
<type>(<scope>): <description courte à l'impératif>

[corps optionnel : le pourquoi]

[footer optionnel : BREAKING CHANGE:, Refs #id]
```

**Types** : `feat` (fonctionnalité), `fix` (correctif), `docs`, `style`, `refactor`,
`perf`, `test`, `build` (build/déps), `ci`, `chore` (maintenance), `revert`.

**Règles** : description ≤ 72 car., impératif présent (« add », pas « added »),
pas de point final. `scope` optionnel (ex : `docker`, `capacitor`, `ui`, `git`).
`feat`/`fix` → bump mineur/patch ; `BREAKING CHANGE:` → bump majeur.

Exemples :
- `feat(ui): ajoute la barre d'onglets de navigation`
- `build(docker): épingle l'image en amd64 pour AAPT2/Rosetta`
- `fix(capacitor): corrige le webDir vers dist`
- `docs: documente le pipeline de build APK`

## Git Flow — branches
- `main` : production, taggée (versions). Jamais de commit direct.
- `develop` : intégration continue.
- `feature/<nom>` : part de `develop`, y retourne en `--no-ff`.
- `release/<x.y.z>` : part de `develop`, merge dans `main` (tag) **et** `develop`.
- `hotfix/<x.y.z>` : part de `main`, merge dans `main` (tag) **et** `develop`.

## Procédures

### Nouvelle feature
```bash
git switch develop && git switch -c feature/<nom>
# … travail + commits conventionnels …
git switch develop && git merge --no-ff feature/<nom> -m "merge: feature/<nom>"
git branch -d feature/<nom>
```

### Release
```bash
git switch develop && git switch -c release/<x.y.z>
# bump version (package.json), CHANGELOG, derniers ajustements
git switch main && git merge --no-ff release/<x.y.z> -m "release: <x.y.z>"
git tag -a v<x.y.z> -m "v<x.y.z>"
git switch develop && git merge --no-ff release/<x.y.z> -m "merge: release/<x.y.z> back to develop"
git branch -d release/<x.y.z>
```

### Hotfix
```bash
git switch main && git switch -c hotfix/<x.y.z>
# correctif + commit fix(...)
git switch main && git merge --no-ff hotfix/<x.y.z> -m "hotfix: <x.y.z>"
git tag -a v<x.y.z> -m "v<x.y.z>"
git switch develop && git merge --no-ff hotfix/<x.y.z> -m "merge: hotfix/<x.y.z>"
git branch -d hotfix/<x.y.z>
```

## À chaque livraison (systématique)
Toute livraison dans un build met à jour **ensemble et systématiquement** :
- **l'historique des versions** : `src/changelog.js` (entrée `build: NN`, in-app)
  **et** `CHANGELOG.md` (dépôt) ;
- **le board Epiq** (source de vérité unique) : cartes livrées → UAT/EUA + tags
  `buildNN`/`vX.Y.Z` + commentaire (voir skills `deploy` et `project-manage`).

Jamais l'un sans l'autre : un build sans entrée d'historique ou sans mise à jour
Epiq est une livraison incomplète.

## Notes
- Commits atomiques : un sujet = un commit. Grouper les fichiers liés.
- Vérifier `git status`/`git diff` avant de committer ; ne jamais committer
  `node_modules/`, `android/`, `dist/`, `build/`, `*.apk` (cf. `.gitignore`).
- Sur ce projet, `git` est réécrit en `rtk git` par le hook (transparent).
