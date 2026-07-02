# ADR-001 — Application 100 % offline, pas de backend

**Date** : 2026-06-01  
**Statut** : Accepté

## Contexte

L'application Cantou est destinée à un usage familial pendant des vacances dans le Cantal. La connectivité en zone rurale/montagne peut être faible ou absente. L'application doit fonctionner sans réseau en permanence.

## Décision

L'application est **autonome** : aucun backend, aucune API distante, aucun cloud sync. Toutes les données vivent sur l'appareil.

## Conséquences

### Positives
- Fonctionne sans réseau (zone rurale, montagne)
- Pas de coût d'infrastructure
- Pas de dépendance à un service tiers
- Données privées, aucune fuite possible

### Négatives / compromis
- Pas de sync multi-device (un seul téléphone utilise l'app)
- Pas de backup automatique (perte des données si réinstallation)
- Pas de partage temps réel entre membres de la famille

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| Airtable comme backend | Dépendance réseau, coût, complexité |
| Firebase / Supabase | Idem + over-engineering pour usage solo |
| Sync Bluetooth local | Complexité Capacitor, hors scope |
