import { EditBudgetModal } from './EditBudgetModal.jsx'

/** Modale « Budget total » : saisie du montant global de l'enveloppe. */
export default {
  title: 'Modals/EditBudgetModal',
  component: EditBudgetModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    newBudgetTotal: '1800',
    budgetTotal: 1800,
    darkMode: false,
    setNewBudgetTotal: () => {},
    onSubmit: () => {},
    onClose: () => {},
  },
  argTypes: { sx: { table: { disable: true } } },
  parameters: { layout: 'fullscreen' },
}

export const ParDefaut = {}
export const ChampVide = { name: 'Champ vide (placeholder)', args: { newBudgetTotal: '' } }
