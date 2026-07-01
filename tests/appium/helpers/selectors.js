// Sélecteurs Appium pour Cantou (Android WebView)
// Utilise accessibility id (= data-testid dans la WebView Capacitor)

export const TABS = {
  accueil:  '~tab-accueil',
  planning: '~tab-planning',
  visites:  '~tab-visites',
  repas:    '~tab-repas',
  budget:   '~tab-budget',
}

export const SCREENS = {
  accueil:  '~screen-accueil',
  planning: '~screen-planning',
  visites:  '~screen-visites',
  repas:    '~screen-repas',
  budget:   '~screen-budget',
}

export const BUDGET = {
  btnAdd:    '~btn-add-depense',
  inputAmt:  '~input-montant',
  inputLabel: '~input-label',
  btnSubmit: '~btn-submit-depense',
}

// Sélecteur XPath générique pour texte visible
export const byText = (text) => `//*[@text="${text}"]`
export const byContains = (text) => `//*[contains(@text,"${text}")]`
