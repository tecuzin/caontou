import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildNotificationList, buildBackupReminder, buildWeatherReminders } from '../notifications.js'

const trip = { start: '2026-08-05', end: '2026-08-15', origin: 'Beauvais', etape: 'Laschamps', destination: 'Mandailles (Cantal)' }

const days = [
  { dow: 'Mer', num: 5, items: [{ time: '09:00', title: 'Départ' }] },
  { dow: 'Jeu', num: 6, items: [{ time: '13:00', title: 'Arrivée' }] },
]
const meals = [
  { id: 1, day: 'Mer 5', dish: 'Étape resto' },
  { id: 2, day: 'Jeu 6', dish: 'Pâtes au pesto' },
]

describe('buildNotificationList()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('ne planifie rien pour des rappels déjà passés', () => {
    vi.setSystemTime(new Date(2026, 11, 31)) // bien après la fin du voyage
    const list = buildNotificationList(days, meals, trip)
    expect(list).toEqual([])
  })

  it('planifie un rappel 30 min avant chaque activité future', () => {
    vi.setSystemTime(new Date(2026, 7, 1)) // avant le voyage
    const list = buildNotificationList(days, meals, trip)
    const activityReminders = list.filter((n) => n.title.startsWith('🗓️'))
    expect(activityReminders).toHaveLength(2)
    // Départ à 09:00 le 5 août -> rappel à 08:30
    const depart = activityReminders.find((n) => n.title.includes('Départ'))
    expect(depart.at.getHours()).toBe(8)
    expect(depart.at.getMinutes()).toBe(30)
  })

  it('planifie un rappel repas à 8h avec le plat du jour trouvé par libellé', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const list = buildNotificationList(days, meals, trip)
    const mealReminder = list.find((n) => n.title.includes('Mer 5'))
    expect(mealReminder.body).toBe('Étape resto')
    expect(mealReminder.at.getHours()).toBe(8)
  })

  it('utilise "Voir les menus" si aucun repas ne correspond au jour', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const list = buildNotificationList(days, [], trip)
    const mealReminder = list.find((n) => n.title.includes('Menu du jour'))
    expect(mealReminder.body).toBe('Voir les menus')
  })

  it('planifie le rappel de départ avec origine/étape/destination', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const list = buildNotificationList(days, meals, trip)
    const departReminder = list.find((n) => n.title.includes("C'est le grand jour"))
    expect(departReminder.body).toBe('Beauvais → Mandailles (Cantal) (via Laschamps)')
  })

  it('planifie le rappel de fin de séjour la veille du retour', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const list = buildNotificationList(days, meals, trip)
    const endReminder = list.find((n) => n.title.includes('fin du séjour'))
    expect(endReminder).toBeDefined()
    expect(endReminder.at.getDate()).toBe(14) // veille du 15 août
  })

  it('ids sont uniques et déterministes pour un même contexte', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const list1 = buildNotificationList(days, meals, trip)
    const list2 = buildNotificationList(days, meals, trip)
    expect(list1.map((n) => n.id)).toEqual(list2.map((n) => n.id))
    expect(new Set(list1.map((n) => n.id)).size).toBe(list1.length)
  })

  it('sans étape (trip.etape vide), n\'ajoute pas de mention "via"', () => {
    vi.setSystemTime(new Date(2026, 7, 1))
    const tripNoEtape = { ...trip, etape: '' }
    const list = buildNotificationList(days, meals, tripNoEtape)
    const departReminder = list.find((n) => n.title.includes("C'est le grand jour"))
    expect(departReminder.body).not.toMatch(/via/)
  })
})

describe('buildWeatherReminders()', () => {
  const randoDays = [
    { dow: 'Mer', num: 5, items: [{ time: '09:00', title: 'Départ' }] }, // pas plein air
    { dow: 'Jeu', num: 6, items: [{ time: '10:00', title: 'Rando au Puy Mary' }] }, // plein air
    { dow: 'Ven', num: 7, items: [{ time: '14:00', title: 'Canyoning' }] }, // plein air
  ]

  it('planifie un rappel la veille au soir des journées plein air uniquement', () => {
    const now = new Date(2026, 7, 1).getTime() // avant le voyage
    const list = buildWeatherReminders(randoDays, trip, now)
    expect(list).toHaveLength(2)
    // Rando le 6 -> rappel la veille (5) à 20h30
    const r6 = list.find((n) => n.body.includes('Jeu 6'))
    expect(r6.at.getDate()).toBe(5)
    expect(r6.at.getHours()).toBe(20)
    expect(r6.at.getMinutes()).toBe(30)
    expect(r6.title).toMatch(/météo/i)
  })

  it('ne planifie rien pour un jour sans activité de plein air', () => {
    const now = new Date(2026, 7, 1).getTime()
    const list = buildWeatherReminders([randoDays[0]], trip, now)
    expect(list).toEqual([])
  })

  it('ignore les rappels déjà passés', () => {
    const now = new Date(2026, 11, 31).getTime() // après le voyage
    expect(buildWeatherReminders(randoDays, trip, now)).toEqual([])
  })

  it('ids réservés hors des plages dynamiques (>= 9100)', () => {
    const now = new Date(2026, 7, 1).getTime()
    const list = buildWeatherReminders(randoDays, trip, now)
    expect(list.every((n) => n.id >= 9100)).toBe(true)
    expect(new Set(list.map((n) => n.id)).size).toBe(list.length)
  })
})

describe('dispatchWebNotifications() — fallback navigateur', () => {
  it('ne planifie rien si l\'API Notification est absente', async () => {
    const { dispatchWebNotifications } = await import('../notifications.js')
    const originalNotification = window.Notification
    // @ts-ignore
    delete window.Notification
    await expect(dispatchWebNotifications([{ id: 1, title: 'X', body: 'Y', at: new Date() }])).resolves.toBeUndefined()
    window.Notification = originalNotification
  })

  it('ne planifie rien si la permission est refusée', async () => {
    const { dispatchWebNotifications } = await import('../notifications.js')
    const originalNotification = window.Notification
    window.Notification = class { static permission = 'denied' }
    await expect(dispatchWebNotifications([{ id: 1, title: 'X', body: 'Y', at: new Date() }])).resolves.toBeUndefined()
    window.Notification = originalNotification
  })

  it('planifie un setTimeout par notification si la permission est accordée', async () => {
    vi.useRealTimers()
    const { dispatchWebNotifications } = await import('../notifications.js')
    const originalNotification = window.Notification
    const created = []
    window.Notification = class {
      static permission = 'granted'
      constructor(title, opts) { created.push({ title, opts }) }
    }
    const soon = new Date(Date.now() + 10)
    await dispatchWebNotifications([{ id: 1, title: 'Test', body: 'Corps', at: soon }])
    await new Promise((r) => setTimeout(r, 30))
    expect(created).toHaveLength(1)
    expect(created[0].title).toBe('Test')
    window.Notification = originalNotification
  })
})

describe('buildBackupReminder()', () => {
  it('propose un rappel dans 2 jours si aucune sauvegarde n\'a jamais été faite', () => {
    const now = new Date(2026, 6, 1, 10, 0, 0)
    const reminder = buildBackupReminder(null, now)
    expect(reminder.id).toBe(9000)
    expect(reminder.body).toMatch(/pas encore fait/)
    const expected = new Date(2026, 6, 3)
    expect(reminder.at.getDate()).toBe(expected.getDate())
    expect(reminder.at.getHours()).toBe(9)
  })

  it('propose un rappel 5 jours après la dernière sauvegarde', () => {
    const now = new Date(2026, 6, 1, 10, 0, 0)
    const lastBackup = new Date(2026, 5, 28).toISOString() // 3 jours avant "now"
    const reminder = buildBackupReminder(lastBackup, now)
    expect(reminder.at.getDate()).toBe(3) // 28 juin + 5 jours = 3 juillet
    expect(reminder.body).toMatch(/5 jours/)
  })

  it('replanifie pour demain si la sauvegarde est déjà en retard', () => {
    const now = new Date(2026, 6, 10, 10, 0, 0)
    const lastBackup = new Date(2026, 5, 1).toISOString() // très ancien, 5 jours largement dépassés
    const reminder = buildBackupReminder(lastBackup, now)
    expect(reminder.at.getTime()).toBeGreaterThan(now.getTime())
    expect(reminder.at.getDate()).toBe(11) // demain
  })

  it('utilise toujours le même id réservé (pas de collision avec buildNotificationList)', () => {
    const reminder1 = buildBackupReminder(null)
    const reminder2 = buildBackupReminder(new Date().toISOString())
    expect(reminder1.id).toBe(reminder2.id)
    expect(reminder1.id).toBe(9000)
  })
})
