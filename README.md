# Passation développeur — « Cantou », app de séjour familial (Cantal)

## Vue d'ensemble
Application mobile (web) pour gérer **tous les aspects d'un séjour familial dans le Cantal** : compte à rebours, trajet, hébergement, planning jour par jour, visites/activités à faire, repas & liste de courses, budget partagé, valises/checklists, météo.

Cible : **famille (2 adultes + jeunes enfants)**, usage **partagé entre plusieurs téléphones** avec synchronisation temps quasi-réel via **Airtable** comme backend.

- **Plateforme visée :** application web installable (PWA) — fonctionne dans le navigateur, « Ajouter à l'écran d'accueil », hors-ligne partiel. (Le même design peut être porté en natif React Native / Flutter plus tard.)
- **Format :** mobile portrait, ~402 × 874 px (iPhone).
- **Langue :** français.

## À propos des fichiers de design
Le fichier `Cantou - Vacances Cantal.dc.html` de ce dossier est une **référence de design réalisée en HTML** — un prototype cliquable qui montre l'apparence et le comportement voulus, **pas du code de production à copier tel quel**. Les données y sont codées en dur (tableaux JS dans la classe `Component`).

La tâche est de **recréer ce design dans l'environnement du projet cible** (React + Vite, Next.js, ou autre selon votre stack), en branchant Airtable comme source de données, et en suivant les conventions de ce codebase. S'il n'existe pas encore de codebase, choisir le framework le plus adapté (recommandation : **React + Vite, PWA**, avec un petit proxy serverless — voir `ARCHITECTURE.md`).

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographie, espacements et interactions sont définitifs. Reproduire l'UI au pixel près à partir du prototype, puis remplacer les données figées par Airtable. Tous les tokens sont listés plus bas.

---

## Écrans

L'app a **5 onglets principaux** (barre du bas) + des **sous-écrans** ouverts depuis l'accueil + une **feuille modale** (slide-up) pour ajouter une dépense.

### 1. Accueil (`tab: accueil`)
- **But :** vue d'ensemble du séjour, accès rapide à tout.
- **Layout :** scroll vertical. De haut en bas :
  1. En-tête « Bonjour 👋 » + pastille avatar (cercle 38px, fond `#cf7d3c`).
  2. **Carte héro** « Prochaine aventure » (fond `#4a5d3a`, radius 26px, texte crème) : titre « Carladès, Cantal », dates, puces J-N (compte à rebours calculé) et météo.
  3. **Carte « Le grand départ »** avec bouton → ouvre le sous-écran Trajet.
  4. **Carte « Valises & préparatifs »** avec barre de progression (N/Total cochés) → ouvre Logistique.
  5. **Grille 2 colonnes de modules** : Trajet, Hébergement, Préparatifs, Météo, Repas, Budget.
- **Interactions :** chaque carte/module navigue vers un onglet ou un sous-écran.

### 2. Planning (`tab: planning`)
- **But :** programme jour par jour (8 jours, 11→18 juillet).
- **Layout :** sélecteur de jours horizontal (pastilles 54px, jour actif fond `#4a5d3a`), puis **timeline verticale** d'activités (heure à gauche, pastille colorée + ligne, titre + note).
- **État :** `day` (index 0–7 du jour sélectionné).

### 3. À faire / Visites (`tab: visites`)
- **But :** liste d'activités/visites enregistrables en favori (♥).
- **Layout :** filtres par catégorie en chips horizontales (Tous, Nature, Famille, Patrimoine, Baignade, Gourmand, Marché), puis cartes de visite (emoji, catégorie colorée, nom, distance·durée, badge âge enfants, bouton cœur).
- **État :** `filter` (catégorie active), `saved` (map id→bool).

### 4. Repas & courses (`tab: repas`)
- **But :** menus de la semaine + liste de courses cochable.
- **Layout :** segment 2 boutons « Menus » / « Courses ».
  - **Menus :** liste jour → plat, + encart spécialités du Cantal.
  - **Courses :** barre de progression globale, puis groupes (Frais, Épicerie, Fruits & légumes, Pour les enfants, Autres) avec items cochables.
- **État :** `mealTab` (repas|courses), `checks` (cases cochées).

### 5. Budget (`tab: budget`)
- **But :** suivi des dépenses partagées.
- **Layout :** carte solde (Restant / sur Total, barre %), bouton « + Ajouter une dépense » (ouvre la feuille modale), répartition par catégorie (barres), liste des dernières dépenses.
- **État :** `expenses` (tableau {label, cat, amt}), total budget (prop `budget`).

### Sous-écrans (ouverts depuis l'accueil, avec bouton retour ‹)
- **Trajet :** carte résumé (Laschamps → Vezels-Roussy, durée/distance/budget), étapes en timeline, checklist « Avant de partir ».
- **Logistique :** plusieurs listes (Valise enfants, Valise adultes, Pharmacie, Voiture, Maison) avec barres de progression et items cochables.
- **Hébergement :** photo (placeholder), nom, dates arrivée/départ, capacité, équipements (chips), Wi-Fi, contact.
- **Météo :** prévisions 7 jours (jour, icône, pluie %, max/min).

### Feuille modale — Ajouter une dépense
Slide-up depuis le bas (`@keyframes sheetUp`), overlay sombre. Champs : montant, libellé, sélection de catégorie (chips). Boutons Annuler / Ajouter. Valide montant > 0, ajoute à `expenses`.

---

## Interactions & comportement
- **Navigation onglets :** instantanée (changement d'état `tab`), barre du bas met l'onglet actif en `#4a5d3a` gras.
- **Sous-écrans :** `sub` = clé du sous-écran ; bouton ‹ remet `sub: null`.
- **Cases à cocher (logistique/courses/trajet) :** toggle optimiste, item coché = barré + case verte `#5b7042`. **À persister dans Airtable.**
- **Favoris visites :** toggle cœur. **À persister.**
- **Ajout dépense :** feuille modale, validation montant numérique > 0. **À persister.**
- **Feuille modale :** animations `sheetUp` 0.3s `cubic-bezier(0.2,0.8,0.2,1)` + overlay `fadeIn` 0.2s ; clic sur overlay ferme, clic sur le contenu stoppe la propagation.

## Gestion d'état (prototype actuel → cible)
Le prototype tient tout dans `this.state` (React class). En cible, ces blocs deviennent des **données Airtable** (voir `AIRTABLE.md`) :
- `expenses` → table **Depenses**
- `checks` (logistique + courses + trajet) → tables **Logistique** / **Courses** (champ booléen `Coché`)
- `saved` (favoris) → champ booléen `Favori` de la table **Visites**
- `day`, `tab`, `sub`, `filter`, `mealTab` → **état UI local** (ne pas persister côté backend)
- Données de référence (jours, étapes trajet, menus, météo, hébergement, infos visites) → tables Airtable **Planning, Trajet, Repas, Meteo, Hebergement, Visites** (lecture seule pour l'app, éditées dans Airtable).

## Tokens de design

### Couleurs
| Rôle | Hex |
|---|---|
| Vert profond (héro, primaire, actif) | `#4a5d3a` |
| Vert secondaire (validé, nature) | `#5b7042` |
| Orange/terracotta (accent, progression) | `#cf7d3c` |
| Rouge brique (favori, extra) | `#b8503f` |
| Brun (hébergement, patrimoine) | `#9c6b4a` |
| Sarcelle (transport, baignade) | `#4f8a86` |
| Olive (marché) | `#8a8b3d` |
| Fond app | `#f4ecdc` |
| Fond cartes | `#fffdf8` |
| Bordure cartes | `#efe6d4` / `#ece2cf` |
| Texte principal | `#2f2a22` |
| Texte secondaire | `#8a8273` |
| Fond pistes de progression | `#efe6d4` |

### Typographie
- **Titres / chiffres :** `Quicksand`, poids 600–700.
- **Texte courant :** `Nunito Sans`, poids 400–800.
- Échelle : héro 30px, titres écran 26px, titres carte 15–20px, corps 13–15px, légendes 11–13px.

### Rayons & ombres
- Radius : cartes 16–26px, chips 999px, cases à cocher 8px, boutons 12–14px.
- Ombre cartes : `0 2px 8px rgba(74,93,58,0.05)` ; héro : `0 10px 26px rgba(74,93,58,0.24)`.

## Assets
- **Aucune image bitmap** dans le prototype — emojis pour les icônes, placeholder rayé pour la photo d'hébergement.
- À prévoir : vraie photo du gîte, éventuellement icônes cohérentes (set type Phosphor/Lucide) en remplacement des emojis si souhaité.

## Fichiers de ce dossier
- `Cantou - Vacances Cantal.dc.html` — le prototype de référence (l'ouvrir dans un navigateur pour voir le comportement).
- `AIRTABLE.md` — **schéma Airtable complet** : bases, tables, champs, types. À recopier pour créer la base.
- `ARCHITECTURE.md` — architecture cible, synchro, **sécurité (proxy / clés API)**, étapes de mise en œuvre, exemples d'appels API.
- `ios-frame.jsx` — composant cadre iPhone utilisé par le prototype (référence visuelle uniquement, pas nécessaire en prod).
