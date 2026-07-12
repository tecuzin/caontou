# ADR-009 — Keystore de signature : sideload familial vs Play Store

**Date** : 2026-07-12
**Statut** : Accepté (procédure Play Store en attente de décision de publication)

## Contexte

L'APK release de Gradle est *non signé*. L'entrypoint de build le signe avec
**`cantou.keystore` committé à la racine** (alias `cantou`, mdp `cantou123`) puis
`zipalign` + `apksigner` → APK installable en sideload.

Trivy/SonarQube ne relèvent pas ce keystore comme secret (c'est un fichier de
clé, pas un token), mais **committer une clé de signature avec son mot de passe
est une mauvaise pratique** pour toute distribution publique : quiconque a le
dépôt peut signer un APK usurpant l'identité de l'app.

## Décision

**Deux canaux de signature distincts**, jamais confondus :

1. **Sideload familial (actuel)** — `cantou.keystore` committé. Assumé : le dépôt
   est privé, la distribution est un partage Telegram familial, l'enjeu est la
   **continuité des mises à jour** (une clé stable évite qu'Android refuse la MAJ
   et force une désinstallation = perte du `localStorage`). ⚠️ **Ne jamais
   régénérer ni changer cette clé** tant que ce canal existe.

2. **Play Store (futur, si publication décidée)** — un **vrai keystore hors-repo** :
   - généré une fois, stocké **hors du dépôt** (gestionnaire de secrets / CI) ;
   - injecté au build via variables d'environnement
     (`CANTOU_KEYSTORE_PATH`, `CANTOU_KEYSTORE_PASS`, `CANTOU_KEY_ALIAS`) —
     l'entrypoint doit lire ces variables et retomber sur `cantou.keystore` si
     absentes (rétrocompat sideload) ;
   - **jamais committé** (le `.gitignore` couvre déjà `*.keystore` hors la clé de
     sideload explicitement suivie) ;
   - envisager **Play App Signing** (Google détient la clé de signature d'app,
     on ne gère qu'une clé d'upload) pour réduire le risque de perte de clé.

## Conséquences

- **Aujourd'hui** : rien ne change — la clé de sideload reste committée et stable.
  Le finding « keystore à sortir du repo » est **documenté et accepté** pour ce
  canal ; il ne devient bloquant qu'à la décision de publier.
- **Le jour d'une publication** : suivre la procédure canal 2 ci-dessus, sans
  jamais toucher à la clé de sideload existante (les deux canaux coexistent, ou
  le sideload est retiré proprement avec préavis aux utilisateurs).

## Alternatives considérées

| Alternative | Raison du rejet (pour l'instant) |
|---|---|
| Sortir tout de suite la clé de sideload du repo | Casse la reproductibilité du build familial sans bénéfice (pas de publication prévue) ; risque d'erreur de clé = MAJ refusées |
| Chiffrer le keystore dans le repo (git-crypt) | Surcouche pour un dépôt privé à faible enjeu ; reporté au chantier Play Store |
