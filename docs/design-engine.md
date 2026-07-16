# Moteur déterministe de cohérence de design (CIEDE2000)

> Objectiver la « beauté » d'une UI **sans modèle flou**, avec des critères
> reproductibles issus des sciences de la couleur et du design.
> Outils : `scripts/design-audit.mjs` (mesure) et `scripts/design-consolidate.mjs`
> (correction sûre). Garde-fou : `src/test/design-coherence.test.js`.

---

## 1. Pourquoi pas un modèle d'esthétique ?

La demande initiale était : « trouve un modèle HuggingFace **ou** des critères
déterministes pour rendre l'app plus belle ». Les prédicteurs d'esthétique
(LAION-Aesthetics, `cafe_aesthetic`, `aesthetic-shadow`…) existent, mais :

- ils sont **entraînés sur des photographies et des œuvres d'art**, pas sur des
  interfaces logicielles ; leur score sur une capture d'écran d'app mobile est
  **bruité et non actionnable** (ils réagissent au contenu, pas à la grille, aux
  contrastes typographiques ou à la cohérence d'un système de tokens) ;
- ils sont **non reproductibles** (poids opaques, dérive de version) et exigent
  du réseau — à rebours de l'ADN **offline-first** de Cantou (ADR-001).

Piloter des décisions de design sur un tel score serait un gadget. On mesure
plutôt des **propriétés déterministes** de la feuille de style, calculables
hors-ligne, explicables, et versionnables.

---

## 2. Ce qui est mesuré

L'app est stylée par des chaînes CSS passées au helper `s()` (ADR-006). Le moteur
parse **tous** les fichiers `src/**/*.{js,jsx}`, en extrait les tokens (couleurs,
tailles de police, rayons, espacements) avec leur **fréquence**, puis calcule
quatre familles de métriques.

### 2.1 Cohérence de palette — distance perceptuelle CIEDE2000

Deux couleurs peuvent avoir des codes hex très différents tout en étant
**indiscernables à l'œil**. La distance pertinente n'est pas euclidienne en RGB
mais **perceptuelle**. Pipeline :

```
sRGB (hex) → linéarisation → XYZ (matrice sRGB, illuminant D65) → CIELAB → ΔE₀₀
```

`ΔE₀₀` est l'implémentation complète **CIEDE2000** (Sharma, Wu & Dalal 2005),
avec corrections de rotation de teinte (R_T), pondérations S_L/S_C/S_H et le
terme G de désaturation des faibles chromas. Repères d'interprétation :

| ΔE₀₀       | Signification perceptuelle                    |
|------------|-----------------------------------------------|
| `< 1`      | différence **invisible**                      |
| `1 – 2`    | visible seulement œil expert, côte à côte     |
| `2 – 5`    | différence faible mais perceptible            |
| `> 5`      | couleurs franchement distinctes               |

On classe les paires à **ΔE < 2** en deux catégories (distinction cruciale, voir
§4) :

- **dérive** : au moins une des deux couleurs **n'est pas** un token référencé
  par `theme.js` → quasi-doublon accidentel, à fusionner ;
- **intentionnelles** : les deux sont des tokens `theme.js` → proches en clair
  **par choix**, car le mode sombre les mappe vers des cibles **différentes**
  selon leur rôle sémantique (fond de carte vs bordure). On ne les pénalise pas.

### 2.2 Échelle de rayons

Les `border-radius` doivent tomber sur une échelle courte et régulière
(`{0,4,8,12,16,24,999}`). Les valeurs orphelines (`7px`, `9px`, `13px`, `26px`…)
trahissent l'ad hoc. Score = part des usages sur l'échelle.

### 2.3 Échelle typographique

Nombre de tailles de police distinctes **dans la gamme texte**. Une gamme
modulaire lisible en compte ~6–7 (légende, corps, sous-titre, titre, gros
titre). Au-delà, le rythme vertical se brouille. Score dégressif au-delà de
6 tailles. Les tailles **display** (≥ 28 px, ≤ 3 usages — compte à rebours
héros, emojis décoratifs plein écran) sont des one-offs hors gamme, listées à
part : concept standard (Material/Tailwind ont des tokens display séparés).
Une taille display qui prolifère (> 3 usages) réintègre le décompte. Nuance
découverte pendant le lot : la moitié des « tailles orphelines » étaient des
**emojis**, pas du texte.

### 2.4 Grille d'espacement

Part des `padding/margin/gap/top/left/right/bottom` alignés sur la **grille
réelle du design : 2 px**. (Première version : 4 px — mais `6/10/14/18` sont des
tokens signature à des centaines d'occurrences ; les pénaliser aurait poussé à
casser l'identité visuelle. Même leçon que pour les rayons, cf. §4.) La vraie
dérive = les valeurs **impaires** (`3,5,7,9,11,13px`), snappées vers le voisin
pair le plus fréquent (±1 px, sous le seuil de perception).

### 2.5 Score composite

```
composite = 0,40·palette + 0,25·rayons + 0,20·espacement + 0,15·typo
```

La palette pèse le plus : c'est le facteur le plus visible et le plus objectif
(la perception couleur est mesurable ; le « bon » espacement l'est moins).

---

## 3. Correction sûre de la palette

`scripts/design-consolidate.mjs` fusionne les couleurs de **dérive** vers un
token canonique. Deux invariants garantissent un rendu **inchangé** :

1. **ΔE < 2** → la fusion est sous le seuil de perception (invisible en clair).
2. **On ne réécrit jamais une couleur référencée par `theme.js`.** Seules les
   couleurs *non référencées* sont redirigées, vers :
   - en priorité un **token existant** (préserve le système) ;
   - sinon la couleur **la plus fréquente** du cluster (jamais l'inverse, pour
     éviter les fusions fréquent→rare et les cycles a↔b).

**Conséquence sur le mode sombre** : toutes les clés de `theme.js` restent
présentes dans le code → substitution sombre intacte. Et une dérive qui
n'était *pas* substituée en sombre (donc affichée claire sur fond nuit — un bug
latent) finit sur un token qui, lui, est substitué → cohérence sombre **améliorée,
jamais dégradée**.

Usage :

```bash
npm run design:audit               # mesure (lecture seule)
npm run design:consolidate         # dry-run : liste les fusions envisagées
npm run design:consolidate -- --apply   # applique
```

---

## 4. Ce que la machine seule ne voit pas

Le diagnostic brut trouvait **37 paires ΔE<2** — apparent chaos. Mais en croisant
avec `theme.js`, on découvre que **la majorité est intentionnelle** : le mode
sombre différencie sémantiquement des couleurs claires quasi-identiques. Seules
**8 couleurs** étaient de la vraie dérive fusionnable.

C'est la leçon centrale : un critère déterministe donne une **mesure**, mais
l'**interprétation** exige le contexte du système (ici, le contrat de theming).
Le moteur encode cette nuance plutôt que de « corriger » à l'aveugle.

---

## 5. Résultats (progression pas à pas)

| Lot | Métrique               | Avant | Après | Note                                 |
|-----|------------------------|:-----:|:-----:|--------------------------------------|
| B73 | Couleurs distinctes    |  80   | **72**| −8 dérives fusionnées (CIEDE2000)     |
| B73 | Paires de dérive       |  14   | **0** | ΔE<2 non intentionnelles éliminées    |
| B73 | Score palette          |   0   | **64**| reste = paires 2≤ΔE<5 (perceptibles)  |
| B74 | Rayons distincts        |  16   | **9** | orphelins 6/7/9/13/18/22/26 snappés   |
| B74 | Score rayons           |  54   | **98**| échelle honnête {4,8,12,14,16,20,28}  |
| B82 | Espacements impairs    | 124   | **0** | snap ±1 px vers le pair fréquent      |
| B82 | Score espacement       |  49   |**100**| grille honnête 2 px                   |
| B83 | Tailles de police      |  19   | **13**| 43 snaps ±1-2 px vers le voisin fréquent |
| B83 | Score typo             |   0   | **68**| gamme texte = 10 pas · 3 display à part |
| —   | **Score composite**    | **23**| **80**| B73 : 49 · B74 : 60 · B82 : 70 · B83 : 80 |

Étape rayons (B74) : les rayons orphelins ont été ramenés sur les tokens réels
(la carte = 14px, le sheet = 28px). Le seul résidu est `10px` (×8). À chaque
étape, **tests + Lighthouse** restent verts (voir §7).

Rendu clair **et** sombre inchangés en B73 (ΔE<2). `386` tests verts, Lighthouse
Perf 94 / A11y 100 / BP 100 / SEO 100 : **aucune régression**.

---

## 6. Feuille de route (leviers « visibles », validation device)

Le score reste tiré vers le bas par des leviers qui **changent les pixels** —
donc à dérouler **pas à pas, avec QA visuelle sur device** :

- ✅ **Rayons** (B74) : orphelins snappés sur l'échelle {4,8,12,14,16,20,28}.
- ✅ **Espacement** (B82) : 124 valeurs impaires snappées sur la grille 2 px.
- ✅ **Typo** (B83) : 19 → 13 tailles (gamme texte 10 pas + 3 display).
  Le cœur dense 12/13/14/15 (438 usages) est l'identité du design — conservé.
- **Élévation** : unifier les ombres ad hoc en une échelle à 3 niveaux (dernier
  levier restant ; le composite est plafonné par la palette : les paires
  2≤ΔE<5 restantes sont des choix perceptibles, pas de la dérive).
- **Élévation** : unifier les ombres ad hoc en une échelle d'élévation à 3 niveaux.

---

## 7. Garde-fou anti-régression

À **chaque build** (discipline projet) :

1. `npm test` — la suite complète doit rester **verte** (dont
   `design-coherence.test.js`, **cliquet anti-régression** : 0 dérive, palette
   ≥ 60, rayons ≥ 90, espacement ≥ 95, typo ≥ 60, composite ≥ 78 — seuils
   remontés à chaque lot livré) ;
2. `npm run quality -- --only lighthouse` — **Perf / A11y / BP / SEO** ne doivent
   pas régresser (référence : 94 / 100 / 100 / 100).

On n'avance d'un pas qu'une fois ces deux garde-fous validés.
