import { describe, it, expect, vi, afterEach } from 'vitest'
import { appendSegment, getRecognitionCtor, isSpeechSupported, startDictation } from '../speech.js'

/** Faux SpeechRecognition contrôlable : on déclenche result/error/end à la main. */
function installFakeRecognition() {
  const instances = []
  class FakeRecognition {
    constructor() {
      this.lang = ''
      this.continuous = false
      this.interimResults = true
      this.started = false
      this.stopped = false
      instances.push(this)
    }
    start() { this.started = true }
    stop() { this.stopped = true }
    emitFinal(transcript) {
      this.onresult?.({ resultIndex: 0, results: [{ 0: { transcript }, isFinal: true, length: 1 }] })
    }
    emitInterim(transcript) {
      this.onresult?.({ resultIndex: 0, results: [{ 0: { transcript }, isFinal: false, length: 1 }] })
    }
  }
  window.SpeechRecognition = FakeRecognition
  return instances
}

afterEach(() => {
  delete window.SpeechRecognition
  delete window.webkitSpeechRecognition
  vi.restoreAllMocks()
})

describe('appendSegment', () => {
  it('concatène avec un seul espace et ignore le vide', () => {
    expect(appendSegment('', 'Bonjour')).toBe('Bonjour')
    expect(appendSegment('Bonjour', 'les amis')).toBe('Bonjour les amis')
    expect(appendSegment('Bonjour ', 'les amis')).toBe('Bonjour les amis')
    expect(appendSegment('Bonjour', '')).toBe('Bonjour')
    expect(appendSegment(undefined, 'seul')).toBe('seul')
  })
})

describe('isSpeechSupported / getRecognitionCtor', () => {
  it('false sans API dispo', () => {
    expect(isSpeechSupported()).toBe(false)
    expect(getRecognitionCtor()).toBeNull()
  })
  it('true avec webkitSpeechRecognition', () => {
    window.webkitSpeechRecognition = function () {}
    expect(isSpeechSupported()).toBe(true)
  })
})

describe('startDictation', () => {
  it('signale unsupported et ne crée rien sans API', () => {
    const onError = vi.fn()
    const ctrl = startDictation({ onError })
    expect(ctrl).toBeNull()
    expect(onError).toHaveBeenCalledWith('unsupported')
  })

  it('configure fr-FR continu et remonte les bribes finalisées uniquement', () => {
    const instances = installFakeRecognition()
    const onSegment = vi.fn()
    const ctrl = startDictation({ onSegment })
    expect(ctrl).not.toBeNull()
    const rec = instances[0]
    expect(rec.lang).toBe('fr-FR')
    expect(rec.continuous).toBe(true)
    expect(rec.interimResults).toBe(false)
    expect(rec.started).toBe(true)

    rec.emitInterim('brouillon')
    expect(onSegment).not.toHaveBeenCalled()
    rec.emitFinal('  la cascade du Pas de Cère  ')
    expect(onSegment).toHaveBeenCalledWith('la cascade du Pas de Cère')
  })

  it('stop() arrête la reconnaissance', () => {
    const instances = installFakeRecognition()
    const ctrl = startDictation({})
    ctrl.stop()
    expect(instances[0].stopped).toBe(true)
  })

  it('relaie les erreurs (micro refusé) et la fin de session', () => {
    const instances = installFakeRecognition()
    const onError = vi.fn()
    const onEnd = vi.fn()
    startDictation({ onError, onEnd })
    const rec = instances[0]
    rec.onerror({ error: 'not-allowed' })
    expect(onError).toHaveBeenCalledWith('not-allowed')
    rec.onend()
    expect(onEnd).toHaveBeenCalled()
  })
})
