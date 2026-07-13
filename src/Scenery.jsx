// Illustrations « montagne & vacances » — SVG inline, zéro image externe
// (l'app est 100 % hors-ligne). Palette alignée sur le design : verts
// #4a5d3a/#5b7042, ocre #cf7d3c, soleil #f5c842, crème #f4ecdc.

// Crête de montagnes en silhouette claire, à poser en bas des cartes
// vert foncé (accueil, trajet, météo). Position absolue : le parent doit
// être en position:relative + overflow:hidden.
export const Ridge = ({ opacity = 0.12 }) => (
  <svg
    viewBox="0 0 402 88"
    preserveAspectRatio="xMidYMax slice"
    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 88, display: 'block', pointerEvents: 'none' }}
  >
    <path d="M0,88 L0,62 L48,30 L86,54 L134,14 L178,48 L216,34 L268,66 L306,22 L352,52 L402,36 L402,88 Z" fill="#fffaf0" opacity={opacity} />
    <path d="M0,88 L0,74 L60,48 L110,68 L166,38 L224,64 L280,44 L330,70 L402,52 L402,88 Z" fill="#fffaf0" opacity={opacity * 0.7} />
    {/* neige sur les deux sommets principaux */}
    <path d="M134,14 L125,23 L143,23 Z" fill="#fffaf0" opacity={opacity * 2.2} />
    <path d="M306,22 L298,30 L314,30 Z" fill="#fffaf0" opacity={opacity * 2.2} />
  </svg>
)

// Panorama complet : ciel, soleil, nuages, deux plans de montagnes
// enneigées, prairie et sapins. Bandeau décoratif de l'accueil.
export const Panorama = ({ height = 118 }) => (
  <svg
    viewBox="0 0 402 118"
    preserveAspectRatio="xMidYMax slice"
    style={{ width: '100%', height, display: 'block' }}
  >
    <defs>
      <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7ea8cd" />
        <stop offset="100%" stopColor="#cfe0ec" />
      </linearGradient>
      <linearGradient id="sc-meadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7a9e5a" />
        <stop offset="100%" stopColor="#5b7042" />
      </linearGradient>
    </defs>
    <rect width="402" height="118" fill="url(#sc-sky)" />
    {/* soleil + halo */}
    <circle cx="332" cy="26" r="20" fill="#f5c842" opacity="0.35" />
    <circle cx="332" cy="26" r="13" fill="#f5c842" />
    {/* nuages */}
    <g fill="#ffffff" opacity="0.75">
      <ellipse cx="70" cy="24" rx="26" ry="9" />
      <ellipse cx="92" cy="19" rx="18" ry="7" />
      <ellipse cx="205" cy="15" rx="20" ry="7" opacity="0.6" />
    </g>
    {/* montagnes arrière */}
    <path d="M-10,118 L60,38 L118,86 L172,26 L236,84 L288,44 L348,90 L402,58 L402,118 Z" fill="#5b7042" />
    <path d="M172,26 L160,40 L184,40 Z" fill="#ffffff" opacity="0.92" />
    <path d="M288,44 L278,56 L298,56 Z" fill="#ffffff" opacity="0.88" />
    {/* montagnes avant */}
    <path d="M-10,118 L52,66 L120,112 L196,52 L268,110 L332,72 L402,112 L402,118 Z" fill="#3d5030" />
    <path d="M196,52 L185,64 L207,64 Z" fill="#ffffff" opacity="0.85" />
    {/* prairie */}
    <path d="M0,106 Q100,96 201,103 T402,102 L402,118 L0,118 Z" fill="url(#sc-meadow)" />
    {/* sapins */}
    <g fill="#2d5020">
      <path d="M58,108 L64,92 L70,108 Z" />
      <path d="M60,100 L64,88 L68,100 Z" />
      <path d="M330,106 L336,90 L342,106 Z" />
      <path d="M332,98 L336,86 L340,98 Z" />
    </g>
  </svg>
)

// Scène du gîte pour l'écran hébergement : maison au premier plan,
// montagnes derrière, prairie, sapins. Remplace le placeholder « photo ».
export const GiteScene = ({ height = 150 }) => (
  <svg
    viewBox="0 0 366 150"
    preserveAspectRatio="xMidYMax slice"
    style={{ width: '100%', height, display: 'block' }}
  >
    <defs>
      <linearGradient id="gs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7ea8cd" />
        <stop offset="100%" stopColor="#cfe0ec" />
      </linearGradient>
      <linearGradient id="gs-meadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7a9e5a" />
        <stop offset="100%" stopColor="#567a3e" />
      </linearGradient>
    </defs>
    <rect width="366" height="150" fill="url(#gs-sky)" />
    <circle cx="306" cy="30" r="22" fill="#f5c842" opacity="0.3" />
    <circle cx="306" cy="30" r="14" fill="#f5c842" />
    <g fill="#ffffff" opacity="0.75">
      <ellipse cx="66" cy="28" rx="24" ry="8" />
      <ellipse cx="86" cy="23" rx="16" ry="6" />
    </g>
    {/* montagnes */}
    <path d="M-8,150 L70,42 L140,116 L212,34 L286,112 L340,66 L366,92 L366,150 Z" fill="#5b7042" />
    <path d="M212,34 L200,49 L224,49 Z" fill="#ffffff" opacity="0.92" />
    <path d="M70,42 L61,54 L79,54 Z" fill="#ffffff" opacity="0.85" />
    {/* prairie */}
    <path d="M0,122 Q90,112 183,119 T366,118 L366,150 L0,150 Z" fill="url(#gs-meadow)" />
    {/* gîte */}
    <g>
      <rect x="142" y="92" width="82" height="46" rx="3" fill="#d4a96a" />
      <path d="M134,92 L183,58 L232,92 Z" fill="#8b3a2a" />
      <rect x="203" y="62" width="11" height="20" fill="#9c7055" />
      <rect x="151" y="100" width="17" height="14" rx="2" fill="#cfe0ec" />
      <rect x="198" y="100" width="17" height="14" rx="2" fill="#cfe0ec" />
      <rect x="174" y="112" width="19" height="26" rx="2" fill="#7a5030" />
    </g>
    {/* sapins */}
    <g fill="#2d5020">
      <path d="M96,136 L106,108 L116,136 Z" />
      <path d="M99,122 L106,102 L113,122 Z" />
      <path d="M256,134 L265,108 L274,134 Z" />
      <path d="M259,120 L265,102 L271,120 Z" />
    </g>
  </svg>
)
