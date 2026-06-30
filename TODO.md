# Cantou — TODO & Backlog

> Lire ce fichier en début de session. Mettre à jour les cases au fil du travail.
> Départ voyage : **7 août 2026**. Deadline app : **15 juillet 2026**.

---

## ✅ Complété

- [x] Design hi-fi porté dans `src/App.jsx` (fidèle au prototype)
- [x] Persistance locale `localStorage` (clé `cantou.v1`)
- [x] Pipeline build APK Docker/Rosetta opérationnel (`./build-docker.sh`)
- [x] Skills créés : `build-apk`, `commit`, `test-unit`, `test-e2e`, `test-appium`
- [x] **CRUD Budget** — edit/delete dépenses + modal ajout
- [x] **CRUD Repas** — edit plat du jour via modal
- [x] **CRUD Shopping (shoppingItems)** — toggle + delete items
- [x] **CRUD Planning (activités)** — edit/delete activités + ajout avec couleur
- [x] **CRUD Planning (jours)** — edit titre/sous-titre + delete jour
- [x] **CRUD Visites** — edit/delete POI (nom, catégorie, distance, durée, âge)
- [x] **CRUD Trajet** — edit/delete étapes (heure, lieu, note, couleur)
- [x] **CRUD Météo** — edit prévision par jour (icône, temp, pluie)
- [x] **CRUD Logistique** — add/delete items par liste (valises, pharmacie, voiture, maison)
- [x] **CRUD Courses** — add/delete items par catégorie
- [x] Infrastructure notifications PWA (`Notification` API, permission au démarrage)
- [x] Création skill `project-manage` (ADR + todo)
- [x] Création fichier `TODO.md`

---

## 🔄 En cours

- [ ] **Tri intelligent des listes** — en attente de précisions utilisateur :
  - [ ] Logi/Courses : tri auto permanent ou bouton toggle ?
  - [ ] Visites : par distance (parsée) ou par catégorie ?
  - Proposition acceptée :
    - Logi/Courses → non cochés en premier
    - Visites → par distance
    - Budget → par montant décroissant
    - Planning → par horaire

---

## 📋 Backlog confirmé

### Notifications
- [ ] Rappels **30 min avant** chaque activité planning
- [ ] Rappels **étapes trajet** (J-1 la veille + le matin du départ)
- [ ] Rappels **repas du jour** (matin 8 h)
- [ ] Alerte **budget** si dépensé > 80 % du total

### CRUD restant / améliorations
- [ ] **Ajout de visite** depuis l'écran Visites (bouton +)
- [ ] **Ajout de repas** (actuellement 7 jours fixes — permettre d'en ajouter)
- [ ] **Ajout d'étape trajet** (bouton + dans l'écran trajet)
- [ ] **Edit checklist trajet** (items "Avant de partir" — add/delete)
- [ ] **Hébergement éditable** — nom, adresse, contact, Wi-Fi, équipements
- [ ] **Budget total éditable** (actuellement hardcodé à 1 800 €)

### UX / Polish
- [ ] Boutons edit/delete remplacer les textes `"edit"` / `"delete"` par icônes ✏️ 🗑️ (repas, shopping)
- [ ] Animations sur les modals (déjà sheetUp, vérifier cohérence)
- [ ] Retour haptique sur actions (Capacitor Haptics)

### Tests
- [ ] Tests unitaires vitest (hooks CRUD)
- [ ] Tests E2E Playwright (flows complets)
- [ ] Tests Appium (APK Android)

---

## 🏗️ Architecture Decision Records

Voir `docs/adr/` pour toutes les décisions techniques.

| # | Décision | Statut |
|---|---|---|
| [ADR-001](docs/adr/001-offline-first.md) | Offline-first, pas de backend | Accepté |
| [ADR-002](docs/adr/002-local-storage.md) | localStorage comme seule persistance | Accepté |
| [ADR-003](docs/adr/003-docker-amd64.md) | Build APK via Docker amd64/Rosetta | Accepté |
| [ADR-004](docs/adr/004-data-separation.md) | Données mutables dans `src/data.js` | Accepté |
| [ADR-005](docs/adr/005-pwa-notifications.md) | Notifications via PWA `Notification` API | Accepté |
| [ADR-006](docs/adr/006-inline-styles.md) | Styles inline via helper `s()` | Accepté |
