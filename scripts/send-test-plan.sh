#!/bin/bash
# Envoie le PLAN DE TEST MANUEL Cantou sur le canal Telegram.
# À lancer avec CHAQUE build/déploiement (voir skill `deploy`) : la famille
# rejoue cette checklist sur chaque nouvel APK et répond avec le nº de build.
#
# Usage : scripts/send-test-plan.sh
# (accepte un numéro de build optionnel en 1er argument, juste pour le titre)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="${1:-$(cat "$SCRIPT_DIR/build.number" 2>/dev/null || echo '?')}"

read -r -d '' MSG <<EOF || true
🧪 *Plan de test manuel Cantou — build ${BUILD}*
Rapide (~2-3 min). Cocher au fur et à mesure, répondre ici avec le nº de build + ✅/❌ + capture si souci.

*1. Lancement & données*
☐ L'app s'ouvre sans écran blanc
☐ Compte à rebours J- affiché sur l'Accueil
☐ « Quoi de neuf ? » apparaît au 1er lancement du build

*2. Persistance (le cœur)*
☐ Cocher un item valise/courses → fermer/rouvrir → toujours coché
☐ Ajouter une dépense → toujours là après réouverture

*3. Budget + donut*
☐ Le donut « Où part l'argent » s'affiche sur l'écran Budget
☐ Total au centre = montant « Dépensé » de la barre du haut
☐ Ajouter/supprimer une dépense → le donut se met à jour
☐ Supprimer toutes les dépenses → le donut disparaît
☐ Couleurs du donut = couleurs des barres « Par catégorie »

*4. Nouveautés du build*
☐ Réglages → Affichage → *Taille du texte* : Grand / Très grand agrandit le texte SANS casser la mise en page
☐ Réglages → *Stockage* : jauge affichée + rappel « photos pas dans la sauvegarde »
☐ Souvenirs → *Importer* : on peut choisir plusieurs photos d'un coup
☐ Jeux → *Parler d'Auvergne* → « Gérer le lexique » : ajouter / modifier / supprimer un mot
☐ Après une modif, le repère « ✓ Enregistré » apparaît brièvement (et PAS au démarrage)
☐ Mode plein soleil / Mode enfant (build 116) toujours OK
☐ ⚠️ *Bingo* : les cases cochées AVANT la mise à jour sont TOUJOURS là

*5. Navigation*
☐ Les 5 onglets s'ouvrent
☐ Chaque sous-écran s'ouvre + le retour fonctionne
☐ Carte : s'affiche, tuiles dispo hors-ligne

*6. Hors-ligne*
☐ Mode avion → app utilisable, données présentes

_Garder ce message épinglé : à rejouer sur chaque nouvel APK._
EOF

bash "$SCRIPT_DIR/scripts/deploy-telegram.sh" --message "$MSG"
