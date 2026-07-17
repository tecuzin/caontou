---
name: project-manage
description: Gestion du projet Cantou — TODO, ADR, reprise de session
---

# Project Management — Cantou

Ce skill gère la traçabilité du projet : board Epiq, décisions d'architecture, et
notes de session.

> ## ⚠️ Epiq est la SOURCE DE VÉRITÉ UNIQUE du backlog
> Le board Epiq (`01KWSTHN79VWRQB7MGPQWR153M`) est **le seul** endroit qui fait
> foi pour les tâches, priorités et états. On lit Epiq pour savoir quoi faire,
> on y écrit l'avancement (colonnes + tags + commentaires). **Aucun backlog
> parallèle** : `TODO.md` n'est qu'un journal lisible des livraisons et notes de
> reprise — jamais une liste de tâches faisant autorité. En cas de divergence,
> **Epiq gagne** ; corriger `TODO.md`, pas l'inverse.

## Board Epiq — workflow (source de vérité unique, consignes David 09/07/2026)

Colonnes, dans l'ordre :

```
Proposal → Todo → In progress → UAT/EUA → Done
```

| Colonne | Qui y met les cartes | Rôle |
|---|---|---|
| **Proposal** | Claude | Propositions, analyses, idées issues d'audits. **Jamais implémentées directement.** |
| **Todo** | **David uniquement** | Le « GO » : David déplace de Proposal → Todo ce qu'il veut voir implémenté. |
| **In progress** | Claude | Déplacer la carte ici **au démarrage** du travail. |
| **UAT/EUA** | Claude | À la livraison dans un build : la carte y attend les **tests utilisateur de David**. |
| **Done** | **David uniquement** | David valide et déplace UAT/EUA → Done. Ne jamais le faire à sa place. |

**Règles strictes** :
1. **N'implémenter QUE ce qui est dans Todo.** Toute idée de Claude va dans
   Proposal (avec description sourcée) et y attend le triage de David.
2. À l'envoi d'un build contenant la carte → déplacer en **UAT/EUA** et ajouter
   **2 tags : `buildNN`** (numéro du build qui embarque la feature) **et `vX.Y.Z`**
   (version). Commenter la carte avec le détail de livraison.
3. **Ne jamais déplacer UAT/EUA → Done soi-même** — attendre l'instruction de David.
4. Si David **remet une carte de UAT/EUA en Todo**, elle contient son **rapport de
   test utilisateur** (description ou commentaire) : le lire, corriger, re-livrer
   (retour en In progress → UAT/EUA avec le nouveau tag de build).

IDs utiles : board `01KWSTHN79VWRQB7MGPQWR153M` · Proposal `01KX43H1YZHXADB0SA2NRVC6F2`
· Todo `01KWSTHN7AKWFJT9N28CGWDPXJ` · In progress `01KWSTHN7AKWFJT9N28CGWDPXK`
· UAT/EUA `01KX43H1Z2K4EWCCG0TV8CC8P5` · Done `01KWSTHN7AKWFJT9N28CGWDPXM`.

## Démarrage de session (TOUJOURS faire en premier)

```bash
# 1. Lire le board Epiq (mcp epiq_issue_list) : cartes en Todo = travail autorisé,
#    cartes revenues de UAT/EUA en Todo = rapports de test à corriger en priorité.
#    → Taguer toute carte des colonnes actives (Proposal/Todo/In progress/UAT)
#      restée SANS tag (voir « Tags de classification »).
# 2. Lire les notes de session (PAS un backlog : Epiq fait foi pour les tâches)
cat TODO.md

# 3. Lire les ADR si on touche à l'architecture
ls docs/adr/

# 4. Rafraîchir le graphe de code (CodeGraphContext) pour les requêtes d'impact
cgc update && cgc stats     # incrémental ; voir « Outillage obligatoire » (CLAUDE.md)
```

**Règle** : avant de commencer à coder, lister les issues Epiq et identifier ce qui
est en **Todo** (seule colonne implémentable) ; à défaut, demander à David de trier
les Proposal.

---

## Cycle de vie d'une carte Epiq (détail complet)

### Phase 1 : Proposal (idée Claude)
Créée par Claude lors d'un audit ou une proposition. Description auto-suffisante avec
contexte et raison. David la lit, la trie mentalement.

**Exemple** : "Error Boundary React + export de secours (p1, audit robustesse 09/07)"

**⚠️ Tagger dès la création (obligatoire).** Toute carte créée par Claude reçoit
immédiatement ses **tags de classification** : au moins **un tag de domaine** +
**un tag de priorité** (`p1`/`p2`/`p3`). Voir la section « Tags de classification »
ci-dessous. Une carte sans tag est un oubli à corriger — ne pas laisser de carte
non taguée dans Proposal / Todo / In progress / UAT.

```bash
mcp epiq_issue_create <title> --parentId <lane>
mcp epiq_issue_description_edit <issueId> --description "..."
mcp epiq_issue_tag_add <issueId> --tagName produit      # domaine
mcp epiq_issue_tag_add <issueId> --tagName p2           # priorité
```

### Tags de classification (obligatoires à la création)
Distincts des tags de livraison `buildNN`/`vX.Y.Z` (ajoutés en Phase 5). Réutiliser
**le vocabulaire existant** (ne pas inventer de synonymes) :

- **Domaine** : `produit`, `technique`, `refactor`, `qualite`, `tests`, `ux`,
  `securite`, `outillage`, `doc`, `notifications`, `idee-creative`, ou un domaine
  fonctionnel (`visites`, `repas`, `trajet`, `hebergement`, `contenu-cantal`…).
- **Priorité** : `p1` (haute) · `p2` (moyenne) · `p3` (basse).
- Combiner librement (ex. une feature carte = `produit` + `visites` + `p2` ;
  un refacto = `technique` + `refactor` + `p2`).

**Audit au démarrage de session** : lister les issues et **taguer toute carte des
colonnes actives (Proposal/Todo/In progress/UAT) restée sans tag** avant de coder.
Les cartes Done anciennes non taguées ne sont pas prioritaires (historique).

### Phase 2 : Todo (GO David)
David déplace la carte de Proposal vers Todo quand il veut que Claude l'implémente.
**C'est le seul signal valide d'implémentation.**

**Commande Claude** :
```bash
mcp epiq_issue_move <issueId> --parentId 01KWSTHN7AKWFJT9N28CGWDPXJ
```

### Phase 3 : In progress (en cours Claude)
Dès que Claude commence le travail, la carte doit passer en In progress.

**Commande Claude** :
```bash
mcp epiq_issue_move <issueId> --parentId 01KWSTHN7AKWFJT9N28CGWDPXK
```

### Phase 4 : Code + build
Claude implémente, teste localement, committe. Ensuite : `./build-docker.sh --deploy`
qui fabrique un APK numéroté avec tags.

### Phase 5 : UAT/EUA (tests David)
À la livraison, Claude déplace la carte en UAT/EUA avec :
- Tag `buildNN` (numéro du build qui embarque la feature)
- Tag `vX.Y.Z` (version sémantique)
- Commentaire Epiq résumant la livraison (« Livré en build 41 : StatusBar thémée crème/bleu nuit, splash Cantou, generate-icon.py écrit 11 splash.png »)

**Commandes Claude** :
```bash
mcp epiq_issue_move <issueId> --parentId 01KX43H1Z2K4EWCCG0TV8CC8P5
mcp epiq_issue_tag_add <issueId> --tagName buildNN
mcp epiq_issue_tag_add <issueId> --tagName vX.Y.Z
mcp epiq_issue_comment_add <issueId> --body "..."
```

### Phase 6a : Test OK → Done (David)
David teste l'APK, valide. Déplace UAT/EUA → Done. **Ne jamais le faire à sa place.**

### Phase 6b : Test KO → Todo (David + rapport)
David trouve un bug. Remet la carte en Todo + ajoute un commentaire détaillant le
problème (ex: « StatusBar ne change pas au toggle 🌙 en mode sombre »).

**Claude lit ce rapport**, l'ajoute au titre ou le note, puis :
1. La carte est déjà en Todo → passe en In progress
2. Implémente le fix
3. Re-livre : In progress → build → UAT/EUA avec **nouveau tag de build** (ex: build42)

Cycle continue jusqu'à test OK → Done.

### Phase 7 : Done → main (optionnel, David)
David merge le commit de la branche dans `main` (ou `release/`) quand il prépare
une release. Le code d'une carte en Done peut toujours être mergé — la validation
est terminée.

---

## Mise à jour du TODO

Après chaque tâche complétée :

1. Cocher la case dans `TODO.md` (`- [ ]` → `- [x]`)
2. Déplacer l'item de la section **Backlog** vers **Complété** si applicable
3. Mettre à jour le tableau ADR si une nouvelle décision a été prise

```bash
# Ouvrir le todo
code TODO.md
```

**Format des items** :
```markdown
- [x] **Nom fonctionnalité** — description courte
- [ ] **Nom fonctionnalité** — description courte (en attente de X)
```

---

## Créer un ADR (Architecture Decision Record)

Chaque décision technique significative doit être tracée.

### Quand créer un ADR ?

- Choix d'une lib / outil
- Décision sur la structure des données
- Changement de stratégie (ex: passer de localStorage à IndexedDB)
- Compromis acceptés (ex: performances vs simplicité)
- Décisions sur l'architecture offline/online

### Commande

```bash
# Créer un nouvel ADR (remplacer NNN par le prochain numéro)
touch docs/adr/NNN-titre-kebab-case.md
```

### Template ADR

```markdown
# ADR-NNN — Titre court

**Date** : YYYY-MM-DD  
**Statut** : Proposé | Accepté | Déprécié | Remplacé par ADR-XXX

## Contexte

Quelle est la situation qui nécessite cette décision ?

## Décision

Quelle est la décision prise ?

## Conséquences

### Positives
- ...

### Négatives / compromis
- ...

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| ... | ... |
```

---

## ADR existants

| # | Fichier | Résumé |
|---|---|---|
| 001 | `docs/adr/001-offline-first.md` | App 100 % offline, pas de backend |
| 002 | `docs/adr/002-local-storage.md` | localStorage comme persistance unique |
| 003 | `docs/adr/003-docker-amd64.md` | Build APK Docker amd64 via Rosetta |
| 004 | `docs/adr/004-data-separation.md` | Données mutables séparées dans `src/data.js` |
| 005 | `docs/adr/005-pwa-notifications.md` | PWA Notification API (pas Capacitor Push) |
| 006 | `docs/adr/006-inline-styles.md` | Styles inline via helper `s()` |

---

## Conventions Git rappel

```
feat(scope): description
fix(scope): description  
chore(scope): description
docs: description
test(scope): description
refactor(scope): description
```

Branches : `main` ← `develop` ← `feature/*` / `fix/*`
