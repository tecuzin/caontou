/* Mock des plugins Capacitor pour Storybook (catalogue de composants).
 * Aucune API native : tout est no-op / valeurs neutres. Aliasé pour chaque
 * paquet `@capacitor/*` dans main.js. */
const noop = async () => ({})

export const Capacitor = { isNativePlatform: () => false, convertFileSrc: (x) => x, getPlatform: () => 'web' }
export function registerPlugin() { return {} }
export class WebPlugin {}

export const Haptics = { impact: noop, notification: noop, vibrate: noop, selectionStart: noop, selectionChanged: noop, selectionEnd: noop }
export const ImpactStyle = { Heavy: 'HEAVY', Medium: 'MEDIUM', Light: 'LIGHT' }
export const NotificationType = { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' }

export const Share = { share: noop, canShare: async () => ({ value: false }) }

export const Filesystem = {
  mkdir: noop, writeFile: noop, deleteFile: noop,
  readFile: async () => ({ data: '' }), getUri: async () => ({ uri: '' }), readdir: async () => ({ files: [] }),
}
export const Directory = { Data: 'DATA', Documents: 'DOCUMENTS', Cache: 'CACHE' }

export const Camera = { getPhoto: async () => ({ base64String: '' }), requestPermissions: noop }
export const CameraResultType = { Base64: 'base64', Uri: 'uri', DataUrl: 'dataUrl' }
export const CameraSource = { Camera: 'CAMERA', Photos: 'PHOTOS', Prompt: 'PROMPT' }

export const Geolocation = {
  getCurrentPosition: async () => ({ coords: { latitude: 44.9, longitude: 2.5 } }),
  requestPermissions: async () => ({ location: 'granted' }),
}

export const LocalNotifications = {
  schedule: noop, cancel: noop, requestPermissions: noop,
  checkPermissions: async () => ({ display: 'granted' }), getPending: async () => ({ notifications: [] }),
}

export const StatusBar = { setStyle: noop, setBackgroundColor: noop, setOverlaysWebView: noop, show: noop, hide: noop }
export const Style = { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' }

export default {}
