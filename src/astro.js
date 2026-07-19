/**
 * Éphémérides « Ciel du jour », 100 % hors-ligne et déterministes (aucune API).
 * - Soleil : lever/coucher par l'algorithme classique du sunrise equation
 *   (déclinaison + angle horaire, zénith 90,833° incluant réfraction).
 * - Lune : phase par l'âge synodique depuis une nouvelle lune de référence.
 * Module pur, testable comme `geo.js` / `osm.js`.
 */

const RAD = Math.PI / 180
const sin = (d) => Math.sin(d * RAD)
const cos = (d) => Math.cos(d * RAD)
const tan = (d) => Math.tan(d * RAD)
const asin = (x) => Math.asin(x) / RAD
const acos = (x) => Math.acos(x) / RAD
const atan = (x) => Math.atan(x) / RAD
const norm360 = (x) => ((x % 360) + 360) % 360
const norm24 = (x) => ((x % 24) + 24) % 24

/** Jour de l'année (1..366) en UTC. */
function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000)
}

/**
 * Heure UTC (0..24) du lever (`rising=true`) ou coucher du soleil pour une date
 * et des coordonnées. Renvoie `null` si le soleil ne se lève/couche pas ce
 * jour-là à cette latitude (nuit/jour polaire) — sans intérêt pour le Cantal
 * mais géré proprement.
 */
function sunEventUTC(date, lat, lng, rising, zenith = 90.833) {
  const N = dayOfYear(date)
  const lngHour = lng / 15
  const t = N + ((rising ? 6 : 18) - lngHour) / 24
  const M = 0.9856 * t - 3.289
  let L = M + 1.916 * sin(M) + 0.020 * sin(2 * M) + 282.634
  L = norm360(L)
  let RA = atan(0.91764 * tan(L))
  RA = norm360(RA)
  RA += (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) // même quadrant que L
  RA /= 15
  const sinDec = 0.39782 * sin(L)
  const cosDec = cos(asin(sinDec))
  const cosH = (cos(zenith) - sinDec * sin(lat)) / (cosDec * cos(lat))
  if (cosH > 1 || cosH < -1) return null
  const H = (rising ? 360 - acos(cosH) : acos(cosH)) / 15
  const T = H + RA - 0.06571 * t - 6.622
  return norm24(T - lngHour)
}

/** Convertit une heure UTC (0..24) d'un jour donné en objet Date (UTC). */
function utcHoursToDate(date, hours) {
  if (hours == null) return null
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCMilliseconds(Math.round(hours * 3600000))
  return d
}

/**
 * Lever / coucher du soleil pour `date` (jour) aux coordonnées. Renvoie des
 * `Date` (instant UTC) → à formater en heure locale via `toLocaleTimeString`.
 * `sunrise`/`sunset` valent `null` en cas de jour/nuit polaire.
 */
export function sunTimes(date, lat, lng) {
  return {
    sunrise: utcHoursToDate(date, sunEventUTC(date, lat, lng, true)),
    sunset: utcHoursToDate(date, sunEventUTC(date, lat, lng, false)),
  }
}

const SYNODIC = 29.530588853
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14) // nouvelle lune de référence

const PHASES = [
  { max: 0.0333, name: 'Nouvelle lune', emoji: '🌑' },
  { max: 0.2167, name: 'Premier croissant', emoji: '🌒' },
  { max: 0.2833, name: 'Premier quartier', emoji: '🌓' },
  { max: 0.4667, name: 'Lune gibbeuse croissante', emoji: '🌔' },
  { max: 0.5333, name: 'Pleine lune', emoji: '🌕' },
  { max: 0.7167, name: 'Lune gibbeuse décroissante', emoji: '🌖' },
  { max: 0.7833, name: 'Dernier quartier', emoji: '🌗' },
  { max: 0.9667, name: 'Dernier croissant', emoji: '🌘' },
  { max: 1.0001, name: 'Nouvelle lune', emoji: '🌑' },
]

/**
 * Phase de lune pour `date` : fraction 0..1 du cycle synodique (0 = nouvelle,
 * 0,5 = pleine), âge en jours, taux d'illumination 0..1, nom et emoji FR.
 */
export function moonPhase(date) {
  const days = (date.getTime() - NEW_MOON_EPOCH) / 86400000
  const fraction = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC
  const age = fraction * SYNODIC
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2
  const p = PHASES.find((x) => fraction < x.max) || PHASES[0]
  return { fraction, age, illumination, name: p.name, emoji: p.emoji }
}
