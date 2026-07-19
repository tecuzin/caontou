---
name: release
description: Préparer et exécuter une release Cantou (Git Flow release/hotfix) — régression complète, bump de version, merge main+develop, tag, build APK, déploiement Telegram, bundle QA Appium. À utiliser pour toute sortie de version (mineure, majeure ou hotfix).
---

# Release Cantou

Ce skill orchestre une release de bout en bout : de la dernière régression sur
`develop` jusqu'à l'APK signé livré sur Telegram, en passant par le tag Git et
le CHANGELOG. Il s'appuie sur les skills existants (`commit` pour le détail
Git Flow, `build-apk` pour le build Docker, `deploy` pour l'envoi Telegram,
`test-unit`/`test-e2e`/`test-appium` pour les suites).

## Vue d'ensemble

```
develop (à jour, tests verts)
   │
   ├─ release/<x.y.z>          ← bump version + CHANGELOG + derniers fixes
   │
   ├──→ main (merge --no-ff)   ← tag v<x.y.z>
   │       │
   │       └─ build-docker.sh --deploy   ← APK depuis main, envoyé Telegram
   │
   └──→ develop (merge --no-ff)  ← les fixes de dernière minute reviennent
```

Ne jamais taguer/déployer depuis `develop` : le tag et le build de release se
font **depuis `main`**, après le merge de la branche `release/*`.

## 1. Geler le scope

Avant de créer `release/<x.y.z>` : plus aucune nouvelle fonctionnalité sur
`develop`, seulement des correctifs de dernière minute (dans la branche
`release/*` elle-même, ou en `fix/*` mergé dans `develop` puis répercuté).

## 2. Régression complète (bloquant)

Tout doit être vert **avant** de créer la branche `release/*`.

```bash
git checkout develop
npm run test                    # unitaires + intégration (Vitest)
npm run test:coverage           # vérifier qu'aucune régression de couverture
npm run test:e2e:coverage       # E2E Playwright + couverture par fonction
```

Si un téléphone Android est disponible (recommandé pour une release majeure,
cf. section 6) :
```bash
adb devices                     # vérifier la connexion
npm run test:appium             # Appium — nécessite un serveur Appium local
```

**Critère de passage** : 100 % des tests Vitest + Playwright verts. Un test
Appium cassé est bloquant seulement s'il révèle un vrai bug (à trancher au
cas par cas — l'environnement Appium est parfois indisponible, voir
`skill test-appium`).

## 3. Historique des versions et version (systématique)

1. Ajouter l'entrée `## [x.y.z] - YYYY-MM-DD` en tête de `CHANGELOG.md`
   (Ajouté / Corrigé / Technique), en listant les commits depuis le dernier
   tag : `git log --oneline v<précédent>..develop`.
2. **Mettre à jour `src/changelog.js`** (historique in-app / « Quoi de neuf ? ») :
   l'entrée `build: NN` de la release doit exister et refléter la version. Ne
   jamais taguer une release dont l'historique in-app est en retard — les deux
   historiques (dépôt + in-app) sont tenus à jour **systématiquement**.
3. Bump `version` dans `package.json` (le `build-docker.sh` le lit pour nommer
   l'APK — `APP_VERSION`).

Ces changements + les tout derniers ajustements sont committés **sur la
branche `release/<x.y.z>`**, pas directement sur `develop`.

## 4. Git Flow — release

```bash
git checkout develop
git checkout -b release/<x.y.z>
# bump package.json + CHANGELOG.md (étape 3), commit(s) chore(release)/docs(changelog)

npm run test && npm run test:e2e:coverage    # dernière vérif sur la branche release

git checkout main
git merge --no-ff release/<x.y.z> -m "release: <x.y.z>"
git tag -a v<x.y.z> -m "v<x.y.z>"

git checkout develop
git merge --no-ff release/<x.y.z> -m "merge: release/<x.y.z> dans develop"
git branch -d release/<x.y.z>
```

Pour un hotfix, remplacer `develop` par `main` comme point de départ (voir
détail dans le skill `commit`, section Hotfix) — mêmes étapes de merge double
(`main` + `develop`) et de tag.

## 5. Build + déploiement

**Toujours depuis `main`**, jamais depuis `develop` ou une branche de travail :

```bash
git checkout main
./build-docker.sh --deploy
```

Vérifier dans les logs :
- `BUILD SUCCESSFUL`
- `Signer #1 certificate SHA-256 digest: 28ce1e5800bdcab402d1621781626d50874404686b51d5ae8e18eff8357a9938`
  (keystore stable — un digest différent = keystore régénéré par erreur,
  **ne pas déployer**, voir CLAUDE.md règle critique n°7)
- `APK envoyé avec succès sur Telegram`

Puis committer `build.number` séparément (voir skill `deploy`) :
```bash
git add build.number
git commit -m "chore: build.number=<N> (cantou-v<x.y.z>-build<N>-<ts>.apk)"
```

## 6. Bundle QA (Appium) — optionnel mais recommandé pour une release majeure

Les scripts Appium (`tests/appium/`) **ne peuvent pas être embarqués dans
l'APK** : ce sont des scripts Node/WebdriverIO qui pilotent l'app depuis
l'extérieur via un serveur Appium, pas du code Android compilé par Gradle.
Le seul moyen de "livrer les deux ensemble" est un ZIP compagnon :

```bash
npm run package:qa-bundle
# → build/outputs/qa-bundle/cantou-qa-bundle-v<x.y.z>-build<N>.zip
#   (APK + tests/appium/ + package.json + RUNME.md avec la procédure)
```

Envoyer ce ZIP sur Telegram en complément de l'APK si un testeur doit vérifier
sur device réel :
```bash
source .env.deploy
curl -s -F "chat_id=${TELEGRAM_CHAT_ID}" \
  -F "document=@build/outputs/qa-bundle/cantou-qa-bundle-v<x.y.z>-build<N>.zip" \
  -F "caption=🧪 Bundle QA v<x.y.z> — APK + tests Appium (voir RUNME.md)" \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument"
```

## 7. Vérifications post-release

- [ ] `git tag -l` liste bien `v<x.y.z>`
- [ ] `main` et `develop` sont synchronisés (`git log main..develop` ne montre
      que d'éventuels commits `chore: build.number` postérieurs)
- [ ] APK reçu sur Telegram, digest keystore vérifié
- [ ] **Board Epiq à jour** — Epiq est la **source de vérité unique du backlog** :
      chaque carte livrée passée en UAT/EUA avec tags `buildNN`/`vX.Y.Z` +
      commentaire (voir skill `project-manage`). C'est ici que se lit l'état réel
      de la release, pas dans un fichier.
- [ ] `TODO.md` mis à jour (journal des livraisons — pas un backlog)
- [ ] README à jour si des fonctionnalités livrées changent l'usage documenté

## Rollback

Si un problème critique est découvert juste après le tag :
- **Avant que l'APK soit installé par des utilisateurs** : un hotfix normal
  suffit (section Hotfix du skill `commit`), pas besoin de défaire le tag.
- **Après diffusion** : ne jamais supprimer/retagger `v<x.y.z>` (réécrit
  l'historique public) — créer un hotfix `v<x.y.z+1>` qui corrige, comme pour
  n'importe quel bug post-release.
