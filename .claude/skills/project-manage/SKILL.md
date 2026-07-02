---
name: project-manage
description: Gestion du projet Cantou — TODO, ADR, reprise de session
---

# Project Management — Cantou

Ce skill gère la traçabilité du projet : suivi des tâches et décisions d'architecture.

## Démarrage de session (TOUJOURS faire en premier)

```bash
# 1. Lire le backlog
cat TODO.md

# 2. Lire les ADR si on touche à l'architecture
ls docs/adr/
```

**Règle** : avant de commencer à coder, lire `TODO.md` et identifier les tâches en cours (`🔄`) ou la prochaine tâche du backlog.

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
