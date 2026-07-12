import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

// Les steps s'appuient sur le PCOM (this.app) — aucun sélecteur en dur ici.

Given('j\'ouvre l\'application', async function () {
  await this.app.goto()
})

When('je vais sur l\'onglet {string}', async function (tab) {
  await this.app.tab(tab)
})

Then('l\'écran {string} est affiché', async function (name) {
  await expect(this.app.screen(name)).toBeVisible()
})

When('j\'ajoute une dépense de {int} € intitulée {string}', async function (montant, label) {
  await this.app.budget.addDepense(montant, label)
})

Then('je vois {string}', async function (texte) {
  await expect(this.page.getByText(texte).first()).toBeVisible()
})

// Vote familial
When('j\'ouvre le vote familial', async function () {
  await this.app.tab('visites')
  await this.app.visites.openVote()
})

When('j\'ajoute les votants {string} et {string}', async function (a, b) {
  await this.app.vote.addVoter(a)
  await this.app.vote.addVoter(b)
})

Then('le bouton démarrer le vote est {word}', async function (etat) {
  if (etat === 'actif') await expect(this.app.vote.startBtn).toBeEnabled()
  else await expect(this.app.vote.startBtn).toBeDisabled()
})
