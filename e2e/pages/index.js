// Page/Component Object Model (PCOM) pour l'E2E Playwright.
// Chaque objet encapsule les sélecteurs (data-testid) et les actions métier
// d'un écran/composant ; les specs ne manipulent jamais de sélecteur en dur.

class Base {
  constructor(page) { this.page = page }
  id(testid) { return this.page.locator(`[data-testid="${testid}"]`) }
}

/** Onglet Budget — CRUD dépenses. */
export class BudgetPage extends Base {
  get screen() { return this.id('screen-budget') }
  get addBtn() { return this.id('btn-add-depense') }
  async addDepense(montant, label) {
    await this.addBtn.click()
    await this.id('input-montant').fill(String(montant))
    if (label != null) await this.id('input-label').fill(label)
    await this.id('btn-submit-depense').click()
  }
}

/** Onglet Visites — tri + ouverture du vote. */
export class VisitesPage extends Base {
  get screen() { return this.id('screen-visites') }
  triByLabel(re) { return this.page.getByText(re) }
  async openVote() { await this.id('btn-open-vote').click() }
}

/** Composant Vote familial (pass-and-play). */
export class VotePage extends Base {
  get startBtn() { return this.id('vote-start') }
  get winner() { return this.id('vote-winner') }
  async addVoter(name) {
    await this.id('vote-new-voter').fill(name)
    await this.id('vote-add-voter').click()
  }
  async start() { await this.startBtn.click() }
  firstPick() { return this.page.locator('[data-testid^="vote-pick-"]').first() }
  pickByTestId(testid) { return this.id(testid) }
  async addToPlanning(dayIndex) {
    await this.id('vote-target-day').selectOption(String(dayIndex))
    await this.id('vote-add-planning').click()
  }
}

/** Onglet Planning. */
export class PlanningPage extends Base {
  get screen() { return this.id('screen-planning') }
}

/** Onglet Repas & courses. */
export class RepasPage extends Base {
  get screen() { return this.id('screen-repas') }
  async toCourses() { await this.page.getByText('Courses', { exact: true }).click() }
  async toMenus() { await this.page.getByText('Menus', { exact: true }).click() }
  async addCategory() { await this.id('btn-add-course-cat').click() }
}

/** Sous-écran Trajet (aller/retour). */
export class TrajetPage extends Base {
  get aller() { return this.id('btn-trajet-aller') }
  get retour() { return this.id('btn-trajet-retour') }
}

/** Sous-écran Restos — carnet de restaurants. */
export class RestosPage extends Base {
  get screen() { return this.id('screen-restos') }
  async addResto({ name, place, tel, reserved } = {}) {
    await this.id('btn-add-resto').click()
    if (name) await this.id('resto-name').fill(name)
    if (place) await this.id('resto-place').fill(place)
    if (tel) await this.id('resto-tel').fill(tel)
    if (reserved) await this.id('resto-reserved').click()
    await this.id('resto-save').click()
  }
}

/** Sous-écran Bingo. */
export class BingoPage extends Base {
  get screen() { return this.id('screen-bingo') }
  get lines() { return this.id('bingo-lines') }
  cell(i) { return this.id(`bingo-cell-${i}`) }
}

/** Sous-écran Bilan. */
export class BilanPage extends Base {
  get screen() { return this.id('screen-bilan') }
  get shareBtn() { return this.id('btn-share-recap') }
}

/** Sous-écran Logistique. */
export class LogistiquePage extends Base {
  async addList(name) {
    await this.id('btn-add-logi-list').click()
    await this.id('input-logi-list-name').fill(name)
    await this.id('btn-save-logi-list').click()
  }
}

/** Modale Export / Import JSON. */
export class DataPage extends Base {
  get exportJson() { return this.id('export-json') }
  get importTextarea() { return this.id('import-textarea') }
  get importPreview() { return this.id('import-preview') }
  async applyImport() { await this.id('btn-apply-import').click() }
}

/** Modale Historique des versions (changelog). */
export class ChangelogPage extends Base {
  async close() { await this.id('btn-changelog-close').click() }
}

/**
 * App — objet racine : navigation (onglets, modules, sous-écrans) + compose
 * tous les page objects. Point d'entrée unique des specs.
 */
export class App extends Base {
  constructor(page) {
    super(page)
    this.budget = new BudgetPage(page)
    this.visites = new VisitesPage(page)
    this.vote = new VotePage(page)
    this.planning = new PlanningPage(page)
    this.repas = new RepasPage(page)
    this.trajet = new TrajetPage(page)
    this.restos = new RestosPage(page)
    this.bingo = new BingoPage(page)
    this.bilan = new BilanPage(page)
    this.logistique = new LogistiquePage(page)
    this.data = new DataPage(page)
    this.changelog = new ChangelogPage(page)
  }

  /** Charge l'app sur un store vierge. */
  async goto() {
    await this.page.goto('/')
    await this.page.evaluate(() => localStorage.clear())
    await this.page.reload()
  }

  get accueil() { return this.id('screen-accueil') }
  get undoSnackbar() { return this.id('undo-snackbar') }
  get countdown() { return this.id('countdown-pill') }

  /** Va sur un onglet principal (accueil, planning, visites, repas, budget). */
  async tab(name) { await this.id(`tab-${name}`).click() }
  screen(name) { return this.id(`screen-${name}`) }

  /** Ouvre un sous-écran depuis une carte/module de l'accueil (par libellé). */
  async openModule(text) { await this.page.getByText(text, { exact: false }).first().click() }

  // Ouvertures directes (boutons dédiés de l'accueil)
  async openBingo() { await this.id('btn-open-bingo').click() }
  async openBilan() { await this.id('btn-open-bilan').click() }
  async openExport() { await this.id('btn-export').click() }
  async openImport() { await this.id('btn-import').click() }
  async openHistorique() { await this.id('btn-open-historique').click() }
  // Le journal de bord s'ouvre depuis l'en-tête d'un jour du Planning (📔).
  async openJournal() { await this.tab('planning'); await this.id('btn-journal').first().click() }
}
