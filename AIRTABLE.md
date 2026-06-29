# Schéma Airtable — « Cantou »

Créez **une base Airtable** nommée `Cantou — Séjour Cantal`. Ajoutez les tables ci-dessous avec exactement ces champs. Les types entre parenthèses sont les types de champ Airtable.

> Convention : chaque enregistrement a déjà un `Record ID` interne fourni par Airtable — pas besoin de le créer. Les champs « 🔒 lecture seule app » sont édités par vous dans Airtable et seulement lus par l'app ; les champs « ✏️ écrit par l'app » sont modifiés depuis l'application.

---

## Table `Sejour` (paramètres généraux — 1 seul enregistrement)
| Champ | Type | Exemple |
|---|---|---|
| `Nom` | Single line text | Puy Mary, Cantal |
| `Date début` | Date | 2026-07-11 |
| `Date fin` | Date | 2026-07-18 |
| `Budget total` | Currency (EUR) | 1800 |
| `Lieu` | Single line text | Mandailles-Saint-Julien |

## Table `Planning` (activités jour par jour) 🔒 lecture seule app
| Champ | Type | Exemple |
|---|---|---|
| `Jour` | Date | 2026-07-13 |
| `Titre jour` | Single line text | Ascension du Puy Mary |
| `Sous-titre` | Single line text | Pas de Peyrol |
| `Heure` | Single line text | 10:00 |
| `Activité` | Single line text | Montée au sommet |
| `Note` | Single line text | Porte-bébé conseillé |
| `Couleur` | Single select | nature / accent / transport / patrimoine / extra |
| `Ordre` | Number | 3 |

*(une ligne par activité ; l'app regroupe par `Jour`)*

## Table `Visites` (activités à faire)
| Champ | Type | Exemple | Accès |
|---|---|---|---|
| `Nom` | Single line text | Puy Mary — Pas de Peyrol | 🔒 |
| `Catégorie` | Single select | Nature / Famille / Patrimoine / Baignade / Gourmand / Marché | 🔒 |
| `Emoji` | Single line text | ⛰️ | 🔒 |
| `Distance` | Single line text | 25 min | 🔒 |
| `Durée` | Single line text | 2 h | 🔒 |
| `Âge enfants` | Single line text | Dès 4 ans (porte-bébé) | 🔒 |
| `Favori` | Checkbox | ✓ | ✏️ écrit par l'app |

## Table `Depenses` (budget) ✏️ écrit par l'app
| Champ | Type | Exemple |
|---|---|---|
| `Libellé` | Single line text | Glaces à Dienne |
| `Montant` | Currency (EUR) | 18.50 |
| `Catégorie` | Single select | Hébergement / Transport / Nourriture / Visites / Extra |
| `Date` | Created time (auto) | — |
| `Payé par` | Single select (option) | Adulte 1 / Adulte 2 |

## Table `Logistique` (valises & checklists) ✏️ `Coché` écrit par l'app
| Champ | Type | Exemple |
|---|---|---|
| `Item` | Single line text | Pulls chauds (montagne !) |
| `Liste` | Single select | Valise enfants / Valise adultes / Pharmacie / Voiture / Maison / Trajet |
| `Coché` | Checkbox | ✓ |
| `Ordre` | Number | 2 |

## Table `Courses` ✏️ `Coché` écrit par l'app
| Champ | Type | Exemple |
|---|---|---|
| `Item` | Single line text | Cantal AOP |
| `Rayon` | Single select | Frais / Épicerie / Fruits & légumes | Pour les enfants / Autres |
| `Coché` | Checkbox | ✓ |

## Table `Repas` (menus) 🔒 lecture seule app
| Champ | Type | Exemple |
|---|---|---|
| `Jour` | Date | 2026-07-14 |
| `Libellé jour` | Single line text | Mar 14 |
| `Plat` | Single line text | Aligot & saucisse de Cantal |

## Table `Hebergement` (1 enregistrement) 🔒 lecture seule app
| Champ | Type | Exemple |
|---|---|---|
| `Nom` | Single line text | La Grange du Puy Mary |
| `Adresse` | Single line text | Mandailles-Saint-Julien (15590) |
| `Arrivée` | Single line text | Sam 11 · dès 16 h |
| `Départ` | Single line text | Sam 18 · avant 10 h |
| `Capacité` | Single line text | 4–5 personnes · 2 chambres · lit bébé |
| `Équipements` | Multiple select | Wi-Fi, Cheminée, Lave-linge… |
| `Wifi SSID` | Single line text | LaGrange-Gite |
| `Wifi code` | Single line text | puymary15 |
| `Contact` | Single line text | Mme Vidal · 06 12 34 56 78 |
| `Photo` | Attachment | (image du gîte) |

## Table `Meteo` (optionnel — sinon API météo live) 🔒
| Champ | Type | Exemple |
|---|---|---|
| `Date` | Date | 2026-07-13 |
| `Icône` | Single line text | 🌧️ |
| `Max` | Number | 17 |
| `Min` | Number | 9 |
| `Pluie` | Single line text | 80 % |

> 💡 La météo gagnerait à venir d'une **API live** (Open-Meteo, gratuit, sans clé) plutôt que d'Airtable, pour rester à jour. Voir `ARCHITECTURE.md`.

---

## Correspondance Single select `Couleur` → hex (côté app)
`nature` → `#5b7042` · `accent` → `#cf7d3c` · `transport` → `#4f8a86` · `patrimoine` → `#9c6b4a` · `extra` → `#b8503f` · `marché` → `#8a8b3d`

## Démarrage rapide
1. Créez la base et les tables ci-dessus.
2. Remplissez `Sejour`, `Planning`, `Visites`, `Repas`, `Hebergement`, et les items de `Logistique`/`Courses` (le prototype contient déjà toutes ces données — copiez-les depuis le fichier HTML).
3. Générez un **Personal Access Token** (Airtable → Developer hub → Personal access tokens) avec les scopes `data.records:read` et `data.records:write`, restreint à cette base.
4. Notez le **Base ID** (commence par `app…`, visible dans l'URL de l'API ou `airtable.com/api`).
5. Suivez `ARCHITECTURE.md` pour brancher l'app.
