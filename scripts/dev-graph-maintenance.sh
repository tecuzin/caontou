#!/bin/sh
# Maintenance de l'outillage de dev Cantou : re-indexation du graphe de code
# (CodeGraphContext) + rapport de version des outils. Voir le skill `dev-tooling`.
#
# Usage :
#   scripts/dev-graph-maintenance.sh              # re-index + stats + versions (log)
#   scripts/dev-graph-maintenance.sh --install-cron   [interval_hours]  # défaut 6
#   scripts/dev-graph-maintenance.sh --uninstall-cron
#   scripts/dev-graph-maintenance.sh --status         # dernier log + état cron
#
# Le graphe est déjà re-indexé à chaque commit/checkout par les hooks CGC
# (`.git/hooks/post-commit|post-checkout`). Ce cron n'est qu'un filet de sécurité
# (dérive hors commit, éditions externes) + un contrôle de version des outils.

set -eu

REPO_ROOT="/Users/davidrochelet/Desktop/design_handoff_cantou"
LOG_DIR="$REPO_ROOT/.git/cgc-maintenance"
LOG_FILE="$LOG_DIR/maintenance.log"
CRON_TAG="# CANTOU_DEV_GRAPH_MAINTENANCE"
SELF="$REPO_ROOT/scripts/dev-graph-maintenance.sh"

log() { mkdir -p "$LOG_DIR"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

run_maintenance() {
  log "── Maintenance graphe de code ──"
  if command -v cgc >/dev/null 2>&1; then
    log "cgc $(cgc --version 2>/dev/null | tail -1)"
    log "Re-indexation incrémentale (cgc update)…"
    cgc update "$REPO_ROOT" --quiet 2>>"$LOG_FILE" || log "⚠️ cgc update a échoué"
    cgc stats 2>/dev/null | grep -E "Files|Functions|Modules|Classes" | while IFS= read -r line; do log "  $line"; done
  else
    log "⚠️ cgc introuvable sur le PATH — graphe non re-indexé"
  fi
  if command -v epiq >/dev/null 2>&1; then log "epiq: $(epiq --version 2>/dev/null | head -1 || echo 'ok')"; fi
  log "Maintenance terminée."
}

install_cron() {
  hours="${1:-6}"
  crontab -l 2>/dev/null | grep -v "$CRON_TAG" > /tmp/cantou_cron.$$ || true
  echo "0 */$hours * * * /bin/sh $SELF >/dev/null 2>&1 $CRON_TAG" >> /tmp/cantou_cron.$$
  crontab /tmp/cantou_cron.$$
  rm -f /tmp/cantou_cron.$$
  log "Cron installé : re-indexation toutes les ${hours}h."
  crontab -l 2>/dev/null | grep "$CRON_TAG" || true
}

uninstall_cron() {
  if crontab -l 2>/dev/null | grep -q "$CRON_TAG"; then
    crontab -l 2>/dev/null | grep -v "$CRON_TAG" | crontab -
    log "Cron désinstallé."
  else
    log "Aucun cron Cantou installé."
  fi
}

status() {
  echo "=== Cron actif ? ==="; crontab -l 2>/dev/null | grep "$CRON_TAG" || echo "non installé"
  echo "=== Dernières lignes de log ==="; [ -f "$LOG_FILE" ] && tail -12 "$LOG_FILE" || echo "aucun log"
}

case "${1:-run}" in
  --install-cron)   install_cron "${2:-6}" ;;
  --uninstall-cron) uninstall_cron ;;
  --status)         status ;;
  run|"")           run_maintenance ;;
  *) echo "Usage: $0 [--install-cron [heures] | --uninstall-cron | --status]"; exit 1 ;;
esac
