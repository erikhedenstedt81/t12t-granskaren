/**
 * DIGG Tillsynsmanual – WCAG 2.2-metodologi för svenska tillgänglighetsgranskning.
 * Kategorier och metoder baserade på DIGG:s tillsynsmanual:
 * https://www.digg.se/kunskap-och-stod/digital-tillganglighet/tillsynsmanual-for-granskning-av-webbsidor
 */

// ─── EN 301 549-kriterier som inte ingår i wcag22.js ─────────────────────────
// Används av GuidedAuditView för uppslag på kriterier utanför WCAG 2.2

export const DIGG_EXTRA_CRITERIA = [
  { id: '12.1.1', name: 'Accessibility and compatibility features', nameSwedish: 'Dokumentation av tillgänglighetsfunktioner', level: 'AA' },
  { id: '12.1.2', name: 'Accessible documentation',               nameSwedish: 'Tillgänglig produktdokumentation',           level: 'AA' },
  { id: '12.2.2', name: 'Information on accessibility features',   nameSwedish: 'Support för tillgänglighetsfunktioner',      level: 'AA' },
  { id: '12.2.3', name: 'Effective communication',                 nameSwedish: 'Effektiv supportkommunikation',              level: 'AA' },
  { id: '12.2.4', name: 'Accessible documentation (support)',      nameSwedish: 'Tillgänglig supportdokumentation',           level: 'AA' },
]

// ─── Kategorier i DIGG:s ordning ──────────────────────────────────────────────

export const DIGG_CATEGORIES = [
  {
    id: 'storande',
    label: 'Störande',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['1.4.2', '2.2.2', '2.3.1'],
  },
  {
    id: 'innehall',
    label: 'Innehåll',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['2.4.2', '3.1.1', '2.2.1', '1.4.1', '1.3.1', '2.4.4', '3.1.2', '2.4.6', '1.4.3', '1.3.3'],
  },
  {
    id: 'tangentbord',
    label: 'Tangentbord',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['2.4.3', '2.4.7', '1.4.11', '3.2.1', '1.4.13', '2.4.1', '2.1.1', '2.1.2', '2.1.4'],
  },
  {
    id: 'layout',
    label: 'Layout',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['1.4.10', '1.4.12', '1.4.4'],
  },
  {
    id: 'generella',
    label: 'Generella krav',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['4.1.3', '1.3.2', '3.2.3', '3.2.4', '2.4.5', '2.5.2'],
  },
  {
    id: 'bilder',
    label: 'Bilder',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['1.4.5', '1.1.1'],
  },
  {
    id: 'ui',
    label: 'Användargränssnitt',
    conditional: false,
    conditionKeys: [],
    criteriaIds: ['3.3.2', '4.1.2', '2.5.3', '1.3.5', '3.2.2', '3.3.1', '3.3.3', '3.3.4'],
  },
  {
    id: 'media',
    label: 'Ljud och video',
    conditional: true,
    conditionKeys: ['video', 'audio', 'liveMedia'],
    criteriaIds: ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5'],
  },
  {
    id: 'touch',
    label: 'Touchskärmar',
    conditional: true,
    conditionKeys: ['touch'],
    criteriaIds: ['2.5.1', '2.5.4', '1.3.4'],
  },
  {
    id: 'docs',
    label: 'Dokumentation och support',
    conditional: true,
    conditionKeys: ['docs', 'support'],
    criteriaIds: ['12.1.1', '12.1.2', '12.2.2', '12.2.3', '12.2.4'],
  },
]

/**
 * Returnerar en deduplicerad, ordnad lista av alla kriterier (första förekomst gäller).
 */
export function getDiggCriteriaOrder() {
  const seen = new Set()
  const result = []
  for (const cat of DIGG_CATEGORIES) {
    for (const id of cat.criteriaIds) {
      if (!seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
  }
  return result
}

// ─── Audit-data per kriterium ─────────────────────────────────────────────────

export const DIGG_AUDIT_DATA = {

  // ════════════════════════════════════════════════════════
  // STÖRANDE
  // ════════════════════════════════════════════════════════

  '1.4.2': {
    method: [
      'Ladda eller ladda om sidan och lyssna efter innehåll som spelas upp automatiskt.',
      'Kontrollera om ljud spelas upp automatiskt och om det varar längre än 3 sekunder.',
      'Sök efter kontroller för att pausa, stoppa eller justera volymen på eventuellt automatiskt ljud.',
    ],
    exceptions: [],
    controls: [
      'Om ljud spelas upp automatiskt och varar ≥ 3 sek: det går att pausa eller stoppa',
      'Om ljud spelas upp automatiskt: volymen går att sänka separat från systemvolymen',
    ],
  },

  '2.2.2': {
    method: [
      'Ladda eller uppdatera sidan och observera allt innehåll som förflyttar sig, blinkar eller scrollar automatiskt.',
      'Mät (ungefärligt) hur länge rörelsen varar.',
      'Sök efter kontroller för att pausa, stoppa eller dölja rörelsen.',
    ],
    exceptions: [
      'Förloppsindikator eller laddningsindikator som inte kan pausas.',
    ],
    controls: [
      'Rörligt innehåll > 5 sek: det går att pausa, stoppa eller dölja rörelsen',
      'Blinkande innehåll > 5 sek: det går att pausa, stoppa eller dölja blinkningarna',
      'Automatisk scrollning > 5 sek: går att pausa, stoppa eller dölja',
      'Automatiskt uppdaterat innehåll: det går att pausa, stoppa eller dölja',
    ],
  },

  '2.3.1': {
    method: [
      'Ladda eller uppdatera sidan och observera innehåll som flimrar eller blinkar snabbt.',
      'Kontrollera om flimret överstiger 3 gånger per sekund på en yta som överstiger tröskelvärdena.',
      'Använd Photosensitive Epilepsy Analysis Tool (PEAT) eller Harding Test vid behov.',
    ],
    exceptions: [
      'Flimmer som understiger de allmänna tröskelvärdena eller tröskeln för rött.',
    ],
    controls: [
      'Inget innehåll flimrar mer än 3 gånger per sekund',
      'Flimrande yta överstiger inte tröskelvärdena (luminans och rött)',
    ],
  },

  // ════════════════════════════════════════════════════════
  // INNEHÅLL
  // ════════════════════════════════════════════════════════

  '2.4.2': {
    method: [
      'Håll muspekaren över webbläsarfliken för att se sidtiteln som tooltip.',
      'Inspektera källkoden – kontrollera <title>-elementet i <head>.',
      'För single-page-applikationer: navigera mellan sektioner och kontrollera om titeln uppdateras dynamiskt.',
    ],
    exceptions: [],
    controls: [
      'Sidan har ett <title>-element',
      'Titeln beskriver sidans ämne eller syfte',
      'Titeln skiljer sig tydligt från andra sidor på webbplatsen',
      'För SPA: titeln uppdateras dynamiskt för att spegla aktuellt innehåll',
    ],
  },

  '3.1.1': {
    method: [
      'Använd WAVE-verktyget som visar sidans språkkod längst upp.',
      'Inspektera källkoden – kontrollera lang-attributet på <html>-elementet.',
      'Verifiera att språkkoden stämmer med sidans faktiska innehållsspråk.',
    ],
    exceptions: [],
    controls: [
      'Sidans <html>-element har ett lang-attribut',
      'Språkkoden är giltig (t.ex. lang="sv" för svenska)',
      'Språkkoden stämmer med sidans faktiska innehållsspråk',
    ],
  },

  '2.2.1': {
    method: [
      'Kontrollera om sidan laddar om automatiskt eller omdirigerar med fördröjning.',
      'Använd Nätverksfliken i Inspektören för att identifiera automatisk uppdatering.',
      'Lämna ett formulär öppet en längre stund och kontrollera om en tidsgräns aktiverats.',
      'Kontrollera om det finns mekanismer för att stänga av, justera eller förlänga tidsgränsen.',
    ],
    exceptions: [
      'Realtidshändelser där tidsgränsen är nödvändig (t.ex. auktioner).',
      'Tidsbegränsningar där förlängning skulle förfela syftet (t.ex. provtentamen).',
      'Tidsgräns längre än 20 timmar.',
    ],
    controls: [
      'Sidan laddar inte om automatiskt utan möjlighet att stänga av',
      'Ingen automatisk omdirigering med fördröjning utan kontroll',
      'Tidsgränser: möjlighet att stänga av, justera (10×) eller förlänga (20 sek varning)',
    ],
  },

  '1.4.1': {
    method: [
      'Granska sidan visuellt och identifiera information som enbart förmedlas med färg.',
      'Vanliga problemfall: obligatoriska fält enbart markerade med röd text, aktiva flikar enbart med bakgrundsfärg, felmeddelanden enbart i rött.',
      'Kontrollera att ytterligare visuell signal finns (ikon, understrykning, mönster, text).',
    ],
    exceptions: [],
    controls: [
      'Obligatoriska fält markeras inte enbart med färg (t.ex. används asterisk eller text)',
      'Felmeddelanden och varningar har ytterligare visuell signal utöver färg',
      'Aktiva/inaktiva tillstånd kommuniceras utan att enbart förlita sig på färg',
      'Diagram och grafer använder inte enbart färg för att särskilja dataserier',
    ],
  },

  '1.3.1': {
    method: [
      'Aktivera en skärmläsare (NVDA+Chrome eller VoiceOver+Safari) och navigera igenom sidans struktur.',
      'Kontrollera rubriker: tryck H-tangenten i NVDA/JAWS och verifiera att rubrikhierarkin är logisk.',
      'Klicka på formuläretiketter – korrekt kopplade etiketter markerar eller ger fokus till tillhörande fält.',
      'Kontrollera listor: visuella listor ska vara uppmärkta med ul/ol/dl, inte enbart div-element.',
      'Inspektera tabeller: datatabeller ska ha th-element med scope-attribut.',
      'Verifiera landmärken: header, nav, main, footer ska vara semantiskt korrekt uppmärkta.',
    ],
    exceptions: [
      'Presentationslayouter ska märkas med role="presentation" eller role="none".',
    ],
    controls: [
      'Landmärken: header, nav, main, footer är korrekt uppmärkta',
      'Rubriker: h1–h6 används i korrekt hierarkisk ordning, inga nivåer hoppas över',
      'Listor: ul/ol/dl används för faktiska listor',
      'Tabeller: th-element och scope-attribut på rubrikceller',
      'Datatabeller har caption eller aria-label',
      'Formuläretiketter är kopplat till tillhörande fält via for/id',
      'Information via färg, form eller stil är också maskinläsbar',
    ],
  },

  '2.4.4': {
    method: [
      'Aktivera skärmläsare och öppna linklista (Insert+F7 i NVDA). Kontrollera att länktexterna är begripliga utan omgivande kontext.',
      'Navigera med tangentbord till alla länkar och kontrollera att syftet framgår.',
      'Vanliga problem: "Läs mer", "Klicka här", "Här", "Se även" utan omgivande kontext.',
      'För bildlänkar: kontrollera att alt-texten beskriver länkens destination/syfte.',
    ],
    exceptions: [
      'Om länkens syfte är genuint oklart även för seende användare, utan omgivande kontext.',
    ],
    controls: [
      'Länktextens syfte framgår utan att omgivande kontext behövs',
      'Inga generiska länktexter som "Läs mer", "Klicka här" utan tillräcklig kontext',
      'Bildlänkar: alt-texten beskriver länkens destination eller syfte',
      'Kombinerade bild-text-länkar: sammanlagd text (inkl. alt) är tillräcklig',
    ],
  },

  '3.1.2': {
    method: [
      'Identifiera textstycken på ett annat språk än sidans huvudspråk.',
      'Inspektera dessa element i källkoden och kontrollera att lang-attribut är angivet.',
      'Verifiera att språkkoderna är giltiga BCP-47-koder.',
    ],
    exceptions: [
      'Egennamn (personnamn, ortnamn).',
      'Tekniska termer utan etablerat modersmålsord.',
      'Ord som är integrerade i det omgivande textspråket (lånord).',
    ],
    controls: [
      'Textstycken på annat språk har lang-attribut på elementet',
      'Språkkoder är giltiga (t.ex. lang="en" för engelska)',
      'Koden stämmer med det markerade textavsnittet',
    ],
  },

  '2.4.6': {
    method: [
      'Granska alla rubriker och kontrollera att de beskriver det efterföljande innehållets ämne.',
      'Granska alla formuläretiketter och kontrollera att de koncist beskriver vad man förväntas fylla i.',
      'Aktivera WAVE-verktyget för att visualisera rubrikstruktur.',
    ],
    exceptions: [],
    controls: [
      'Alla rubriker beskriver ämnet eller syftet med efterföljande innehåll',
      'Alla formuläretiketter beskriver vad fältet avser',
      'Inga tomma rubriker eller etiketter',
    ],
  },

  '1.4.3': {
    method: [
      'Identifiera text på sidan och mät kontrasten mot bakgrundsfärgen med ett kontrastverktyg (t.ex. Colour Contrast Analyser).',
      'Kontrollera text i alla tillstånd: normal, hover, fokus.',
      'Mät platshållartext (placeholder) i formulärfält separat.',
      'Kontrollera text i knappar, flikar och navigeringselement.',
    ],
    exceptions: [
      'Logotyper och varumärkestext.',
      'Dekorativ text som inte förmedlar information.',
      'Inaktiverade komponenter (disabled).',
    ],
    controls: [
      'Stor text ≥ 18pt (24px) eller 14pt (19px) fet: kontrast minst 3:1',
      'Övrig brödtext och UI-text: kontrast minst 4,5:1',
      'Platshållartext i formulärfält: kontrast minst 4,5:1',
      'Text i knappar och interaktiva element uppfyller kontrastkraven',
    ],
  },

  '1.3.3': {
    method: [
      'Sök igenom sidans instruktionstexter efter formuleringar som refererar till sensoriska egenskaper.',
      'Vanliga problemfall: "Klicka på den gröna knappen", "Se formuläret till höger", "Den runda knappen".',
      'Kontrollera om information kan tolkas utan att se, höra eller uppfatta form/färg/position.',
    ],
    exceptions: [],
    controls: [
      'Instruktioner refererar inte enbart till form, färg, storlek eller placering',
      'Instruktioner refererar inte enbart till ljud eller auditiv information',
      'Innehåll är begripligt utan visuell kontext',
    ],
  },

  // ════════════════════════════════════════════════════════
  // TANGENTBORD
  // ════════════════════════════════════════════════════════

  '2.4.3': {
    method: [
      'Navigera igenom alla fokusbara element med Tab-tangenten och notera fokusordningen.',
      'Aktivera funktioner som öppnar menyer, modaler eller dropdowns.',
      'Kontrollera att fokus förflyttas automatiskt till det öppnade elementet.',
      'Kontrollera att fokus återgår till det aktiverande elementet när dialogen/menyn stängs.',
      'Kontrollera att fokusordningen är logisk i relation till sidans visuella ordning.',
    ],
    exceptions: [],
    controls: [
      'Fokusordningen följer en logisk ordning som inte försvårar förståelse',
      'Fokus förflyttas automatiskt till öppnad meny/modal',
      'Fokus återgår korrekt till aktiverande element när dialog stängs',
      'Fokus hamnar inte på ett oförväntat ställe efter interaktion',
    ],
  },

  '2.4.7': {
    method: [
      'Koppla bort musen och navigera igenom alla fokusbara element med Tab-tangenten.',
      'Observera om varje element har en tydlig synlig fokusmarkering.',
      'Inspektera CSS-kod för avsiktlig doldhet (outline: none utan alternativ).',
    ],
    exceptions: [
      'Tillåtet att dölja fokus tills tangentbordet börjar användas.',
    ],
    controls: [
      'Alla fokusbara element har en synlig fokusmarkering',
      'Ingen fokusmarkering är dold med outline: none utan alternativ',
      'Fokusindikatorn är tydlig och urskiljer sig från bakgrunden',
    ],
  },

  '1.4.11': {
    method: [
      'Navigera igenom fokusbara element med tangentbord och kontrollera fokusmarkeringarnas kontrast.',
      'Aktivera interaktiva komponenter (knappar, kryssrutor, radioknappar, dropdown) och mät kontrasten.',
      'Mät kontrasten för formulärfälts kantlinjer mot bakgrunden.',
      'Kontrollera ikoner som förmedlar information.',
    ],
    exceptions: [
      'Komponenter vars utseende kontrolleras av webbläsaren, ej påverkade av CSS.',
      'Dekorativa grafiska element.',
      'Logotyper.',
    ],
    controls: [
      'Fokusmarkeringar: kontrast minst 3:1 mot intilliggande färger',
      'Aktiva komponenter med visuell indikering: kontrast minst 3:1',
      'Formulärfälts kantlinjer: kontrast minst 3:1 mot bakgrunden',
      'Informationsbärande ikoner: kontrast minst 3:1 mot intilliggande färger',
    ],
  },

  '3.2.1': {
    method: [
      'Navigera igenom alla fokusbara element med tangentbord.',
      'Klicka med mus på fokusbara element (exklusive avsedda knappar/länkar) och kontrollera att ingen oväntad kontextändring sker.',
      'Kontrollera dropdown-menyer, datumväljare och liknande – de ska inte navigera bort vid enbart fokusering.',
    ],
    exceptions: [],
    controls: [
      'Ingen kontextändring (sidnavigering, formulärinlämning etc.) sker vid enbart fokusering',
      'Dropdown-menyer öppnar inte en ny sida vid enbart fokus',
    ],
  },

  '1.4.13': {
    method: [
      'Navigera med tangentbord till element som visar tooltip, dropdown eller popup vid fokus.',
      'Kontrollera om det går att dölja innehållet utan att förflytta fokus (t.ex. med Escape).',
      'Testa med musen att hovra och sedan flytta pekaren till det uppdykande innehållet.',
      'Kontrollera att innehållet kvarstår tills användaren aktivt döljer det.',
      'Testa vid 200% zoom att uppdykande innehåll inte döljs.',
    ],
    exceptions: [
      'Innehåll som kontrolleras av webbläsaren, t.ex. title-attribut-tooltips.',
    ],
    controls: [
      'Uppdykande innehåll kan döljas med Escape utan att fokus förflyttas',
      'Pekaren kan föras till uppdykande innehåll utan att det försvinner',
      'Innehållet kvarstår tills fokus/pekare förflyttas, användaren döljer det, eller det blir irrelevant',
    ],
  },

  '2.4.1': {
    method: [
      'Ladda sidan och tryck Tab direkt – kontrollera om den första fokuserbara länken är en "Hoppa till innehållet"-länk.',
      'Aktivera länken och verifiera att fokus förflyttas till huvudinnehållet (main).',
      'Kontrollera om korrekta landmärken (header, nav, main) finns som alternativ till skipplänk.',
    ],
    exceptions: [],
    controls: [
      'Det finns en "Hoppa till innehållet"-länk synlig vid tangentbordsfokus',
      'Skipplänken fungerar och tar användaren till huvudinnehållet',
      'Återkommande navigeringsblock kan förbigås',
    ],
  },

  '2.1.1': {
    method: [
      'Koppla bort musen och försök använda alla funktioner enbart med tangentbord.',
      'Kontrollera att alla knappar, länkar, formulärfält, menyer och modaler kan nås och aktiveras.',
      'Kontrollera att anpassade widgets (carousel, accordion, tabs, datepicker) har tangentbordsstöd.',
      'Kontrollera att ingen funktion kräver specifik timing (snabba tangenttryckningar).',
    ],
    exceptions: [
      'Funktioner som kräver en specifik rörelseväg (t.ex. frihand-ritning).',
    ],
    controls: [
      'Alla funktioner är tillgängliga via tangentbord',
      'Alla interaktiva element kan aktiveras med Enter och/eller Mellanslag',
      'Anpassade widgets har korrekt tangentbordsinteraktion (piltangenter i menyer, Escape för att stänga)',
      'Ingen funktion kräver att tangenter hålls ned under längre tid',
    ],
  },

  '2.1.2': {
    method: [
      'Navigera igenom alla fokusbara element och aktivera visa/dölj-funktioner.',
      'Kontrollera att fokus alltid kan lämna ett element med Tab, Shift+Tab eller Escape.',
      'Testa modaler, menyer och dropdowns specifikt – fokus ska aldrig fastna.',
    ],
    exceptions: [],
    controls: [
      'Fokus kan lämna varje komponent med tangentbord',
      'Inga tangentbordsfällor förekommer',
      'Om alternativa tangenter krävs: tydlig information ges om navigationssättet',
    ],
  },

  '2.1.4': {
    method: [
      'Tryck alla teckengenererande tangenter (bokstäver, siffror, specialtecken) individuellt.',
      'Kontrollera om de aktiverar funktioner utan att en modifierartangent (Ctrl, Alt, Shift, Cmd) används.',
    ],
    exceptions: [],
    controls: [
      'Enknapps snabbtangenter (utan modifierartangent) kan stängas av av användaren',
      'Enknapps snabbtangenter kan ommappas med modifierartangent, ELLER',
      'Snabbtangenten är enbart aktiv när komponenten har fokus',
    ],
  },

  // ════════════════════════════════════════════════════════
  // LAYOUT
  // ════════════════════════════════════════════════════════

  '1.4.10': {
    method: [
      'Metod 1: Zooma webbläsaren till 400% (Ctrl++) och kontrollera att allt innehåll fortfarande är tillgängligt utan horisontell scrollning.',
      'Metod 2: Öppna responsiv designvy i DevTools (Ctrl+Shift+M), sätt bredden till 320px och kontrollera layouten.',
      'Identifiera om någon information eller funktion försvinner eller kräver tvåriktad scrollning.',
    ],
    exceptions: [
      'Tvådimensionell scrollning är acceptabel för innehåll som kräver det: bilder, diagram, tabeller, kartor, spel, videor.',
    ],
    controls: [
      'Ingen information eller funktion försvinner vid 320px bredd/400% zoom',
      'Ingen tvåriktad scrollning krävs vid 320px (utom för specifikt undantaget innehåll)',
      'Alla funktioner är tillgängliga vid smal layout',
    ],
  },

  '1.4.12': {
    method: [
      'Använd Text Spacing-bookmarklet eller webbplatsens egna inställningar för textavstånd.',
      'Sätt: radavstånd till 1,5×, styckeavstånd till 2×, ordavstånd till 0,16em, teckenavstånd till 0,12em.',
      'Kontrollera att inget textinnehåll klipps bort, överlappar, eller att funktioner slutar fungera.',
    ],
    exceptions: [
      'Textinnehåll vars språk inte stöder de specificerade textavståndsegenskaperna.',
    ],
    controls: [
      'Textinnehåll klipps inte bort vid utökat radavstånd (1,5×)',
      'Textinnehåll klipps inte bort vid utökat styckeavstånd (2×)',
      'Textinnehåll klipps inte bort vid utökat ordavstånd (0,16em)',
      'Textinnehåll klipps inte bort vid utökat teckenavstånd (0,12em)',
      'Alla funktioner fungerar med kombinerade textavståndsändringar',
    ],
  },

  '1.4.4': {
    method: [
      'Öppna sidan och zooma webbläsaren till 200% (Ctrl++).',
      'Kontrollera att all text förstoras och att inget innehåll klipps bort eller överlappar.',
      'Kontrollera att alla funktioner fortfarande är tillgängliga vid 200% zoom.',
      'Kontrollera att ingen text renderas som bild (bilder skalas inte som text).',
    ],
    exceptions: [
      'Textning i videor.',
      'Logotyper och varumärkestext.',
    ],
    controls: [
      'All text kan förstoras till 200% via webbläsarzoom utan förlust av innehåll',
      'Ingen funktion går förlorad vid 200% zoom',
      'Text i knappar och formulärfält förstoras korrekt',
      'Inga element täcker varandra eller klipps vid 200% zoom',
    ],
  },

  // ════════════════════════════════════════════════════════
  // GENERELLA KRAV
  // ════════════════════════════════════════════════════════

  '4.1.3': {
    method: [
      'Metod 1: Aktivera en skärmläsare och utlös statusmeddelanden (bekräftelser, felmeddelanden, laddningsstatus). Verifiera att meddelanden läses upp utan att fokus förflyttas.',
      'Metod 2: Inspektera behållarens roll i DevTools – kontrollera om role="status", role="alert", role="alertdialog" eller aria-live används.',
    ],
    exceptions: [],
    controls: [
      'Statusmeddelanden (t.ex. "Formuläret skickades") annonseras av hjälpmedel utan fokusförflyttning',
      'Felmeddelanden har role="alert" eller likvärdig live-region',
      'Icke-kritiska statusmeddelanden har role="status" eller aria-live="polite"',
      'Laddningsindikatorer kommuniceras programmatiskt till hjälpmedel',
    ],
  },

  '1.3.2': {
    method: [
      'Metod 1: Öppna sidan i två fönster och stäng av CSS i ett (Web Developer > CSS > Disable). Jämför innehållsordningen.',
      'Metod 2: Aktivera skärmläsare och navigera med piltangenter. Kontrollera att innehållet presenteras i en begriplig ordning.',
    ],
    exceptions: [],
    controls: [
      'Innehållet presenteras i en meningsfull ordning utan CSS',
      'DOM-ordningen matchar den logiska och visuella ordningen',
      'Skärmläsaren läser innehållet i en begriplig sekvens',
    ],
  },

  '3.2.3': {
    method: [
      'Jämför navigeringsmenyer och deras ordning på minst två sidor inom webbplatsen.',
      'Kontrollera att navigeringsfunktioner förekommer i samma inbördes ordning på alla sidor.',
    ],
    exceptions: [
      'Tillåtet om användaren själv kan ändra ordningen.',
    ],
    controls: [
      'Navigeringsfunktioner förekommer i konsekvent ordning på alla sidor',
      'Interna länkars ordning är konsekvent inom varje navigeringsfunktion',
    ],
  },

  '3.2.4': {
    method: [
      'Jämför ikoner, etiketter och komponenter med samma funktion på minst två sidor.',
      'Kontrollera att samma funktion har samma namn och textalternativ på alla sidor.',
    ],
    exceptions: [
      'Pagineringslänkar kan ha olika mål men samma semantiska innebörd.',
    ],
    controls: [
      'Identiska ikoner har samma namn och textalternativ på alla sidor',
      'Samma länktext leder konsekvent till samma mål',
      'Komponenter med samma funktion är konsekvent benämnda',
    ],
  },

  '2.4.5': {
    method: [
      'Kontrollera om webbplatsen har mer än en sida.',
      'Identifiera om det finns minst två sätt att navigera till aktuell sida (t.ex. navigeringsmeny + sökfunktion, eller sitemap + navigering).',
    ],
    exceptions: [
      'Sidor som utgör ett steg i eller resultat av en process.',
    ],
    controls: [
      'Det finns minst två sätt att hitta sidan på webbplatsen',
      'T.ex. navigeringsmeny, sökfunktion, webbplatskarta, relaterade länkar',
    ],
  },

  '2.5.2': {
    method: [
      'Metod 1: Tryck ned musknapp över ett klickbart element, flytta bort pekaren och släpp utanför – funktionen ska inte aktiveras.',
      'Metod 2: För dra-och-släpp: börja dra, återvänd till startläget och släpp – åtgärden ska inte slutföras.',
    ],
    exceptions: [
      'Om det är nödvändigt att åtgärden sker vid nedtryckning (t.ex. pianotangenter i realtid).',
    ],
    controls: [
      'Enkeltrycks-funktioner aktiveras inte vid nedtryckning (utan vid uppgång)',
      'Åtgärden kan avbrytas genom att flytta pekaren från elementet innan uppgång',
      'Dra-och-släpp: kan avbrytas eller ångras',
    ],
  },

  // ════════════════════════════════════════════════════════
  // BILDER
  // ════════════════════════════════════════════════════════

  '1.4.5': {
    method: [
      'Identifiera alla textliknande element på sidan.',
      'Kontrollera om dessa är kodade som faktisk text eller renderas som bilder.',
      'Använd Web Developer-tillägget för att dölja bilder och se om textinnehåll försvinner.',
    ],
    exceptions: [
      'Anpassningsbara textbilder (om användaren kan anpassa teckensnitt och färg).',
      'Logotyper och varumärkestext.',
      'Skärmbilder och dokument som visar text i sitt visuella sammanhang.',
    ],
    controls: [
      'Text presenteras som riktig text, inte som bild av text',
      'Om bilder av text används: användaren kan anpassa utseendet (teckensnitt, färg, storlek)',
    ],
  },

  '1.1.1': {
    method: [
      'Aktivera skärmläsare och navigera till alla bilder med Tab- och piltangenter.',
      'Kontrollera alt-attributet för alla <img>-element i källkoden.',
      'Kontrollera att informationsbärande bilder har meningsfull alt-text.',
      'Kontrollera att dekorativa bilder har alt="" eller role="presentation".',
      'Kontrollera att knappar och ikoner utan synlig text har aria-label eller aria-labelledby.',
    ],
    exceptions: [
      'Dekorativa bilder med alt="" behöver ingen beskrivning.',
      'CAPTCHA om ett alternativt tillgängligt CAPTCHA erbjuds.',
    ],
    controls: [
      'Informationsbärande bilder har meningsfull alt-text som förmedlar samma info',
      'Dekorativa bilder har alt="" eller role="presentation"',
      'Knappar med enbart ikoner har aria-label eller synlig text',
      'Bilder av text har alt-text som innehåller exakt den text som visas',
      'Komplexa bilder (diagram, grafer) har utökad beskrivning',
    ],
  },

  // ════════════════════════════════════════════════════════
  // ANVÄNDARGRÄNSSNITT
  // ════════════════════════════════════════════════════════

  '3.3.2': {
    method: [
      'Granska alla formulärfält och kontrollera att synliga etiketter eller instruktioner finns.',
      'Kontrollera att det framgår vilka fält som är obligatoriska.',
      'Kontrollera att formatkrav (t.ex. datumformat, telefonnummer) förklaras före fältet.',
    ],
    exceptions: [
      'Om syftet är uppenbart för seende behövs ingen synlig etikett, men dold etikett (aria-label) krävs för hjälpmedel.',
    ],
    controls: [
      'Synliga etiketter finns för alla inmatningsfält',
      'Det framgår tydligt vilka fält som är obligatoriska',
      'Formatkrav förklaras i förväg (t.ex. "ÅÅÅÅ-MM-DD")',
      'Instruktioner är tillgängliga för hjälpmedel via label, aria-label eller aria-describedby',
    ],
  },

  '4.1.2': {
    method: [
      'Öppna DevTools Accessibility-panel och inspektera alla interaktiva komponenter.',
      'Kontrollera att varje komponent har: roll, tillgängligt namn och korrekt tillstånd.',
      'Aktivera skärmläsare och interagera med anpassade widgets (accordion, tabs, kombobox).',
      'Kontrollera att tillståndsändringar kommuniceras (aria-expanded, aria-checked, aria-selected).',
    ],
    exceptions: [],
    controls: [
      'Alla interaktiva komponenter har en korrekt roll',
      'Alla komponenter har ett maskinläsbart tillgängligt namn',
      'Tillstånd och värden är maskinläsbara (aria-expanded, aria-checked, value)',
      'Anpassade widgets följer ARIA Authoring Practices Guide',
    ],
  },

  '2.5.3': {
    method: [
      'Identifiera alla interaktiva element med synlig text (knappar, länkar).',
      'Jämför den synliga texten med det maskinläsbara namnet i DevTools Accessibility-panel.',
      'Det maskinläsbara namnet ska innehålla (inkludera) den synliga texttexten.',
    ],
    exceptions: [
      'Tecken som används symboliskt (t.ex. "X" för "Stäng").',
    ],
    controls: [
      'Det maskinläsbara (tillgängliga) namnet innehåller den synliga texten på komponenten',
      'aria-label ersätter inte, utan inkluderar, den synliga texten',
    ],
  },

  '1.3.5': {
    method: [
      'Identifiera formulärfält som samlar in personuppgifter (namn, e-post, adress, telefon, betalkort).',
      'Inspektera autocomplete-attributet i källkoden.',
      'Verifiera att autocomplete-värdena matchar fältets faktiska syfte.',
    ],
    exceptions: [
      'Fält som av säkerhetsskäl bör hindra automatisk ifyllning.',
    ],
    controls: [
      'Namnfält har autocomplete="name" eller specificerade namnvärden',
      'E-postfält har autocomplete="email"',
      'Telefonfält har autocomplete="tel"',
      'Adressfält har korrekt autocomplete-värde (street-address, postal-code m.fl.)',
    ],
  },

  '3.2.2': {
    method: [
      'Skriv text i formulärfält och observera om kontextändring sker automatiskt.',
      'Markera och avmarkera kryssrutor, välj i dropdown-listor.',
      'Kontrollera att ingen automatisk navigering eller formulärinlämning sker vid inmatning.',
    ],
    exceptions: [
      'Om användaren tydligt informerats om beteendet innan.',
    ],
    controls: [
      'Ingen kontextändring sker vid värdeändring i formulärfält',
      'Dropdown-listor navigerar inte automatiskt till ny sida vid val',
      'Kryssrutor och radioknappar orsakar inte oväntad kontextändring',
    ],
  },

  '3.3.1': {
    method: [
      'Lämna obligatoriska fält tomma och skicka formuläret.',
      'Ange felaktigt formaterade värden: felaktig e-post (utan @), ogiltigt datum, för korta/långa värden.',
      'Kontrollera att felmeddelanden visas med text och att de identifierar det specifika fältet.',
      'Kontrollera att skärmläsaren annonserar felet (role="alert" eller focus på felsammanfattning).',
    ],
    exceptions: [],
    controls: [
      'Felmeddelanden visas med text (inte enbart med färg eller ikon)',
      'Felmeddelanden identifierar vilket specifikt fält som har fel',
      'Fältet markeras med aria-invalid="true" eller felmeddelandet är programmatiskt kopplat',
      'Hjälpmedel annonserar felet utan att användaren behöver söka det',
    ],
  },

  '3.3.3': {
    method: [
      'Orsaka valideringsfel i formulär och kontrollera om felmeddelanden ger konkreta korrigeringsförslag.',
      'T.ex. vid felaktigt e-postformat: meddela "Ange en giltig e-postadress, t.ex. namn@example.se".',
    ],
    exceptions: [
      'Om förslaget skulle äventyra säkerhet (t.ex. lösenordssystem).',
      'Om fältets syfte förfelas av ett förslag.',
    ],
    controls: [
      'Felmeddelanden ger specifika förslag på hur felet kan korrigeras',
      'Formatkrav kommuniceras tydligt i felmeddelandet',
    ],
  },

  '3.3.4': {
    method: [
      'Identifiera formulär med rättsliga, ekonomiska eller personliga konsekvenser (köp, bokningar, juridiska avtal).',
      'Kontrollera att det finns möjlighet att granska, bekräfta och/eller ångra inmatning.',
    ],
    exceptions: [],
    controls: [
      'Känsliga formulär: möjlighet att granska inmatningen innan slutgiltig inlämning',
      'Möjlighet att ångra, korrigera eller bekräfta inlämning',
      'Automatiska inmatningsfel kan korrigeras av användaren',
    ],
  },

  // ════════════════════════════════════════════════════════
  // LJUD OCH VIDEO
  // ════════════════════════════════════════════════════════

  '1.2.1': {
    method: [
      'Identifiera alla förinspelade ljud-only-klipp och video-only-klipp.',
      'Lyssna på ljudklippet och läs transkriptionen parallellt – verifiera att de stämmer överens.',
      'Kontrollera att olika talpersoner identifieras tydligt i transkriptionen.',
      'För tyst video: kontrollera att ett alternativt ljudspår eller en text beskriver det visuella innehållet.',
    ],
    exceptions: [
      'Ljudklipp som utgör mediealternativ till befintlig text, tydligt märkta som sådana.',
    ],
    controls: [
      'Förinspelat ljud-only har en texttranskription',
      'Transkriptionen förmedlar identisk information i samma ordning',
      'Video-only (stumfilm) har transkription eller beskrivande ljudspår',
    ],
  },

  '1.2.2': {
    method: [
      'Spela filmen med undertexter aktiverade.',
      'Kontrollera att alla relevanta dialoger och viktiga ljudeffekter återges.',
      'Verifiera att undertexterna är synkroniserade med filmen.',
    ],
    exceptions: [
      'Filmade versioner av textinnehåll, tydligt märkta som mediealternativ.',
    ],
    controls: [
      'All förinspelad video med ljud har undertexter',
      'Undertexterna täcker alla dialoger och relevanta ljudhändelser',
      'Undertexterna är korrekt synkroniserade med bilden',
      'Mediespelaren har kontroll för att slå på/av undertexter',
    ],
  },

  '1.2.3': {
    method: [
      'Kontrollera om förinspelad video med ljud har antingen syntolkning eller en fullständig texttranskription.',
      'En texttranskription räcker för nivå A; syntolkning krävs för AA (1.2.5).',
    ],
    exceptions: [
      'Om allt visuellt innehåll redan förklaras i det befintliga ljudspåret.',
    ],
    controls: [
      'Förinspelad video med ljud har syntolkning ELLER fullständig texttranskription',
      'Alternativet förmedlar all visuell och auditiv information',
    ],
  },

  '1.2.4': {
    method: [
      'Identifiera direktsänd video med ljud.',
      'Kontrollera att realtidstextning är tillgänglig under sändningen.',
      'Verifiera att textningen är tillräckligt korrekt och synkroniserad.',
    ],
    exceptions: [],
    controls: [
      'Direktsänd video med ljud har realtidstextning',
      'Textningen är tillräckligt synkroniserad och korrekt för förståelse',
    ],
  },

  '1.2.5': {
    method: [
      'Spela förinspelade videofilmer med ljud och aktivera syntolkning.',
      'Verifiera att syntolkningen beskriver all visuell information som inte framgår av ljudspåret.',
      'Kontrollera att syntolkningen inträffar vid naturliga pauser eller att utökad syntolkning erbjuds.',
    ],
    exceptions: [
      'Om allt visuellt innehåll redan förklaras i det befintliga ljudspåret.',
    ],
    controls: [
      'Förinspelad video med ljud har syntolkning',
      'Syntolkningen förmedlar all relevant visuell information',
      'Mediespelaren har kontroll för att aktivera syntolkning',
    ],
  },

  // ════════════════════════════════════════════════════════
  // TOUCHSKÄRMAR
  // ════════════════════════════════════════════════════════

  '2.5.1': {
    method: [
      'Identifiera alla flerpunktsgester (nyp-zoom, svepgester, roterande gester).',
      'Kontrollera att all funktionalitet som använder flerpunktsgester också kan utföras med en enda fingerkontakt.',
      'Kontrollera att rörelsebanebaserade gester (svep åt sidan) har ett alternativ utan specifik rörelsebana.',
    ],
    exceptions: [
      'Flerpunktsgester som är nödvändiga för funktionen (t.ex. fri teckning).',
    ],
    controls: [
      'Alla flerpunktsgester har ett enkelpunkts-alternativ',
      'Svep-baserad navigering har alternativa knappar',
      'Rörelsebanebaserade gester kan utföras utan specifik rörelsebana',
    ],
  },

  '2.5.4': {
    method: [
      'Identifiera om tjänsten har funktioner som aktiveras via enhetens rörelse (skakning, lutning, rotation).',
      'Kontrollera att samma funktion kan utföras via ett vanligt gränssnittselement.',
      'Kontrollera att rörelsestyrningen kan inaktiveras.',
    ],
    exceptions: [
      'Om rörelseaktivering är nödvändig för funktionen (t.ex. stegräknare, gyroskopkalibrering).',
    ],
    controls: [
      'Rörelsestyrda funktioner har alternativ UI-kontroll',
      'Rörelsestyrningen kan inaktiveras av användaren',
    ],
  },

  '1.3.4': {
    method: [
      'Öppna sidan och vrid enheten 90° (eller använd DevTools för att simulera rotation).',
      'Kontrollera att innehållet anpassar sig till den nya orienteringen.',
      'Kontrollera att ingen orientering är låst utan specifik anledning.',
    ],
    exceptions: [
      'Innehåll som kräver specifik orientering för sin funktion (t.ex. pianotangentbord).',
      'Om användaren själv har låst orienteringen på enheten.',
    ],
    controls: [
      'Innehållet fungerar i både stående och liggande läge',
      'Ingen orientering är låst utan specifik funktionell anledning',
      'Alla funktioner är tillgängliga i båda orienteringarna',
    ],
  },

  // ════════════════════════════════════════════════════════
  // DOKUMENTATION OCH SUPPORT
  // ════════════════════════════════════════════════════════

  '12.1.1': {
    method: [
      'Granska produktdokumentationen och kontrollera om tillgänglighetsfunktioner dokumenteras.',
      'Kontrollera om dokumentationen förklarar hur man aktiverar och använder hjälpmedelsfunktioner.',
    ],
    exceptions: [],
    controls: [
      'Produktdokumentationen beskriver hur man använder tillgänglighetsfunktioner',
      'Kompatibilitet med hjälpmedel är dokumenterad',
    ],
  },

  '12.1.2': {
    method: [
      'Granska hela produktdokumentationen som separata webbsidor eller dokument.',
      'Kontrollera tillgängligheten i dokumentationen enligt WCAG 2.2 AA.',
    ],
    exceptions: [],
    controls: [
      'Webbbaserad dokumentation uppfyller WCAG 2.2 AA-kraven',
      'Dokumentation i PDF/Word uppfyller tillgänglighetskraven för det formatet',
    ],
  },

  '12.2.2': {
    method: [
      'Kontakta kundtjänst och ställ frågor om tillgänglighets- och kompatibilitetsfunktioner.',
      'Fråga var tillgänglighetsredogörelsen finns och om kända brister.',
    ],
    exceptions: [],
    controls: [
      'Kundtjänst kan informera om tillgänglighets- och kompatibilitetsfunktioner',
      'Kundtjänst känner till var tillgänglighetsredogörelsen finns',
    ],
  },

  '12.2.3': {
    method: [
      'Kontakta kundtjänst och fråga om kommunikationsmöjligheter för personer med funktionsnedsättning.',
      'Fråga specifikt om texttelefoni, bildtelefoni och Teletal (PTS).',
    ],
    exceptions: [],
    controls: [
      'Kundtjänst tillmötesgår kommunikationsbehov hos personer med funktionsnedsättning',
      'Möjlighet till kommunikation via ombud (t.ex. teckentolk) finns',
    ],
  },

  '12.2.4': {
    method: [
      'Begär supportdokumentation och granska dess tillgänglighet.',
      'Kontrollera om dokumentationen finns i tillgängliga format.',
    ],
    exceptions: [],
    controls: [
      'Webbbaserad supportdokumentation uppfyller WCAG 2.2 AA-kraven',
      'Icke-webbbaserad supportdokumentation uppfyller tillämpliga tillgänglighetskrav',
    ],
  },
}

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

/**
 * Hämtar audit-data för ett kriterie-id, med fallback för okända kriterier.
 */
export function getAuditData(criterionId) {
  return DIGG_AUDIT_DATA[criterionId] ?? {
    method: ['Granska kriteriet manuellt enligt WCAG 2.2-specifikationen och DIGG:s tillsynsmanual.'],
    exceptions: [],
    controls: ['Kriteriet uppfyller tillämpliga krav'],
  }
}

/**
 * Hämtar metadata för ett kriterium – söker i wcag22 och DIGG_EXTRA_CRITERIA.
 * Returnerar { id, nameSwedish, level, ... } eller null.
 */
export function getAnyCriterion(id, wcag22Array) {
  return wcag22Array.find(c => c.id === id)
    ?? DIGG_EXTRA_CRITERIA.find(c => c.id === id)
    ?? null
}

/**
 * Returnerar de kategorier som är relevanta för ett projekt baserat på auditContext.answers.
 */
export function getApplicableCategories(answers = {}) {
  return DIGG_CATEGORIES.filter(cat => {
    if (!cat.conditional) return true
    return cat.conditionKeys.some(key => answers[key] === true)
  })
}

/**
 * Returnerar en deduplicerad ordnad lista av alla tillämpliga kriterier.
 */
export function getOrderedCriteriaIds(answers = {}) {
  const applicableCategories = getApplicableCategories(answers)
  const seen = new Set()
  const result = []
  for (const cat of applicableCategories) {
    for (const id of cat.criteriaIds) {
      if (!seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
  }
  return result
}
