/** Réglages globaux du catalogue Cantou. Fond crème + police de l'app pour que
 *  les composants s'affichent dans leur contexte visuel réel. */
export const parameters = {
  layout: 'centered',
  controls: { expanded: true, matchers: { color: /(color|background|bg)$/i, date: /Date$/i } },
  backgrounds: {
    default: 'crème',
    values: [
      { name: 'crème', value: '#f4ecdc' },
      { name: 'carte', value: '#fffdf8' },
      { name: 'sombre', value: '#1c1a16' },
    ],
  },
  options: {
    storySort: { order: ['Introduction', 'Composants', 'Écrans', '*'] },
  },
}

export const decorators = [
  (Story) => (
    <div style={{ fontFamily: "'Nunito Sans', system-ui, sans-serif", color: '#2f2a22', width: 360, maxWidth: '100%' }}>
      <Story />
    </div>
  ),
]
