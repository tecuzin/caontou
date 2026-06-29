# Architecture cible — « Cantou » avec backend Airtable

## 1. Vue d'ensemble
```
┌─────────────┐     HTTPS      ┌──────────────────┐    Airtable API   ┌───────────┐
│  App PWA    │ ─────────────► │  Proxy serverless │ ────────────────► │ Airtable  │
│ (React/Vite)│ ◄───────────── │ (Vercel/Netlify) │ ◄──────────────── │  (base)   │
└─────────────┘                └──────────────────┘                   └───────────┘
   téléphones                  garde le token secret                   les données
```

**Pourquoi un proxy ?** Le token Airtable donne un accès total à la base. S'il est mis dans le code de l'app (front), n'importe qui peut le lire et modifier vos données. Un petit proxy serverless (une fonction) garde le token côté serveur et n'expose que les routes nécessaires. **C'est la bonne pratique pour « option 3 ».**

> Raccourci acceptable pour un usage strictement privé et temporaire : appeler Airtable directement depuis l'app avec le token. Simple, mais **non sécurisé** (token exposé). À éviter si l'app est partagée par lien.

## 2. Stack recommandée
- **Front :** React + Vite, PWA (manifest + service worker pour install écran d'accueil + cache hors-ligne). Reprend le design HTML à l'identique.
- **Proxy :** une fonction serverless (Vercel Functions, Netlify Functions ou Cloudflare Workers). Token Airtable en **variable d'environnement** (`AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`).
- **Auth famille (léger) :** un simple code d'accès partagé (mot de passe stocké en variable d'env du proxy) suffit pour un usage familial ; pas besoin de comptes individuels au départ.
- **État client :** React Query (TanStack Query) — gère cache, revalidation, et **mises à jour optimistes** (cocher une case réagit instantanément puis se synchronise). Idéal pour ce type d'app.

## 3. Routes du proxy (exemple)
| Méthode | Route | Action Airtable |
|---|---|---|
| `GET` | `/api/:table` | Lister les enregistrements d'une table |
| `POST` | `/api/:table` | Créer (ex. une dépense) |
| `PATCH` | `/api/:table/:id` | Mettre à jour (ex. cocher `Coché`, basculer `Favori`) |
| `DELETE`| `/api/:table/:id` | Supprimer |

### Exemple — fonction Vercel (`/api/[table].js`)
```js
export default async function handler(req, res) {
  const { table } = req.query;
  const ALLOWED = ['Depenses','Logistique','Courses','Visites','Planning','Repas','Hebergement','Sejour','Meteo'];
  if (!ALLOWED.includes(table)) return res.status(400).end();

  const base = process.env.AIRTABLE_BASE_ID;
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;
  const opts = {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: req.method,
  };
  if (req.method !== 'GET') opts.body = JSON.stringify(req.body);
  const target = req.query.id ? `${url}/${req.query.id}` : url;

  const r = await fetch(target, opts);
  const data = await r.json();
  res.status(r.status).json(data);
}
```

### Exemple — hook côté app (React Query)
```js
// Lister les visites
const { data } = useQuery({
  queryKey: ['Visites'],
  queryFn: () => fetch('/api/Visites').then(r => r.json()),
});

// Basculer un favori (mise à jour optimiste)
const toggleFavori = useMutation({
  mutationFn: ({ id, favori }) =>
    fetch(`/api/Visites?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { Favori: favori } }),
    }),
  onMutate: async (vars) => { /* maj optimiste du cache */ },
});
```

## 4. Correspondance écran → table
| Écran / action | Table Airtable | Opération |
|---|---|---|
| Accueil — compte à rebours, dates, budget | `Sejour` | GET |
| Planning | `Planning` | GET (groupé par `Jour`) |
| Visites — affichage | `Visites` | GET |
| Visites — cœur ♥ | `Visites` | PATCH `Favori` |
| Repas — menus | `Repas` | GET |
| Repas — courses (cocher) | `Courses` | PATCH `Coché` |
| Budget — affichage | `Depenses` + `Sejour` | GET |
| Budget — ajouter dépense | `Depenses` | POST |
| Logistique — cocher | `Logistique` | PATCH `Coché` |
| Hébergement | `Hebergement` | GET |
| Météo | `Meteo` ou API live | GET |

## 5. Météo en direct (recommandé)
Plutôt qu'une table figée, utiliser **Open-Meteo** (gratuit, sans clé). Coordonnées Pas de Peyrol / Puy Mary ≈ `lat 45.108, lon 2.683`.
```
https://api.open-meteo.com/v1/forecast?latitude=45.108&longitude=2.683&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe/Paris
```
Mapper `weather_code` → emoji/icône côté app.

## 6. Hors-ligne (PWA)
- Mettre en cache les données de référence (planning, visites, hébergement) via le service worker → consultables sans réseau en montagne (couverture faible au Puy Mary !).
- Les mutations (cocher, dépense) faites hors-ligne : les mettre en file et rejouer au retour du réseau (React Query + persistance, ou une petite file dans IndexedDB).

## 7. Étapes de mise en œuvre
1. **Base Airtable** — créer tables + champs (`AIRTABLE.md`), remplir les données de référence (présentes dans le prototype HTML).
2. **Proxy** — déployer la fonction serverless avec `AIRTABLE_TOKEN` + `AIRTABLE_BASE_ID` en variables d'env.
3. **Front** — initialiser React + Vite, recréer les écrans à partir du prototype HTML (hifi, tokens dans `README.md`).
4. **Brancher les données** — remplacer chaque tableau figé par un appel via React Query (tableau §4).
5. **Mutations** — cocher / favori / ajout dépense → PATCH/POST optimistes.
6. **Météo live** — brancher Open-Meteo.
7. **PWA** — manifest + service worker + cache hors-ligne.
8. **Accès** — code d'accès familial partagé.
9. **Déployer** — Vercel/Netlify ; installer sur les téléphones via « Ajouter à l'écran d'accueil ».

## 8. Estimation indicative
- Base Airtable + remplissage : ~½ journée.
- Proxy + déploiement : ~½ journée.
- Front (recréation hifi + branchement données) : ~3–5 jours selon finition.
- PWA + hors-ligne + météo : ~1–2 jours.

> Tout est faisable par un développeur React, ou en pair-programming avec Claude Code à partir de ce dossier.
