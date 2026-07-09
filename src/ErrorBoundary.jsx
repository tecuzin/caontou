import { Component } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { buildExport, exportFilename, downloadExport } from './backup.js'
import { s } from './utils.js'

const haptic = (style = ImpactStyle.Light) => Haptics.impact({ style }).catch(() => {})

/**
 * Error Boundary React — capture les exceptions non gérées et affiche
 * une modale de secours. Cas d'usage critique : données corrompues,
 * bug écran, erreur parse — le seul moyen de récupérer sur l'APK offline.
 *
 * Actions disponibles :
 *  • Réessayer : rechargement de la page
 *  • Exporter : sauvegarde locale des données (localStorage direct)
 *  • Réinitialiser écran : supprime le flag de setup, force un rechargement
 *
 * Design : modale rassurante, gros texte, boutons tactiles (padding ample).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  onRetry = () => {
    haptic(ImpactStyle.Light)
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  onExport = async () => {
    haptic(ImpactStyle.Medium)
    try {
      const storeJson = localStorage.getItem('cantou.v1')
      if (!storeJson) {
        alert('⚠️ Aucune donnée trouvée dans le téléphone.')
        return
      }
      const store = JSON.parse(storeJson)
      const exported = buildExport(store, '1.0.0')
      await downloadExport(exported, exportFilename())
      alert('✅ Données exportées avec succès.')
    } catch (err) {
      alert(`❌ Erreur lors de l'export : ${err.message}`)
    }
  }

  onResetUI = () => {
    haptic(ImpactStyle.Light)
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const sx = (css) => s(css)

    return (
      <div
        style={sx(
          'position:fixed;inset:0;background:#f4ecdc;z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;font-family:system-ui,sans-serif;'
        )}
      >
        {/* Icône emoji */}
        <div style={sx('font-size:64px;margin-bottom:16px;')}>🔴</div>

        {/* Titre */}
        <h1
          style={sx(
            'color:#2f2a22;font-size:20px;font-weight:600;margin:0 0 12px;text-align:center;'
          )}
        >
          Oups, une erreur s'est produite
        </h1>

        {/* Message rassurant */}
        <p
          style={sx(
            'color:#6b6354;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.5;max-width:320px;'
          )}
        >
          L'app a rencontré un problème inattendu. Tes données sont en sécurité sur le téléphone.
        </p>

        {/* Détail de l'erreur (petit, gris) */}
        {this.state.error && (
          <details
            style={sx(
              'width:100%;max-width:320px;margin-bottom:24px;padding:8px;background:#efe6d4;border-radius:4px;cursor:pointer;'
            )}
          >
            <summary style={sx('color:#6b6354;font-size:12px;font-weight:500;cursor:pointer;')}>
              Détails techniques
            </summary>
            <pre
              style={sx(
                'margin:8px 0 0;font-size:10px;color:#2f2a22;overflow-x:auto;white-space:pre-wrap;word-break:break-word;'
              )}
            >
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        )}

        {/* Boutons d'action */}
        <div
          style={sx(
            'display:flex;flex-direction:column;gap:12px;width:100%;max-width:320px;'
          )}
        >
          <button
            onClick={this.onRetry}
            style={sx(
              'padding:12px 20px;background:#4a5d3a;color:#fffaf0;font-size:14px;font-weight:500;border:none;border-radius:6px;cursor:pointer;transition:transform 0.08s;'
            )}
            onMouseDown={(e) => (e.target.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
          >
            🔄 Réessayer
          </button>

          <button
            onClick={this.onExport}
            style={sx(
              'padding:12px 20px;background:#9c6b4a;color:#fffaf0;font-size:14px;font-weight:500;border:none;border-radius:6px;cursor:pointer;transition:transform 0.08s;'
            )}
            onMouseDown={(e) => (e.target.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
          >
            💾 Exporter mes données
          </button>

          <button
            onClick={this.onResetUI}
            style={sx(
              'padding:12px 20px;background:#b8503f;color:#fffaf0;font-size:14px;font-weight:500;border:none;border-radius:6px;cursor:pointer;transition:transform 0.08s;'
            )}
            onMouseDown={(e) => (e.target.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
          >
            🔄 Recommencer
          </button>
        </div>

        {/* Message d'aide */}
        <p
          style={sx(
            'color:#6b6354;font-size:12px;text-align:center;margin-top:24px;'
          )}
        >
          Si le problème persiste, essaie d'exporter tes données, puis réinstalle l'app.
        </p>
      </div>
    )
  }
}
