---
name: dev-tooling
description: >-
  Outillage de développement Cantou — graphe de code (CodeGraphContext / cgc +
  MCP), board Epiq (epiq + MCP), et graphify. À utiliser pour installer,
  vérifier, maintenir ou dépanner ces outils, ou pour savoir comment les
  interroger pendant le dev (analyse d'impact, appelants, dead code, backlog).
---

# Outillage de dev — Cantou

Trois outils assistent le développement. Ils sont **déjà configurés** ; ce skill
sert à les installer/reproduire, les **maintenir** (re-indexation, mises à jour)
et les dépanner.

| Outil | Rôle | CLI | MCP |
|---|---|---|---|
| **CodeGraphContext** | Graphe du code de `src/` (FalkorDB embarqué) : appelants, dépendances, complexité, dead-code | `cgc` (`~/.local/bin`) | `codegraphcontext` |
| **Epiq** | Board de tickets = **source de vérité unique du backlog** (voir skill `project-manage`) | `epiq` | `epiq` |
| **graphify** | Transforme n'importe quelle entrée (code, docs, images…) en graphe de connaissances | — | skill `/graphify` (`~/.claude/skills/graphify/`) |
| **flint-chart / Vega** | Visualiser des données de dev/analyse (activité des agents, analyse UX) — voir skill `vega` | `tools/agent-viz/` | — |

## Configuration (reproductible)

- **MCP** : déclarés dans **`.mcp.json`** (versionné) à la racine —
  `codegraphcontext` (`cgc mcp start`) et `epiq` (`epiq-mcp`). À la 1ʳᵉ ouverture,
  approuver les serveurs MCP du projet. (Historique : ils étaient aussi ajoutés en
  scope *local* via `claude mcp add` ; `.mcp.json` rend le setup partageable. En
  cas de doublon gênant : `claude mcp remove epiq -s local` / `… codegraphcontext -s local`.)
- **CLIs** : `cgc` (CodeGraphContext ≥ 0.5.1, `pipx`/`pip install codegraphcontext`)
  et `epiq` (`brew`/binaire) doivent être sur le `PATH`.
- **graphify** : skill global `~/.claude/skills/graphify/SKILL.md` — invoqué par
  `/graphify` ; utile hors code (docs, specs, captures).

## Usage pendant le dev (obligatoire pour l'analyse d'impact)

**Toujours interroger le graphe AVANT** une analyse d'impact, une chasse au code
mort ou un choix de cible de refactor — ne pas deviner au grep (voir CLAUDE.md) :

```bash
cgc analyze callers <fonction>   # qui appelle ? (avant de déplacer)
cgc analyze calls <fonction>     # dépendances de la fonction
cgc analyze deps <module>        # imports d'un module
cgc analyze dead-code            # fonctions non appelées
cgc analyze complexity           # cibles prioritaires de refactor
cgc find name <symbole> | content "<texte>"
```

MCP équivalents : `analyze_code_relationships`, `find_code`, `find_dead_code`,
`find_most_complex_functions`, `execute_cypher_query`. Pour le board :
`mcp epiq_issue_list/create/move/tag_add/comment_add` (workflow complet dans le
skill `project-manage`).

## Maintenance & indexation

**Re-indexation automatique** : les hooks git **CGC** (`.git/hooks/post-commit`
et `post-checkout`) lancent `cgc update <repo> --quiet` à chaque commit / changement
de branche → le graphe suit le code sans intervention. (Hooks gérés par cgc,
marqués `CGC_MANAGED_HOOK` ; s'ils disparaissent, ré-indexer réinstalle le suivi.)

**Filet de sécurité (cron)** — `scripts/dev-graph-maintenance.sh` :

```bash
scripts/dev-graph-maintenance.sh                    # re-index + stats + versions (→ .git/cgc-maintenance/maintenance.log)
scripts/dev-graph-maintenance.sh --install-cron 6   # cron toutes les 6 h (défaut)
scripts/dev-graph-maintenance.sh --uninstall-cron   # retirer le cron
scripts/dev-graph-maintenance.sh --status           # état cron + dernier log
```

Le cron (crontab utilisateur, tag `# CANTOU_DEV_GRAPH_MAINTENANCE`) rattrape les
dérives hors commit et journalise les versions d'outils. Redondant avec les hooks
dans le cas courant → optionnel, mais installé par défaut. **N.B.** un cron *cloud*
(routines/CronCreate) ne convient pas : `cgc` est local (FalkorDB embarqué).

**Contrôles de santé** :

```bash
cgc stats            # nb de fichiers/fonctions/modules indexés
cgc list             # dépôts indexés
claude mcp list      # epiq / codegraphcontext = ✔ Connected
epiq --version ; cgc --version
```

**Mise à jour des outils** (si nécessaire) :

```bash
pipx upgrade codegraphcontext   # ou: pip install -U codegraphcontext
brew upgrade epiq               # selon l'installation
```

Après une montée de version de `cgc`, refaire un `cgc update <repo>` (ou laisser
le prochain commit le faire).

## Dépannage

- **MCP « Failed/Needs auth »** : `claude mcp list` ; relancer la session ; vérifier
  que `cgc`/`epiq-mcp` sont sur le `PATH`.
- **Graphe périmé / requêtes vides** : `cgc update <repo>` puis `cgc stats` ; en
  dernier recours `cgc index <repo>` (ré-indexation complète).
- **`epiq_issue_list` trop volumineux** (dépasse le token limit) : le résultat est
  sauvegardé dans un fichier ; le traiter en `python`/`grep` par colonne
  (`parentNodeId` → swimlane), pas le lire en entier.
- **Hooks CGC absents** après un clone : ré-indexer le repo réinstalle les hooks
  gérés ; sinon les recréer (voir `.git/hooks/post-commit`).
