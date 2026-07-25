import { SuggestionsSection } from './SuggestionsSection.jsx'
import { s } from '../../utils.js'

/** Boîte à idées : la famille propose des activités, avec envoi groupé
 *  (Telegram/WhatsApp) via la feuille de partage système. */
export default {
  title: 'Composants/Accueil/SuggestionsSection',
  component: SuggestionsSection,
  tags: ['autodocs'],
  args: {
    sx: s, newSuggestionText: '', setNewSuggestionText: () => {}, submitSuggestion: () => {},
    deleteSuggestion: () => {}, sendSuggestions: () => {},
  },
  argTypes: {
    sx: { table: { disable: true } }, setNewSuggestionText: { table: { disable: true } },
    submitSuggestion: { table: { disable: true } }, deleteSuggestion: { table: { disable: true } }, sendSuggestions: { table: { disable: true } },
  },
  parameters: { layout: 'padded' },
}

export const Vide = { name: 'Aucune idée', args: { suggestions: [] } }
export const AvecIdees = {
  name: 'Quelques idées',
  args: { suggestions: [
    { id: 1, text: 'Balade au Puy Mary dimanche' },
    { id: 2, text: 'Baignade à la cascade' },
  ] },
}
