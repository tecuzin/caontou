# ADR-005 — Notifications via PWA `Notification` API

**Date** : 2026-06-30  
**Statut** : Accepté

## Contexte

L'app doit pouvoir envoyer des rappels (activités, trajet, repas, budget). Capacitor propose `@capacitor/local-notifications` mais son installation via npm est bloquée par la config `allowScripts` du projet. La PWA `Notification` API est disponible nativement dans la WebView Android.

## Décision

Utiliser **`window.Notification`** (API Web standard) pour les notifications in-app :
- `Notification.requestPermission()` au démarrage
- `new Notification(title, { body })` pour déclencher
- `setTimeout()` pour les délais

Pour les notifications **push en arrière-plan** (quand l'app est fermée), prévoir une migration future vers `@capacitor/local-notifications` si besoin.

## Conséquences

### Positives
- Zéro dépendance supplémentaire
- Fonctionne immédiatement dans la WebView
- Pas de config native Android à modifier

### Négatives / compromis
- Pas de notifications quand l'app est fermée (nécessite service worker + push)
- Pas de son/vibration native personnalisable
- Comportement variable selon les versions Android

## Alternatives considérées

| Alternative | Raison du rejet |
|---|---|
| `@capacitor/local-notifications` | Bloqué par `allowScripts` npm config |
| Service Worker + Push API | Trop complexe pour les besoins actuels |
| Firebase Cloud Messaging | Nécessite backend, contraire à ADR-001 |
