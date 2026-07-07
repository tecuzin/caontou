# ADR-008 — Livraison APK Capacitor plutôt que PWA installable (service worker)

**Date** : 2026-07-07
**Statut** : Accepté

## Contexte

Cantou est une app React/Vite « offline-first » (voir [ADR-001](001-offline-first.md)).
Deux façons de livrer une app web en offline sur mobile existent :

1. **PWA installable** depuis le navigateur : un **service worker** met en cache
   les assets (stratégies cache-first / network-first / stale-while-revalidate)
   et un manifest permet « Ajouter à l'écran d'accueil ».
2. **APK natif via Capacitor** : les assets web sont **empaquetés dans l'APK**
   (`COPY` du `dist/` dans le projet Android), servis localement par la WebView.

Les checklists PWA classiques (web.dev, Lighthouse « Installable » / « PWA
Optimized ») supposent le modèle 1 et insistent sur la fiabilité du service
worker — « la régression PWA la plus fréquente est une mise à jour de service
worker qui casse le offline sans que ça se voie ». Il faut clarifier lequel des
deux modèles s'applique à Cantou pour ne pas se tromper de checklist.

## Décision

Cantou est livrée en **APK Capacitor**, pas en PWA installée depuis un
navigateur. **Il n'y a pas de service worker** : l'offline est garanti par
construction (tous les assets sont embarqués dans l'APK et servis par la
WebView, sans requête réseau). La persistance des données mutables reste le
`localStorage` de la WebView (voir [ADR-002](002-local-storage.md)).

En conséquence, **les checklists PWA orientées service worker / cache HTTP ne
s'appliquent pas** à Cantou. L'audit qualité pertinent porte sur : taille du
bundle, performance de rendu, accessibilité (Lighthouse en mode page servie
localement), et non sur l'installabilité PWA ou les stratégies de cache SW.

## Conséquences

### Positives
- Offline **total et déterministe** : aucun réseau, aucune dépendance à l'état
  d'un cache de service worker qui pourrait se corrompre ou se désynchroniser.
- Diffusion familiale simple : un fichier APK signé (keystore stable) envoyé sur
  Telegram, installé en sideload — pas d'hébergement HTTPS ni de navigateur
  compatible requis.
- Accès aux API natives (notifications locales, partage, haptique, filesystem)
  via les plugins Capacitor, hors de portée d'une PWA sur certaines plateformes.

### Négatives / compromis
- Pas de mise à jour « silencieuse » comme un service worker : chaque évolution
  nécessite un nouvel APK (build + envoi Telegram + installation manuelle).
- Pas d'installabilité via l'URL d'un navigateur (non pertinent ici : diffusion
  hors magasin, en famille).
- Le `versionCode` doit être incrémenté et la signature rester stable, sinon
  Android refuse la mise à jour (voir CLAUDE.md règle critique n°7).

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| PWA installable + service worker | Complexité et fragilité du cache SW pour un bénéfice nul ici (l'APK embarque déjà tout) ; nécessiterait un hébergement HTTPS |
| PWA + APK (double cible) | Deux modèles offline à maintenir et tester en parallèle, sans besoin réel |
| WebView + assets téléchargés au 1er lancement | Réintroduit une dépendance réseau au démarrage, contraire à [ADR-001](001-offline-first.md) |
