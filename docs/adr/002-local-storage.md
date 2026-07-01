# ADR-002 — localStorage comme seule persistance

**Date** : 2026-06-01  
**Statut** : Accepté

## Contexte

L'app a besoin de persister les données mutables (dépenses, repas, planning, listes) entre les sessions, sur Android via Capacitor WebView.

## Décision

Utiliser **`localStorage`** avec une clé unique `cantou.v1`, sérialisé en JSON. Un hook `useEffect` synchronise l'état React vers localStorage à chaque mutation.

Structure : `{ saved, checks, expenses, meals, shoppingItems, days, visits, meteo, trajetSteps, logi, courses }`

## Conséquences

### Positives
- API synchrone, simple, sans dépendance
- Fonctionne nativement dans la WebView Android Capacitor
- Pas de migration de schema à gérer pour ce scope

### Négatives / compromis
- Limite ~5 MB (suffisant pour ce cas d'usage)
- Pas de requêtes/index (tout en mémoire à chaque démarrage)
- Sérialisation JSON intégrale à chaque mutation (acceptable pour ce volume)

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| IndexedDB | API complexe, overkill pour ~50 KB de données |
| Capacitor Preferences | Clé/valeur seulement, pas adapté aux objets imbriqués |
| SQLite (Capacitor) | Installation native complexe, migration schema |
