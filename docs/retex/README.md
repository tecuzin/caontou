# Retours d'expérience (REX / RETEX) — Cantou

Ce dossier trace le **retour d'expérience** du projet : ce qu'on a fait, pourquoi,
ce qu'on en a appris, et **les gains obtenus** (mesurés, pas estimés). Complément
des ADR (`docs/adr/`, *décisions*) et du CHANGELOG (`CHANGELOG.md`, *livraisons*).

## Convention

- **Un fichier par session/chantier**, nommé `AAAA-MM-JJ-sujet.md`.
- Le REX « socle » `000-historique-projet.md` retrace toute l'histoire depuis le début.
- Chaque REX suit la trame : **Contexte → Ce qui a été fait → Analyse → Gains obtenus
  → Enseignements → Actions**.
- Les **fiches actions** vivent dans `fiches-actions/` : elles relient chaque action
  (ticket Epiq) à un **gain attendu** puis au **gain obtenu** une fois traitée.
- Toute mesure cite l'outil et la date (ex. *vitest --coverage, 11/07*).

## Index

| Fiche | Sujet | Date |
|---|---|---|
| [000-historique-projet](000-historique-projet.md) | Histoire du projet depuis l'initialisation | 29/06 → 11/07 |
| [2026-07-11-analyse-qualite](2026-07-11-analyse-qualite.md) | Audit qualité complet (couverture, E2E, Trivy, Lighthouse, SonarQube) | 11/07 |
| [fiches-actions/2026-07-11-qualite](fiches-actions/2026-07-11-qualite.md) | 17 actions qualité → gains attendus/obtenus | 11/07 |
