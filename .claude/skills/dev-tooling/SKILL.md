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
| **flint-chart / Vega** | Visualiser des données de dev/analyse (activité des agents **+ temps passé et tokens par tâche/agent**, analyse UX) — voir skill `vega` | `tools/agent-viz/` | — |

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
cgc find name <symbole> | content "<texte>"
```

> ### ⚠️ Trou connu : la complexité du graphe ignore le JS
> `cgc analyze complexity` (et le tool MCP `find_most_complex_functions`) ne
> calcule la complexité cyclomatique **que pour Python** : sur Cantou, le seul
> résultat réel vient de `scripts/generate-icon.py`, et **toutes les fonctions
> JS/JSX ressortent à 1** — y compris `App()` (>1200 lignes). Ne pas s'en servir
> pour choisir une cible de refactor : la mesure est inopérante, pas nulle.
>
> Remplacement maison, sans dépendance :
> ```bash
> npm run audit:complexity                            # top 15 JS/JSX
> node scripts/complexity-audit.mjs --json --top 30   # sortie machine
> ```
> Heuristique textuelle (source masqué + regex sur les points de décision),
> **pas un AST** : les scores servent à classer des cibles, pas à produire un
> McCabe canonique. Méthode détaillée en en-tête du script.
>
> Note d'indexation : le `.cgcignore` racine exclut `.vite/`, `dist/`, `build/`,
> `android/`, `node_modules/` et `tools/*/node_modules/` — sans ça
> `cgc analyze dead-code` est noyé par les bundles de `.vite/deps/**`.

MCP équivalents : `analyze_code_relationships`, `find_code`, `find_dead_code`,
`execute_cypher_query` (voir l'avertissement ci-dessus pour
`find_most_complex_functions`). Pour le board :
`mcp epiq_issue_list/create/move/tag_add/comment_add` (workflow complet dans le
skill `project-manage`).

## Maintenance & indexation

> **Agent-viz : tenir à jour SYSTÉMATIQUEMENT.** Dès qu'on utilise des
> sous-agents (Agent tool) dans une session, **régénérer la visualisation
> d'activité** en fin de travail (ou après chaque lot d'agents) :
> ```bash
> node tools/agent-viz/build.mjs        # → /tmp/agent-activity.html
> ```
> La sortie doit **toujours** refléter les agents de la session en cours (temps
> passé + tokens par agent **et** par outil, voir skill `vega`). Réflexe non
> optionnel : un `agent-viz` périmé après avoir lancé des agents = travail
> incomplet. Ouvrir le HTML si David veut voir la répartition.

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

## 💸 Maîtriser la consommation de tokens des sous-agents

Mesuré sur la session du 26-27/07/2026 (31 agents, 53,9 M tokens bruts) avec
`node tools/agent-viz/metrics.mjs` et `cost-dashboard.mjs`. Trois constats, et
les règles qui en découlent.

### 1. Ne JAMAIS lire le board Epiq en entier
`epiq_issue_list` renvoie **~288 000 caractères** (toutes colonnes, descriptions
et commentaires compris). Appelé en boucle, c'était le **premier poste de
dépense** : les tâches « backlog » coûtaient **4× une fonctionnalité**
(1,3 M contre 215 k en coût pondéré).

```bash
node scripts/board.mjs                 # résumé par colonne   →  171 caractères
node scripts/board.mjs --lane todo     # une colonne
node scripts/board.mjs --tag p1        # par tag              → ~8 k caractères
node scripts/board.mjs --show <id>     # UNE carte + description
node scripts/board.mjs --untagged      # cartes actives sans tag/priorité
```

**99,94 % de volume en moins** sur le résumé, 97 % sur une requête filtrée.
Le script rejoue le journal d'événements Epiq en local — même source de vérité,
aucun appel réseau. N'utiliser le MCP `epiq_issue_list` que si `board.mjs`
échoue, et dans ce cas **parser le fichier sauvegardé avec node** plutôt que de
laisser la sortie entrer dans le contexte.

### 2. Les agents qui meurent coûtent presque la moitié de la facture
**18 agents sur 31 sont morts** (quota, connexion coupée, stall de 600 s) →
**46 % du coût pondéré parti en pure perte**.

- **Découper systématiquement** : un agent chargé de 16 tâches meurt en route et
  perd tout ; deux agents de 8 survivent mieux.
- **Ne pas déléguer ce qui prend 10 minutes inline.** Le coût fixe d'un agent
  (recharger tout le contexte du projet) dépasse souvent la tâche elle-même.
- **Quand un agent meurt, vérifier le working tree AVANT de relancer** : il a
  souvent écrit des fichiers exploitables (`memory.js`, `heights.js`,
  `kids-lock.js`, `DrawPad.jsx` ont tous été récupérés ainsi).

### 3. 85 % du volume est du contexte relu, pas du travail neuf
Sur 53,9 M tokens, **45,6 M sont de la lecture de cache**. Chaque agent
recharge à chaque tour tout ce qu'il a déjà lu.

- **Donner les chemins des fichiers modèles dans le prompt** au lieu de laisser
  l'agent les chercher (`Grep`/`Glob` en série gonflent le contexte).
- **Interdire aux agents les commandes verbeuses** : `vitest` sans filtre,
  `git log` long, `cat` de gros fichiers. Toujours canaliser dans `grep -E`.
- Préférer **un agent séquentiel** à N agents parallèles quand ils liraient
  tous les mêmes fichiers : le contexte serait payé N fois.

### Mesurer avant d'optimiser
```bash
node tools/agent-viz/metrics.mjs <dossier-transcripts>          # rapport texte
node tools/agent-viz/metrics.mjs <dossier> --json               # données brutes
node tools/agent-viz/cost-dashboard.mjs <dossier> /tmp/cost.html # graphiques
```
Le coût affiché est **pondéré** (sortie ×5, écriture de cache ×1,25, lecture de
cache ×0,1) : ce n'est pas une facture, c'est une base de comparaison honnête
entre postes — agréger les quatre postes en un seul chiffre masque justement
ce qu'on cherche.
