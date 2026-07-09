# Cantou — Règles projet & reproduction

Application mobile « Cantou » (séjour familial dans le Cantal). PWA **React + Vite**
empaquetée en **APK Android via Capacitor**, compilée **entièrement dans Docker**
(rien d'installé sur le disque hôte).

## Stack
- **UI** : React 18 + Vite 5 (PWA mobile portrait ~402×874).
- **Natif** : Capacitor 6 (`android/` est généré, jamais versionné).
- **Persistance** : **locale, sur l'appareil** (`localStorage`, persistant dans la
  WebView Android). **Application autonome** : pas de backend, pas d'Airtable, pas
  de réseau, pas de déploiement. (`AIRTABLE.md`/`ARCHITECTURE.md` = archives du
  handoff initial, non utilisés.)
- **Build** : Docker via Colima, image `node:20-slim` épinglée **amd64**.

## ⚠️ Règles critiques de build (à ne jamais oublier)

1. **AAPT2 n'existe qu'en x86_64.** Sur Apple Silicon (ARM64), un conteneur ARM64
   fait planter le build Android (`qemu-x86_64: ld-linux-x86-64.so.2 not found`).
   → L'image **doit** être amd64 : `FROM --platform=linux/amd64` + `docker run --platform linux/amd64`.

2. **On compile en amd64 via Rosetta**, pas QEMU. Profil Colima dédié en
   `--vm-type vz --vz-rosetta` (VM ARM64 native + traduction binaire x86_64).
   QEMU fonctionne aussi mais est lent et exige `brew install qemu`.

3. **Aucun volume monté.** Colima ne peut pas monter `~/Desktop` (permissions macOS
   TCC). Le projet est **copié dans l'image** (`COPY . /workspace`) puis l'APK est
   **extrait par `docker cp`** depuis un conteneur nommé. Ne jamais réintroduire de `-v`.

4. **BuildKit indisponible** (buildx manquant) → builder legacy : `DOCKER_BUILDKIT=0`.
   Le legacy honore quand même `FROM --platform=` ; ne pas passer `--platform` au
   `docker build` (non supporté), seulement au `docker run`.

5. **`.dockerignore` exclut** `node_modules`, `dist`, `android`, `build` et le gros
   `*.dc.html`. **Ne pas exclure `index.html`** (point d'entrée Vite).

6. **Android SDK** : `platforms;android-34` (cible Capacitor 6) **et** `android-35`,
   `build-tools;34.0.0`/`35.0.0`. Licences acceptées dans l'image.

7. **Cache de layers Docker = vitesse du build.** Le Dockerfile bake `npm install`
   (layer invalidée par `package*.json` seulement) puis un **warm-up Gradle**
   (cap add + assembleRelease factice → peuple `/root/.gradle` et pré-génère
   `android/`) **avant** le `COPY . /workspace`. Ne jamais remonter `COPY .`
   au-dessus de ces layers, et ne pas exclure `package-lock.json` du contexte :
   c'est ce qui fait passer un build de ~13 min à ~4 min.

8. **APK signé avec un keystore STABLE** : l'APK release de Gradle est *non signé*.
   L'entrypoint signe avec **`cantou.keystore` committé à la racine** (alias `cantou` /
   mdp `cantou123`) + `zipalign` + `apksigner` → `cantou-release.apk` installable.
   **Ne jamais régénérer ce keystore** : une clé différente = Android refuse la mise à
   jour (conflit de package, désinstallation forcée = perte du localStorage).
   Keystore de sideload familial ; **remplacer par un vrai keystore hors-repo pour le
   Play Store.**

## Comment construire l'APK
```bash
./build-docker.sh
# → build/outputs/apk/cantou-release.apk
```
Prérequis (une fois) : `colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30`.
Voir le skill **build-apk** pour le détail.

## Conventions Git
- **Commits conventionnels** + **Git Flow**. Voir le skill **commit**.
- Branches : `main` (stable) ← `develop` (intégration) ← `feature/*`, `release/*`, `hotfix/*`.

## État
- ✅ Design haute-fidélité porté dans `src/App.jsx` (fidèle au prototype
  `Cantou - Vacances Cantal.dc.html`) : 5 onglets + 4 sous-écrans + feuille d'ajout.
- ✅ Persistance locale des données mutables (favoris, cases cochées, dépenses)
  via `localStorage` sous la clé `cantou.v1`.
- ✅ Pipeline de build APK Docker/Rosetta opérationnel.

### Détail d'implémentation UI
- `src/App.jsx` utilise un helper `s("css…")` qui parse les chaînes CSS du
  prototype en objets de style React → reproduction fidèle au pixel.
- Données de référence (planning, visites, repas, météo…) en constantes statiques.
- Compte à rebours « J- » calculé depuis la date réelle (départ 11/07/2026).
- **Lieu réel du séjour** : le gîte est à **Vezels-Roussy (15130)**, dans le
  **Carladès** (sud-est d'Aurillac), et non à Mandailles / vallée de la Jordanne
  comme le supposait le prototype initial. Tout le contenu de référence (visites,
  planning, trajet, météo, hébergement) a été **re-basé sur le Carladès** :
  destination Vezels-Roussy, sorties de proximité (Pas de Cère, Le Lioran / Plomb
  du Cantal, château de Messilhac, Raulhac, rocher de Ronesque, Aurillac ~25 min),
  et les sites du nord (Puy Mary, Salers) conservés en « grandes sorties » (~1 h).
  Distances de route indicatives depuis Vezels-Roussy.
