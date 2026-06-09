// H₂O — Water card data

const PHASE_DIAGRAM = `<svg viewBox="0 0 280 165" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:12px 14px">
  <defs>
    <linearGradient id="gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgba(100,180,255,.14)"/><stop offset="100%" stop-color="rgba(50,100,200,.04)"/></linearGradient>
    <linearGradient id="gl" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="rgba(34,211,238,.04)"/><stop offset="100%" stop-color="rgba(34,211,238,.11)"/></linearGradient>
  </defs>
  <path d="M0,0 L108,0 L108,100 L42,155 L0,155Z" fill="url(#gs)"/>
  <path d="M108,0 L260,0 L260,68 L108,100Z" fill="url(#gl)"/>
  <path d="M108,100 L260,68 L260,155 L42,155Z" fill="rgba(160,160,255,.04)"/>
  <line x1="108" y1="0" x2="108" y2="100" stroke="rgba(80,160,255,.50)" stroke-width="1.4" stroke-dasharray="5,2"/>
  <path d="M108,100 C148,94 202,80 238,68" stroke="rgba(34,211,238,.62)" stroke-width="1.4"/>
  <path d="M42,155 C72,138 94,118 108,100" stroke="rgba(150,150,255,.52)" stroke-width="1.4"/>
  <circle cx="108" cy="100" r="4" fill="#22d3ee"/>
  <circle cx="238" cy="68" r="4" fill="#fb923c" opacity=".88"/>
  <text x="25" y="52" font-size="10" font-weight="600" fill="rgba(120,190,255,.65)" font-family="Space Grotesk,sans-serif">SÓLIDO</text>
  <text x="148" y="36" font-size="10" font-weight="600" fill="rgba(34,211,238,.65)" font-family="Space Grotesk,sans-serif">LÍQUIDO</text>
  <text x="155" y="138" font-size="10" font-weight="600" fill="rgba(180,180,255,.52)" font-family="Space Grotesk,sans-serif">GAS</text>
  <text x="113" y="110" font-size="7" fill="rgba(34,211,238,.80)" font-family="Space Grotesk,sans-serif">Pto. triple</text>
  <text x="113" y="120" font-size="6.5" fill="rgba(34,211,238,.50)" font-family="Space Grotesk,sans-serif">0.01°C · 0.006 atm</text>
  <text x="200" y="62" font-size="7" fill="rgba(251,146,60,.82)" font-family="Space Grotesk,sans-serif">Pto. crítico</text>
  <text x="200" y="72" font-size="6.5" fill="rgba(251,146,60,.52)" font-family="Space Grotesk,sans-serif">374°C · 218 atm</text>
  <line x1="8" y1="150" x2="260" y2="150" stroke="rgba(255,255,255,.08)" stroke-width=".8"/>
  <line x1="8" y1="5" x2="8" y2="150" stroke="rgba(255,255,255,.08)" stroke-width=".8"/>
  <text x="110" y="148" font-size="7.5" fill="rgba(255,255,255,.22)" font-family="Space Grotesk,sans-serif">→ Temperatura</text>
</svg>`;

const MOL_DIAGRAM = `<svg viewBox="0 0 260 140" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:14px 16px">
  <line x1="100" y1="68" x2="56" y2="36" stroke="rgba(34,211,238,.42)" stroke-width="2" stroke-linecap="round"/>
  <line x1="160" y1="68" x2="204" y2="36" stroke="rgba(34,211,238,.42)" stroke-width="2" stroke-linecap="round"/>
  <text x="128" y="28" text-anchor="middle" font-size="9" fill="rgba(34,211,238,.55)" font-family="Inter,sans-serif">104.5°</text>
  <path d="M68 46 Q128 20 188 46" stroke="rgba(34,211,238,.20)" stroke-width=".8" fill="none"/>
  <circle cx="130" cy="70" r="20" fill="rgba(34,211,238,.10)" stroke="rgba(34,211,238,.55)" stroke-width="1.2"/>
  <text x="130" y="75" text-anchor="middle" font-size="16" font-weight="700" fill="#22d3ee" font-family="Inter,sans-serif">O</text>
  <circle cx="128" cy="60" r="2.5" fill="rgba(34,211,238,.60)"/>
  <circle cx="132" cy="60" r="2.5" fill="rgba(34,211,238,.60)"/>
  <circle cx="44" cy="28" r="14" fill="rgba(255,255,255,.07)" stroke="rgba(200,230,255,.42)" stroke-width="1"/>
  <text x="44" y="33" text-anchor="middle" font-size="12" font-weight="700" fill="rgba(215,238,255,.82)" font-family="Inter,sans-serif">H</text>
  <circle cx="216" cy="28" r="14" fill="rgba(255,255,255,.07)" stroke="rgba(200,230,255,.42)" stroke-width="1"/>
  <text x="216" y="33" text-anchor="middle" font-size="12" font-weight="700" fill="rgba(215,238,255,.82)" font-family="Inter,sans-serif">H</text>
  <text x="44" y="54" text-anchor="middle" font-size="7.5" fill="rgba(200,220,255,.45)" font-family="Inter,sans-serif">δ+</text>
  <text x="216" y="54" text-anchor="middle" font-size="7.5" fill="rgba(200,220,255,.45)" font-family="Inter,sans-serif">δ+</text>
  <line x1="130" y1="90" x2="130" y2="118" stroke="rgba(34,211,238,.28)" stroke-width="1.2" stroke-dasharray="3,2"/>
  <polygon points="130,122 127,117 133,117" fill="rgba(34,211,238,.38)"/>
  <text x="136" y="110" font-size="7.5" fill="rgba(34,211,238,.52)" font-family="Inter,sans-serif">δ−  dipolo</text>
  <text x="16" y="120" font-size="8" fill="rgba(200,220,255,.35)" font-family="Space Grotesk,sans-serif">sp³ · bent · polar · 1.85 D</text>
</svg>`;

const OVERLAY_SVG = `<svg viewBox="0 0 76 76" fill="none">
  <line x1="28" y1="29" x2="11" y2="15" stroke="rgba(34,211,238,.36)" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="48" y1="29" x2="65" y2="15" stroke="rgba(34,211,238,.36)" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="38" cy="36" r="13" fill="rgba(34,211,238,.09)" stroke="rgba(34,211,238,.52)" stroke-width=".9"/>
  <text x="38" y="40.5" text-anchor="middle" font-size="12" font-weight="700" fill="#22d3ee" font-family="Inter,sans-serif">O</text>
  <circle cx="8"  cy="12" r="7.5" fill="rgba(255,255,255,.06)" stroke="rgba(200,230,255,.38)" stroke-width=".8"/>
  <text  x="8"  y="15.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="rgba(210,235,255,.78)" font-family="Inter,sans-serif">H</text>
  <circle cx="68" cy="12" r="7.5" fill="rgba(255,255,255,.06)" stroke="rgba(200,230,255,.38)" stroke-width=".8"/>
  <text  x="68" y="15.5" text-anchor="middle" font-size="8.5" font-weight="700" fill="rgba(210,235,255,.78)" font-family="Inter,sans-serif">H</text>
  <path d="M 17 22 Q 38 9 59 22" stroke="rgba(34,211,238,.20)" stroke-width=".7" fill="none"/>
  <text x="38" y="9" text-anchor="middle" font-size="5.5" fill="rgba(34,211,238,.48)" font-family="Inter,sans-serif">104.5°</text>
  <line x1="38" y1="49" x2="38" y2="63" stroke="rgba(34,211,238,.26)" stroke-width=".9" stroke-dasharray="2,2"/>
  <polygon points="38,67 35.5,62 40.5,62" fill="rgba(34,211,238,.36)"/>
  <circle cx="32" cy="34" r="1.4" fill="rgba(34,211,238,.52)"/>
  <circle cx="44" cy="34" r="1.4" fill="rgba(34,211,238,.52)"/>
</svg>`;

export const H2O = {
  id: 'h2o',
  name: 'H₂O',
  label: 'Agua',
  accent: '#22d3ee',
  accentLight: '#c4643a',
  panelIcon: 'droplets',
  panelGradient: 'linear-gradient(150deg,#030d24 0%,#071e50 55%,#0a3570 100%)',

  banner: {
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=80',
    formula: 'H<sub>2</sub>O',
    formulaName: 'Agua · Water · Eau · Wasser',
    tag: 'Dihidrógeno monóxido · 18.015 g/mol',
    pills: ['Compuesto inorgánico', 'CAS 7732-18-5'],
    overlaySvg: OVERLAY_SVG,
    dark: {
      filter: 'saturate(1.2) brightness(.88)',
      blend: 'rgba(0,70,200,.28)',
      grad: 'linear-gradient(175deg,rgba(0,18,55,.12) 0%,rgba(2,8,28,.68) 58%,rgba(1,5,16,.96) 100%)',
      frost: 'linear-gradient(135deg,rgba(80,160,255,.13) 0%,rgba(20,80,200,.05) 60%,rgba(0,200,255,.03) 100%)',
      frostBd: 'rgba(80,180,255,.11)',
      cbGrad: 'linear-gradient(180deg,rgba(2,10,25,.97) 0%,rgba(1,6,16,.99) 100%)',
    },
    light: {
      filter: 'saturate(.9) brightness(1.05)',
      blend: 'rgba(200,110,30,.20)',
      grad: 'linear-gradient(175deg,rgba(170,95,25,.10) 0%,rgba(32,14,3,.55) 56%,rgba(14,5,1,.92) 100%)',
      frost: 'linear-gradient(135deg,rgba(255,215,155,.20) 0%,rgba(215,155,75,.07) 60%,rgba(255,195,95,.03) 100%)',
      frostBd: 'rgba(195,145,75,.13)',
      cbGrad: 'linear-gradient(180deg,rgba(252,250,247,.97) 0%,rgba(248,244,238,.99) 100%)',
    }
  },

  bentos: [
    { section: 'Estructura' },
    { id: 'molecula',      icon: 'atom',           label: 'Molécula',    color: '#22d3ee' },
    { id: 'quimica',       icon: 'flask-conical',  label: 'Química',     color: '#a78bfa' },
    { id: 'electro',       icon: 'zap',            label: 'Polaridad',   color: '#fbbf24' },
    { section: 'Física' },
    { id: 'densidad',      icon: 'scale',          label: 'Densidad',    color: '#38bdf8' },
    { id: 'tension',       icon: 'droplets',       label: 'Tensión',     color: '#34d399' },
    { id: 'flotabilidad',  icon: 'ship',           label: 'Empuje',      color: '#60a5fa' },
    { id: 'insectos',      icon: 'bug',            label: 'Insectos',    color: '#a3e635' },
    { id: 'capilaridad',   icon: 'sprout',         label: 'Capilarid.',  color: '#2dd4bf' },
    { id: 'sonido',        icon: 'waves',          label: 'Sonido',      color: '#f472b6' },
    { section: 'Termodinámica' },
    { id: 'termodinamica', icon: 'thermometer',    label: 'Termodinámica', wide: true, sublabel: 'Calor · fases · temperatura', color: '#fb923c' },
    { section: 'Biología' },
    { id: 'biologia',      icon: 'dna',            label: 'Vida',        color: '#f472b6' },
    { id: 'fotosintesis',  icon: 'leaf',           label: 'Fotosínt.',   color: '#4ade80' },
    { id: 'aguapesada',    icon: 'test-tubes',     label: 'D₂O',         color: '#c084fc' },
    { section: 'Historia &amp; Contexto' },
    { id: 'historia', icon: 'scroll', label: 'Historia del Agua', wide: true, sublabel: 'Antigüedad · ciencia · crisis hídrica', color: '#e879f9' },
  ],

  modals: {

    molecula:{tag:'Estructura · VSEPR',title:'Molécula H₂O',tabs:[
      {id:'geo',label:'Geometría',html:`
        <div class="il-wrap">${MOL_DIAGRAM}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Geometría</div><div class="ms-v">Bent <span class="ms-u">angular</span></div></div>
          <div class="mstat"><div class="ms-l">Ángulo H-O-H</div><div class="ms-v">104.5 <span class="ms-u">°</span></div></div>
          <div class="mstat"><div class="ms-l">Enlace O–H</div><div class="ms-v">96 <span class="ms-u">pm</span></div></div>
          <div class="mstat"><div class="ms-l">Masa molecular</div><div class="ms-v">18.015 <span class="ms-u">g/mol</span></div></div>
        </div>
        <p class="mdesc">Geometría angular por los dos pares solitarios del oxígeno (hibridación sp³). La asimetría confiere polaridad neta de 1.85 Debye y permite los puentes de hidrógeno responsables de todas sus anomalías.</p>`},
      {id:'quimica',label:'Química',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">pH neutro</div><div class="ms-v">7.0</div></div>
          <div class="mstat"><div class="ms-l">Constante dieléctrica</div><div class="ms-v">80.1 <span class="ms-u">ε</span></div></div>
          <div class="mstat"><div class="ms-l">Puentes de H</div><div class="ms-v">4 <span class="ms-u">por molécula</span></div></div>
          <div class="mstat"><div class="ms-l">Kw (25°C)</div><div class="ms-v">10⁻¹⁴ <span class="ms-u">mol²/L²</span></div></div>
        </div>
        <p class="mdesc">El agua es anfótera: puede actuar como ácido (dona H⁺) o base (acepta H⁺). Su alta constante dieléctrica (ε≈80) estabiliza iones en solución — es el solvente universal. Los cuatro puentes de hidrógeno posibles por molécula forman redes supramoleculares dinámicas que explican sus propiedades anómalas.</p>`},
      {id:'desc',label:'Descubrimiento',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">585 AC</div><div><div class="tl-t">Thales de Mileto</div><div class="tl-d">El agua como arché — principio fundamental de toda la materia.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1766</div><div><div class="tl-t">Henry Cavendish</div><div class="tl-d">Aísla el hidrógeno ("aire inflamable") quemando metales en ácido.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1781</div><div><div class="tl-t">Cavendish sintetiza agua</div><div class="tl-d">Quema hidrógeno en aire y obtiene agua pura — la primera síntesis documentada.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1783</div><div><div class="tl-t">Antoine Lavoisier</div><div class="tl-d">Nombra al "hidrógeno" (generador de agua). Confirma la fórmula H₂O y refuta la teoría del flogisto.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1800</div><div><div class="tl-t">Nicholson &amp; Carlisle</div><div class="tl-d">Primera electrólisis del agua — descomposición en H₂ y O₂.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1932</div><div><div class="tl-t">Harold Urey</div><div class="tl-d">Descubre el deuterio y el agua pesada (D₂O). Premio Nobel de Química 1934.</div></div></div>
        </div>`}
    ]},

    quimica:{tag:'Química · Propiedades',title:'Química del Agua',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">pH neutro</div><div class="ms-v">7.0</div></div>
          <div class="mstat"><div class="ms-l">pKa</div><div class="ms-v">15.7 <span class="ms-u">como ácido</span></div></div>
          <div class="mstat"><div class="ms-l">ε dieléctrica</div><div class="ms-v">80.1</div></div>
          <div class="mstat"><div class="ms-l">Kw 25°C</div><div class="ms-v">10⁻¹⁴ <span class="ms-u">mol²/L²</span></div></div>
        </div>
        <p class="mdesc">El agua disuelve más sustancias que cualquier otro líquido. Su alta constante dieléctrica (ε=80) reduce la atracción entre iones opuestos, permitiendo que sales como NaCl se ionicen completamente. Puede actuar como ácido o base (anfótera), siendo fundamental para toda la química en solución acuosa.</p>`},
      {id:'reacciones',label:'Reacciones',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Autoionización</div><div class="ms-v" style="font-size:11px">2H₂O ⇌ H₃O⁺ + OH⁻</div></div>
          <div class="mstat"><div class="ms-l">Electrólisis</div><div class="ms-v" style="font-size:11px">2H₂O → 2H₂ + O₂</div></div>
          <div class="mstat"><div class="ms-l">Fotosíntesis</div><div class="ms-v" style="font-size:10px">6H₂O + 6CO₂ → C₆H₁₂O₆ + 6O₂</div></div>
          <div class="mstat"><div class="ms-l">Combustión H₂</div><div class="ms-v" style="font-size:11px">2H₂ + O₂ → 2H₂O</div></div>
        </div>
        <p class="mdesc">La electrólisis del agua es la base para la producción de hidrógeno verde. La combustión del hidrógeno produce solo vapor de agua, sin CO₂. Los electrolizadores modernos alcanzan eficiencias del 70–80%.</p>`}
    ]},

    electro:{tag:'Polaridad · Electroquímica',title:'Dipolo Eléctrico',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Momento dipolar</div><div class="ms-v">1.85 <span class="ms-u">Debye</span></div></div>
          <div class="mstat"><div class="ms-l">Electroneg. O</div><div class="ms-v">3.44 <span class="ms-u">Pauling</span></div></div>
          <div class="mstat"><div class="ms-l">Electroneg. H</div><div class="ms-v">2.20 <span class="ms-u">Pauling</span></div></div>
          <div class="mstat"><div class="ms-l">Carga parcial O</div><div class="ms-v">−2δ</div></div>
        </div>
        <p class="mdesc">El momento dipolar de 1.85 D resulta de la asimetría angular y la diferencia de electronegatividad. El oxígeno atrae densidad electrónica (δ−); los hidrógenos quedan δ+. Este dipolo permanente es la razón por la que el agua orienta sus moléculas en campos eléctricos externos.</p>`},
      {id:'puentes',label:'Puentes H',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Energía por puente</div><div class="ms-v">20 <span class="ms-u">kJ/mol</span></div></div>
          <div class="mstat"><div class="ms-l">Longitud O···H</div><div class="ms-v">197 <span class="ms-u">pm</span></div></div>
          <div class="mstat"><div class="ms-l">Por molécula (máx)</div><div class="ms-v">4 <span class="ms-u">puentes</span></div></div>
          <div class="mstat"><div class="ms-l">Tiempo de vida</div><div class="ms-v">~1 <span class="ms-u">ps</span></div></div>
        </div>
        <p class="mdesc">Cada molécula puede formar 4 puentes de hidrógeno simultáneos (2 donando, 2 aceptando). Son 10× más fuertes que van der Waals, pero 20× más débiles que enlaces covalentes. Responsables del calor específico elevado, tensión superficial alta y la anomalía de densidad del hielo.</p>`}
    ]},

    densidad:{tag:'Física · Densidad anómala',title:'Anomalía de la Densidad',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Densidad máxima</div><div class="ms-v">1.000 <span class="ms-u">g/cm³ a 4°C</span></div></div>
          <div class="mstat"><div class="ms-l">Densidad hielo</div><div class="ms-v">0.917 <span class="ms-u">g/cm³</span></div></div>
          <div class="mstat"><div class="ms-l">Expansión al congelar</div><div class="ms-v">+9 <span class="ms-u">%</span></div></div>
          <div class="mstat"><div class="ms-l">Temp. densidad máx</div><div class="ms-v">4 <span class="ms-u">°C</span></div></div>
        </div>`},
      {id:'comparacion',label:'Comparación',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Hielo (0°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:91%;background:rgba(120,200,255,.65)"></div></div><span class="cbar-val">0.917 g/cm³</span></div>
          <div class="cbar"><span class="cbar-label">Agua (4°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#22d3ee"></div></div><span class="cbar-val">1.000 g/cm³</span></div>
          <div class="cbar"><span class="cbar-label">Agua (20°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:99.8%;background:rgba(34,211,238,.70)"></div></div><span class="cbar-val">0.998 g/cm³</span></div>
          <div class="cbar"><span class="cbar-label">Agua (100°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:95.8%;background:rgba(34,211,238,.45)"></div></div><span class="cbar-val">0.958 g/cm³</span></div>
          <div class="cbar"><span class="cbar-label">Vapor (100°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:0.06%;background:rgba(200,200,255,.40)"></div></div><span class="cbar-val">0.0006 g/cm³</span></div>
        </div>
        <p class="mdesc">La anomalía de densidad del agua salvó la vida en la Tierra. Al congelarse desde la superficie (el hielo flota), el agua líquida debajo se mantiene a 4°C — temperatura perfecta para la vida acuática en invierno.</p>`}
    ]},

    tension:{tag:'Física · Tensión superficial',title:'Tensión Superficial',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Tensión (20°C)</div><div class="ms-v">72.8 <span class="ms-u">mN/m</span></div></div>
          <div class="mstat"><div class="ms-l">Aceite oliva</div><div class="ms-v">≈32 <span class="ms-u">mN/m</span></div></div>
          <div class="mstat"><div class="ms-l">Etanol</div><div class="ms-v">22.4 <span class="ms-u">mN/m</span></div></div>
          <div class="mstat"><div class="ms-l">Mercurio</div><div class="ms-v">485 <span class="ms-u">mN/m</span></div></div>
        </div>
        <p class="mdesc">Las moléculas en la superficie no tienen vecinas encima — experimentan una fuerza neta hacia el interior, creando una membrana elástica. La tensión de 72.8 mN/m es excepcionalmente alta para una molécula tan pequeña, gracias a los puentes de hidrógeno.</p>`},
      {id:'fenomenos',label:'Fenómenos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Gotas</div><div class="ms-v">Esféricas <span class="ms-u">mín. superficie</span></div></div>
          <div class="mstat"><div class="ms-l">Menisco en vidrio</div><div class="ms-v">Cóncavo <span class="ms-u">adhesión > cohesión</span></div></div>
          <div class="mstat"><div class="ms-l">Menisco en Hg</div><div class="ms-v">Convexo <span class="ms-u">cohesión > adhesión</span></div></div>
          <div class="mstat"><div class="ms-l">Tensión activa</div><div class="ms-v">Surfactantes <span class="ms-u">reducen γ</span></div></div>
        </div>
        <p class="mdesc">Los jabones son surfactantes: sus moléculas tienen un extremo polar (hidrofílico) y uno apolar (hidrofóbico). Se sitúan en la interfase agua-aire, reduciendo la tensión superficial de 72 a ~35 mN/m y permitiendo que el agua moje superficies grasas.</p>`}
    ]},

    flotabilidad:{tag:'Física · Hidrostática',title:'Principio de Arquímedes',tabs:[
      {id:'principio',label:'Principio',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Empuje</div><div class="ms-v" style="font-size:12px">E = ρ · g · V</div></div>
          <div class="mstat"><div class="ms-l">ρ agua (4°C)</div><div class="ms-v">1 000 <span class="ms-u">kg/m³</span></div></div>
          <div class="mstat"><div class="ms-l">Flota si ρ media</div><div class="ms-v">&lt; 1.0 <span class="ms-u">g/cm³</span></div></div>
          <div class="mstat"><div class="ms-l">Hunde si ρ media</div><div class="ms-v">&gt; 1.0 <span class="ms-u">g/cm³</span></div></div>
        </div>
        <p class="mdesc">Arquímedes (287–212 aC) formuló que todo cuerpo sumergido recibe un empuje igual al peso del fluido desplazado. Un barco de acero (ρ=7.8 g/cm³) flota porque su densidad media incluyendo el aire interior es menor que 1 g/cm³. Eureka.</p>`},
      {id:'ejemplos',label:'Ejemplos',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Balsa (madera)</span><div class="cbar-track"><div class="cbar-fill" style="width:12%;background:#4ade80"></div></div><span class="cbar-val">0.12 g/cm³ ↑</span></div>
          <div class="cbar"><span class="cbar-label">Corcho</span><div class="cbar-track"><div class="cbar-fill" style="width:24%;background:#a3e635"></div></div><span class="cbar-val">0.24 g/cm³ ↑</span></div>
          <div class="cbar"><span class="cbar-label">Aceite</span><div class="cbar-track"><div class="cbar-fill" style="width:88%;background:#fbbf24"></div></div><span class="cbar-val">0.88 g/cm³ ↑</span></div>
          <div class="cbar"><span class="cbar-label">Hielo</span><div class="cbar-track"><div class="cbar-fill" style="width:91.7%;background:#60a5fa"></div></div><span class="cbar-val">0.917 g/cm³ ↑</span></div>
          <div class="cbar"><span class="cbar-label">Aluminio</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:rgba(255,100,100,.65)"></div></div><span class="cbar-val">2.7 g/cm³ ↓</span></div>
          <div class="cbar"><span class="cbar-label">Plomo</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:rgba(255,60,60,.65)"></div></div><span class="cbar-val">11.3 g/cm³ ↓</span></div>
        </div>`}
    ]},

    insectos:{tag:'Biología · Interfase',title:'Insectos & Tensión Superficial',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Zapatero (Gerris)</div><div class="ms-v">~15× <span class="ms-u">su peso soportado</span></div></div>
          <div class="mstat"><div class="ms-l">Nano-pelos/pata</div><div class="ms-v">~16 000</div></div>
          <div class="mstat"><div class="ms-l">Ángulo de contacto</div><div class="ms-v">&gt;150° <span class="ms-u">superhydrofóbico</span></div></div>
          <div class="mstat"><div class="ms-l">Velocidad Gerris</div><div class="ms-v">1.5 <span class="ms-u">m/s</span></div></div>
        </div>
        <p class="mdesc">El zapatero de agua (Gerris lacustris) tiene patas cubiertas de ≈16 000 micro-pelos que atrapan bolsas de aire. El ángulo de contacto supera los 150° (superhydrofóbico). Las patas deforman la superficie sin perforarla, distribuyendo el peso en área amplia.</p>`},
      {id:'otros',label:'Otros organismos',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Larvas mosquito</div><div><div class="tl-t">Respiran desde abajo</div><div class="tl-d">Cuelgan invertidas de la superficie usando sifones respiratorios hidrofóbicos.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Escarabajo Stenocara</div><div><div class="tl-t">Recolecta niebla</div><div class="tl-d">Su exoesqueleto alterna áreas hidrofílicas e hidrofóbicas que canalizan gotas hacia la boca.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Araña Dolomedes</div><div><div class="tl-t">Camina y pesca</div><div class="tl-d">Usa la tensión superficial para moverse y detecta vibraciones del agua para cazar peces.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Basilisco (lagarto)</div><div><div class="tl-t">Corre sobre el agua</div><div class="tl-d">Sus patas palmadas golpean el agua con fuerza, creando cavidades de aire antes de que la superficie se rompa.</div></div></div>
        </div>`}
    ]},

    capilaridad:{tag:'Física · Capilaridad',title:'Efecto Capilar',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Xilema vegetal</div><div class="ms-v">&gt;10 <span class="ms-u">m de altura</span></div></div>
          <div class="mstat"><div class="ms-l">Ley de Jurin</div><div class="ms-v" style="font-size:10px">h = 2γcosθ/ρgr</div></div>
          <div class="mstat"><div class="ms-l">Adhesión agua-vidrio</div><div class="ms-v">&gt; <span class="ms-u">cohesión H₂O</span></div></div>
          <div class="mstat"><div class="ms-l">En tubo de 0.1mm</div><div class="ms-v">14.8 <span class="ms-u">cm de ascenso</span></div></div>
        </div>
        <p class="mdesc">La capilaridad es el ascenso espontáneo del agua en tubos estrechos por balance entre adhesión (agua-pared) y cohesión (agua-agua). En árboles el xilema tiene tubos de 20–200 μm que conducen agua sin bombeo activo. Sin capilaridad, la secuoya (115 m) sería imposible.</p>`},
      {id:'aplicaciones',label:'Aplicaciones',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Plantas</div><div><div class="tl-t">Transporte en xilema</div><div class="tl-d">Agua sube desde raíces a hojas por capilaridad, transpiración y presión osmótica.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Medicina</div><div><div class="tl-t">Capilares sanguíneos</div><div class="tl-d">La sangre fluye por capilares de 5–10 μm gracias a la capilaridad y presión cardíaca.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Papel</div><div><div class="tl-t">Absorción de tinta</div><div class="tl-d">Las fibras de celulosa forman miles de micro-canales que absorben líquido por capilaridad.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Tecnología</div><div><div class="tl-t">Tests rápidos (LFT)</div><div class="tl-d">Los tests de COVID y embarazo usan tiras de nitrocelulosa que transportan la muestra por capilaridad sin bomba.</div></div></div>
        </div>`}
    ]},

    sonido:{tag:'Física · Acústica',title:'Sonido en el Agua',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="cmp-bars" style="margin-bottom:14px">
          <div class="cbar"><span class="cbar-label">Agua (20°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#22d3ee"></div></div><span class="cbar-val">1 480 m/s</span></div>
          <div class="cbar"><span class="cbar-label">Agua de mar</span><div class="cbar-track"><div class="cbar-fill" style="width:103%;background:rgba(34,211,238,.75)"></div></div><span class="cbar-val">1 530 m/s</span></div>
          <div class="cbar"><span class="cbar-label">Hielo</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:rgba(120,200,255,.70)"></div></div><span class="cbar-val">3 200 m/s</span></div>
          <div class="cbar"><span class="cbar-label">Aire (20°C)</span><div class="cbar-track"><div class="cbar-fill" style="width:23%;background:rgba(200,200,255,.50)"></div></div><span class="cbar-val">343 m/s</span></div>
        </div>
        <p class="mdesc">El sonido viaja ~4.3× más rápido en agua que en aire porque el agua es casi incompresible. Las ballenas explotan el canal SOFAR (~1000 m de profundidad) para comunicarse a miles de km. Los sonares y las ecografías médicas aprovechan esta propiedad.</p>`}
    ]},

    termodinamica:{tag:'Física · Termodinámica',title:'Propiedades Térmicas',tabs:[
      {id:'calor',label:'Calor',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Calor específico</div><div class="ms-v">4 182 <span class="ms-u">J/(kg·K)</span></div></div>
          <div class="mstat"><div class="ms-l">Calor de fusión</div><div class="ms-v">334 <span class="ms-u">kJ/kg</span></div></div>
          <div class="mstat"><div class="ms-l">Calor de vaporiz.</div><div class="ms-v">2 260 <span class="ms-u">kJ/kg</span></div></div>
          <div class="mstat"><div class="ms-l">Cond. térmica</div><div class="ms-v">0.606 <span class="ms-u">W/(m·K)</span></div></div>
        </div>
        <p class="mdesc">El calor específico más alto de los líquidos no metálicos (4182 J/kg·K): los océanos actúan como termostatos planetarios. El calor de vaporización extraordinario (2260 kJ/kg) explica la eficiencia de la sudoración — evaporar 1 L requiere ~627 kcal.</p>`},
      {id:'fases',label:'Diagrama de fases',html:`
        <div class="il-wrap">${PHASE_DIAGRAM}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Punto triple</div><div class="ms-v">0.01°C <span class="ms-u">0.006 atm</span></div></div>
          <div class="mstat"><div class="ms-l">Punto crítico</div><div class="ms-v">374°C <span class="ms-u">218 atm</span></div></div>
        </div>
        <p class="mdesc">El punto triple es la única condición donde los tres estados coexisten en equilibrio. Por encima del punto crítico, el agua es un fluido supercrítico con propiedades de gas y líquido simultáneamente — usado como solvente "verde" en extracción industrial.</p>`},
      {id:'clima',label:'Clima',html:`
        <div class="crisis-grid">
          <div class="crisis-card"><div class="crisis-n">71%</div><div class="crisis-l">de la superficie terrestre cubierta de agua</div></div>
          <div class="crisis-card"><div class="crisis-n">97%</div><div class="crisis-l">es agua salada en océanos</div></div>
          <div class="crisis-card"><div class="crisis-n">~4°C</div><div class="crisis-l">variación de temperatura media oceánica anual</div></div>
          <div class="crisis-card"><div class="crisis-n">30×</div><div class="crisis-l">más calor acumula el océano vs la atmósfera</div></div>
        </div>
        <p class="mdesc">Los océanos absorben ~90% del calor extra generado por el efecto invernadero. Su enorme capacidad calorífica retrasa el calentamiento global — pero el calor almacenado persistirá siglos aunque cesen las emisiones.</p>`}
    ]},

    biologia:{tag:'Biología · Composición',title:'Agua en la Vida',tabs:[
      {id:'cuerpo',label:'Cuerpo humano',html:`
        <div class="cmp-bars" style="margin-bottom:14px">
          <div class="cbar"><span class="cbar-label">Sangre</span><div class="cbar-track"><div class="cbar-fill" style="width:83%;background:#f472b6"></div></div><span class="cbar-val">83%</span></div>
          <div class="cbar"><span class="cbar-label">Cerebro</span><div class="cbar-track"><div class="cbar-fill" style="width:73%;background:#a78bfa"></div></div><span class="cbar-val">73%</span></div>
          <div class="cbar"><span class="cbar-label">Músculo</span><div class="cbar-track"><div class="cbar-fill" style="width:75%;background:#60a5fa"></div></div><span class="cbar-val">75%</span></div>
          <div class="cbar"><span class="cbar-label">Promedio adulto</span><div class="cbar-track"><div class="cbar-fill" style="width:65%;background:#34d399"></div></div><span class="cbar-val">60–65%</span></div>
          <div class="cbar"><span class="cbar-label">Huesos</span><div class="cbar-track"><div class="cbar-fill" style="width:31%;background:#fbbf24"></div></div><span class="cbar-val">31%</span></div>
        </div>
        <p class="mdesc">Deshidratación del 2% reduce el rendimiento cognitivo y físico notablemente. La del 10% es letal. El agua regula temperatura, transporta nutrientes y es reactivo en miles de reacciones enzimáticas.</p>`},
      {id:'celula',label:'Célula',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Citoplasma</div><div class="ms-v">70–85 <span class="ms-u">% agua</span></div></div>
          <div class="mstat"><div class="ms-l">Solvente celular</div><div class="ms-v">Universal <span class="ms-u">en bioquímica</span></div></div>
          <div class="mstat"><div class="ms-l">Efecto hidrofóbico</div><div class="ms-v">Forma <span class="ms-u">membranas</span></div></div>
          <div class="mstat"><div class="ms-l">Proteínas</div><div class="ms-v">Plegamiento <span class="ms-u">dependiente</span></div></div>
        </div>
        <p class="mdesc">Las membranas celulares existen gracias al efecto hidrofóbico: las colas apolares de los fosfolípidos se orientan lejos del agua, formando bicapas espontáneamente. El plegamiento correcto de proteínas depende críticamente del agua. Sin el "efecto hidrofóbico" no habría compartimentalización celular.</p>`}
    ]},

    fotosintesis:{tag:'Biología · Fotosíntesis',title:'Agua y Fotosíntesis',tabs:[
      {id:'reaccion',label:'Reacción',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Ecuación global</div><div class="ms-v" style="font-size:10px">6H₂O + 6CO₂ + luz</div></div>
          <div class="mstat"><div class="ms-l">Productos</div><div class="ms-v" style="font-size:10px">→ C₆H₁₂O₆ + 6O₂</div></div>
          <div class="mstat"><div class="ms-l">Origen del O₂</div><div class="ms-v">Fotólisis <span class="ms-u">del agua</span></div></div>
          <div class="mstat"><div class="ms-l">Luz absorbida</div><div class="ms-v">400–700 <span class="ms-u">nm</span></div></div>
        </div>
        <p class="mdesc">En el fotosistema II, la energía luminosa divide moléculas de agua (fotólisis), liberando electrones que impulsan la síntesis de ATP. El O₂ que respiramos es subproducto de esta ruptura. Todo el oxígeno libre de la atmósfera proviene históricamente de la fotólisis del agua.</p>`},
      {id:'historia',label:'Evolución',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">~3.5 Ga</div><div><div class="tl-t">Cianobacterias</div><div class="tl-d">Primeros organismos en usar agua como fuente de electrones. Comienzan a liberar O₂.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~2.4 Ga</div><div><div class="tl-t">Gran Oxidación</div><div class="tl-d">El O₂ acumulado oxida el hierro oceánico y satura la atmósfera — primera catástrofe ecológica global.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~500 Ma</div><div><div class="tl-t">Plantas terrestres</div><div class="tl-d">Colonización de tierra firme. Desarrollo de xilema para conducir agua contra la gravedad.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1771</div><div><div class="tl-t">Priestley</div><div class="tl-d">Demuestra que las plantas "restauran el aire" consumido por la respiración.</div></div></div>
        </div>`}
    ]},

    aguapesada:{tag:'Curiosidades · Isótopos',title:'Agua Pesada D₂O',tabs:[
      {id:'datos',label:'Datos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Masa molecular</div><div class="ms-v">20.03 <span class="ms-u">g/mol</span></div></div>
          <div class="mstat"><div class="ms-l">Densidad</div><div class="ms-v">1.105 <span class="ms-u">g/cm³</span></div></div>
          <div class="mstat"><div class="ms-l">Punto ebullición</div><div class="ms-v">101.4 <span class="ms-u">°C</span></div></div>
          <div class="mstat"><div class="ms-l">En agua natural</div><div class="ms-v">1/3 200 <span class="ms-u">moléculas</span></div></div>
        </div>
        <p class="mdesc">El agua pesada contiene deuterio (²H), isótopo del hidrógeno con un neutrón extra. Es tóxica para los organismos vivos en altas concentraciones porque la diferencia de masa altera las tasas de reacción enzimática. Se separa por destilación fraccionada (diferencia de 1.4°C en ebullición).</p>`},
      {id:'nuclear',label:'Usos nucleares',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Uso principal</div><div class="ms-v">Moderador <span class="ms-u">CANDU</span></div></div>
          <div class="mstat"><div class="ms-l">Ventaja vs agua</div><div class="ms-v">No absorbe <span class="ms-u">neutrones</span></div></div>
          <div class="mstat"><div class="ms-l">Permite usar</div><div class="ms-v">Uranio <span class="ms-u">natural (0.7% U-235)</span></div></div>
          <div class="mstat"><div class="ms-l">Descubrimiento</div><div class="ms-v">1932 <span class="ms-u">Harold Urey</span></div></div>
        </div>
        <p class="mdesc">Los reactores CANDU (Canadá) usan D₂O como moderador y refrigerante. La clave: ralentiza los neutrones para mantener la fisión, sin absorberlos como haría el agua normal. Permite usar uranio natural sin enriquecimiento — más barato, pero los reactores son más grandes y complejos.</p>`}
    ]},

    historia:{tag:'Historia · Agua & Humanidad',title:'Historia del Agua',tabs:[
      {id:'antiguedad',label:'Antigüedad',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">~3500 AC</div><div><div class="tl-t">Mesopotamia</div><div class="tl-d">Primeros canales de irrigación en el Tigris y Éufrates. El control del agua = poder político.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~3100 AC</div><div><div class="tl-t">Egipto</div><div class="tl-d">El nilómetro mide el Nilo. Las crecidas regulan agricultura, calendario y recaudación fiscal.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~585 AC</div><div><div class="tl-t">Thales de Mileto</div><div class="tl-d">El agua como arché — principio fundamental del cosmos. Primera hipótesis materialista sobre el origen de la vida.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~300 AC</div><div><div class="tl-t">Acueductos romanos</div><div class="tl-d">Roma construye 11 acueductos (>800 km totales) que abastecen 1 millón de personas.</div></div></div>
          <div class="tl-item"><div class="tl-yr">~250 AC</div><div><div class="tl-t">Arquímedes</div><div class="tl-d">Principio del empuje hidrostático. Tornillo de Arquímedes para elevar agua en irrigación — aún usado.</div></div></div>
        </div>`},
      {id:'ciencia',label:'Revolución científica',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">1766</div><div><div class="tl-t">Cavendish</div><div class="tl-d">Aísla el "aire inflamable" (hidrógeno). Demuestra que al quemarlo produce agua.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1783</div><div><div class="tl-t">Lavoisier</div><div class="tl-d">Nombra al hidrógeno y oxígeno. Confirma H₂O = 2H + O. Fin de la teoría del flogisto.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1800</div><div><div class="tl-t">Nicholson &amp; Carlisle</div><div class="tl-d">Primera electrólisis del agua. Descomponen H₂O en sus elementos con pila de Volta.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1884</div><div><div class="tl-t">Svante Arrhenius</div><div class="tl-d">Teoría de la ionización. Explica el pH y la conducción eléctrica en agua.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1932</div><div><div class="tl-t">Harold Urey</div><div class="tl-d">Descubre el deuterio. Nobel 1934. Fundamento del agua pesada y tecnología nuclear.</div></div></div>
        </div>`},
      {id:'crisis',label:'Crisis hídrica',html:`
        <div class="crisis-grid">
          <div class="crisis-card"><div class="crisis-n">2.5%</div><div class="crisis-l">del agua total es dulce</div></div>
          <div class="crisis-card"><div class="crisis-n">0.3%</div><div class="crisis-l">accesible para consumo humano</div></div>
          <div class="crisis-card"><div class="crisis-n" style="color:#f87171">2.2B</div><div class="crisis-l">personas sin agua potable (2023)</div></div>
          <div class="crisis-card"><div class="crisis-n" style="color:#f87171">5B</div><div class="crisis-l">en estrés hídrico proyectado para 2050</div></div>
        </div>
        <p class="mdesc">La crisis del agua es silenciosa pero urgente. El 70% del agua dulce se usa en agricultura. El cambio climático redistribuye la lluvia — más inundaciones y más sequías simultáneamente. Tecnologías emergentes: desalinización solar, cosecha de niebla, reciclaje de aguas grises.</p>`}
    ]}

  }
};
