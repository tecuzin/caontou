import { ModalShell } from './ModalShell.jsx'
import { s } from '../utils.js'

/**
 * Coquille de modale accessible (bottom sheet) partagée par toutes les feuilles :
 * backdrop cliquable + fermeture au clavier (Échap). L'appelant fournit la
 * feuille en `children` (avec `role="dialog"` + `stopPropagation`).
 */
export default {
  title: 'Composants/ModalShell',
  component: ModalShell,
  tags: ['autodocs'],
  args: { onClose: () => {}, z: 200, fade: true },
  argTypes: { onClose: { table: { disable: true } }, children: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const AvecFeuille = {
  name: 'Avec une feuille de démo',
  render: (args) => (
    <ModalShell {...args}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={s('background:#f6efe2;border-radius:28px 28px 0 0;padding:20px 20px 30px;')}>
        <div style={s('width:40px;height:4px;border-radius:4px;background:#d8cbb0;margin:0 auto 16px;')} />
        <div style={s('font-family:Quicksand;font-weight:700;font-size:19px;')}>Titre de la feuille</div>
        <div style={s('font-size:13px;color:#6b6354;margin-top:6px;')}>Contenu de démonstration — clic sur le fond ou touche Échap pour fermer.</div>
      </div>
    </ModalShell>
  ),
}
