// Combustión — Engineering card data

const OTTO_SVG = `<svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:12px 16px">
  <defs>
    <linearGradient id="oc1" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(239,68,68,.12)"/>
      <stop offset="100%" stop-color="rgba(239,68,68,.04)"/>
    </linearGradient>
  </defs>
  <!-- axes -->
  <line x1="32" y1="148" x2="256" y2="148" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
  <line x1="32" y1="148" x2="32" y2="14" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
  <text x="140" y="162" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.30)" font-family="Space Grotesk,sans-serif">→ Volumen</text>
  <text x="10" y="82" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.30)" font-family="Space Grotesk,sans-serif" transform="rotate(-90,10,82)">↑ Presión</text>
  <!-- cycle path: 1→2 adiabatic compression, 2→3 isochoric combustion, 3→4 adiabatic expansion, 4→1 isochoric exhaust -->
  <!-- 1 = (220,138) bottom-right, 2 = (68,88) top-left compressed, 3 = (68,28) top peak, 4 = (220,62) expanded hot -->
  <path d="M220,138 C180,132 110,102 68,88" stroke="rgba(239,68,68,.70)" stroke-width="1.6" fill="none"/>
  <text x="148" y="128" font-size="7" fill="rgba(239,68,68,.65)" font-family="Space Grotesk,sans-serif">1→2 compresión</text>
  <line x1="68" y1="88" x2="68" y2="28" stroke="rgba(251,146,60,.80)" stroke-width="1.6"/>
  <text x="26" y="60" font-size="7" fill="rgba(251,146,60,.65)" font-family="Space Grotesk,sans-serif">2→3</text>
  <text x="16" y="68" font-size="6.5" fill="rgba(251,146,60,.45)" font-family="Space Grotesk,sans-serif">ignición</text>
  <path d="M68,28 C100,34 160,46 220,62" stroke="rgba(250,204,21,.72)" stroke-width="1.6" fill="none"/>
  <text x="130" y="40" font-size="7" fill="rgba(250,204,21,.65)" font-family="Space Grotesk,sans-serif">3→4 expansión (trabajo útil)</text>
  <line x1="220" y1="62" x2="220" y2="138" stroke="rgba(96,165,250,.70)" stroke-width="1.6"/>
  <text x="225" y="106" font-size="7" fill="rgba(96,165,250,.65)" font-family="Space Grotesk,sans-serif">4→1</text>
  <text x="222" y="114" font-size="6.5" fill="rgba(96,165,250,.45)" font-family="Space Grotesk,sans-serif">escape</text>
  <!-- area fill -->
  <path d="M220,138 C180,132 110,102 68,88 L68,28 C100,34 160,46 220,62Z" fill="url(#oc1)"/>
  <!-- points -->
  <circle cx="220" cy="138" r="3.5" fill="#ef4444"/>
  <circle cx="68" cy="88" r="3.5" fill="#fb923c"/>
  <circle cx="68" cy="28" r="3.5" fill="#fbbf24"/>
  <circle cx="220" cy="62" r="3.5" fill="#60a5fa"/>
  <text x="224" y="141" font-size="7" fill="rgba(239,68,68,.80)" font-family="Space Grotesk,sans-serif">1</text>
  <text x="54" y="92" font-size="7" fill="rgba(251,146,60,.80)" font-family="Space Grotesk,sans-serif">2</text>
  <text x="54" y="29" font-size="7" fill="rgba(251,191,36,.80)" font-family="Space Grotesk,sans-serif">3</text>
  <text x="224" y="65" font-size="7" fill="rgba(96,165,250,.80)" font-family="Space Grotesk,sans-serif">4</text>
</svg>`;

const DIESEL_SVG = `<svg viewBox="0 0 280 170" fill="none" xmlns="http://www.w3.org/2000/svg" style="padding:12px 16px">
  <line x1="32" y1="148" x2="256" y2="148" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
  <line x1="32" y1="148" x2="32" y2="14" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
  <text x="140" y="162" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.30)" font-family="Space Grotesk,sans-serif">→ Volumen</text>
  <!-- 1→2 compression, 2→3 isobaric combustion (horizontal), 3→4 expansion, 4→1 exhaust -->
  <path d="M220,138 C180,130 110,100 68,82" stroke="rgba(239,68,68,.70)" stroke-width="1.6" fill="none"/>
  <line x1="68" y1="82" x2="68" y2="24" stroke="rgba(251,146,60,.80)" stroke-width="1.6"/>
  <line x1="68" y1="24" x2="120" y2="24" stroke="rgba(250,204,21,.85)" stroke-width="1.6"/>
  <text x="78" y="19" font-size="7" fill="rgba(250,204,21,.75)" font-family="Space Grotesk,sans-serif">combustión isobárica</text>
  <path d="M120,24 C160,34 190,58 220,78" stroke="rgba(74,222,128,.72)" stroke-width="1.6" fill="none"/>
  <line x1="220" y1="78" x2="220" y2="138" stroke="rgba(96,165,250,.70)" stroke-width="1.6"/>
  <path d="M220,138 C180,130 110,100 68,82 L68,24 L120,24 C160,34 190,58 220,78Z" fill="rgba(239,68,68,.06)"/>
  <circle cx="220" cy="138" r="3.5" fill="#ef4444"/>
  <circle cx="68"  cy="82"  r="3.5" fill="#fb923c"/>
  <circle cx="68"  cy="24"  r="3.5" fill="#fbbf24"/>
  <circle cx="120" cy="24"  r="3.5" fill="#facc15"/>
  <circle cx="220" cy="78"  r="3.5" fill="#4ade80"/>
  <text x="225" y="141" font-size="7" fill="rgba(239,68,68,.80)" font-family="Space Grotesk,sans-serif">1</text>
  <text x="54"  y="86"  font-size="7" fill="rgba(251,146,60,.80)" font-family="Space Grotesk,sans-serif">2</text>
  <text x="54"  y="26"  font-size="7" fill="rgba(251,191,36,.80)" font-family="Space Grotesk,sans-serif">3</text>
  <text x="123" y="22"  font-size="7" fill="rgba(250,204,21,.80)" font-family="Space Grotesk,sans-serif">4</text>
  <text x="225" y="80"  font-size="7" fill="rgba(74,222,128,.80)" font-family="Space Grotesk,sans-serif">5</text>
</svg>`;

export const COMBUSTION = {
  id: 'combustion',
  name: 'Combustión',
  label: 'Ingeniería · Termodinámica',
  accent: '#ef4444',
  accentLight: '#b91c1c',
  panelIcon: 'cog',
  panelGradient: 'linear-gradient(150deg,#0f0005 0%,#3b0a0a 55%,#5c1010 100%)',

  banner: {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80',
    formula: 'ΔH',
    formulaName: 'Entalpía · Eficiencia · Potencia',
    tag: 'Reacción exotérmica controlada · ingeniería térmica',
    pills: ['Termodinámica aplicada', 'Ciclos de potencia'],
    overlaySvg: `<svg viewBox="0 0 76 76" fill="none">
      <circle cx="38" cy="38" r="28" stroke="rgba(239,68,68,.35)" stroke-width=".8" stroke-dasharray="4,3"/>
      <circle cx="38" cy="38" r="18" fill="rgba(239,68,68,.07)" stroke="rgba(239,68,68,.45)" stroke-width=".8"/>
      <text x="38" y="34" text-anchor="middle" font-size="7" font-weight="700" fill="rgba(239,68,68,.70)" font-family="Inter,sans-serif">η = 1 −</text>
      <text x="38" y="44" text-anchor="middle" font-size="7" font-weight="700" fill="rgba(239,68,68,.70)" font-family="Inter,sans-serif">Tc/Th</text>
      <path d="M38,10 L38,20" stroke="rgba(251,146,60,.40)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M38,56 L38,66" stroke="rgba(251,146,60,.40)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M10,38 L20,38" stroke="rgba(251,146,60,.40)" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M56,38 L66,38" stroke="rgba(251,146,60,.40)" stroke-width="1.2" stroke-linecap="round"/>
      <text x="38" y="8" text-anchor="middle" font-size="5.5" fill="rgba(251,146,60,.50)" font-family="Inter,sans-serif">Th</text>
      <text x="38" y="74" text-anchor="middle" font-size="5.5" fill="rgba(96,165,250,.50)" font-family="Inter,sans-serif">Tc</text>
    </svg>`,
    dark: {
      filter: 'saturate(1.15) brightness(.80)',
      blend: 'rgba(160,20,0,.38)',
      grad: 'linear-gradient(175deg,rgba(50,8,0,.18) 0%,rgba(18,4,0,.74) 58%,rgba(6,1,0,.97) 100%)',
      frost: 'linear-gradient(135deg,rgba(239,68,68,.14) 0%,rgba(185,28,28,.06) 60%,rgba(220,38,38,.03) 100%)',
      frostBd: 'rgba(239,68,68,.16)',
      cbGrad: 'linear-gradient(180deg,rgba(18,4,0,.97) 0%,rgba(8,2,0,.99) 100%)',
    },
    light: {
      filter: 'saturate(.80) brightness(1.08)',
      blend: 'rgba(160,30,0,.15)',
      grad: 'linear-gradient(175deg,rgba(140,30,5,.12) 0%,rgba(28,8,2,.58) 56%,rgba(10,3,1,.93) 100%)',
      frost: 'linear-gradient(135deg,rgba(255,200,180,.20) 0%,rgba(220,130,90,.07) 60%,rgba(240,160,100,.03) 100%)',
      frostBd: 'rgba(185,80,50,.16)',
      cbGrad: 'linear-gradient(180deg,rgba(253,250,247,.97) 0%,rgba(249,244,240,.99) 100%)',
    }
  },

  bentos: [
    { section: 'Tipos de Combustión' },
    { id: 'completa',    icon: 'check-circle',   label: 'Completa',    color: '#4ade80' },
    { id: 'incompleta',  icon: 'alert-circle',   label: 'Incompleta',  color: '#f87171' },
    { id: 'lambda',      icon: 'sliders',        label: 'Índice λ',    color: '#fbbf24' },
    { section: 'Motores de Combustión' },
    { id: 'otto',   icon: 'rotate-cw',  label: 'Ciclo Otto',  wide: true, sublabel: '4 tiempos · relación de compresión · eficiencia', color: '#fb923c' },
    { id: 'diesel',      icon: 'truck',          label: 'Diesel',      color: '#ef4444' },
    { id: 'turbina',     icon: 'wind',           label: 'Turbina',     color: '#60a5fa' },
    { section: 'Termodinámica' },
    { id: 'poder',       icon: 'battery-charging',label:'Poder calorífico',color:'#fbbf24' },
    { id: 'carnot',      icon: 'gauge',          label: 'Carnot',      color: '#a78bfa' },
    { id: 'llama_adiab', icon: 'thermometer',    label: 'T. adiabática',color:'#f472b6' },
    { section: 'Historia Industrial' },
    { id: 'historia_ind', icon: 'factory', label: 'Historia industrial', wide: true, sublabel: 'Newcomen 1712 → vapor → turborreactor 1939', color: '#e879f9' },
    { section: 'Futuro & Ambiente' },
    { id: 'hidrogeno',   icon: 'zap',            label: 'H₂ verde',    color: '#38bdf8' },
    { id: 'emisiones',   icon: 'cloud',          label: 'Emisiones',   color: '#94a3b8' },
    { id: 'eficiencia',  icon: 'arrow-up-right', label: 'Eficiencia',  color: '#34d399' },
  ],

  modals: {

    completa:{tag:'Química · Estequiometría',title:'Combustión Completa',tabs:[
      {id:'reaccion',label:'Reacción',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Metano (estequiométrico)</div><div class="ms-v" style="font-size:10px">CH₄ + 2O₂ → CO₂ + 2H₂O</div></div>
          <div class="mstat"><div class="ms-l">Gasolina (aprox.)</div><div class="ms-v" style="font-size:10px">C₈H₁₈ + 12.5O₂ → 8CO₂ + 9H₂O</div></div>
          <div class="mstat"><div class="ms-l">Relación A/F gasolina</div><div class="ms-v">14.7 <span class="ms-u">kg aire / kg combustible</span></div></div>
          <div class="mstat"><div class="ms-l">Productos</div><div class="ms-v">CO₂ + H₂O <span class="ms-u">solo</span></div></div>
        </div>
        <p class="mdesc">La combustión completa ocurre cuando todo el carbono se oxida a CO₂ y todo el hidrógeno a H₂O. Requiere suficiente oxidante (λ ≥ 1). En la práctica, incluso los mejores motores producen algo de CO e hidrocarburos sin quemar por inhomogeneidad de la mezcla.</p>`},
      {id:'productos',label:'Productos de escape',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">N₂ (inerte)</span><div class="cbar-track"><div class="cbar-fill" style="width:71%;background:#94a3b8"></div></div><span class="cbar-val">~71%</span></div>
          <div class="cbar"><span class="cbar-label">CO₂</span><div class="cbar-track"><div class="cbar-fill" style="width:14%;background:#ef4444"></div></div><span class="cbar-val">~14%</span></div>
          <div class="cbar"><span class="cbar-label">H₂O (vapor)</span><div class="cbar-track"><div class="cbar-fill" style="width:13%;background:#60a5fa"></div></div><span class="cbar-val">~13%</span></div>
          <div class="cbar"><span class="cbar-label">O₂ residual</span><div class="cbar-track"><div class="cbar-fill" style="width:2%;background:#4ade80"></div></div><span class="cbar-val">~2%</span></div>
        </div>
        <p class="mdesc">Los gases de escape de un motor bencinero en combustión completa contienen principalmente N₂ (del aire de admisión), CO₂ y vapor de agua. Las sondas lambda (sensores de O₂) en el escape miden si la mezcla es rica o pobre para ajustar la inyección en tiempo real.</p>`}
    ]},

    incompleta:{tag:'Química · Contaminación',title:'Combustión Incompleta',tabs:[
      {id:'productos',label:'Productos tóxicos',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Monóxido CO</div><div class="ms-v">Tóxico <span class="ms-u">mortal &gt;200 ppm</span></div></div>
          <div class="mstat"><div class="ms-l">Hollín (PM2.5)</div><div class="ms-v">Cancerígeno <span class="ms-u">partículas &lt;2.5 μm</span></div></div>
          <div class="mstat"><div class="ms-l">NOₓ</div><div class="ms-v">Smog <span class="ms-u">fotoquímico</span></div></div>
          <div class="mstat"><div class="ms-l">PAH (benceno)</div><div class="ms-v">Cancerígeno <span class="ms-u">en diesel</span></div></div>
        </div>
        <p class="mdesc">La combustión incompleta ocurre con λ &lt; 1 (exceso de combustible), baja temperatura o tiempo insuficiente. El CO es incoloro e inodoro — se une a la hemoglobina con 250× más afinidad que el O₂. Los catalizadores de tres vías convierten CO → CO₂, NOₓ → N₂ e hidrocarburos → CO₂ + H₂O con eficiencia &gt;99%.</p>`},
      {id:'diesel_pm',label:'Diésel y PM2.5',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">PM2.5 motor diésel</div><div class="ms-v">20–100 <span class="ms-u">mg/km (sin filtro)</span></div></div>
          <div class="mstat"><div class="ms-l">Filtro de partículas</div><div class="ms-v">&gt;99% <span class="ms-u">retención</span></div></div>
          <div class="mstat"><div class="ms-l">SCR (urea)</div><div class="ms-v">NOₓ → N₂ <span class="ms-u">+H₂O</span></div></div>
          <div class="mstat"><div class="ms-l">Euro 6d</div><div class="ms-v">0.005 g/km <span class="ms-u">PM límite</span></div></div>
        </div>
        <p class="mdesc">Los motores diésel modernos (Euro 6d) usan DPF (filtro de partículas diésel) y SCR (reducción catalítica selectiva con AdBlue/urea). La norma Euro 6d exige &lt;0.005 g/km de partículas y &lt;0.08 g/km de NOₓ — reducciones del 97% respecto a Euro 1 de 1992.</p>`}
    ]},

    lambda:{tag:'Ingeniería · Mezcla',title:'Índice Lambda (λ)',tabs:[
      {id:'lambda',label:'Definición',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">λ = 1</div><div class="ms-v">Estequiométrico <span class="ms-u">A/F ideal</span></div></div>
          <div class="mstat"><div class="ms-l">λ &lt; 1</div><div class="ms-v">Mezcla rica <span class="ms-u">exceso combustible</span></div></div>
          <div class="mstat"><div class="ms-l">λ &gt; 1</div><div class="ms-v">Mezcla pobre <span class="ms-u">exceso aire</span></div></div>
          <div class="mstat"><div class="ms-l">Gasolina λ óptimo</div><div class="ms-v">14.7 <span class="ms-u">kg aire/kg combustible</span></div></div>
        </div>
        <p class="mdesc">Lambda es la relación entre el aire real y el aire estequiométrico. Un motor moderno oscila alrededor de λ=1 (control en bucle cerrado con sonda lambda). Bajo carga máxima se enriquece la mezcla (λ≈0.85–0.95) para refrigerar las válvulas y aumentar potencia. En ralentí se empobece para reducir emisiones.</p>`},
      {id:'cmp',label:'Comparativa',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">λ 0.7 — máx. potencia</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#ef4444"></div></div><span class="cbar-val">CO alto</span></div>
          <div class="cbar"><span class="cbar-label">λ 0.85–0.95 — plena carga</span><div class="cbar-track"><div class="cbar-fill" style="width:80%;background:#fb923c"></div></div><span class="cbar-val">potencia</span></div>
          <div class="cbar"><span class="cbar-label">λ 1.0 — estequiométrico</span><div class="cbar-track"><div class="cbar-fill" style="width:65%;background:#4ade80"></div></div><span class="cbar-val">catalizador</span></div>
          <div class="cbar"><span class="cbar-label">λ 1.3–1.6 — lean burn</span><div class="cbar-track"><div class="cbar-fill" style="width:45%;background:#38bdf8"></div></div><span class="cbar-val">NOₓ alto</span></div>
          <div class="cbar"><span class="cbar-label">λ &gt;2 — GDI estratificado</span><div class="cbar-track"><div class="cbar-fill" style="width:30%;background:#a78bfa"></div></div><span class="cbar-val">min consumo</span></div>
        </div>`}
    ]},

    otto:{tag:'Ingeniería · Motor de 4 tiempos',title:'Ciclo Otto',tabs:[
      {id:'diagrama',label:'Diagrama P-V',html:`
        <div class="il-wrap">${OTTO_SVG}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Relación compresión</div><div class="ms-v">8–12 <span class="ms-u">:1</span></div></div>
          <div class="mstat"><div class="ms-l">Eficiencia ideal</div><div class="ms-v">η = 1 − r^(1−γ)</div></div>
          <div class="mstat"><div class="ms-l">Eficiencia real</div><div class="ms-v">25–35 <span class="ms-u">%</span></div></div>
          <div class="mstat"><div class="ms-l">T máxima en ciclo</div><div class="ms-v">~2 500 <span class="ms-u">K</span></div></div>
        </div>`},
      {id:'tiempos',label:'4 Tiempos',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">1. Admisión</div><div><div class="tl-t">Pistón baja · válvula admisión abierta</div><div class="tl-d">El cilindro se llena de mezcla aire-combustible a presión atmosférica. El volumen aumenta al máximo (PMI).</div></div></div>
          <div class="tl-item"><div class="tl-yr">2. Compresión</div><div><div class="tl-t">Pistón sube · válvulas cerradas</div><div class="tl-d">La mezcla se comprime 8–12:1 adiabáticamente. La temperatura sube a ~400°C. La energía de compresión se almacena.</div></div></div>
          <div class="tl-item"><div class="tl-yr">3. Explosión</div><div><div class="tl-t">Bujía · expansión adiabática</div><div class="tl-d">La chispa enciende la mezcla. La combustión rápida (isocórica) eleva P y T. El pistón baja generando trabajo útil.</div></div></div>
          <div class="tl-item"><div class="tl-yr">4. Escape</div><div><div class="tl-t">Pistón sube · válvula escape abierta</div><div class="tl-d">Los gases quemados son expulsados. La presión cae a atmosférica. El ciclo se repite a ~1000–7000 RPM.</div></div></div>
        </div>`},
      {id:'detonacion',label:'Detonación (Knock)',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Detonación</div><div class="ms-v">Autoignición <span class="ms-u">prematura</span></div></div>
          <div class="mstat"><div class="ms-l">Número de octano</div><div class="ms-v">Resistencia <span class="ms-u">a detonar</span></div></div>
          <div class="mstat"><div class="ms-l">Super sin plomo</div><div class="ms-v">95–98 <span class="ms-u">RON</span></div></div>
          <div class="mstat"><div class="ms-l">Antidetonantes</div><div class="ms-v">Etanol <span class="ms-u">RON 108</span></div></div>
        </div>
        <p class="mdesc">La detonación ocurre cuando la mezcla se enciende espontáneamente antes de que llegue el frente de llama de la bujía. Produce ondas de choque que dañan pistones y bielas. El número de octano mide la resistencia: iso-octano = 100, n-heptano = 0. El etanol (RON 108) es un excelente antidetonante — razón por la que Brasil ha usado alcohol carburante desde 1970.</p>`}
    ]},

    diesel:{tag:'Ingeniería · Motor Diesel',title:'Ciclo Diesel',tabs:[
      {id:'diagrama',label:'Diagrama P-V',html:`
        <div class="il-wrap">${DIESEL_SVG}</div>
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Relación compresión</div><div class="ms-v">14–22 <span class="ms-u">:1</span></div></div>
          <div class="mstat"><div class="ms-l">Eficiencia real</div><div class="ms-v">35–45 <span class="ms-u">%</span></div></div>
          <div class="mstat"><div class="ms-l">T aire comprimido</div><div class="ms-v">~700–900 <span class="ms-u">°C</span></div></div>
          <div class="mstat"><div class="ms-l">Sin bujía</div><div class="ms-v">Autoignición <span class="ms-u">por compresión</span></div></div>
        </div>`},
      {id:'otto_vs_diesel',label:'Otto vs Diesel',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Compresión</div><div class="ms-v">Otto: 8–12 <span class="ms-u">Diesel: 14–22</span></div></div>
          <div class="mstat"><div class="ms-l">Ignición</div><div class="ms-v">Otto: bujía <span class="ms-u">Diesel: compresión</span></div></div>
          <div class="mstat"><div class="ms-l">Eficiencia</div><div class="ms-v">Otto: 25–35% <span class="ms-u">Diesel: 35–45%</span></div></div>
          <div class="mstat"><div class="ms-l">Torque</div><div class="ms-v">Otto: alto RPM <span class="ms-u">Diesel: bajo RPM</span></div></div>
        </div>
        <p class="mdesc">La mayor relación de compresión del Diesel eleva más la temperatura del aire, logrando autoignición sin chispa. El ciclo Diesel es inherentemente más eficiente porque la expansión llega más lejos. Los motores Diesel marinos de 2 tiempos (MAN B&W) alcanzan el 55% de eficiencia — récord mundial en motores de combustión interna.</p>`}
    ]},

    turbina:{tag:'Ingeniería · Turbomaquinaria',title:'Turbinas de Gas',tabs:[
      {id:'ciclo',label:'Ciclo Brayton',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">1→2 Compresión</div><div class="ms-v">Compresor <span class="ms-u">axial</span></div></div>
          <div class="mstat"><div class="ms-l">2→3 Combustión</div><div class="ms-v">Cámara <span class="ms-u">isobárica</span></div></div>
          <div class="mstat"><div class="ms-l">3→4 Expansión</div><div class="ms-v">Turbina <span class="ms-u">extrae trabajo</span></div></div>
          <div class="mstat"><div class="ms-l">T entrada turbina</div><div class="ms-v">1 400–1 700 <span class="ms-u">°C</span></div></div>
        </div>
        <p class="mdesc">El ciclo Brayton es la base de los turborreactores, turbofanes y turbinas de gas para generación eléctrica. La temperatura de entrada a la turbina (TIT) supera el punto de fusión del acero (1538°C), posible por refrigeración interna con aire. La eficiencia de ciclo combinado (gas + vapor) alcanza el 62% — el más eficiente de los ciclos comerciales.</p>`},
      {id:'tipos',label:'Tipos de turbinas',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">Turborreactor</div><div><div class="tl-t">1939 · Hans von Ohain / Whittle</div><div class="tl-d">Todo el aire pasa por la cámara. Alto consumo. Eficiente a velocidades supersónicas. Usado en cazas militares.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Turbofán</div><div><div class="tl-t">1960s · aviación comercial</div><div class="tl-d">Un gran fan desvía la mayoría del aire sin pasar por la cámara (bypass). BPR 10–12:1 en motores modernos. 30% más eficiente que turborreactor.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Turbohélice</div><div><div class="tl-t">Velocidades subsónicas</div><div class="tl-d">La turbina mueve una hélice convencional. Muy eficiente a baja velocidad (&lt;650 km/h). ATR 72, C-130.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Ciclo combinado</div><div><div class="tl-t">Generación eléctrica</div><div class="tl-d">Los gases de escape de la turbina de gas generan vapor para una turbina de vapor adicional. η &gt; 60%.</div></div></div>
        </div>`}
    ]},

    poder:{tag:'Termodinámica · Energía',title:'Poder Calorífico',tabs:[
      {id:'superior',label:'Poder calorífico superior',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Hidrógeno H₂</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#38bdf8"></div></div><span class="cbar-val">142 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Gas natural (CH₄)</span><div class="cbar-track"><div class="cbar-fill" style="width:38.7%;background:#f97316"></div></div><span class="cbar-val">55 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Propano C₃H₈</span><div class="cbar-track"><div class="cbar-fill" style="width:35%;background:#fb923c"></div></div><span class="cbar-val">50 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Gasolina</span><div class="cbar-track"><div class="cbar-fill" style="width:31%;background:#fbbf24"></div></div><span class="cbar-val">44 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Diesel</span><div class="cbar-track"><div class="cbar-fill" style="width:29.5%;background:#ef4444"></div></div><span class="cbar-val">42 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Carbón bituminoso</span><div class="cbar-track"><div class="cbar-fill" style="width:20%;background:#78716c"></div></div><span class="cbar-val">29 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Etanol</span><div class="cbar-track"><div class="cbar-fill" style="width:19%;background:#4ade80"></div></div><span class="cbar-val">27 MJ/kg</span></div>
          <div class="cbar"><span class="cbar-label">Madera seca</span><div class="cbar-track"><div class="cbar-fill" style="width:13%;background:#86efac"></div></div><span class="cbar-val">19 MJ/kg</span></div>
        </div>`},
      {id:'volumetrico',label:'Por volumen',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Diesel (L)</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#ef4444"></div></div><span class="cbar-val">37 MJ/L</span></div>
          <div class="cbar"><span class="cbar-label">Gasolina (L)</span><div class="cbar-track"><div class="cbar-fill" style="width:87%;background:#fbbf24"></div></div><span class="cbar-val">32 MJ/L</span></div>
          <div class="cbar"><span class="cbar-label">Etanol (L)</span><div class="cbar-track"><div class="cbar-fill" style="width:58%;background:#4ade80"></div></div><span class="cbar-val">21 MJ/L</span></div>
          <div class="cbar"><span class="cbar-label">GLP (L líq.)</span><div class="cbar-track"><div class="cbar-fill" style="width:65%;background:#fb923c"></div></div><span class="cbar-val">24 MJ/L</span></div>
          <div class="cbar"><span class="cbar-label">H₂ líquido (L)</span><div class="cbar-track"><div class="cbar-fill" style="width:23%;background:#38bdf8"></div></div><span class="cbar-val">8.5 MJ/L</span></div>
        </div>
        <p class="mdesc">Aunque el hidrógeno tiene la densidad energética másica más alta (142 MJ/kg), su densidad volumétrica en estado líquido (8.5 MJ/L) es muy inferior al diesel (37 MJ/L). El tanque de H₂ para una autonomía equivalente pesa mucho menos pero ocupa 4× más volumen — el desafío del almacenamiento del H₂.</p>`}
    ]},

    carnot:{tag:'Termodinámica · Eficiencia límite',title:'Límite de Carnot',tabs:[
      {id:'principio',label:'Principio',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Eficiencia Carnot</div><div class="ms-v" style="font-size:12px">η = 1 − Tc/Th</div></div>
          <div class="mstat"><div class="ms-l">Motor Carnot (ideal)</div><div class="ms-v">Límite <span class="ms-u">físico absoluto</span></div></div>
          <div class="mstat"><div class="ms-l">2.ª Ley</div><div class="ms-v">Entropía <span class="ms-u">siempre aumenta</span></div></div>
          <div class="mstat"><div class="ms-l">Ejemplo (Th=1000K, Tc=300K)</div><div class="ms-v">η = 70 <span class="ms-u">% máx.</span></div></div>
        </div>
        <p class="mdesc">Sadi Carnot (1824) demostró que ningún motor puede superar la eficiencia del ciclo Carnot. La única forma de aumentarla es elevar Th (temperatura del foco caliente) o reducir Tc (foco frío). Los motores reales están muy por debajo de este límite por irreversibilidades (fricción, calor no recuperado, mezcla imperfecta).</p>`},
      {id:'motores_reales',label:'Eficiencias reales',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Ciclo combinado gas+vapor</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#4ade80"></div></div><span class="cbar-val">60–62%</span></div>
          <div class="cbar"><span class="cbar-label">Turbina a vapor nuclear</div><div class="cbar-track"><div class="cbar-fill" style="width:56%;background:#38bdf8"></div></div><span class="cbar-val">33–36%</span></div>
          <div class="cbar"><span class="cbar-label">Motor diésel marino 2T</span><div class="cbar-track"><div class="cbar-fill" style="width:90%;background:#fbbf24"></div></div><span class="cbar-val">55%</span></div>
          <div class="cbar"><span class="cbar-label">Motor diesel camión</span><div class="cbar-track"><div class="cbar-fill" style="width:68%;background:#fb923c"></div></div><span class="cbar-val">42–48%</span></div>
          <div class="cbar"><span class="cbar-label">Motor gasolina (turbo)</span><div class="cbar-track"><div class="cbar-fill" style="width:56%;background:#ef4444"></div></div><span class="cbar-val">35–40%</span></div>
          <div class="cbar"><span class="cbar-label">Motor gasolina (std)</span><div class="cbar-track"><div class="cbar-fill" style="width:43%;background:rgba(239,68,68,.55)"></div></div><span class="cbar-val">25–30%</span></div>
          <div class="cbar"><span class="cbar-label">Motor de vapor (Watt)</span><div class="cbar-track"><div class="cbar-fill" style="width:3%;background:#94a3b8"></div></div><span class="cbar-val">1–3%</span></div>
        </div>`}
    ]},

    llama_adiab:{tag:'Termodinámica · Temperaturas',title:'Temperatura Adiabática de Llama',tabs:[
      {id:'datos',label:'Temperaturas',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Acetileno + O₂</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#38bdf8"></div></div><span class="cbar-val">3 500°C</span></div>
          <div class="cbar"><span class="cbar-label">Hidrógeno + O₂</span><div class="cbar-track"><div class="cbar-fill" style="width:94%;background:#60a5fa"></div></div><span class="cbar-val">2 800°C</span></div>
          <div class="cbar"><span class="cbar-label">Metano + O₂</span><div class="cbar-track"><div class="cbar-fill" style="width:66%;background:#f97316"></div></div><span class="cbar-val">2 230°C</span></div>
          <div class="cbar"><span class="cbar-label">Metano + aire</span><div class="cbar-track"><div class="cbar-fill" style="width:52%;background:#fb923c"></div></div><span class="cbar-val">1 950°C</span></div>
          <div class="cbar"><span class="cbar-label">Gasolina + aire</span><div class="cbar-track"><div class="cbar-fill" style="width:56%;background:#fbbf24"></div></div><span class="cbar-val">2 050°C</span></div>
        </div>
        <p class="mdesc">La temperatura adiabática de llama (TAF) es la temperatura máxima teórica si toda la entalpía de reacción va al producto sin pérdidas. Con oxígeno puro es ~700°C mayor que con aire, ya que el N₂ del aire absorbe calor sin reaccionar. Los materiales refractarios de turbinas deben soportar temperaturas cercanas a la TAF.</p>`}
    ]},

    historia_ind:{tag:'Historia · Revolución Industrial',title:'Historia de la Combustión Industrial',tabs:[
      {id:'vapor',label:'Era del vapor',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">1698</div><div><div class="tl-t">Thomas Savery</div><div class="tl-d">Primera máquina de vapor comercial para bombear agua de minas. Sin pistón — solo condensación crea vacío.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1712</div><div><div class="tl-t">Thomas Newcomen</div><div class="tl-d">Pistón atmosférico — el vapor se condensa creando vacío y la atmósfera empuja el pistón. Eficiencia ~0.5%. Bombea minas de carbón.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1769</div><div><div class="tl-t">James Watt</div><div class="tl-d">Condensador separado (4× más eficiente), movimiento rotativo, regulador centrífugo. La máquina que inició la Revolución Industrial.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1804</div><div><div class="tl-t">Trevithick — Locomotora</div><div class="tl-d">Primera locomotora de vapor en rieles. La era del ferrocarril transforma el comercio global.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1859</div><div><div class="tl-t">Drake — Primer pozo petróleo</div><div class="tl-d">Titusville, Pennsylvania. Inicia la era del petróleo que desplaza al carbón.</div></div></div>
        </div>`},
      {id:'combustion_interna',label:'Combustión interna',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">1876</div><div><div class="tl-t">Nicolaus Otto</div><div class="tl-d">Primer motor de 4 tiempos con éxito comercial. El ciclo Otto — el motor de todos los automóviles de gasolina.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1892</div><div><div class="tl-t">Rudolf Diesel</div><div class="tl-d">Motor de encendido por compresión — sin bujía, mayor eficiencia. Primer motor diesel presentado en la Exposición de Múnich.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1903</div><div><div class="tl-t">Hermanos Wright</div><div class="tl-d">Motor de gasolina de 12 CV, 4 cilindros, 77 kg. Kitty Hawk — 12 segundos que cambiaron el mundo.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1939</div><div><div class="tl-t">Hans von Ohain / Whittle</div><div class="tl-d">Primer turborreactor en vuelo (He 178). El ciclo Brayton en aplicación aeronáutica.</div></div></div>
          <div class="tl-item"><div class="tl-yr">1957</div><div><div class="tl-t">Sputnik · Cohetes</div><div class="tl-d">Motor de cohete RD-107 (queroseno + O₂ líquido) — 81 toneladas de empuje. La combustión conquista el espacio.</div></div></div>
        </div>`}
    ]},

    hidrogeno:{tag:'Futuro · Energía limpia',title:'Hidrógeno Verde',tabs:[
      {id:'concepto',label:'Concepto',html:`
        <div class="mstats">
          <div class="mstat"><div class="ms-l">Electrólisis verde</div><div class="ms-v">H₂O + electricidad → H₂ + ½O₂</div></div>
          <div class="mstat"><div class="ms-l">Eficiencia electrolizador</div><div class="ms-v">65–80 <span class="ms-u">%</span></div></div>
          <div class="mstat"><div class="ms-l">Poder calorífico</div><div class="ms-v">142 <span class="ms-u">MJ/kg</span></div></div>
          <div class="mstat"><div class="ms-l">Combustión</div><div class="ms-v">2H₂ + O₂ → 2H₂O <span class="ms-u">cero CO₂</span></div></div>
        </div>
        <p class="mdesc">El hidrógeno verde se produce electrolizando agua con electricidad renovable. No emite CO₂ al quemar — solo agua. Es el candidato para descarbonizar industrias donde electrificar directamente es difícil: acero (DRI), cemento, aviación de largo alcance, barcos. Chile y Australia tienen los mejores recursos renovables para producirlo.</p>`},
      {id:'desafios',label:'Desafíos',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Eficiencia (producción)</span><div class="cbar-track"><div class="cbar-fill" style="width:75%;background:#38bdf8"></div></div><span class="cbar-val">~75%</span></div>
          <div class="cbar"><span class="cbar-label">Eficiencia (licuefacción)</span><div class="cbar-track"><div class="cbar-fill" style="width:30%;background:#60a5fa"></div></div><span class="cbar-val">~30%</span></div>
          <div class="cbar"><span class="cbar-label">Eficiencia (pila H₂)</span><div class="cbar-track"><div class="cbar-fill" style="width:60%;background:#4ade80"></div></div><span class="cbar-val">~60%</span></div>
          <div class="cbar"><span class="cbar-label">Eficiencia total (P2P)</span><div class="cbar-track"><div class="cbar-fill" style="width:35%;background:#fbbf24"></div></div><span class="cbar-val">~35%</span></div>
        </div>
        <p class="mdesc">El mayor desafío del H₂ es el almacenamiento: debe comprimirse a 700 bar o licuarse a −253°C para alcanzar densidades energéticas volumétricas aceptables. La cadena power-to-power (electricidad → H₂ → pila de combustible → electricidad) tiene una eficiencia del 35% — peor que baterías (~90%), pero el H₂ puede almacenarse indefinidamente.</p>`}
    ]},

    emisiones:{tag:'Medio Ambiente · Impacto',title:'Impacto Ambiental',tabs:[
      {id:'crisis',label:'Crisis climática',html:`
        <div class="crisis-grid">
          <div class="crisis-card"><div class="crisis-n">423</div><div class="crisis-l">ppm CO₂ en 2024 (récord histórico)</div></div>
          <div class="crisis-card"><div class="crisis-n">+1.3°C</div><div class="crisis-l">temperatura media global sobre era preindustrial</div></div>
          <div class="crisis-card"><div class="crisis-n" style="color:#f87171">37 Gt</div><div class="crisis-l">CO₂ emitido por combustión en 2023</div></div>
          <div class="crisis-card"><div class="crisis-n" style="color:#f87171">80%</div><div class="crisis-l">de la energía primaria mundial viene de combustibles fósiles</div></div>
        </div>
        <p class="mdesc">La combustión de carbón, petróleo y gas es responsable del 80% de las emisiones de CO₂ globales. El carbón emite 820 g CO₂/kWh; el gas natural 490 g CO₂/kWh; la eólica 11 g CO₂/kWh (fabricación incluida). La transición energética requiere reemplazar ~15 TW de capacidad instalada en fósiles.</p>`},
      {id:'sectores',label:'Emisiones por sector',html:`
        <div class="cmp-bars">
          <div class="cbar"><span class="cbar-label">Generación eléctrica</span><div class="cbar-track"><div class="cbar-fill" style="width:100%;background:#ef4444"></div></div><span class="cbar-val">34%</span></div>
          <div class="cbar"><span class="cbar-label">Transporte</span><div class="cbar-track"><div class="cbar-fill" style="width:62%;background:#f97316"></div></div><span class="cbar-val">21%</span></div>
          <div class="cbar"><span class="cbar-label">Industria (proceso)</span><div class="cbar-track"><div class="cbar-fill" style="width:56%;background:#fbbf24"></div></div><span class="cbar-val">19%</span></div>
          <div class="cbar"><span class="cbar-label">Calefacción edificios</span><div class="cbar-track"><div class="cbar-fill" style="width:29%;background:#94a3b8"></div></div><span class="cbar-val">10%</span></div>
          <div class="cbar"><span class="cbar-label">Agricultura</span><div class="cbar-track"><div class="cbar-fill" style="width:26%;background:#86efac"></div></div><span class="cbar-val">9%</span></div>
        </div>`}
    ]},

    eficiencia:{tag:'Ingeniería · Mejoras tecnológicas',title:'Fronteras de Eficiencia',tabs:[
      {id:'tecnologias',label:'Tecnologías actuales',html:`
        <div class="timeline">
          <div class="tl-item"><div class="tl-yr">HCCI</div><div><div class="tl-t">Encendido por compresión homogéneo</div><div class="tl-d">Combina lo mejor de Otto (gasolina) y Diesel (compresión). La mezcla se enciende sola uniformemente. Eficiencia 40%+ — pero difícil de controlar en todo el rango de operación.</div></div></div>
          <div class="tl-item"><div class="tl-yr">Miller/Atkinson</div><div><div class="tl-t">Ciclos de expansión prolongada</div><div class="tl-d">La válvula de admisión se cierra tarde o temprano para reducir la compresión efectiva. Más eficiente que Otto; usado en motores híbridos Toyota (Prius).</div></div></div>
          <div class="tl-item"><div class="tl-yr">Recuperación de calor</div><div><div class="tl-t">WHR (Waste Heat Recovery)</div><div class="tl-d">El escape caliente (300–500°C) genera vapor para una turbina secundaria de Rankine. Mejora la eficiencia neta del motor en 5–8 puntos.</div></div></div>
          <div class="tl-item"><div class="tl-yr">GDCI</div><div><div class="tl-t">Inyección de carga estratificada</div><div class="tl-d">Gasolina directa con mezcla ultra-pobre y autoignición. η ~47% — récord para motor de gasolina. En investigación activa (Delphi, 2015–).</div></div></div>
        </div>`}
    ]}

  }
};
