/**
 * DIGG-inspirerad granskningsmall för WCAG 2.2.
 * Varje kriterium har: method (steg-för-steg), exceptions, controls (checklista).
 * Kategorier följer WCAG-riktlinjernas struktur.
 */

export const DIGG_CATEGORIES = [
  {
    id: 'images',
    label: 'Bilder och icke-text',
    criteriaIds: ['1.1.1', '1.4.5', '1.4.9'],
  },
  {
    id: 'media',
    label: 'Tidsbegränsat media',
    criteriaIds: ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5', '1.2.6', '1.2.7', '1.2.8', '1.2.9'],
  },
  {
    id: 'adaptable',
    label: 'Anpassningsbart innehåll',
    criteriaIds: ['1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6'],
  },
  {
    id: 'distinguishable',
    label: 'Urskiljbart (färg, kontrast, text)',
    criteriaIds: ['1.4.1', '1.4.2', '1.4.3', '1.4.4', '1.4.5', '1.4.6', '1.4.7', '1.4.8', '1.4.9', '1.4.10', '1.4.11', '1.4.12', '1.4.13'],
  },
  {
    id: 'keyboard',
    label: 'Tangentbordstillgänglighet',
    criteriaIds: ['2.1.1', '2.1.2', '2.1.3', '2.1.4'],
  },
  {
    id: 'timing',
    label: 'Tidsgränser',
    criteriaIds: ['2.2.1', '2.2.2', '2.2.3', '2.2.4', '2.2.5', '2.2.6'],
  },
  {
    id: 'seizures',
    label: 'Anfall och fysiska reaktioner',
    criteriaIds: ['2.3.1', '2.3.2', '2.3.3'],
  },
  {
    id: 'navigable',
    label: 'Navigerbart',
    criteriaIds: ['2.4.1', '2.4.2', '2.4.3', '2.4.4', '2.4.5', '2.4.6', '2.4.7', '2.4.8', '2.4.9', '2.4.10', '2.4.11', '2.4.12', '2.4.13'],
  },
  {
    id: 'input',
    label: 'Inmatningsmodaliteter',
    criteriaIds: ['2.5.1', '2.5.2', '2.5.3', '2.5.4', '2.5.5', '2.5.6', '2.5.7', '2.5.8'],
  },
  {
    id: 'readable',
    label: 'Läsbart',
    criteriaIds: ['3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6'],
  },
  {
    id: 'predictable',
    label: 'Förutsägbart',
    criteriaIds: ['3.2.1', '3.2.2', '3.2.3', '3.2.4', '3.2.5', '3.2.6'],
  },
  {
    id: 'assistance',
    label: 'Inmatningshjälp',
    criteriaIds: ['3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6', '3.3.7', '3.3.8', '3.3.9'],
  },
  {
    id: 'compatible',
    label: 'Kompatibelt',
    criteriaIds: ['4.1.1', '4.1.2', '4.1.3'],
  },
]

/** Slår samman alla kategoriers criteriaIds till en ordnad lista. */
export const DIGG_CRITERIA_ORDER = DIGG_CATEGORIES.flatMap(c => c.criteriaIds)

export const DIGG_AUDIT_DATA = {

  // ── 1.1 Textalternativ ────────────────────────────────────────────────────

  '1.1.1': {
    method: [
      'Aktivera en skärmläsare (NVDA + Chrome eller VoiceOver + Safari).',
      'Navigera till alla bilder, ikoner och grafik på sidan.',
      'Kontrollera att informativa bilder har meningsfull alt-text som förmedlar samma information.',
      'Kontrollera att dekorativa bilder ignoreras av skärmläsaren (alt="" eller role="presentation").',
      'Kontrollera att knappar och länkar med enbart ikoner har ett tillgängligt namn.',
      'Inspektera källkoden med DevTools för att verifiera alt-attributen.',
    ],
    exceptions: [
      'Dekorativa bilder behöver ingen beskrivande alt-text om alt="" är satt.',
      'CAPTCHA-bilder är undantagna om ett alternativt tillgängligt CAPTCHA erbjuds.',
      'Logotyper kan använda organisationens namn som alt-text.',
    ],
    controls: [
      'Alla informativa bilder har meningsfull och korrekt alt-text',
      'Dekorativa bilder har alt="" eller role="presentation"',
      'Knappar/länkar med enbart ikoner har aria-label eller aria-labelledby',
      'Komplexa bilder (diagram, grafer) har utökad beskrivning (aria-describedby, figcaption eller länk)',
      'Bilder av text har alt-text som innehåller samma text',
    ],
  },

  // ── 1.2 Tidsbegränsat media ───────────────────────────────────────────────

  '1.2.1': {
    method: [
      'Identifiera alla förinspelade ljud-only och video-only element.',
      'För ljud-only: kontrollera att en texttranskription finns tillgänglig.',
      'För video-only (utan ljud): kontrollera att antingen texttranskription eller ljudbeskrivning finns.',
      'Kontrollera att alternativet är lika detaljerat som det ursprungliga innehållet.',
    ],
    exceptions: [
      'Gäller inte för direktsänd media.',
      'Om videon är ett alternativ till textinnehåll (t.ex. teckenspråk) räcker det med tydlig hänvisning.',
    ],
    controls: [
      'Förinspelade ljud-only har tillgänglig texttranskription',
      'Förinspelade video-only har texttranskription eller ljudbeskrivning',
      'Alternativet är placerat nära mediainnehållet och lätt att hitta',
    ],
  },

  '1.2.2': {
    method: [
      'Identifiera alla förinspelade videofilmer med ljud.',
      'Kontrollera att textning (captions) är tillgänglig för allt talat innehåll och viktiga ljud.',
      'Aktivera textningen och kontrollera att den är synkroniserad och korrekt.',
      'Kontrollera att textning kan aktiveras av användaren (om den inte är påbränd).',
    ],
    exceptions: [
      'Gäller inte för direktsänd media (se 1.2.4).',
      'Automatiskt genererad textning som inte granskats är generellt inte tillräcklig.',
    ],
    controls: [
      'All förinspelad video med ljud har textning',
      'Textningen är synkroniserad med ljudet',
      'Textningen täcker allt talat innehåll',
      'Viktiga ljud (applåder, larm, musik som bär information) är beskrivna',
      'Textning kan aktiveras av användaren',
    ],
  },

  '1.2.3': {
    method: [
      'Identifiera alla förinspelade videofilmer med ljud.',
      'Kontrollera att antingen en texttranskription eller en ljudbeskrivning av videoinnehållet finns.',
      'En texttranskription räcker för nivå A (1.2.5 kräver ljudbeskrivning för AA).',
    ],
    exceptions: [
      'Om videons visuella information redan förklaras i det befintliga ljudspåret behövs inget extra.',
    ],
    controls: [
      'Förinspelad video har antingen fullständig texttranskription eller ljudbeskrivning',
      'Alternativet beskriver all visuell information som är nödvändig för förståelsen',
    ],
  },

  '1.2.4': {
    method: [
      'Identifiera om tjänsten erbjuder direktsänd video med ljud.',
      'Kontrollera att textning (captions) är tillgänglig i realtid under direktsändningen.',
      'Verifiera att textningen är tillräckligt korrekt och synkroniserad.',
    ],
    exceptions: [
      'Gäller bara direktsänd media, inte förinspelat material.',
    ],
    controls: [
      'Direktsänd video med ljud har realtidstextning',
      'Textningen är tillräckligt korrekt för förståelse',
    ],
  },

  '1.2.5': {
    method: [
      'Identifiera alla förinspelade videofilmer med ljud.',
      'Kontrollera att en ljudbeskrivning finns tillgänglig som beskriver visuell information.',
      'Aktivera ljudbeskrivningen och verifiera att den infaller i naturliga pauser eller att utökad ljudbeskrivning erbjuds.',
    ],
    exceptions: [
      'Om videons befintliga ljud redan beskriver all visuell information behövs inget extra.',
    ],
    controls: [
      'Förinspelad video har ljudbeskrivning',
      'Ljudbeskrivningen förmedlar all relevant visuell information',
      'Ljudbeskrivningen är synkroniserad med videon',
    ],
  },

  '1.2.6': {
    method: [
      'Kontrollera om förinspelad video med ljud erbjuder teckenspråkstolkning.',
      'Verifiera att teckenspråksversionen är synkroniserad och täcker allt talat innehåll.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Förinspelad video med ljud har teckenspråkstolkning',
      'Teckenspråkstolkningen är synkroniserad med videon',
    ],
  },

  '1.2.7': {
    method: [
      'Kontrollera om förinspelade videor med ljudbeskrivning erbjuder utökad ljudbeskrivning.',
      'Utökad ljudbeskrivning pausar videon för att ge mer tid till beskrivningar.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Utökad ljudbeskrivning finns tillgänglig för video där pauserna är för korta',
    ],
  },

  '1.2.8': {
    method: [
      'Kontrollera om förinspelade synkroniserade media och video-only har fullständig texttranskription.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Förinspelade synkroniserade media har fullständig texttranskription',
    ],
  },

  '1.2.9': {
    method: [
      'Identifiera om tjänsten har direktsänt ljud-only-innehåll.',
      'Kontrollera att ett textalternativ i realtid finns.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Direktsänt ljud-only har realtidsalternativ i textform',
    ],
  },

  // ── 1.3 Anpassningsbart ───────────────────────────────────────────────────

  '1.3.1': {
    method: [
      'Aktivera en skärmläsare och navigera igenom sidans huvudinnehåll.',
      'Kontrollera att rubriker används hierarkiskt (h1 → h2 → h3) och speglar sidans struktur.',
      'Kontrollera att listor är kodade som ul/ol/dl, inte som div med streck.',
      'Kontrollera att tabeller har th-element med scope-attribut och eventuell caption.',
      'Kontrollera att formulärfält har korrekta label-element kopplade via for/id.',
      'Inspektera sidans semantik med DevTools Accessibility-panel.',
    ],
    exceptions: [
      'Presentationslayouter (t.ex. designtabeller) ska markeras med role="presentation".',
    ],
    controls: [
      'Rubriker används i korrekt hierarkisk ordning',
      'Listor är semantiskt korrekt kodade (ul/ol/dl)',
      'Tabeller har korrekta th-element och scope-attribut',
      'Datatabeller har caption eller aria-label',
      'Formulärfält är kopplade till sina label-element',
      'Landmarks (header, nav, main, footer) används korrekt',
      'Visuell formattering förmedlas inte enbart via CSS utan semantisk grund',
    ],
  },

  '1.3.2': {
    method: [
      'Kontrollera att sidans läsordning i DOM:en matchar den visuella ordningen.',
      'Dölj alla CSS-stilar och kontrollera att innehållet fortfarande är meningsfullt i DOM-ordningen.',
      'Testa med skärmläsare att innehållet presenteras i logisk ordning.',
    ],
    exceptions: [],
    controls: [
      'DOM-ordningen matchar den meningsfulla visuella presentationsordningen',
      'Innehållet är meningsfullt utan CSS',
    ],
  },

  '1.3.3': {
    method: [
      'Identifiera alla instruktioner på sidan.',
      'Kontrollera att instruktioner inte enbart refererar till sensoriska egenskaper som form, färg, storlek eller position.',
      'Exempel på problem: "Klicka på den gröna knappen" eller "Se formuläret till höger".',
    ],
    exceptions: [],
    controls: [
      'Instruktioner använder inte enbart färg för att identifiera element',
      'Instruktioner använder inte enbart form/position/storlek',
      'Instruktioner är begripliga utan visuell kontext',
    ],
  },

  '1.3.4': {
    method: [
      'Testa sidan i stående och liggande läge på en mobil enhet eller med DevTools rotation.',
      'Kontrollera att allt innehåll och alla funktioner är tillgängliga i båda orienteringarna.',
      'Kontrollera att sidan inte låser användaren till en specifik orientering.',
    ],
    exceptions: [
      'Låsning till orientering är tillåten om det är nödvändigt för funktionen (t.ex. ett piano-tangentbord).',
    ],
    controls: [
      'Innehållet är tillgängligt i både stående och liggande läge',
      'Ingen orientering är låst utan specifik anledning',
      'Alla funktioner fungerar i båda orienteringarna',
    ],
  },

  '1.3.5': {
    method: [
      'Identifiera alla formulärfält som samlar in personuppgifter.',
      'Kontrollera att fälten har korrekt autocomplete-attribut (name, email, tel, street-address etc.).',
      'Verifiera att autocomplete-värdena matchar den faktiska inmatningstypen.',
    ],
    exceptions: [
      'Gäller inte fält som av säkerhetsskäl bör hindra automatisk ifyllning.',
    ],
    controls: [
      'Formulärfält för personuppgifter har korrekt autocomplete-attribut',
      'Autocomplete-värden matchar fältets faktiska syfte',
      'Namn, e-post, telefon, adress och betalningsinformation har autocomplete',
    ],
  },

  '1.3.6': {
    method: [
      'Kontrollera att ikoner och UI-komponenter som representerar begrepp är kodade med standardiserade roller eller tokens.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Syftet med UI-komponenter kan fastställas programmatiskt via semantik',
    ],
  },

  // ── 1.4 Urskiljbart ───────────────────────────────────────────────────────

  '1.4.1': {
    method: [
      'Identifiera alla ställen där färg används för att förmedla information.',
      'Kontrollera att samma information också förmedlas på ett annat sätt (text, ikon, mönster).',
      'Vanliga problemfall: obligatoriska fält markeras enbart med röd färg, aktiva flikar enbart med bakgrundsfärg, felmeddelanden enbart i rött.',
    ],
    exceptions: [],
    controls: [
      'Obligatoriska formulärfält markeras inte enbart med färg',
      'Felmeddelanden och varningar förmedlas inte enbart med röd/gul färg',
      'Aktiva tillstånd (aktiv flik, markerat alternativ) indikeras med mer än färg',
      'Diagram och grafer använder inte enbart färg för att särskilja dataserier',
    ],
  },

  '1.4.2': {
    method: [
      'Kontrollera om sidan spelar upp ljud automatiskt i mer än 3 sekunder.',
      'Om ja: kontrollera att det finns en mekanism för att pausa, stoppa eller stänga av ljudet.',
      'Verifiera att mekanismen är tillgänglig via tangentbord.',
    ],
    exceptions: [],
    controls: [
      'Ljud som spelas upp automatiskt kan stängas av, pausas eller sänkas i volym',
      'Kontrollmöjligheten är tillgänglig via tangentbord',
    ],
  },

  '1.4.3': {
    method: [
      'Använd ett kontrastverktyg (t.ex. Colour Contrast Analyser eller WebAIM Contrast Checker).',
      'Mät kontrasten för all normalstor text (under 18pt/14pt bold) mot bakgrunden. Krav: minst 4,5:1.',
      'Mät kontrasten för stor text (18pt+ eller 14pt+ bold). Krav: minst 3:1.',
      'Kontrollera text i alla tillstånd: normal, hover, fokus, aktiv.',
      'Kontrollera platshållartext i formulärfält.',
    ],
    exceptions: [
      'Inaktiverade element (disabled) är undantagna.',
      'Logotyper och varumärkestexter är undantagna.',
      'Rent dekorativ text är undantagen.',
    ],
    controls: [
      'All normal brödtext har kontrast minst 4,5:1',
      'All stor text (18pt+/14pt bold+) har kontrast minst 3:1',
      'Platshållartext i formulär har tillräcklig kontrast',
      'Text i knappar och interaktiva element har tillräcklig kontrast',
      'Text i alla interaktiva tillstånd (hover, fokus) har tillräcklig kontrast',
    ],
  },

  '1.4.4': {
    method: [
      'Zooma in webbläsaren till 200% (Ctrl/Cmd + scroll eller inställningar).',
      'Kontrollera att all text skalas korrekt och att inget innehåll klipps bort.',
      'Kontrollera att all funktionalitet fortfarande är tillgänglig vid 200% zoom.',
      'Kontrollera att ingen text renderas som bilder av text som inte skalas.',
    ],
    exceptions: [
      'Textning i video är undantagen.',
      'Logotyper/varumärken är undantagna.',
    ],
    controls: [
      'All text kan förstoras till 200% utan förlust av innehåll eller funktionalitet',
      'Ingen text kräver horisontell scrollning vid 200% zoom på standardskärm',
      'Inga element täcker varandra eller klipps bort vid 200% zoom',
    ],
  },

  '1.4.5': {
    method: [
      'Identifiera alla instanser av text som renderas som bild (img med text i, CSS background-image med text).',
      'Kontrollera att bilder av text är ersatta med riktig text + CSS-formatering.',
      'Kontrollera att om bilder av text används, kan användaren anpassa visningen.',
    ],
    exceptions: [
      'Logotyper/varumärken är undantagna.',
      'Texter i bilder som visar konst eller specifika dokument är undantagna.',
    ],
    controls: [
      'Text presenteras som faktisk text, inte som bild av text',
      'Om bilder av text används finns möjlighet att anpassa utseendet',
    ],
  },

  '1.4.6': {
    method: [
      'Mät kontrasten för all normalstor text. Krav för AAA: minst 7:1.',
      'Mät kontrasten för stor text. Krav för AAA: minst 4,5:1.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Normal text har kontrast minst 7:1',
      'Stor text har kontrast minst 4,5:1',
    ],
  },

  '1.4.7': {
    method: [
      'Kontrollera om bakgrundsljud finns under tal.',
      'Om ja: är bakgrundsljudet minst 20 dB tystare än talet, eller kan det stängas av?',
    ],
    exceptions: ['Detta är ett AAA-kriterium.', 'Gäller inte CAPTCHA eller musikinspelningar.'],
    controls: [
      'Bakgrundsljud är minst 20 dB lägre än det primära talet, eller kan stängas av',
    ],
  },

  '1.4.8': {
    method: [
      'Kontrollera om det finns mekanismer för att anpassa textpresentationen.',
      'Kan användaren välja förgrunds- och bakgrundsfärg?',
      'Är textblockens bredd max 80 tecken?',
      'Är textjustering inte "justify"?',
      'Är radavståndet minst 1,5 gånger teckenstorleken?',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Textblock är max 80 tecken breda',
      'Text är inte centrerad eller höger/vänsterjusterad på full bredd',
      'Radavstånd är minst 1,5 ggr teckenstorleken',
      'Texten kan anpassas av användaren (färg, bakgrund)',
    ],
  },

  '1.4.9': {
    method: [
      'Kontrollera att bilder av text inte används, utom för logotyper.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.', 'Logotyper är undantagna.'],
    controls: [
      'Bilder av text används inte (utom logotyper)',
    ],
  },

  '1.4.10': {
    method: [
      'Zooma in webbläsaren till 400% eller minska fönsterbredden till 320 CSS-pixlar.',
      'Kontrollera att allt innehåll är tillgängligt utan horisontell scrollning.',
      'Kontrollera att inga funktioner eller information försvinner.',
      'Testa med DevTools responsiv design-vy (sätt bredd till 320px).',
    ],
    exceptions: [
      'Innehåll som kräver tvådimensionell layout (komplexa tabeller, kartor, diagram) är undantaget.',
    ],
    controls: [
      'Allt innehåll kan visas utan horisontell scrollning vid 320px bredd',
      'Alla funktioner är tillgängliga vid 320px bredd',
      'Ingen information försvinner eller klipps bort vid smal layout',
    ],
  },

  '1.4.11': {
    method: [
      'Mät kontrastförhållandet för alla icke-textuella UI-komponenter (knappar, ikoner, formulärinput, diagram).',
      'Gräns: minst 3:1 mot angränsande färger.',
      'Kontrollera gränser/konturer på formulärfält (input, textarea, select).',
      'Kontrollera fokusramen (focus ring) på interaktiva element.',
      'Kontrollera visuell aktiv/inaktiv state på knappar och kontroller.',
    ],
    exceptions: [
      'Inaktiverade element är undantagna.',
      'Utseende som kontrolleras av webbläsaren och inte av sidan är undantaget.',
    ],
    controls: [
      'Formulärfältets kantlinje har kontrast minst 3:1 mot bakgrunden',
      'Knappar och kontroller har visuella gränser med kontrast minst 3:1',
      'Ikoner som förmedlar information har kontrast minst 3:1',
      'Diagram/grafers visuella komponenter har kontrast minst 3:1',
      'Fokusindikatorer har kontrast minst 3:1',
    ],
  },

  '1.4.12': {
    method: [
      'Använd ett bokmärke eller DevTools CSS-override för att ändra typografiska egenskaper.',
      'Sätt: line-height till 1,5 × teckenstorlek, letter-spacing till 0,12 × teckenstorlek, word-spacing till 0,16 × teckenstorlek, spacing after paragraphs till 2 × teckenstorlek.',
      'Kontrollera att inget innehåll klipps bort, täcks över eller förlorar funktion.',
    ],
    exceptions: [
      'Gäller inte textinnehåll i videofilmer eller bilder av text.',
    ],
    controls: [
      'Innehållet behåller sin funktion med ökade typografiska avstånd',
      'Inget text klipps bort vid ökade avstånd',
      'Inga funktioner slutar fungera vid ökade typografiska avstånd',
    ],
  },

  '1.4.13': {
    method: [
      'Identifiera all HTML-hover- och fokusutlöst innehåll (tooltips, dropdowns, popups).',
      'Kontrollera att sådant innehåll kan stängas utan att flytta fokus (Escape-tangent).',
      'Kontrollera att användaren kan flytta muspekaren till hover-innehållet utan att det försvinner.',
      'Kontrollera att innehållet kvarstår tills användaren tar bort det, hovern tar slut eller det inte längre är giltigt.',
    ],
    exceptions: [
      'Om hover-innehållet inte döljer befintligt innehåll och bara visar extra information.',
    ],
    controls: [
      'Hover/fokus-utlöst innehåll kan stängas med Escape utan att flytta fokus',
      'Muspekaren kan flyttas till hover-innehållet utan att det försvinner',
      'Hover/fokus-innehållet är beständigt (kvarstår tills användaren avvisar det)',
    ],
  },

  // ── 2.1 Tangentbordstillgänglighet ───────────────────────────────────────

  '2.1.1': {
    method: [
      'Koppla bort musen och navigera hela sidan enbart med tangentbordet.',
      'Använd Tab/Shift+Tab för att flytta fokus, Enter/Space för att aktivera.',
      'Kontrollera att alla interaktiva element (knappar, länkar, formulär, menyer, modaler) kan nås och användas.',
      'Kontrollera att anpassade widgets (dragsliders, datepickers, carousels) har tangentbordsstöd.',
      'Kontrollera att ingen funktion kräver specifika tangentbordsgenvägar som kan kollidera med AT.',
    ],
    exceptions: [
      'Funktioner som kräver rörelsevägar (fri teckning) är undantagna om alternativ finns.',
    ],
    controls: [
      'Alla interaktiva element kan nås med Tab-tangenten',
      'Alla funktioner kan användas enbart med tangentbord',
      'Anpassade widgets har korrekta tangentbordsinteraktioner (piltangenter i menyer, Escape för att stänga)',
      'Inga tangentbordsfällor förekommer (fokus kan inte lämna ett element)',
    ],
  },

  '2.1.2': {
    method: [
      'Navigera med tangentbordet till alla komponenter (modaler, menyer, widgets).',
      'Kontrollera att fokus alltid kan lämna ett element med Tab/Shift+Tab eller via instruktioner.',
      'Verifiera att modaler och popups inte fångar fokus permanent.',
    ],
    exceptions: [],
    controls: [
      'Fokus kan alltid lämna interaktiva komponenter med Tab/Shift+Tab',
      'Inga tangentbordsfällor förekommer',
      'Om fokus begränsas (t.ex. i en modal) finns tydlig instruktion för hur man lämnar',
    ],
  },

  '2.1.3': {
    method: [
      'Kontrollera att alla funktioner är tillgängliga via tangentbord utan undantag.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Alla funktioner utan undantag kan styras via tangentbord',
    ],
  },

  '2.1.4': {
    method: [
      'Identifiera om sidan definierar egna tangentbordsgenvägar med enbart bokstäver, siffror eller specialtecken.',
      'Kontrollera att sådana genvägar kan inaktiveras, ommappas eller bara aktiveras när komponenten är fokuserad.',
    ],
    exceptions: [
      'Gäller inte genvägar som kräver modifieringstangenter (Ctrl, Alt, Cmd).',
    ],
    controls: [
      'Enbokstavs-genvägar kan inaktiveras av användaren',
      'Enbokstavs-genvägar kan ommappas, eller är bara aktiva när komponenten är fokuserad',
    ],
  },

  // ── 2.2 Tidsgränser ───────────────────────────────────────────────────────

  '2.2.1': {
    method: [
      'Identifiera om sidan har tidsgränser för sessioner eller aktiviteter.',
      'Kontrollera att användaren kan stänga av, justera eller förlänga tidsgränsen.',
      'Förvarning bör ges minst 20 sekunder innan tidsgränsen löper ut.',
      'Undantag: om tidsgränsen är längre än 20 timmar behöver den inte uppfylla kravet.',
    ],
    exceptions: [
      'Realtidsevenemang med absolut tidsgräns (auktioner, examinationer) kan vara undantagna.',
      'Tidsgränser som är nödvändiga av säkerhetsskäl kan vara undantagna.',
    ],
    controls: [
      'Tidsgränser kan stängas av, justeras eller förlängas',
      'Användaren varnas minst 20 sekunder innan tidsgränsen löper ut',
      'Sessionen kan förlängas med enkel åtgärd (klick, knapptryckning)',
    ],
  },

  '2.2.2': {
    method: [
      'Identifiera rörligt, blinkande eller scrollande innehåll som startar automatiskt.',
      'Kontrollera att sådant innehåll kan pausas, stoppas eller döljas.',
      'Innehåll som rör sig automatiskt och varar mer än 5 sekunder ska kunna pausas.',
    ],
    exceptions: [
      'Om rörelsen är nödvändig (t.ex. en pågående process-indikator) kan det vara undantaget.',
    ],
    controls: [
      'Rörligt/blinkande innehåll kan pausas, stoppas eller döljas',
      'Auto-uppdaterande innehåll kan pausas eller fördröjas',
    ],
  },

  '2.2.3': {
    method: [
      'Kontrollera att inga tidsgränser används i sidans innehåll (utom realtidsevenemang).',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Inga tidsgränser används (utom realtidsevenemang och nödvändiga undantag)',
    ],
  },

  '2.2.4': {
    method: [
      'Kontrollera att avbrott (automatiska uppdateringar, meddelanden) kan skjutas upp eller stängas av av användaren.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.', 'Nödsituationer är undantagna.'],
    controls: [
      'Avbrott och automatiska uppdateringar kan skjutas upp eller stängas av',
    ],
  },

  '2.2.5': {
    method: [
      'Om en autentiserad session löper ut, kontrollera att data som användaren matat in inte går förlorad.',
      'Kontrollera att det går att återautentisera och fortsätta utan dataförlust.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Data bevaras när en session löper ut och användaren återautentiserar sig',
    ],
  },

  '2.2.6': {
    method: [
      'Kontrollera att användaren varnas om tidsgränser som kan leda till dataförlust.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Användaren varnas om att data kan gå förlorad vid inaktivitet',
    ],
  },

  // ── 2.3 Anfall ────────────────────────────────────────────────────────────

  '2.3.1': {
    method: [
      'Identifiera om sidan innehåller blinkande innehåll.',
      'Kontrollera att inget innehåll blinkar mer än 3 gånger per sekund, eller att blixten är under de generella eller röda tröskelvärdena.',
      'Verktyg: PEAT (Photosensitive Epilepsy Analysis Tool) eller Harding Test.',
    ],
    exceptions: [
      'Innehåll som blinkar under tröskelvärdena är undantaget.',
    ],
    controls: [
      'Inget innehåll blinkar mer än 3 gånger per sekund',
      'Blinkande innehåll är under de generella tröskelvärdena för fotosensitivitet',
    ],
  },

  '2.3.2': {
    method: [
      'Kontrollera att inget innehåll blinkar överhuvudtaget (strängare krav).',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Sidan innehåller inget blinkande innehåll',
    ],
  },

  '2.3.3': {
    method: [
      'Kontrollera att animationer som utlöses av interaktion kan inaktiveras.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.', 'Om animationen är nödvändig för funktionen.'],
    controls: [
      'Rörelseanimationer utlösta av interaktion kan inaktiveras',
    ],
  },

  // ── 2.4 Navigerbart ───────────────────────────────────────────────────────

  '2.4.1': {
    method: [
      'Kontrollera att det finns en mekanism för att hoppa förbi upprepade block (t.ex. navigation).',
      'Vanligen en "Hoppa till innehållet"-länk synlig vid fokus.',
      'Testa att länken fungerar och tar tangentbordsanvändaren till huvudinnehållet.',
      'Alternativt: kontrollera om landmarks (header, nav, main) används korrekt så AT-användare kan hoppa.',
    ],
    exceptions: [],
    controls: [
      'En "Hoppa till innehållet"-länk finns och fungerar vid tangentbordsnavigation',
      'Länken är synlig vid fokus och hoppar till rätt plats',
      'Alternativt: korrekta landmark-regioner finns för AT-navigation',
    ],
  },

  '2.4.2': {
    method: [
      'Kontrollera att varje sida har ett title-element i HTML:en.',
      'Kontrollera att titeln är beskrivande och identifierar sidan och webbplatsen.',
      'Kontrollera om titeln uppdateras dynamiskt vid navigation (SPA-applikationer).',
    ],
    exceptions: [],
    controls: [
      'Alla sidor har ett beskrivande title-element',
      'Titeln identifierar sidans innehåll och webbplatsen',
      'Titeln uppdateras korrekt vid SPA-navigation',
    ],
  },

  '2.4.3': {
    method: [
      'Navigera med Tab-tangenten och observera fokusets ordning.',
      'Kontrollera att fokusordningen är logisk och följer sidans visuella ordning.',
      'Kontrollera att modaler fångar fokus korrekt och returnerar fokus vid stängning.',
    ],
    exceptions: [],
    controls: [
      'Fokusordningen är logisk och meningsfull',
      'Fokus placeras korrekt när modaler/popups öppnas',
      'Fokus returneras korrekt när modaler/popups stängs',
    ],
  },

  '2.4.4': {
    method: [
      'Inspektera alla länkar och knappar på sidan.',
      'Kontrollera att länktexten beskriver länkens syfte utan omgivande kontext (om möjligt).',
      'Acceptabelt: länktext som i kombination med omgivande paragraf/listpunkt är tydlig.',
      'Problematiskt: enbart "Läs mer", "Klicka här", "Här" utan kontext.',
      'Testa med skärmläsare i länklista-läge.',
    ],
    exceptions: [],
    controls: [
      'Alla länkar har beskrivande länktext som förklarar destination/syfte',
      'Inga oklara länktexter ("Läs mer", "Klicka här") utan tillräcklig omgivande kontext',
      'Länktext kompletteras med aria-label eller aria-describedby vid behov',
    ],
  },

  '2.4.5': {
    method: [
      'Kontrollera om webbplatsen har fler än en sida.',
      'Kontrollera att det finns minst två sätt att hitta innehåll: t.ex. sökning + navigation, eller sitemap + navigation.',
    ],
    exceptions: [
      'Sidor som är ett steg i en process behöver bara en navigeringsmöjlighet.',
    ],
    controls: [
      'Det finns minst två sätt att navigera till innehåll (sökning, sitemap, navigation, relaterade länkar)',
    ],
  },

  '2.4.6': {
    method: [
      'Kontrollera att alla rubriker och etiketter är beskrivande.',
      'Rubriker ska förklara sektionens innehåll. Etiketter ska förklara fältets syfte.',
      'Kontrollera att tomma rubriker (placeholderrubriker) inte används.',
    ],
    exceptions: [],
    controls: [
      'Alla rubriker beskriver sektionens innehåll',
      'Alla formuläretiketter är beskrivande',
      'Inga generiska rubriker som "Sektion 1" eller tomma rubriker används',
    ],
  },

  '2.4.7': {
    method: [
      'Navigera med Tab-tangenten och observera fokusindikatorn.',
      'Kontrollera att alla interaktiva element har en synlig fokusring eller annat tydligt fokusindikator.',
      'Kontrollera att CSS inte raderat fokusindikatorn (outline: none utan alternativ).',
    ],
    exceptions: [
      'Fokusindikatorn behöver inte uppfylla kontrastkraven för 2.4.7, men bör vara synlig.',
    ],
    controls: [
      'Alla interaktiva element har synlig fokusindikator',
      'Fokusindikatorn är aldrig borttagen med outline: none utan ersättning',
    ],
  },

  '2.4.8': {
    method: [
      'Kontrollera att det finns information om var på webbplatsen/processen användaren befinner sig.',
      'T.ex. brödsmulor, aktiv länk i navigering markerad, stegindikator.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Brödsmulor eller annan positionsinformation finns',
      'Aktiv/aktuell sida är markerad i navigeringen',
    ],
  },

  '2.4.9': {
    method: [
      'Kontrollera att alla länktexter är beskrivande utan att förlita sig på omgivande kontext.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Alla länktexter beskriver syftet/destinationen utan omgivande kontext',
    ],
  },

  '2.4.10': {
    method: [
      'Kontrollera om avsnittsrubriker används för att organisera innehållet.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Avsnittsrubriker används för att organisera innehållet',
    ],
  },

  '2.4.11': {
    method: [
      'Testa med enbart tangentbord och kontrollera att det fokuserade elementet alltid är helt synligt.',
      'Säkerställ att sticky headers/footers inte döljer det fokuserade elementet.',
    ],
    exceptions: [
      'Om elementet är dolt av innehåll som användaren inte kan flytta är det undantaget.',
    ],
    controls: [
      'Fokuserade element döljs inte helt av sticky/fixed-positionerat innehåll',
      'Det fokuserade elementet är åtminstone delvis synligt',
    ],
  },

  '2.4.12': {
    method: [
      'Kontrollera att det fokuserade elementet alltid är helt synligt utan att täckas av annat innehåll.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Det fokuserade elementet är alltid helt synligt',
    ],
  },

  '2.4.13': {
    method: [
      'Mät fokusringens synlighet: kontrastförhållande och storlek.',
      'Krav: minst 3:1 kontrast mot angränsande färger, och fokusramen täcker perimetern med minst 2 CSS-pixlar.',
    ],
    exceptions: [
      'Webbläsarens standardfokusindikator är undantagen om den inte modifierats.',
    ],
    controls: [
      'Fokusramen har kontrast minst 3:1 mot angränsande färger',
      'Fokusramen är minst 2 CSS-pixlar tjock',
      'Fokusramen är tydligt synlig på alla bakgrundsfärger',
    ],
  },

  // ── 2.5 Inmatningsmodaliteter ─────────────────────────────────────────────

  '2.5.1': {
    method: [
      'Identifiera alla gester med flera fingrar eller rörelseberoende gester (svep, nyp, rotering).',
      'Kontrollera att all funktionalitet som kräver sådana gester också kan utföras med enkel pekpunkt (klick/tap).',
    ],
    exceptions: [
      'Gester som är nödvändiga för funktionen (t.ex. fri teckning med fingrar) är undantagna.',
    ],
    controls: [
      'Alla flerfingersgest-funktioner har ett enkelpunkts-alternativ',
      'Svep-baserad navigering har alternativa kontroller (knappar)',
    ],
  },

  '2.5.2': {
    method: [
      'Identifiera alla pek-händelser på sidan.',
      'Kontrollera att aktivering sker vid "uppåt"-händelse (pointerup/mouseup), inte "nedåt".',
      'Alternativt: om aktivering sker vid nedåt-händelse, kan åtgärden ångras eller avbrytas.',
    ],
    exceptions: [
      'Om aktivering vid nedåt-händelse är nödvändig för funktionen.',
    ],
    controls: [
      'Pek-interaktioner aktiveras vid "upp"-händelse, inte "ned"-händelse',
      'Eller: åtgärden kan avbrytas/ångras om aktivering sker vid nedåt-händelse',
    ],
  },

  '2.5.3': {
    method: [
      'Kontrollera att alla interaktiva element har ett synligt etikett som matchar deras tillgängliga namn.',
      'Om en knapp har synlig text "Skicka" ska dess accessible name också vara "Skicka" (inte "Skicka formulär").',
      'Verktyg: Accessibility Insights – Name Inspector.',
    ],
    exceptions: [],
    controls: [
      'Synliga etiketter på interaktiva element matchar eller ingår i det tillgängliga namnet',
    ],
  },

  '2.5.4': {
    method: [
      'Identifiera om tjänsten har funktioner som aktiveras via enhetens rörelse (skakning, lutning).',
      'Kontrollera att alternativ UI-kontroll finns för samma funktion.',
      'Kontrollera att rörelseaktivering kan inaktiveras för att undvika oavsiktlig aktivering.',
    ],
    exceptions: [
      'Om rörelseaktivering är nödvändig för funktionen (t.ex. stegräknare).',
    ],
    controls: [
      'Rörelsestyrda funktioner har alternativ UI-kontroll',
      'Rörelsestyrning kan inaktiveras av användaren',
    ],
  },

  '2.5.5': {
    method: [
      'Mät storleken på alla pekbara mål (knappar, länkar, kontroller).',
      'Krav: minst 44×44 CSS-pixlar för det pekbara området.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.', 'Inline-länktext är undantagen.'],
    controls: [
      'Alla pekbara mål är minst 44×44 CSS-pixlar',
    ],
  },

  '2.5.6': {
    method: [
      'Kontrollera att innehållet inte begränsar användningen till specifika inmatningsmekanismer.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Innehållet fungerar med alla tillgängliga inmatningsmekanismer',
    ],
  },

  '2.5.7': {
    method: [
      'Identifiera alla drag-och-släpp-funktioner på sidan.',
      'Kontrollera att ett alternativ utan dragning finns för samma funktion.',
    ],
    exceptions: [
      'Om dragning är nödvändig för funktionen.',
    ],
    controls: [
      'Alla drag-och-släpp-funktioner har ett alternativ som inte kräver dragning',
    ],
  },

  '2.5.8': {
    method: [
      'Mät storleken på alla pekbara mål.',
      'Krav (AA): minst 24×24 CSS-pixlar, eller tillräckligt avstånd till andra mål.',
    ],
    exceptions: [
      'Inline-text, essensiella mål, mål styrda av användaragenten.',
    ],
    controls: [
      'Pekbara mål är minst 24×24 CSS-pixlar',
      'Alternativt: avstånd till angränsande mål är tillräckligt',
    ],
  },

  // ── 3.1 Läsbart ───────────────────────────────────────────────────────────

  '3.1.1': {
    method: [
      'Inspektera sidans html-element och kontrollera att lang-attributet är korrekt satt.',
      'Kontrollera att språkkoden matchar sidans faktiska innehållsspråk (t.ex. lang="sv" för svenska).',
    ],
    exceptions: [],
    controls: [
      'HTML-elementet har ett korrekt lang-attribut',
      'Språkkoden matchar sidans innehållsspråk',
    ],
  },

  '3.1.2': {
    method: [
      'Kontrollera om sidan innehåller text på ett annat språk än sidans standardspråk.',
      'Verifiera att sådana textstycken är markerade med lang-attributet på elementet.',
    ],
    exceptions: [
      'Egennamn, tekniska termer och ord utan tydligt språk är undantagna.',
    ],
    controls: [
      'Textstycken på annat språk är markerade med korrekt lang-attribut',
    ],
  },

  '3.1.3': {
    method: [
      'Kontrollera om ovanliga ord, jargong eller förkortningar förklaras.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Ovanliga ord och jargong förklaras i text eller via länk',
      'Förkortningar förklaras (abbr-element eller text)',
    ],
  },

  '3.1.4': {
    method: [
      'Kontrollera om förkortningar förklaras vid första användningen eller via abbr-element.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Förkortningar förklaras vid första förekomst eller via abbr-element',
    ],
  },

  '3.1.5': {
    method: [
      'Bedöm om texten kräver mer än grundskole-nivå (9 år) för att förstås.',
      'Om ja: kontrollera att en förenklad version eller stöd finns.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Komplex text har förenklad sammanfattning eller lässtöd',
    ],
  },

  '3.1.6': {
    method: [
      'Kontrollera om det finns ord vars uttal är viktigt för förståelsen.',
      'Om ja: kontrollera att uttalsstöd (fonetik, fonetisk transkription) finns.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Ord med tvetydigt uttal har uttalsstöd',
    ],
  },

  // ── 3.2 Förutsägbart ──────────────────────────────────────────────────────

  '3.2.1': {
    method: [
      'Interagera med alla fokuserbara element.',
      'Kontrollera att fokusering av ett element inte automatiskt triggar en kontextändring (navigering, formulärinlämning, etc.).',
    ],
    exceptions: [],
    controls: [
      'Fokusering av element orsakar inte automatiska kontextändringar',
    ],
  },

  '3.2.2': {
    method: [
      'Interagera med alla formulärfält och kontroller.',
      'Kontrollera att inmatning/ändring inte automatiskt triggar kontextändring utan förhandsvarning.',
      'T.ex. ska en dropdown inte automatiskt navigera till en ny sida vid val.',
    ],
    exceptions: [],
    controls: [
      'Ändring av inmatningsvärde orsakar inte automatisk kontextändring utan förvarning',
      'Om automatisk kontextändring sker vid inmatning, är användaren informerad om detta',
    ],
  },

  '3.2.3': {
    method: [
      'Kontrollera att navigation som upprepas på flera sidor presenteras i konsekvent ordning.',
    ],
    exceptions: [
      'Användare kan ändra ordning på navigationselement.',
    ],
    controls: [
      'Navigationsmenyer är konsekvent ordnade på alla sidor',
    ],
  },

  '3.2.4': {
    method: [
      'Kontrollera att komponenter som har samma funktion på flera sidor har konsekvent etikett/namn.',
      'T.ex. ska en sökfunktion alltid heta "Sök", inte "Sök" på en sida och "Hitta" på en annan.',
    ],
    exceptions: [],
    controls: [
      'Komponenter med samma funktion har konsekvent benämning på alla sidor',
    ],
  },

  '3.2.5': {
    method: [
      'Kontrollera att kontextändringar (ny sida, popup) bara sker på explicit användarinitiativ.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Kontextändringar sker bara vid explicit handling av användaren',
    ],
  },

  '3.2.6': {
    method: [
      'Kontrollera att hjälp (kontaktinformation, formulärhjälp) finns tillgänglig konsekvent på alla sidor.',
    ],
    exceptions: [],
    controls: [
      'Hjälpfunktioner och kontaktinformation är konsekvent placerade',
    ],
  },

  // ── 3.3 Inmatningshjälp ───────────────────────────────────────────────────

  '3.3.1': {
    method: [
      'Fyll i formulär med avsiktliga fel och kontrollera att felmeddelanden visas.',
      'Kontrollera att felmeddelanden tydligt identifierar vilket fält som har fel.',
      'Kontrollera att felmeddelanden är synliga och tillgängliga för skärmläsare.',
      'Kontrollera att fel annonseras med role="alert" eller fokus flyttas till felsammanfattning.',
    ],
    exceptions: [],
    controls: [
      'Felmeddelanden identifierar det fält som har fel',
      'Felmeddelanden är tillgängliga för skärmläsare (role="alert" eller fokus)',
      'Felmeddelanden är förståeliga och inte bara i tekniska termer',
    ],
  },

  '3.3.2': {
    method: [
      'Kontrollera att alla formulärfält har tydliga etiketter.',
      'Kontrollera att format-krav (datum, telefonnummer) förklaras i etiketten eller via beskrivning.',
      'Kontrollera att obligatoriska fält är märkta.',
    ],
    exceptions: [],
    controls: [
      'Alla formulärfält har tydliga etiketter',
      'Formatkrav förklaras i förväg (t.ex. "ÅÅÅÅ-MM-DD" för datum)',
      'Obligatoriska fält är tydligt markerade',
    ],
  },

  '3.3.3': {
    method: [
      'Fyll i formulär med fel och kontrollera att felmeddelanden ger förslag på korrekt inmatning.',
      'T.ex. vid felaktigt e-postformat: föreslå korrekt format.',
    ],
    exceptions: [
      'Undantaget om förslaget skulle äventyra säkerhet eller syfte.',
    ],
    controls: [
      'Felmeddelanden ger specifika förslag på hur felet kan korrigeras',
    ],
  },

  '3.3.4': {
    method: [
      'Identifiera formulär med rättsliga, ekonomiska eller personliga konsekvenser.',
      'Kontrollera att det finns möjlighet att kontrollera, bekräfta eller ångra inmatning innan slutgiltig inlämning.',
    ],
    exceptions: [],
    controls: [
      'Känsliga formulär har bekräftelsesteg eller möjlighet att granska inmatning',
      'Inlämnade data kan ångras inom rimlig tid',
    ],
  },

  '3.3.5': {
    method: [
      'Kontrollera om kontextkänslig hjälp finns tillgänglig.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Kontextkänslig hjälp finns för komplexa fält och processer',
    ],
  },

  '3.3.6': {
    method: [
      'Kontrollera att alla formulär har möjlighet att kontrollera, bekräfta eller ångra.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Alla formulärinlämningar kan granskas, bekräftas eller ångras',
    ],
  },

  '3.3.7': {
    method: [
      'Identifiera formulär med flera steg eller sessionsberoende data.',
      'Kontrollera att information som redan matats in i en process inte behöver matas in igen.',
      'Om återinmatning krävs: kontrollera att det finns en tydlig anledning.',
    ],
    exceptions: [
      'Säkerhetskänslig data (lösenord) kan kräva återinmatning.',
    ],
    controls: [
      'Tidigare inmatad information behöver inte matas in igen',
      'Alternativt: användaren kan välja ett tidigare inmatat värde',
    ],
  },

  '3.3.8': {
    method: [
      'Kontrollera om tjänsten kräver kognitiva tester (pussel, bilder att tolka) för autentisering.',
      'Kontrollera att ett alternativt autentiseringssätt erbjuds som inte kräver kognitiv förmåga.',
      'T.ex. lösenordshanterare ska kunna fylla i lösenord automatiskt.',
    ],
    exceptions: [
      'Undantaget om säkerhetssyftet inte kan uppnås på annat sätt.',
    ],
    controls: [
      'Autentisering kräver inget kognitivt test (pussel, bilder)',
      'Lösenordsfält tillåter inklistring och autoifyllning',
      'Alternativt autentiseringssätt erbjuds',
    ],
  },

  '3.3.9': {
    method: [
      'Kontrollera att om ett kognitivt test krävs för autentisering, finns alternativ med igenkänningsteknik.',
    ],
    exceptions: ['Detta är ett AAA-kriterium.'],
    controls: [
      'Kognitivt test i autentisering kan ersättas med igenkänning (t.ex. klicka på objekt)',
    ],
  },

  // ── 4.1 Kompatibelt ───────────────────────────────────────────────────────

  '4.1.1': {
    method: [
      'Kör HTML-validering via W3Cs validatör (validator.w3.org) eller DevTools.',
      'Kontrollera att element har korrekt öppnings- och stängningstaggar.',
      'Kontrollera att attribut inte dupliceras på samma element.',
      'Kontrollera att element-id är unika på sidan.',
    ],
    exceptions: [],
    controls: [
      'HTML-koden är välformad (korrekta öppnings-/stängningstaggar)',
      'Inga duplicerade id-attribut på sidan',
      'Inga duplicerade attribut på samma element',
      'Element med nästling följer HTML-specifikationens regler',
    ],
  },

  '4.1.2': {
    method: [
      'Aktivera en skärmläsare och navigera igenom alla interaktiva komponenter.',
      'Kontrollera att alla UI-komponenter har: namn (accessible name), roll (role), värde (value/state).',
      'Kontrollera att statusändringar kommuniceras till hjälpmedel (t.ex. expanderad/komprimerad).',
      'Använd DevTools Accessibility-panel för att inspektera accessibility tree.',
      'Kontrollera anpassade widgets (tabs, accordions, dropdowns) har korrekt ARIA-implementering.',
    ],
    exceptions: [],
    controls: [
      'Alla interaktiva element har ett tillgängligt namn',
      'Alla UI-komponenter har korrekt roll (role)',
      'Statusändringar kommuniceras (aria-expanded, aria-checked, aria-selected)',
      'Formulärfält har korrekt name, role och value',
      'Anpassade widgets följer ARIA Authoring Practices',
    ],
  },

  '4.1.3': {
    method: [
      'Identifiera alla statusmeddelanden på sidan (bekräftelser, fel, varningar, laddningsstatus).',
      'Kontrollera att statusmeddelanden är programmässigt bestämbara via role eller property.',
      'T.ex. role="status" för icke-kritiska meddelanden, role="alert" för viktiga meddelanden.',
      'Kontrollera att skärmläsaren annonserar meddelanden utan att fokus behöver flyttas.',
    ],
    exceptions: [],
    controls: [
      'Statusmeddelanden (framgång, fel, info) har role="status" eller role="alert"',
      'Skärmläsaren annonserar statusmeddelanden automatiskt',
      'Laddningsindikatorer kommuniceras till hjälpmedel (aria-live)',
    ],
  },
}

/** Hjälpfunktion: hämtar kategori för ett givet kriterie-id */
export function getCategoryForCriterion(criterionId) {
  return DIGG_CATEGORIES.find(c => c.criteriaIds.includes(criterionId)) ?? null
}

/** Hjälpfunktion: hämtar audit-data för ett kriterie-id, med fallback */
export function getAuditData(criterionId) {
  return DIGG_AUDIT_DATA[criterionId] ?? {
    method: ['Granska kriteriet manuellt enligt WCAG 2.2-specifikationen.'],
    exceptions: [],
    controls: ['Kriteriet uppfyller WCAG 2.2-kravet'],
  }
}
