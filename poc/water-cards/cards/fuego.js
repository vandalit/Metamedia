// Fuego — Fire card data

const FLAME_SVG = `<svg viewBox="0 0 280 165" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:10px 14px">
  <defs>
    <radialGradient id="fcore" cx="50%" cy="80%" r="40%">
      <stop offset="0%" stop-color="rgba(255,255,220,.22)"/>
      <stop offset="60%" stop-color="rgba(255,140,0,.10)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="fcool" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="rgba(255,100,0,.18)"/>
      <stop offset="100%" stop-color="rgba(255,50,0,.04)"/>
    </linearGradient>
  </defs>
  <!-- outer flame shape -->
  <path d="M140,155 C80,155 42,120 40,80 C38,55 55,35 65,20 C70,12 68,5 68,5 C80,18 78,30 82,38 C90,28 95,10 100,2 C106,20 104,40 110,52 C118,38 120,22 125,10 C132,30 130,55 140,60 C150,55 148,30 155,10 C160,22 162,38 170,52 C176,40 174,20 180,2 C185,10 187,28 195,38 C199,30 197,18 209,5 C209,5 207,12 212,20 C222,35 239,55 237,80 C235,120 200,155 140,155Z" fill="url(#fcool)" opacity=".7"/>
  <!-- inner hot zone -->
  <path d="M140,150 C95,150 68,122 68,92 C68,72 80,58 86,44 C90,36 88,26 90,20 C98,32 96,48 102,56 C108,44 110,28 114,16 C120,34 118,56 126,66 C132,56 132,38 136,24 C142,40 140,62 140,66 C140,62 138,40 144,24 C148,38 148,56 154,66 C162,56 160,34 166,16 C170,28 172,44 178,56 C184,48 182,32 190,20 C192,26 190,36 194,44 C200,58 212,72 212,92 C212,122 185,150 140,150Z" fill="url(#fcore)"/>
  <!-- zone labels -->
  <line x1="60" y1="95" x2="95" y2="95" stroke="rgba(255,200,80,.30)" stroke-width=".8" stroke-dasharray="3,2"/>
  <text x="14" y="98" font-size="7.5" fill="rgba(255,200,80,.62)" font-family="Space Grotesk,sans-serif">~1 200°C</text>
  <line x1="60" y1="65" x2="90" y2="65" stroke="rgba(255,140,40,.30)" stroke-width=".8" stroke-dasharray="3,2"/>
  <text x="14" y="68" font-size="7.5" fill="rgba(255,140,40,.62)" font-family="Space Grotesk,sans-serif">~1 500°C</text>
  <line x1="60" y1="35" x2="82" y2="35" stroke="rgba(200,220,255,.25)" stroke-width=".8" stroke-dasharray="3,2"/>
  <text x="14" y="38" font-size="7.5" fill="rgba(200,220,255,.50)" font-family="Space Grotesk,sans-serif">~800°C</text>
  <!-- convection arrows -->
  <path d="M232,130 C245,110 248,90 242,65" stroke="rgba(255,120,30,.28)" stroke-width="1.2" fill="none" marker-end="url(#arw)"/>
  <path d="M232,130 C246,108 250,82 245,55" stroke="rgba(255,120,30,.18)" stroke-width=".8" fill="none"/>
  <text x="238" y="145" font-size="7" fill="rgba(255,150,50,.50)" font-family="Space Grotesk,sans-serif">convección</text>
  <!-- base -->
  <line x1="80" y1="155" x2="200" y2="155" stroke="rgba(255,80,0,.30)" stroke-width="1.5" stroke-linecap="round"/>
  <text x="110" y="162" font-size="8" fill="rgba(255,100,30,.45)" font-family="Space Grotesk,sans-serif">zona de combustión</text>
</svg>`;

const TETRAHEDRON_SVG = `<svg viewBox="0 0 280 175" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:12px 16px">
  <!-- tetrahedron wireframe projection -->
  <polygon points="140,18 42,145 238,145" stroke="rgba(255,120,30,.55)" stroke-width="1.4" fill="rgba(255,80,0,.04)"/>
  <line x1="140" y1="18" x2="140" y2="145" stroke="rgba(255,120,30,.30)" stroke-width="1" stroke-dasharray="5,3"/>
  <line x1="42" y1="145" x2="200" y2="82" stroke="rgba(255,120,30,.22)" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="238" y1="145" x2="80" y2="82" stroke="rgba(255,120,30,.22)" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="80" y1="82" x2="200" y2="82" stroke="rgba(255,120,30,.22)" stroke-width="1" stroke-dasharray="4,3"/>
  <!-- vertices -->
  <circle cx="140" cy="18"  r="5" fill="#f97316"/>
  <circle cx="42"  cy="145" r="5" fill="#fbbf24"/>
  <circle cx="238" cy="145" r="5" fill="#60a5fa"/>
  <circle cx="140" cy="145" r="5" fill="#f472b6"/>
  <!-- labels -->
  <text x="130" y="10" font-size="8" font-weight="700" fill="#f97316" font-family="Space Grotesk,sans-serif">CALOR</text>
  <text x="4"   y="158" font-size="8" font-weight="700" fill="#fbbf24" font-family="Space Grotesk,sans-serif">COMBUSTIBLE</text>
  <text x="210" y="158" font-size="8" font-weight="700" fill="#60a5fa" font-family="Space Grotesk,sans-serif">OXIDANTE</text>
  <text x="108" y="160" font-size="7.5" font-weight="700" fill="#f472b6" font-family="Space Grotesk,sans-serif">REACCIÓN</text>
  <text x="96"  y="169" font-size="6.5" fill="rgba(244,114,182,.55)" font-family="Space Grotesk,sans-serif">en cadena</text>
  <!-- center label -->
  <text x="140" y="93" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(255,140,50,.60)" font-family="Space Grotesk,sans-serif">FUEGO</text>
</svg>`;

export const FUEGO = {
  id: 'fuego',
  name: 'Fuego',
  label: 'Fire · Feuer · Feu',
  accent: '#f97316',
  accentLight: '#c2410c',
  panelIcon: 'flame',
  panelGradient: 'linear-gradient(150deg,#1a0500 0%,#5c1a00 55%,#8b2500 100%)',

  banner: {
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=80',
    formula: '🔥',
    formulaName: 'Fire · Feuer · Feu · Fuoco',
    tag: 'Oxidación rápida exotérmica · plasma luminoso',
    pills: ['Fenómeno fisicoquímico', 'Estado plasmático parcial'],
    overlaySvg: `<svg viewBox="0 0 76 76" fill="none">
      <path d="M38,68 C18,68 10,50 12,34 C14,22 22,14 24,8 C26,14 24,22 28,28 C32,20 34,10 38,4 C40,14 38,26 38,26 C38,26 36,14 40,4 C44,10 46,20 50,28 C54,22 52,14 54,8 C56,14 64,22 66,34 C68,50 60,68 38,68Z" fill="rgba(249,115,22,.18)" stroke="rgba(249,115,22,.55)" stroke-width=".8"/>
      <path d="M38,62 C24,62 18,50 20,38 C22,28 28,22 30,16 C32,22 30,30 34,36 C36,30 38,20 38,14 C38,20 40,30 42,36 C46,30 44,22 46,16 C48,22 54,28 56,38 C58,50 52,62 38,62Z" fill="rgba(251,191,36,.14)" stroke="rgba(251,191,36,.45)" stroke-width=".7"/>
      <circle cx="38" cy="44" r="8" fill="rgba(255,255,200,.08)" stroke="rgba(255,240,100,.35)" stroke-width=".6"/>
      <text x="38" y="48" text-anchor="middle" font-size="8" font-weight="700" fill="rgba(255,220,80,.80)" font-family="Inter,sans-serif">CO₂</text>
    </svg>`,
    dark: {
      filter: 'saturate(1.3) brightness(.82)',
      blend: 'rgba(180,40,0,.35)',
      grad: 'linear-gradient(175deg,rgba(60,10,0,.15) 0%,rgba(20,5,0,.72) 58%,rgba(8,2,0,.97) 100%)',
      frost: 'linear-gradient(135deg,rgba(255,140,50,.14) 0%,rgba(200,60,0,.06) 60%,rgba(255,100,0,.03) 100%)',
      frostBd: 'rgba(255,120,30,.14)',
      cbGrad: 'linear-gradient(180deg,rgba(20,5,0,.97) 0%,rgba(10,2,0,.99) 100%)',
    },
    light: {
      filter: 'saturate(.85) brightness(1.10)',
      blend: 'rgba(180,80,0,.18)',
      grad: 'linear-gradient(175deg,rgba(160,60,10,.12) 0%,rgba(30,10,2,.58) 56%,rgba(12,4,1,.93) 100%)',
      frost: 'linear-gradient(135deg,rgba(255,200,120,.22) 0%,rgba(220,140,60,.08) 60%,rgba(255,180,80,.04) 100%)',
      frostBd: 'rgba(200,120,40,.16)',
      cbGrad: 'linear-gradient(180deg,rgba(252,248,242,.97) 0%,rgba(248,242,234,.99) 100%)',
    }
  },

  bentos: [
    { section: 'Química' },
    { id: 'oxidacion',   icon: 'beaker',          label: 'Oxidación',   color: '#f97316' },
    { id: 'plasma',      icon: 'sparkles',        label: 'Plasma',      color: '#a78bfa' },
    { id: 'temperatura', icon: 'thermometer',     label: 'Temperatura', color: '#fbbf24' },
    { section: 'Física' },
    { id: 'conveccion',  icon: 'wind',            label: 'Convección',  color: '#60a5fa' },
    { id: 'radiacion',   icon: 'sun',             label: 'Radiación',   color: '#fb923c' },
    { id: 'combustibles',icon: 'fuel',            label: 'Combustibles',color: '#4ade80' },
    { section: 'Extinción' },
    { id: 'tetraedro', icon: 'triangle-alert', label: 'Tetraedro del Fuego', wide: true, sublabel: 'Combustible · oxidante · calor · cadena', color: '#f87171' },
    { section: 'Historia' },
    { id: 'arqueologia', icon: 'landmark',        label: 'Arqueología', color: '#c084fc' },
    { id: 'mitologia',   icon: 'book-open',       label: 'Mitología',   color: '#e879f9' },
    { id: 'civilizacion',icon: 'building-2',      label: 'Civilización',color: '#34d399' },
    { section: 'Curiosidades' },
    { id: 'microgravedad', icon: 'orbit', label: 'Fuego en el espacio', wide: true, sublabel: 'ISS · esfera azul · llama silenciosa', color: '#38bdf8' },
    { id: 'azul',        icon: 'eye',             label: 'Fuego azul',  color: '#818cf8' },
    { id: 'artificiales',icon: 'star',            label: 'Artificiales',color: '#f472b6' },
  ],

  modals: {

    oxidacion:{tag:'Química · Combustión',title:'Reacción de Oxidación',tabs:[
      {id:'reaccion',label:'Reacción',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Ecuación general</div><div class="ms-v" style="font-size:10px">CₓHᵧ + O₂ → CO₂ + H₂O + calor</div></div>
          <div class="mstat"><div class="ms-l">Metano (completa)</div><div class="ms-v" style="font-size:10px">CH₄ + 2O₂ → CO₂ + 2H₂O</div></div>
          <div class="mstat"><div class="ms-l">ΔH combustión CH₄</div><div class="ms-v">−890 <span class="ms-u">kJ/mol</span></div></div>
          <div class="mstat"><div class="ms-l">Temperatura llama</div><div class="ms-v">~1 950 <span class="ms-u">°C (CH₄+O₂)</span></div></div>
        </div>
        <p class="mdesc">La combustión es una reacción en cadena radicalaria. La energía de activación rompe enlaces, liberando radicales (OH·, H·, O·) que propagan la reacción a velocidades exponenciales. La llama es la zona de reacción visible donde se libera la mayor parte de la energía.</p>`},
      {id:'cadena',label:'Cadena radical',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">1. Iniciación</div><div><div class="tl-t">Ruptura de enlace</div><div class="tl-d">La energía de activación rompe moléculas de combustible: RH → R· + H·</div></div></div>
          <div class="tl-item"><div class="tl-yr">2. Propagación</div><div><div class="tl-t">Multiplicación de radicales</div><div class="tl-d">H· + O₂ → OH· + O· ; O· + H₂ → OH· + H· — cada radical genera dos nuevos.</div></div></div>
          <div class="tl-item"><div class="tl-yr">3. Ramificación</div><div><div class="tl-t">Explosión de radicales</div><div class="tl-d">OH· + CO → CO₂ + H· libera calor y nuevos radicales — autocatalítico.</div></div></div>
          <div class="tl-item"><div class="tl-yr">4. Terminación</div><div><div class="tl-t">Quenching de radicales</div><div class="tl-d">Dos radicales se recombinan: H· + OH· → H₂O. La llama se extingue si no hay suficiente combustible u oxidante.</div></div></div>
        </div>`},
      {id:'energia',label:'Calor liberado',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Hidrógeno H₂</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#f97316"></div></div><span class="cbar-val">142 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Metano CH₄</span><div class="cbar-track"><div class="cbar-fill" style="width:39%;background:#fb923c"></div></div><span class="cbar-val">55 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Gasolina</span><div class="cbar-track"><div class="cbar-fill" style="width:31%;background:#fbbf24"></div></div><span class="cbar-val">44 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Diesel</span><div class="cbar-track"><div class="cbar-fill" style="width:30%;background:#a3e635"></div></div><span class="cbar-val">42 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Carbón bituminoso</span><div class="cbar-track"><div class="cbar-fill" style="width:20%;background:#94a3b8"></div></div><span class="cbar-val">29 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Madera seca</span><div class="cbar-track"><div class="cbar-fill" style="width:13%;background:#86efac"></div></div><span class="cbar-val">19 MJ/kg</span></div>
        </div>`}
    ]},

    plasma:{tag:'Física · Estado de la materia',title:'Plasma y Llama',tabs:[
      {id:'plasma',label:'Plasma',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">4.° estado materia</div><div class="ms-v">Gas <span class="ms-u">ionizado</span></div></div>
          <div class="mstat"><div class="ms-l">Ionización en llama</div><div class="ms-v">~10⁹–10¹² <span class="ms-u">iones/cm³</span></div></div>
          <div class="mstat"><div class="ms-l">99% del universo</div><div class="ms-v">Es <span class="ms-u">plasma</span></div></div>
          <div class="mstat"><div class="ms-l">Sol (centro)</div><div class="ms-v">15 × 10⁶ <span class="ms-u">°C plasma</span></div></div>
        </div>
        <p class="mdesc">La llama es un plasma "frío" y parcial — solo una fracción de las moléculas están ionizadas. Los electrones libres le permiten conducir electricidad (verificable colocando electrodos a cada lado de una vela). Las estrellas, rayos y pantallas de plasma son manifestaciones del cuarto estado.</p>`},
      {id:'luz',label:'Luz emitida',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Mecanismo</div><div class="ms-v">Cuerpo negro <span class="ms-u">+ emisión atómica</span></div></div>
          <div class="mstat"><div class="ms-l">C₂ (dímero carbono)</div><div class="ms-v">Verde-azul <span class="ms-u">Swan bands</span></div></div>
          <div class="mstat"><div class="ms-l">CH radical</div><div class="ms-v">Azul-violeta <span class="ms-u">430 nm</span></div></div>
          <div class="mstat"><div class="ms-l">Na (sodio)</div><div class="ms-v">Amarillo <span class="ms-u">589 nm</span></div></div>
        </div>
        <p class="mdesc">La luz de la llama proviene de dos fuentes: (1) radiación de cuerpo negro de las partículas de hollín incandescentes (espectro continuo), y (2) emisión atómica y molecular de radicales excitados (espectro discreto). El color azul en la base es CH y C₂; el amarillo es Na contaminante. Una llama "perfecta" de gas puro sería casi invisible.</p>`}
    ]},

    temperatura:{tag:'Física · Pirometría',title:'Colores de la Llama',tabs:[
      {id:'colores',label:'Temperatura / Color',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Rojo oscuro</span><div class="cbar-track"><div class="cbar-fill" style="width:33%;background:#7f1d1d"></div></div><span class="cbar-val">~700 K</span></div>
          <div class="cbar"><span class="cbar-label">Rojo cereza</span><div class="cbar-track"><div class="cbar-fill" style="width:42%;background:#dc2626"></div></div><span class="cbar-val">~900 K</span></div>
          <div class="cbar"><span class="cbar-label">Naranja</span><div class="cbar-track"><div class="cbar-fill" style="width:53%;background:#ea580c"></div></div><span class="cbar-val">~1 100 K</span></div>
          <div class="cbar"><span class="cbar-label">Amarillo</span><div class="cbar-track"><div class="cbar-fill" style="width:62%;background:#ca8a04"></div></div><span class="cbar-val">~1 300 K</span></div>
          <div class="cbar"><span class="cbar-label">Blanco</span><div class="cbar-track"><div class="cbar-fill" style="width:76%;background:rgba(255,255,255,.45)"></div></div><span class="cbar-val">~1 600 K</span></div>
          <div class="cbar"><span class="cbar-label">Azul brillante</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#3b82f6"></div></div><span class="cbar-val">&gt;2 000 K</span></div>
        </div>
        <p class="mdesc">La ley de Stefan-Boltzmann establece que la potencia irradiada es proporcional a T⁴. La ley de Wien: la longitud de onda del pico de emisión se desplaza hacia el azul a mayor temperatura. La llama azul de un quemador de gas indica combustión más completa y más caliente que la llama naranja de una vela.</p>`},
      {id:'metalurgia',label:'Aplicaciones',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Forja (900°C)</div><div><div class="tl-t">Rojo naranja</div><div class="tl-d">El acero se trabaja a 900–1150°C. El herrero juzga la temperatura por el color del metal al rojo.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Soldadura (3 500°C)</div><div><div class="tl-t">Llama acetileno-O₂</div><div class="tl-d">La llama oxiacetilénica alcanza 3500°C — suficiente para fundir acero. La llama carburante (exceso C₂H₂) forma depósitos de carbono; la oxidante, escoria de óxido de hierro.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Cohetes (3 600°C)</div><div><div class="tl-t">Llama de escape</div><div class="tl-d">Los motores de cohete H₂/O₂ producen llamas invisibles (solo vapor de agua). Los motores de queroseno emiten penachos naranja por partículas de hollín.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Pirometría</div><div><div class="tl-t">Medición no invasiva</div><div class="tl-d">Los pirómetros de radiación miden temperatura a distancia analizando el espectro emitido — crítico en hornos industriales de 1600°C+.</div></div></div>
        </div>`}
    ]},

    conveccion:{tag:'Física · Dinámica de fluidos',title:'Convección y Forma de la Llama',tabs:[
      {id:'forma',label:'Forma de la llama',html:`
        <div class="il-wrap">${FLAME_SVG}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Forma en gravedad</div><div class="ms-v">Gota <span class="ms-u">alargada</span></div></div>
          <div class="mstat"><div class="ms-l">Causa</div><div class="ms-v">Convección <span class="ms-u">natural</span></div></div>
          <div class="mstat"><div class="ms-l">Temp. base (azul)</div><div class="ms-v">~1 800°C</div></div>
          <div class="mstat"><div class="ms-l">Temp. punta (roja)</div><div class="ms-v">~700°C</div></div>
        </div>
        <p class="mdesc">En gravedad normal, el aire caliente asciende (es menos denso) y arrastra la llama hacia arriba en forma de gota. Los gases fríos entran desde la base, oxidando el combustible continuamente. En microgravedad, sin convección, la llama es una esfera perfecta — y es azul, más pequeña y fría.</p>`},
      {id:'turbulenta',label:'Llama turbulenta',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Nro. Reynolds crítico</div><div class="ms-v">&gt;2 000</div></div>
          <div class="mstat"><div class="ms-l">Llama laminar</div><div class="ms-v">Suave <span class="ms-u">predecible</span></div></div>
          <div class="mstat"><div class="ms-l">Llama turbulenta</div><div class="ms-v">Fluctuante <span class="ms-u">eficiente</span></div></div>
          <div class="mstat"><div class="ms-l">Eficiencia</div><div class="ms-v">Turbulenta <span class="ms-u">mayor mezclado</span></div></div>
        </div>
        <p class="mdesc">Las llamas laminares (vela) son estables y predecibles pero poco eficientes. Las turbulentas (quemadores industriales) mezclan combustible y oxidante rápidamente, aumentando la tasa de reacción. Los motores a reacción operan con llamas turbulentas diseñadas meticulosamente para maximizar eficiencia y minimizar emisiones.</p>`}
    ]},

    radiacion:{tag:'Física · Transferencia de calor',title:'Radiación Térmica del Fuego',tabs:[
      {id:'modos',label:'Tres modos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Conducción</div><div class="ms-v">Contacto <span class="ms-u">directo</span></div></div>
          <div class="mstat"><div class="ms-l">Convección</div><div class="ms-v">Fluido <span class="ms-u">en movimiento</span></div></div>
          <div class="mstat"><div class="ms-l">Radiación</div><div class="ms-v">Ondas <span class="ms-u">electromagnéticas</span></div></div>
          <div class="mstat"><div class="ms-l">En incendios grandes</div><div class="ms-v">Radiación <span class="ms-u">&gt;50% del calor</span></div></div>
        </div>
        <p class="mdesc">La radiación no necesita medio material — es la razón por la que el Sol nos calienta. En incendios forestales de gran escala, la radiación puede precalentar vegetación a cientos de metros de distancia antes de que las llamas lleguen, acelerando la propagación dramáticamente.</p>`},
      {id:'ir',label:'Infrarrojo',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Espectro emitido</div><div class="ms-v">0.7–100 <span class="ms-u">μm (IR)</span></div></div>
          <div class="mstat"><div class="ms-l">Sensación de calor</div><div class="ms-v">IR medio <span class="ms-u">3–8 μm</span></div></div>
          <div class="mstat"><div class="ms-l">Cámaras termográficas</div><div class="ms-v">8–14 <span class="ms-u">μm</span></div></div>
          <div class="mstat"><div class="ms-l">Misiles de calor</div><div class="ms-v">Guiados por <span class="ms-u">IR exhaust</span></div></div>
        </div>
        <p class="mdesc">La radiación infrarroja del fuego es la que sentimos como calor. Las cámaras termográficas permiten ver la temperatura sin contacto — usadas en bomberos, diagnóstico eléctrico y fotografía nocturna de fauna. Los satélites de detección de incendios detectan el IR emitido por focos activos en tiempo real.</p>`}
    ]},

    combustibles:{tag:'Energía · Comparativa',title:'Combustibles',tabs:[
      {id:'calorico',label:'Poder calorífico',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Hidrógeno H₂</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#38bdf8"></div></div><span class="cbar-val">142 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Gas natural</span><div class="cbar-track"><div class="cbar-fill" style="width:39%;background:#f97316"></div></div><span class="cbar-val">55 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Propano</span><div class="cbar-track"><div class="cbar-fill" style="width:35%;background:#fb923c"></div></div><span class="cbar-val">50 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Gasolina</span><div class="cbar-track"><div class="cbar-fill" style="width:31%;background:#fbbf24"></div></div><span class="cbar-val">44 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Diesel</span><div class="cbar-track"><div class="cbar-fill" style="width:30%;background:#a3e635"></div></div><span class="cbar-val">42 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Carbón bituminoso</span><div class="cbar-track"><div class="cbar-fill" style="width:20%;background:#94a3b8"></div></div><span class="cbar-val">29 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Madera seca</span><div class="cbar-track"><div class="cbar-fill" style="width:13%;background:#86efac"></div></div><span class="cbar-val">19 MJ/kg</span></div>
        </div>`},
      {id:'estados',label:'Estados de la materia',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Gases (metano, H₂)</div><div class="ms-v">Arden <span class="ms-u">directamente</span></div></div>
          <div class="mstat"><div class="ms-l">Líquidos (gasolina)</div><div class="ms-v">Arden <span class="ms-u">por vaporización</span></div></div>
          <div class="mstat"><div class="ms-l">Sólidos (madera)</div><div class="ms-v">Arden <span class="ms-u">por pirólisis</span></div></div>
          <div class="mstat"><div class="ms-l">Pirólisis</div><div class="ms-v">200–300 <span class="ms-u">°C descomposición</span></div></div>
        </div>
        <p class="mdesc">Los sólidos no arden directamente: primero se pirolisan (descomponen por calor en gases combustibles). La madera libera celulosa y lignina degradadas como gases (CO, CH₄, H₂, hidrocarburos) que luego se queman. La brasa es carbono que arde sin llama. La pirólisis a alta temperatura y sin oxígeno produce carbón vegetal.</p>`}
    ]},

    tetraedro:{tag:'Ciencia · Extinción',title:'Tetraedro del Fuego',tabs:[
      {id:'diagrama',label:'Tetraedro',html:`
        <div class="il-wrap">${TETRAHEDRON_SVG}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Lado 1</div><div class="ms-v">Combustible <span class="ms-u">CH, C, etc.</span></div></div>
          <div class="mstat"><div class="ms-l">Lado 2</div><div class="ms-v">Oxidante <span class="ms-u">O₂ ≥16%</span></div></div>
          <div class="mstat"><div class="ms-l">Lado 3</div><div class="ms-v">Calor <span class="ms-u">T &gt; T ignición</span></div></div>
          <div class="mstat"><div class="ms-l">Lado 4</div><div class="ms-v">Cadena radical <span class="ms-u">autoalimentada</span></div></div>
        </div>
        <p class="mdesc">El triángulo del fuego (combustible + oxidante + calor) fue actualizado al tetraedro cuando se entendió la reacción en cadena radicalaria. Eliminar cualquiera de los cuatro lados extingue el fuego. Los agentes halogenados (Halon) actúan sobre la cadena radical — extremadamente eficaces pero destructores del ozono.</p>`},
      {id:'extincion',label:'Métodos de extinción',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Agua</div><div><div class="tl-t">Enfriamiento + sofocación</div><div class="tl-d">Absorbe calor (2260 kJ/kg de vaporización) y el vapor desplaza O₂. Ineficaz en fuegos de grasa o eléctricos.</div></div></div>
          <div class="tl-item"><div class="tl-yr">CO₂</div><div><div class="tl-t">Sofocación</div><div class="tl-d">Desplaza O₂ por debajo del 16% crítico. Ideal para equipos eléctricos. Peligroso en espacios cerrados.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Polvo ABC</div><div><div class="tl-t">Inhibición + sofocación</div><div class="tl-d">NH₄H₂PO₄ libera NH₃ y HPO₃ que inhiben radicales. Universal para fuegos A, B y C.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Espuma</div><div><div class="tl-t">Sofocación + separación</div><div class="tl-d">Cubre la superficie del combustible líquido, evitando la vaporización. Crítico en incendios de aviación y refinerías.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Halon</div><div><div class="tl-t">Ruptura de cadena radical</div><div class="tl-d">Agentes halogenados (Br, F) capturan radicales OH· y H· con enorme eficiencia. Prohibidos por el Protocolo de Montreal (1987).</div></div></div>
        </div>`}
    ]},

    arqueologia:{tag:'Historia · Paleontología del fuego',title:'Fuego Prehistórico',tabs:[
      {id:'origenes',label:'Orígenes',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">~1.5 Ma</div><div><div class="tl-t">Primeras evidencias (debate)</div><div class="tl-d">Huesos quemados en Swartkrans (Sudáfrica). Posiblemente fuego natural controlado por Homo erectus.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~1 Ma</div><div><div class="tl-t">Wonderwerk Cave</div><div class="tl-d">Evidencia más sólida de uso de fuego: cenizas y huesos quemados en una cueva sudafricana. Homo erectus.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~400 ka</div><div><div class="tl-t">Qesem Cave, Israel</div><div class="tl-d">Hogares repetidamente usados en el mismo lugar. Evidencia de producción activa (no solo uso) de fuego.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~125 ka</div><div><div class="tl-t">Homo sapiens</div><div class="tl-d">Fuego dominado plenamente. Uso para cocinar, ceramica, calefacción, defensa y comunicación (señales de humo).</div></div></div>
        </div>`},
      {id:'produccion',label:'Producción de fuego',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Percusión (sílex)</div><div class="ms-v">~800°C <span class="ms-u">en la chispa</span></div></div>
          <div class="mstat"><div class="ms-l">Fricción (arco)</div><div class="ms-v">Temperatura <span class="ms-u">ignición ~300°C</span></div></div>
          <div class="mstat"><div class="ms-l">Fósforos modernos</div><div class="ms-v">1827 <span class="ms-u">John Walker</span></div></div>
          <div class="mstat"><div class="ms-l">Encendedores Bic</div><div class="ms-v">1973 <span class="ms-u">piezoeléctrico</span></div></div>
        </div>
        <p class="mdesc">El dominio del fuego fue un punto de inflexión evolutivo. Cocinar liberó energía de los alimentos (Teoría de Wrangham): el intestino se redujo, el cerebro creció. Una dieta cocida aporta ~30% más calorías del mismo alimento que crudo. Sin fuego, Homo sapiens moderno probablemente no habría evolucionado.</p>`}
    ]},

    mitologia:{tag:'Cultura · Mitología del fuego',title:'El Fuego en los Mitos',tabs:[
      {id:'mitos',label:'Mitologías',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Grecia</div><div><div class="tl-t">Prometeo</div><div class="tl-d">Roba el fuego del Olimpo y lo da a la humanidad. Zeus lo condena a ser devorado eternamente por un águila. El fuego como dono divino y trasgresión.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Hindú</div><div><div class="tl-t">Agni</div><div class="tl-d">Dios del fuego en el Rig-Veda. Mensajero entre humanos y dioses. El fuego de los sacrificios transporta las ofrendas a los dioses.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Azteca</div><div><div class="tl-t">Huehueteotl</div><div class="tl-d">El dios del fuego más antiguo de Mesoamérica. El fuego nuevo al final de cada ciclo de 52 años (Fuego Nuevo) evitaba el fin del mundo.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Zoroastrismo</div><div><div class="tl-t">Fuego eterno</div><div class="tl-d">El fuego sagrado en los templos zoroastrianos arde sin interrupción — algunos llevan miles de años activos en Irán.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Olimpismo</div><div><div class="tl-t">Llama olímpica</div><div class="tl-d">Encendida con una lente solar en Olimpia (Grecia) y transportada en relevo. Tradición moderna creada en 1936 para los Juegos de Berlín.</div></div></div>
        </div>`}
    ]},

    civilizacion:{tag:'Historia · Fuego & Civilización',title:'El Fuego que nos hizo humanos',tabs:[
      {id:'cocina',label:'Cocina',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Reacción de Maillard</div><div class="ms-v">115–165 <span class="ms-u">°C</span></div></div>
          <div class="mstat"><div class="ms-l">Caramelización</div><div class="ms-v">&gt;160 <span class="ms-u">°C</span></div></div>
          <div class="mstat"><div class="ms-l">Kcal extra vs crudo</div><div class="ms-v">+30% <span class="ms-u">en promedio</span></div></div>
          <div class="mstat"><div class="ms-l">Bacterias eliminadas</div><div class="ms-v">70°C <span class="ms-u">por 2 minutos</span></div></div>
        </div>
        <p class="mdesc">La reacción de Maillard (aminoácidos + azúcares reductores → cientos de compuestos aromáticos) es responsable del dorado de la carne, el pan y el café tostado. La cocción no solo añade sabor: reduce patógenos, destruye antinutrientes y aumenta la biodisponibilidad de proteínas.</p>`},
      {id:'metalurgia',label:'Metalurgia',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">~7000 AC</div><div><div class="tl-t">Cobre nativo</div><div class="tl-d">Primeros objetos de cobre fundido. Temperatura de fusión: 1083°C — requería hornos controlados.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~3300 AC</div><div><div class="tl-t">Bronce (Cu+Sn)</div><div class="tl-d">Aleación más dura que el cobre. Fundición en moldes. Inicia la Edad del Bronce y la civilización compleja.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~1200 AC</div><div><div class="tl-t">Hierro</div><div class="tl-d">Requiere 1535°C y carbón vegetal para reducir el óxido de hierro. La forja del hierro nació en Anatolia (hititas).</div></div></div>
          <div class="tl-item"><div class="tl-yr">1856</div><div><div class="tl-t">Acero Bessemer</div><div class="tl-d">Henry Bessemer inyecta aire en hierro fundido para oxidar el carbono. Produce acero barato — fundamento de la industrialización.</div></div></div>
        </div>`}
    ]},

    microgravedad:{tag:'Ciencia · ISS · Combustión',title:'Fuego en Microgravedad',tabs:[
      {id:'iss',label:'Experimentos ISS',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Forma en 0g</div><div class="ms-v">Esfera <span class="ms-u">perfecta</span></div></div>
          <div class="mstat"><div class="ms-l">Color en 0g</div><div class="ms-v">Azul <span class="ms-u">pálido</span></div></div>
          <div class="mstat"><div class="ms-l">Sin convección</div><div class="ms-v">Hollín no sube <span class="ms-u">→ azul</span></div></div>
          <div class="mstat"><div class="ms-l">FLEX-2 (NASA)</div><div class="ms-v">2012 <span class="ms-u">experimento ISS</span></div></div>
        </div>
        <p class="mdesc">En la ISS sin gravedad, no hay convección — el caliente no sube. El oxígeno llega solo por difusión molecular. La llama es una esfera perfecta, más pequeña, azul y silenciosa. Sin convección, las partículas de hollín no se arrastran hacia arriba → la llama es casi completamente azul. El experimento FLEX-2 descubrió que gotas de combustible pueden continuar quemándose sin llama visible ("cool flames").</p>`},
      {id:'coolflames',label:'Cool Flames',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Temperatura</div><div class="ms-v">500–700 <span class="ms-u">K (fría)</span></div></div>
          <div class="mstat"><div class="ms-l">Llama normal</div><div class="ms-v">1 500–2 500 <span class="ms-u">K</span></div></div>
          <div class="mstat"><div class="ms-l">Visible</div><div class="ms-v">No <span class="ms-u">con ojo desnudo</span></div></div>
          <div class="mstat"><div class="ms-l">Aplicación</div><div class="ms-v">HCCI <span class="ms-u">motores eficientes</span></div></div>
        </div>
        <p class="mdesc">Las "cool flames" son combustión a baja temperatura (500–700 K) sin llama visible. Descubiertas accidentalmente en la ISS cuando las gotas de combustible seguían reaccionando después de apagarse la llama visible. El fenómeno promete mejoras en motores HCCI (Homogeneous Charge Compression Ignition) que combinarían la eficiencia del Diesel con las emisiones de un motor de gasolina.</p>`}
    ]},

    azul:{tag:'Curiosidades · Fenómenos extraños',title:'Fuego Azul & Fuego Negro',tabs:[
      {id:'kawah',label:'Fuego azul de Java',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Ubicación</div><div class="ms-v">Kawah Ijen <span class="ms-u">Java, Indonesia</span></div></div>
          <div class="mstat"><div class="ms-l">Compuesto</div><div class="ms-v">Azufre S₂ <span class="ms-u">líquido</span></div></div>
          <div class="mstat"><div class="ms-l">Temperatura</div><div class="ms-v">445°C <span class="ms-u">azufre fundido</span></div></div>
          <div class="mstat"><div class="ms-l">Flujos</div><div class="ms-v">Ríos de azufre <span class="ms-u">ardiendo azul</span></div></div>
        </div>
        <p class="mdesc">En el volcán Kawah Ijen, el gas SO₂ a alta temperatura se enciende al contacto con el aire. El azufre líquido fluye como lava ardiendo con llamas azules. El espectáculo más sobrenatural de la naturaleza — completamente real y fotografiado extensamente. Los mineros trabajan de noche para verlo; de día, la contaminación de H₂S los obliga a usar máscaras.</p>`},
      {id:'negro',label:'Fuego negro (negativo)',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">¿Existe?</div><div class="ms-v">Sí <span class="ms-u">como suma de espectros</span></div></div>
          <div class="mstat"><div class="ms-l">Mecanismo</div><div class="ms-v">Absorbe <span class="ms-u">luz visible</span></div></div>
          <div class="mstat"><div class="ms-l">Sodio + luz Na</div><div class="ms-v">Sombra <span class="ms-u">oscura visible</span></div></div>
          <div class="mstat"><div class="ms-l">Tipo de fuego</div><div class="ms-v">Absorción <span class="ms-u">no emisión</span></div></div>
        </div>
        <p class="mdesc">El "fuego negro" se crea iluminando sodio frío con luz de sodio caliente. El sodio frío absorbe exactamente las longitudes de onda que el caliente emite, creando una sombra negra donde hay fuego. Demuestra que la absorción y emisión atómica son procesos inversos — base del espectro de absorción solar (líneas de Fraunhofer).</p>`}
    ]},

    artificiales:{tag:'Curiosidades · Química de colores',title:'Fuegos Artificiales',tabs:[
      {id:'colores',label:'Compuestos cromáticos',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Rojo — Sr (estroncio)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#dc2626"></div></div><span class="cbar-val">SrCl₂</span></div>
          <div class="cbar"><span class="cbar-label">Naranja — Ca (calcio)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#ea580c"></div></div><span class="cbar-val">CaCl₂</span></div>
          <div class="cbar"><span class="cbar-label">Amarillo — Na (sodio)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#ca8a04"></div></div><span class="cbar-val">NaCl</span></div>
          <div class="cbar"><span class="cbar-label">Verde — Ba (bario)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#16a34a"></div></div><span class="cbar-val">BaCl₂</span></div>
          <div class="cbar"><span class="cbar-label">Azul — Cu (cobre)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#2563eb"></div></div><span class="cbar-val">CuCl₂</span></div>
          <div class="cbar"><span class="cbar-label">Blanco — Mg, Al, Ti</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:rgba(255,255,255,.45)"></div></div><span class="cbar-val">polvo metálico</span></div>
        </div>
        <p class="mdesc">Los colores provienen de la emisión atómica: los electrones de los metales excitados por el calor emiten fotones al regresar al estado base. Cada elemento tiene un espectro único — la misma física que los espectros estelares. El azul (cobre) es el más difícil de lograr: el CuCl₂ se descompone por encima de 1000°C antes de emitir.</p>`}
    ]}

  }
};
