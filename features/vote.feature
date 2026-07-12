# language: fr
Fonctionnalité: Vote familial « on fait quoi demain ? »
  Afin d'impliquer toute la famille dans les décisions
  Nous votons pour la sortie du lendemain

  Scénario: Le vote nécessite au moins un votant
    Étant donné que j'ouvre l'application
    Quand j'ouvre le vote familial
    Alors le bouton démarrer le vote est bloqué

  Scénario: Deux votants peuvent démarrer le vote
    Étant donné que j'ouvre l'application
    Quand j'ouvre le vote familial
    Et j'ajoute les votants "Papa" et "Maman"
    Alors le bouton démarrer le vote est actif
