/* ------------------------------------------------------------------ *
 * Mini-lexique auvergnat pour enfants — contenu statique, 100 % hors-ligne.
 *
 * ─── MÉTHODE ───────────────────────────────────────────────────────
 * L'occitan d'Auvergne n'a PAS d'orthographe unique dans l'usage
 * populaire : la graphie francisée (« cantou », « cabrette ») cohabite
 * avec la graphie classique occitane (« canton », « cabreta »), et le
 * Cantal lui-même est à cheval sur DEUX aires dialectales — l'auvergnat
 * au nord/est (Mauriac, Saint-Flour) et le languedocien « aurillacois »
 * au sud-ouest, dont relève le Carladès (source : IEO Cantal,
 * https://www.ieo-cantal.com/la-lenga-del-cantal/ ; Wikipédia,
 * https://fr.wikipedia.org/wiki/Aurillacois_(dialecte) ).
 * Un même mot peut donc se dire et s'écrire autrement d'une vallée à
 * l'autre : `note` le signale quand c'est le cas.
 *
 * ─── CRITÈRE DE RECOUPEMENT ────────────────────────────────────────
 * Chaque entrée ci-dessous a été vérifiée dans **au moins deux sources
 * indépendantes et sérieuses** (dictionnaires : CNRTL/TLFi, Wiktionnaire ;
 * encyclopédie : Wikipédia ; institutions : IEO Cantal, offices de
 * tourisme, INRAE ; presse régionale). `source` cite la principale ;
 * `source2` la source de recoupement. Les mots qui n'ont PAS tenu ce
 * critère ont été écartés — mieux vaut 15 mots sûrs que 25 douteux, ce
 * lexique est lu par des enfants.
 *
 * Écartés volontairement : « burle » (vent glacial, mais attesté pour le
 * Velay / l'Ardèche / le Forez, PAS pour le Cantal), « dròlle » (enfant :
 * une seule source solide), « goulliat », ainsi que tout l'argot moderne
 * du Midi (barjo, cagade, chocolatine…) qui n'est pas de l'auvergnat.
 * ------------------------------------------------------------------ */

/** @typedef {{word:string, meaning:string, note?:string, source:string, source2:string}} DialectWord */

/** @type {DialectWord[]} */
export const DIALECT_WORDS = [
  {
    word: 'Cantou',
    meaning: 'Le coin du feu : la grande cheminée où l’on s’assoit, avec un banc de chaque côté.',
    note: 'De l’occitan « canton » = le coin. C’est le nom de cette appli !',
    source: 'https://fr.wiktionary.org/wiki/cantou',
    source2: 'https://www.blats.fr/petit-lexique-auvergnat.html',
  },
  {
    word: 'Buron',
    meaning: 'La petite cabane de pierre en montagne où les vachers vivaient l’été et faisaient le fromage.',
    source: 'https://www.cnrtl.fr/definition/buron',
    source2: 'https://fr.wikipedia.org/wiki/Buron',
  },
  {
    word: 'Bouffadou',
    meaning: 'Le long bâton percé dans lequel on souffle pour raviver le feu sans faire voler les cendres.',
    note: 'De l’occitan « bufar » = souffler. On écrit aussi bufadou ou boufadou.',
    source: 'https://fr.wikipedia.org/wiki/Bouffadou',
    source2: 'https://www.blats.fr/petit-lexique-auvergnat.html',
  },
  {
    word: 'Cabra',
    meaning: 'La chèvre, en occitan du Cantal.',
    note: 'Au nord du département on dit plutôt « chabra ».',
    source: 'https://www.ieo-cantal.com/la-lenga-del-cantal/',
    source2: 'https://fr.wikipedia.org/wiki/Cabrette',
  },
  {
    word: 'Cabrette',
    meaning: 'La cornemuse auvergnate, avec un soufflet sous le bras : l’instrument roi du Cantal.',
    note: 'En occitan « cabreta » = petite chèvre, car la poche est en peau de chèvre.',
    source: 'https://fr.wikipedia.org/wiki/Cabrette',
    source2: 'https://www.pci-lab.fr/fiche-d-inventaire/fiche/455-la-pratique-de-la-cabrette-ou-musette',
  },
  {
    word: 'Ostal',
    meaning: 'La maison, le foyer. Se prononce « oustal ».',
    source: 'https://www.ieo-cantal.com/la-lenga-del-cantal/',
    source2: 'https://fr.wiktionary.org/wiki/ostal',
  },
  {
    word: 'Escòla',
    meaning: 'L’école. Se prononce « escolo » par ici.',
    source: 'https://www.ieo-cantal.com/la-lenga-del-cantal/',
    source2: 'https://fr.wiktionary.org/wiki/escòla',
  },
  {
    word: 'Poutou',
    meaning: 'Un bisou !',
    note: 'De l’occitan « poton », petit mot venu de « pòt » = la lèvre.',
    source: 'https://fr.wiktionary.org/wiki/poutou',
    source2: 'https://www.blats.fr/petit-lexique-auvergnat.html',
  },
  {
    word: 'Bader',
    meaning: 'Regarder bouche bée, rester en admiration devant quelque chose.',
    note: 'De l’occitan « badar ». Dire « arrête de bader ! » c’est « arrête de rêvasser ».',
    source: 'https://fr.wiktionary.org/wiki/bader',
    source2: 'https://www.blats.fr/petit-lexique-auvergnat.html',
  },
  {
    word: 'Fada',
    meaning: 'Un peu fou, un peu nigaud — ça se dit gentiment, pour taquiner.',
    source: 'https://www.blats.fr/petit-lexique-auvergnat.html',
    source2: 'https://www.regardsetviedauvergne.fr/2012/09/petit-abecedaire-du-langage-auvergnat.html',
  },
  {
    word: 'Qu’es aquò ?',
    meaning: '« Qu’est-ce que c’est ? » — la question occitane la plus célèbre.',
    note: 'Passée en français sous la forme « quésaco ».',
    source: 'https://fr.wiktionary.org/wiki/quésaco',
    source2: 'https://www.blats.fr/petit-lexique-auvergnat.html',
  },
  {
    word: 'Planèze',
    meaning: 'Un grand plateau de lave plate, en forme de triangle, entre deux vallées.',
    note: 'Il y en a plein autour du volcan du Cantal — la plus grande est celle de Saint-Flour.',
    source: 'https://www.cnrtl.fr/definition/plan%C3%A8ze',
    source2: 'https://fr.wikipedia.org/wiki/Planèze',
  },
  {
    word: 'Gerle',
    meaning: 'La grande cuve en bois de châtaignier où l’on verse le lait pour faire le fromage de Salers.',
    source: 'https://fr.wikipedia.org/wiki/Gerle',
    source2: 'https://umrf.clermont.hub.inrae.fr/actualites/gerle',
  },
  {
    word: 'Truffade',
    meaning: 'Pommes de terre poêlées avec de la tome fraîche qui file : LE plat du Cantal.',
    note: 'De l’occitan « trufada » : ici, « trufa » veut dire pomme de terre.',
    source: 'https://fr.wikipedia.org/wiki/Truffade',
    source2: 'https://www.pays-saint-flour.fr/aligot-ou-truffade/',
  },
  {
    word: 'Pounti',
    meaning: 'Un pain de viande aux blettes et aux pruneaux, sucré-salé, qu’on emportait aux champs.',
    source: 'https://fr.wikipedia.org/wiki/Pounti',
    source2: 'https://www.olydea.com/tourism-french-auvergnat-gastronomy',
  },
  {
    word: 'Pachade',
    meaning: 'Une grosse crêpe épaisse, souvent aux myrtilles ou aux pommes.',
    source: 'https://en.wikipedia.org/wiki/Pachade',
    source2: 'https://www.regardsetviedauvergne.fr/2021/03/gastronomie-regionale-la-pachade.html',
  },
]

/** PRNG mulberry32 : seed entier → fonction () => flottant [0,1). Pur.
 *  (Même implémentation que `memory.js` : tirage déterministe, jamais Math.random.) */
export function makeRng(seed = 1) {
  let a = (Math.floor(Math.abs(seed)) || 1) >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Tire une manche de `n` mots distincts, dans un ordre DÉTERMINISTE pour une
 * graine donnée : `pickRound(w, n, 7)` rend toujours exactement la même liste.
 * Ne mute pas `words`. `n` est borné à [0, words.length].
 * @param {DialectWord[]} words
 * @param {number} n
 * @param {number} seed
 * @returns {DialectWord[]}
 */
export function pickRound(words = DIALECT_WORDS, n = 8, seed = 1) {
  const list = Array.isArray(words) ? words.slice() : []
  const count = Math.max(0, Math.min(Math.floor(n) || 0, list.length))
  const rng = makeRng(seed)
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list.slice(0, count)
}

/** Graine aléatoire de manche (hors logique pure : usage UI uniquement). */
export function randomDialectSeed() {
  return Math.floor(Math.random() * 1e9) + 1
}
