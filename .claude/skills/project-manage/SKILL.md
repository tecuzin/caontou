---
name: project-manage
description: Gestion du projet Cantou — TODO, ADR, reprise de session
---

# Project Management — Cantou

Ce skill gère la traçabilité du projet : board Epiq (source de vérité des tâches),
TODO.md et décisions d'architecture.

## Board Epiq — workflow (source de vérité, consignes David 09/07/2026)

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
# 2. Lire le backlog complémentaire
cat TODO.md

# 3. Lire les ADR si on touche à l'architecture
ls docs/adr/
```

**Règle** : avant de commencer à coder, lister les issues Epiq et identifier ce qui
est en **Todo** (seule colonne implémentable) ; à défaut, demander à David de trier
les Proposal.

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
