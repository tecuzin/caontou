---
name: storybook
description: Catalogue de composants Cantou via Storybook (outil de dev ISOLÉ, hors app/APK). À utiliser pour lancer le catalogue, écrire une story, documenter un composant, ou auditer la cohérence visuelle des composants.
---

# Storybook — catalogue de composants Cantou

Storybook rend chaque composant réutilisable en isolation, avec ses variantes,
une **doc d'utilisation** (autodocs) et un lien vers ses tests. Sert de base à
l'**audit de cohérence visuelle**.

> ## ⚠️ Outil de dev ISOLÉ — zéro impact sur l'app / l'APK
> Storybook vit dans **`tools/storybook/`** avec son **propre `package.json`**
> (deps gitignorées, comme `tools/agent-viz`). **Ne JAMAIS** ajouter Storybook ni
> ses addons au `package.json` **racine** : le build APK Docker fait `npm install`
> (avec devDeps, pour Vite) et l'empreinte de toolchain se déclenche sur
> `package.json` → ça rebuilderait l'image (~6-7 min) et l'alourdirait. Les
> **stories** vivent dans `src/**/*.stories.jsx` (co-localisées avec les
> composants) mais ne sont **jamais importées par l'app** → hors bundle APK, et
> hors de vitest (`include: src/test/**`).

## Lancer le catalogue

```bash
npm --prefix tools/storybook run storybook   # → http://localhost:6006
# (équivaut à : cd tools/storybook && node_modules/.bin/storybook dev -p 6006)
```

## Installer / réinstaller les deps (⚠️ contournement npm du poste)

Le npm du poste (sandbox) injecte une **variable d'env `npm_config_allow_scripts`**
qui **fait échouer tout `npm install` imbriqué** (`EALLOWSCRIPTS: --allow-scripts
is not allowed in project-scoped installs`), même avec un `.npmrc` local. Il faut
**neutraliser cette variable** le temps de l'install :

```bash
cd tools/storybook
env -u npm_config_allow_scripts npm install --no-audit --no-fund
```

Le champ **`allowScripts`** de `tools/storybook/package.json` (`esbuild`, `rollup`,
`@swc/core`, `core-js`…) autorise alors les scripts d'install nécessaires (binaire
natif esbuild du builder Vite). Sans ce combo, le serveur ne démarre pas.

## Écrire une story (CSF3)

Créer `src/<dir>/MonComposant.stories.jsx` à côté du composant :

```jsx
import { MonComposant } from './MonComposant.jsx'
import { s } from '../utils.js'            // helper de style du projet (prop sx)

export default {
  title: 'Composants/MonComposant',        // groupe dans la sidebar
  component: MonComposant,
  tags: ['autodocs'],                       // ← génère la doc d'utilisation (props)
  args: { sx: s, /* props par défaut */ },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { docs: { description: { component: 'À quoi sert ce composant.' } } },
}

export const ParDefaut = {}
export const Variante = { name: 'État vide', args: { /* … */ } }
```

Conventions :
- **Toujours** passer le helper `sx={s}`.
- Couvrir les **états notables** (vide → ne rend rien, mode sombre, données longues).
- Capacitor est **mocké** (alias Vite → `.storybook/capacitor-mock.js`) : ne pas
  s'attendre à des API natives réelles dans le catalogue.
- Ranger dans `Composants/…` (réutilisables) ou `Écrans/…` (écrans).

## Config (dans `tools/storybook/.storybook/`)

| Fichier | Rôle |
|---|---|
| `main.js` | glob des stories (`../../../src/**`), addons, alias Vite qui **mockent `@capacitor/*`** |
| `preview.jsx` | fond crème/carte/sombre, police de l'app, décor mobile 360 px |
| `preview-head.html` | fonts Google (Quicksand/Nunito Sans) + keyframes |
| `capacitor-mock.js` | no-ops pour tous les plugins Capacitor |

## Lien avec l'audit de cohérence visuelle

Voir les composants côte à côte pour repérer les divergences (rayons, espacements,
couleurs de boutons, badges/pills, ombres) → corriger par petits pas, en gardant
`node scripts/design-audit.mjs` vert (voir skill `refactor`). App.jsx reste
minimaliste : la logique/les composants vivent dans `src/`, jamais dans App.jsx.

## Build statique (optionnel, pour partager le catalogue)

```bash
env -u npm_config_allow_scripts npm --prefix tools/storybook run build
# → tools/storybook/storybook-static/ (gitignoré)
```
