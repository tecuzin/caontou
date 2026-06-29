---
description: Déroule une release Git Flow (commits conventionnels, merge vers main, tag).
argument-hint: <x.y.z>
---

Effectue une release Git Flow versionnée `$ARGUMENTS` en suivant le skill **commit**.

1. Vérifie un arbre propre (`git status`) et que tu es à jour sur `develop`.
2. Crée `release/$ARGUMENTS` depuis `develop`.
3. Bump la version dans `package.json`, mets à jour le CHANGELOG si présent,
   commit en `chore(release): $ARGUMENTS`.
4. Merge dans `main` en `--no-ff`, puis `git tag -a v$ARGUMENTS -m "v$ARGUMENTS"`.
5. Merge la release de retour dans `develop` en `--no-ff`, supprime la branche.
6. Affiche `git log --oneline --graph --all -n 15` pour confirmer.

Ne pousse rien sans accord explicite de l'utilisateur.
