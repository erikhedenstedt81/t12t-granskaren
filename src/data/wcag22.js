// WCAG 2.2 – alla 87 kriterier
export const wcag22 = [
  // ─── PRINCIPLE 1: PERCEIVABLE ───────────────────────────────────────────────

  // Guideline 1.1 – Text Alternatives
  {
    id: "1.1.1",
    name: "Non-text Content",
    nameSwedish: "Icke-textuellt innehåll",
    level: "A",
    principle: "Perceivable",
    description: "All non-text content has a text alternative that serves the equivalent purpose.",
    eaaCritical: true,
    commonIssues: [
      "Bilder saknar alt-attribut",
      "Dekorativa bilder har beskrivande alt-text istället för tom alt",
      "Ikoner och logotyper saknar tillgänglig namnbeteckning"
    ],
    suggestedFix: "Lägg till meningsfull alt-text på informativa bilder. Sätt alt=\"\" på dekorativa bilder. Ge knappar med enbart ikoner ett aria-label."
  },

  // Guideline 1.2 – Time-based Media
  {
    id: "1.2.1",
    name: "Audio-only and Video-only (Prerecorded)",
    nameSwedish: "Enbart ljud och enbart video (förinspelat)",
    level: "A",
    principle: "Perceivable",
    description: "Prerecorded audio-only and video-only content has an alternative.",
    eaaCritical: true,
    commonIssues: [
      "Poddar saknar transkription",
      "Animerade GIF-filer saknar textbeskrivning"
    ],
    suggestedFix: "Tillhandahåll en texttranskription för allt förinspelat ljud- och videoinnehåll utan ljud."
  },
  {
    id: "1.2.2",
    name: "Captions (Prerecorded)",
    nameSwedish: "Undertexter (förinspelat)",
    level: "A",
    principle: "Perceivable",
    description: "Captions are provided for all prerecorded audio content in synchronized media.",
    eaaCritical: true,
    commonIssues: [
      "Video saknar undertexter",
      "Automatiska undertexter är felaktiga och har inte granskats"
    ],
    suggestedFix: "Lägg till korrekta, synkroniserade undertexter på alla förinspelad videor. Granska och korrigera automatgenererade undertexter."
  },
  {
    id: "1.2.3",
    name: "Audio Description or Media Alternative (Prerecorded)",
    nameSwedish: "Syntolkning eller mediaalternativ (förinspelat)",
    level: "A",
    principle: "Perceivable",
    description: "An alternative for time-based media or audio description is provided for prerecorded video.",
    eaaCritical: false,
    commonIssues: [
      "Video saknar syntolkning för visuellt innehåll som inte beskrivs i dialogen",
      "Ingen textbaserad mediaalternativ erbjuds"
    ],
    suggestedFix: "Lägg till syntolkning eller erbjud en textbaserad alternativ som beskriver allt visuellt innehåll i videon."
  },
  {
    id: "1.2.4",
    name: "Captions (Live)",
    nameSwedish: "Undertexter (direktsänt)",
    level: "AA",
    principle: "Perceivable",
    description: "Captions are provided for all live audio content in synchronized media.",
    eaaCritical: true,
    commonIssues: [
      "Direktsända webbinarier och möten saknar realtidsundertexter",
      "Undertexter tillhandahålls inte vid direktsänd video"
    ],
    suggestedFix: "Använd tjänst för realtidsundertextning (CART) eller aktivera automatisk undertextning i videokonferensplattformen."
  },
  {
    id: "1.2.5",
    name: "Audio Description (Prerecorded)",
    nameSwedish: "Syntolkning (förinspelat)",
    level: "AA",
    principle: "Perceivable",
    description: "Audio description is provided for all prerecorded video content.",
    eaaCritical: false,
    commonIssues: [
      "Förinspelad video saknar syntolkning",
      "Syntolkning täcker inte all viktig visuell information"
    ],
    suggestedFix: "Skapa en syntolkad version av videon eller en utökad ljudbeskrivning som beskriver visuella händelser."
  },
  {
    id: "1.2.6",
    name: "Sign Language (Prerecorded)",
    nameSwedish: "Teckenspråk (förinspelat)",
    level: "AAA",
    principle: "Perceivable",
    description: "Sign language interpretation is provided for all prerecorded audio content.",
    eaaCritical: false,
    commonIssues: [
      "Viktigt videoinnehåll saknar teckenspråkstolkning",
    ],
    suggestedFix: "Lägg till teckenspråkstolkning som inbäddad video eller som separat alternativ."
  },
  {
    id: "1.2.7",
    name: "Extended Audio Description (Prerecorded)",
    nameSwedish: "Utökad syntolkning (förinspelat)",
    level: "AAA",
    principle: "Perceivable",
    description: "Extended audio description is provided for all prerecorded video content where pauses in foreground audio are insufficient.",
    eaaCritical: false,
    commonIssues: [
      "Videon innehåller tätt packad dialog utan utrymme för syntolkning"
    ],
    suggestedFix: "Skapa en version med utökad syntolkning där videon pausas för att möjliggöra beskrivning av visuellt innehåll."
  },
  {
    id: "1.2.8",
    name: "Media Alternative (Prerecorded)",
    nameSwedish: "Mediaalternativ (förinspelat)",
    level: "AAA",
    principle: "Perceivable",
    description: "An alternative for time-based media is provided for all prerecorded synchronized media.",
    eaaCritical: false,
    commonIssues: [
      "Inget fullständigt textbaserat alternativ finns för video"
    ],
    suggestedFix: "Erbjud ett fullständigt textbaserat mediaalternativ som inkluderar all dialog, ljud och visuell information."
  },
  {
    id: "1.2.9",
    name: "Audio-only (Live)",
    nameSwedish: "Enbart ljud (direktsänt)",
    level: "AAA",
    principle: "Perceivable",
    description: "An alternative for time-based media that presents equivalent information is provided for live audio-only content.",
    eaaCritical: false,
    commonIssues: [
      "Direktsänd radioutsändning saknar realtidstranskription"
    ],
    suggestedFix: "Tillhandahåll realtidstranskription för direktsänt ljudinnehåll."
  },

  // Guideline 1.3 – Adaptable
  {
    id: "1.3.1",
    name: "Info and Relationships",
    nameSwedish: "Information och relationer",
    level: "A",
    principle: "Perceivable",
    description: "Information, structure, and relationships conveyed through presentation can be programmatically determined.",
    eaaCritical: true,
    commonIssues: [
      "Tabeller saknar th-element och caption",
      "Formulärfält är inte kopplade till sina etiketter med for/id",
      "Rubriker sätts med CSS istället för h1–h6"
    ],
    suggestedFix: "Använd semantisk HTML: rubrikhierarki, label+input-koppling, ARIA-roller där HTML-element saknas. Koppla formuläretiketter med for-attribut."
  },
  {
    id: "1.3.2",
    name: "Meaningful Sequence",
    nameSwedish: "Meningsfull ordning",
    level: "A",
    principle: "Perceivable",
    description: "If the sequence in which content is presented affects its meaning, the correct reading sequence can be programmatically determined.",
    eaaCritical: false,
    commonIssues: [
      "CSS-grid eller flexbox ändrar visuell ordning utan att DOM-ordningen uppdateras",
      "Innehåll presenteras i fel ordning för skärmläsare"
    ],
    suggestedFix: "Se till att DOM-ordningen speglar den logiska läsordningen. Undvik att enbart ändra ordning med CSS order-property."
  },
  {
    id: "1.3.3",
    name: "Sensory Characteristics",
    nameSwedish: "Sensoriska egenskaper",
    level: "A",
    principle: "Perceivable",
    description: "Instructions do not rely solely on sensory characteristics such as shape, color, size, visual location, orientation, or sound.",
    eaaCritical: false,
    commonIssues: [
      "Instruktioner säger 'klicka på den gröna knappen' utan annan identifiering",
      "Navigation beskrivs enbart med 'menyn till höger'"
    ],
    suggestedFix: "Komplettera instruktioner baserade på form, färg eller position med textbaserade identifierare som namn eller funktion."
  },
  {
    id: "1.3.4",
    name: "Orientation",
    nameSwedish: "Orientering",
    level: "AA",
    principle: "Perceivable",
    description: "Content does not restrict its view and operation to a single display orientation unless essential.",
    eaaCritical: true,
    commonIssues: [
      "Appen låser skärmrotation till stående läge",
      "Innehåll visas inte korrekt i liggande läge"
    ],
    suggestedFix: "Ta bort CSS eller JavaScript-kod som låser skärmorienteringen. Testa att appen fungerar i både stående och liggande läge."
  },
  {
    id: "1.3.5",
    name: "Identify Input Purpose",
    nameSwedish: "Identifiera syfte med inmatning",
    level: "AA",
    principle: "Perceivable",
    description: "The purpose of each input field collecting information about the user can be programmatically determined.",
    eaaCritical: true,
    commonIssues: [
      "Formulärfält saknar autocomplete-attribut",
      "Namn-, e-post- och telefonfält saknar lämpliga autocomplete-värden"
    ],
    suggestedFix: "Lägg till autocomplete-attribut på formulärfält för personlig information, t.ex. autocomplete=\"name\", autocomplete=\"email\", autocomplete=\"tel\"."
  },
  {
    id: "1.3.6",
    name: "Identify Purpose",
    nameSwedish: "Identifiera syfte",
    level: "AAA",
    principle: "Perceivable",
    description: "The purpose of UI components, icons, and regions can be programmatically determined.",
    eaaCritical: false,
    commonIssues: [
      "Ikonknappar saknar programmatisk roll eller syftebeskrivning",
      "Sidregioner saknar ARIA-landmärken"
    ],
    suggestedFix: "Använd ARIA-landmärken (main, nav, aside) och lägg till aria-label på ikonknappar och regioner."
  },

  // Guideline 1.4 – Distinguishable
  {
    id: "1.4.1",
    name: "Use of Color",
    nameSwedish: "Användning av färg",
    level: "A",
    principle: "Perceivable",
    description: "Color is not used as the only visual means of conveying information.",
    eaaCritical: true,
    commonIssues: [
      "Obligatoriska formulärfält markeras enbart med röd färg",
      "Felmeddelanden visas enbart i rött utan ikon eller text"
    ],
    suggestedFix: "Kombinera alltid färgkodning med text, ikoner eller mönster. Visa t.ex. * och texten 'obligatoriskt' på obligatoriska fält."
  },
  {
    id: "1.4.2",
    name: "Audio Control",
    nameSwedish: "Ljudkontroll",
    level: "A",
    principle: "Perceivable",
    description: "Any audio that plays automatically for more than 3 seconds can be paused, stopped, or have volume controlled.",
    eaaCritical: false,
    commonIssues: [
      "Bakgrundsmusik startar automatiskt utan kontroller",
      "Video spelas upp automatiskt med ljud"
    ],
    suggestedFix: "Stäng av automatisk uppspelning av ljud. Om ljud måste spelas automatiskt, tillhandahåll synliga kontroller för att pausa eller stänga av."
  },
  {
    id: "1.4.3",
    name: "Contrast (Minimum)",
    nameSwedish: "Kontrast (minimum)",
    level: "AA",
    principle: "Perceivable",
    description: "Text and images of text have a contrast ratio of at least 4.5:1 (3:1 for large text).",
    eaaCritical: true,
    commonIssues: [
      "Ljusgrå text på vit bakgrund uppfyller inte kontrastkrav",
      "Platshållartext i inputfält har för låg kontrast",
      "Inaktiverade knappar med text har för låg kontrast"
    ],
    suggestedFix: "Kontrollera kontrastförhållanden med ett verktyg som WebAIM Contrast Checker. Minst 4.5:1 för normal text, 3:1 för text ≥18pt eller ≥14pt fet."
  },
  {
    id: "1.4.4",
    name: "Resize Text",
    nameSwedish: "Ändra textstorlek",
    level: "AA",
    principle: "Perceivable",
    description: "Text can be resized without assistive technology up to 200 percent without loss of content or functionality.",
    eaaCritical: true,
    commonIssues: [
      "Text är satt i pixlar och bryts eller döljs vid 200% zoom",
      "Fast höjd på containrar gör att text klipps bort vid förstoring"
    ],
    suggestedFix: "Använd relativa enheter (rem, em, %) för textstorlekar och höjder. Testa sidan i webbläsaren vid 200% textzoom."
  },
  {
    id: "1.4.5",
    name: "Images of Text",
    nameSwedish: "Bilder av text",
    level: "AA",
    principle: "Perceivable",
    description: "Text is used instead of images of text where possible.",
    eaaCritical: false,
    commonIssues: [
      "Logotyper och banners använder bilder med inbäddad text",
      "Citat och rubriker renderas som bilder"
    ],
    suggestedFix: "Ersätt bilder med text med riktig HTML-text styled med CSS. Undantag gäller för logotyper och dekorativa element."
  },
  {
    id: "1.4.6",
    name: "Contrast (Enhanced)",
    nameSwedish: "Kontrast (förbättrad)",
    level: "AAA",
    principle: "Perceivable",
    description: "Text and images of text have a contrast ratio of at least 7:1.",
    eaaCritical: false,
    commonIssues: [
      "Text uppfyller bara minimikravet 4.5:1 men inte det förstärkta 7:1"
    ],
    suggestedFix: "Öka kontrastförhållandet till minst 7:1 för all text (3:1 undantag för stor text gäller inte här; det är 4.5:1)."
  },
  {
    id: "1.4.7",
    name: "Low or No Background Audio",
    nameSwedish: "Lågt eller inget bakgrundsljud",
    level: "AAA",
    principle: "Perceivable",
    description: "Prerecorded audio-only content has no background noise, or can be turned off, or is at least 20dB lower than foreground speech.",
    eaaCritical: false,
    commonIssues: [
      "Bakgrundsmusik i podcasts är för hög och stör förståelsen"
    ],
    suggestedFix: "Se till att bakgrundsljud är minst 20 dB lägre än talinnehållet, eller erbjud en version utan bakgrundsljud."
  },
  {
    id: "1.4.8",
    name: "Visual Presentation",
    nameSwedish: "Visuell presentation",
    level: "AAA",
    principle: "Perceivable",
    description: "For blocks of text, foreground and background colors can be selected, width is no more than 80 characters, text is not justified, line spacing is at least 1.5, and text can be resized without scrolling.",
    eaaCritical: false,
    commonIssues: [
      "Textblock är bredare än 80 tecken",
      "Marginaljusterad text skapar ojämna mellanrum"
    ],
    suggestedFix: "Begränsa textblocksbredden till 80 tecken, använd vänsterjusterad text, och sätt radavstånd till minst 1.5."
  },
  {
    id: "1.4.9",
    name: "Images of Text (No Exception)",
    nameSwedish: "Bilder av text (utan undantag)",
    level: "AAA",
    principle: "Perceivable",
    description: "Images of text are only used for pure decoration or where a particular presentation is essential.",
    eaaCritical: false,
    commonIssues: [
      "Textinnehåll renderas fortfarande som bilder trots möjlighet att använda riktig text"
    ],
    suggestedFix: "Ersätt alla bilder med text med HTML-text och CSS-styling, utom för logotyper och helt dekorativa element."
  },
  {
    id: "1.4.10",
    name: "Reflow",
    nameSwedish: "Omflöde",
    level: "AA",
    principle: "Perceivable",
    description: "Content can be presented without loss of information or functionality at 320 CSS pixels width without horizontal scrolling.",
    eaaCritical: true,
    commonIssues: [
      "Innehåll kräver horisontell scrollning vid 320px bredd",
      "Tabeller och diagram flödar inte om korrekt på smala skärmar"
    ],
    suggestedFix: "Implementera responsiv design med CSS flexbox/grid. Testa vid 320px bredd (400% zoom på 1280px skärm). Undvik horisontell scroll."
  },
  {
    id: "1.4.11",
    name: "Non-text Contrast",
    nameSwedish: "Kontrast för icke-text",
    level: "AA",
    principle: "Perceivable",
    description: "UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.",
    eaaCritical: true,
    commonIssues: [
      "Formulärfältsgränser syns inte mot bakgrunden",
      "Fokusborder har för låg kontrast",
      "Diagram och grafer har för låg kontrast på datapunkter"
    ],
    suggestedFix: "Se till att gränser runt interaktiva element, ikoner och grafiska element har minst 3:1 kontrastförhållande mot angränsande bakgrundsfärg."
  },
  {
    id: "1.4.12",
    name: "Text Spacing",
    nameSwedish: "Textavstånd",
    level: "AA",
    principle: "Perceivable",
    description: "No loss of content when overriding text spacing properties (line height ≥1.5, letter spacing ≥0.12em, word spacing ≥0.16em, paragraph spacing ≥2em).",
    eaaCritical: false,
    commonIssues: [
      "Text klipps bort när radavstånd ökas via användarstylesheet",
      "Fasta höjder på containrar döljer text vid ökade avstånd"
    ],
    suggestedFix: "Undvik fasta höjder på textelement. Testa med bookmarklet som lägger till WCAG-definierade textavstånd."
  },
  {
    id: "1.4.13",
    name: "Content on Hover or Focus",
    nameSwedish: "Innehåll vid hovring eller fokus",
    level: "AA",
    principle: "Perceivable",
    description: "Where hover or focus triggers additional content, that content is dismissible, hoverable, and persistent.",
    eaaCritical: false,
    commonIssues: [
      "Tooltips försvinner när användaren försöker flytta musen till dem",
      "Popup-innehåll kan inte stängas med Escape-tangenten",
      "Hover-innehåll försvinner för snabbt"
    ],
    suggestedFix: "Se till att tooltip-innehåll (1) kan stängas med Escape utan att flytta fokus, (2) förblir synligt när musen hovrar över det, (3) förblir synligt tills användaren stänger det."
  },

  // ─── PRINCIPLE 2: OPERABLE ──────────────────────────────────────────────────

  // Guideline 2.1 – Keyboard Accessible
  {
    id: "2.1.1",
    name: "Keyboard",
    nameSwedish: "Tangentbord",
    level: "A",
    principle: "Operable",
    description: "All functionality is operable through a keyboard interface.",
    eaaCritical: true,
    commonIssues: [
      "Anpassade widgets som dragspel och flikar kan inte användas med tangentbord",
      "JavaScript-händelsehanterare använder enbart onmousedown",
      "Knappar implementerade som div-element utan tangentbordshantering"
    ],
    suggestedFix: "Använd semantiska HTML-element (button, a, input) som är tangentbordsåtkomliga per default. För anpassade widgets, implementera tangentbordshantering enligt ARIA Authoring Practices."
  },
  {
    id: "2.1.2",
    name: "No Keyboard Trap",
    nameSwedish: "Inget tangentbordsfälla",
    level: "A",
    principle: "Operable",
    description: "Keyboard focus can be moved away from a component using only the keyboard.",
    eaaCritical: true,
    commonIssues: [
      "Fokus fastnar i modaldialog som inte stängs med Escape",
      "Inbäddat plugin eller iframe fångar tangentbordsfokus"
    ],
    suggestedFix: "Testa att Tab och Escape alltid kan flytta fokus ut ur komponenter. Implementera fokushantering i modaler: fånga fokus inuti modalen men tillåt Escape att stänga."
  },
  {
    id: "2.1.3",
    name: "Keyboard (No Exception)",
    nameSwedish: "Tangentbord (utan undantag)",
    level: "AAA",
    principle: "Operable",
    description: "All functionality is operable through a keyboard interface without exception.",
    eaaCritical: false,
    commonIssues: [
      "Viss funktionalitet förlitar sig på frihands- eller geströrelser"
    ],
    suggestedFix: "Implementera tangentbordsalternativ för all funktionalitet, inklusive ritverktyg och dra-och-släpp."
  },
  {
    id: "2.1.4",
    name: "Character Key Shortcuts",
    nameSwedish: "Kortkommandon med teckentangenter",
    level: "A",
    principle: "Operable",
    description: "Single character keyboard shortcuts can be turned off, remapped, or activated only on focus.",
    eaaCritical: false,
    commonIssues: [
      "Enstaka bokstavstangenter aktiverar funktioner och stör röststyrningsanvändare",
      "Kortkommandon kan inte stängas av"
    ],
    suggestedFix: "Erbjud möjlighet att stänga av eller mappa om enkelbokstavskortkommandon. Alternativt, aktivera dem bara när relevant komponent har fokus."
  },

  // Guideline 2.2 – Enough Time
  {
    id: "2.2.1",
    name: "Timing Adjustable",
    nameSwedish: "Justerbar tidsgräns",
    level: "A",
    principle: "Operable",
    description: "For time limits, users can turn off, adjust, or extend the time limit.",
    eaaCritical: true,
    commonIssues: [
      "Session timeout ger inte varning eller möjlighet att förlänga",
      "Tidsbegränsade formulär loggar ut utan förvarning"
    ],
    suggestedFix: "Varna användaren minst 20 sekunder innan session löper ut och erbjud möjlighet att förlänga med ett enkelt steg. Undvik tidsbegränsningar om möjligt."
  },
  {
    id: "2.2.2",
    name: "Pause, Stop, Hide",
    nameSwedish: "Pausa, stoppa, dölj",
    level: "A",
    principle: "Operable",
    description: "Moving, blinking, scrolling, or auto-updating content can be paused, stopped, or hidden.",
    eaaCritical: false,
    commonIssues: [
      "Animerade banners och karuseller kan inte pausas",
      "Automatiskt uppdaterande nyhetsflöde stör tangentbordsanvändare"
    ],
    suggestedFix: "Lägg till pausa/stoppa-kontroller för allt rörligt eller automatiskt uppdaterande innehåll som varar mer än 5 sekunder."
  },
  {
    id: "2.2.3",
    name: "No Timing",
    nameSwedish: "Ingen tidsbegränsning",
    level: "AAA",
    principle: "Operable",
    description: "Timing is not an essential part of the event or activity presented.",
    eaaCritical: false,
    commonIssues: [
      "Tidspress används i icke-essentiella interaktioner"
    ],
    suggestedFix: "Ta bort tidsbegränsningar från innehåll och interaktioner där de inte är absolut nödvändiga."
  },
  {
    id: "2.2.4",
    name: "Interruptions",
    nameSwedish: "Avbrott",
    level: "AAA",
    principle: "Operable",
    description: "Interruptions can be postponed or suppressed by the user.",
    eaaCritical: false,
    commonIssues: [
      "Push-notiser kan inte fördröjas av användaren"
    ],
    suggestedFix: "Ge användaren möjlighet att skjuta upp eller stänga av avbrott som notiser och varningar."
  },
  {
    id: "2.2.5",
    name: "Re-authenticating",
    nameSwedish: "Återautentisering",
    level: "AAA",
    principle: "Operable",
    description: "When an authenticated session expires, data entered is preserved so the user can continue after re-authentication.",
    eaaCritical: false,
    commonIssues: [
      "Formulärdata förloras efter sessionstimeout"
    ],
    suggestedFix: "Spara formulärdata lokalt och återställ det efter att användaren autentiserat sig igen."
  },
  {
    id: "2.2.6",
    name: "Timeouts",
    nameSwedish: "Tidsgränser",
    level: "AAA",
    principle: "Operable",
    description: "Users are warned of the duration of any inactivity that could cause data loss.",
    eaaCritical: false,
    commonIssues: [
      "Användare informeras inte om tidsgräns som kan orsaka dataförlust"
    ],
    suggestedFix: "Informera tydligt om tidsgränser vid inaktivitet i samband med datainhämtning."
  },

  // Guideline 2.3 – Seizures and Physical Reactions
  {
    id: "2.3.1",
    name: "Three Flashes or Below Threshold",
    nameSwedish: "Tre blixtar eller under tröskelvärde",
    level: "A",
    principle: "Operable",
    description: "Content does not flash more than three times per second, or the flash is below general flash and red flash thresholds.",
    eaaCritical: true,
    commonIssues: [
      "Animationer blinkar mer än 3 gånger per sekund",
      "Video innehåller blixtande sekvenser"
    ],
    suggestedFix: "Se till att inget innehåll blinkar mer än 3 gånger per sekund. Testa video med PEAT-verktyget."
  },
  {
    id: "2.3.2",
    name: "Three Flashes",
    nameSwedish: "Tre blixtar",
    level: "AAA",
    principle: "Operable",
    description: "Content does not flash more than three times in any one second period.",
    eaaCritical: false,
    commonIssues: [
      "Innehåll blinkar exakt 3 gånger per sekund (uppfyller A men inte AAA)"
    ],
    suggestedFix: "Eliminera all blinkande effekt, eller reducera till max 2 gånger per sekund."
  },
  {
    id: "2.3.3",
    name: "Animation from Interactions",
    nameSwedish: "Animationer från interaktioner",
    level: "AAA",
    principle: "Operable",
    description: "Motion animation triggered by interaction can be disabled unless essential.",
    eaaCritical: false,
    commonIssues: [
      "Parallax-effekter och scroll-animationer kan inte stängas av"
    ],
    suggestedFix: "Respektera prefers-reduced-motion media query och inaktivera icke-nödvändiga animationer."
  },

  // Guideline 2.4 – Navigable
  {
    id: "2.4.1",
    name: "Bypass Blocks",
    nameSwedish: "Hoppa över block",
    level: "A",
    principle: "Operable",
    description: "A mechanism is available to bypass blocks of content that are repeated on multiple pages.",
    eaaCritical: true,
    commonIssues: [
      "Ingen 'hoppa till huvudinnehåll'-länk finns",
      "Sidlayout har ingen semantisk struktur som skärmläsare kan navigera med"
    ],
    suggestedFix: "Lägg till en synlig (eller focusbaren) 'Hoppa till innehåll'-länk som första element i sidan. Använd ARIA-landmärken (main, nav)."
  },
  {
    id: "2.4.2",
    name: "Page Titled",
    nameSwedish: "Sidrubrik",
    level: "A",
    principle: "Operable",
    description: "Web pages have titles that describe topic or purpose.",
    eaaCritical: false,
    commonIssues: [
      "Alla sidor har samma generiska titel",
      "Titeln beskriver inte syftet med sidan"
    ],
    suggestedFix: "Sätt unika, beskrivande titlar med formatet 'Sidnamn – Webbplatsnamn' i <title>-elementet."
  },
  {
    id: "2.4.3",
    name: "Focus Order",
    nameSwedish: "Fokusordning",
    level: "A",
    principle: "Operable",
    description: "If a web page can be navigated sequentially and the navigation sequences affect meaning, focusable components receive focus in an order that preserves meaning and operability.",
    eaaCritical: true,
    commonIssues: [
      "tabindex med positiva värden skapar förvirrande fokusordning",
      "Fokus hoppar slumpmässigt runt på sidan"
    ],
    suggestedFix: "Undvik positiva tabindex-värden. Låt DOM-ordningen styra fokusordningen. Testa genom att tabba igenom hela sidan."
  },
  {
    id: "2.4.4",
    name: "Link Purpose (In Context)",
    nameSwedish: "Länkens syfte (i sammanhang)",
    level: "A",
    principle: "Operable",
    description: "The purpose of each link can be determined from the link text alone or from the link text together with its context.",
    eaaCritical: true,
    commonIssues: [
      "Flera 'Läs mer'-länkar utan sammanhang",
      "Ikoner som länktexter saknar aria-label",
      "'Klicka här'-texter"
    ],
    suggestedFix: "Skriv beskrivande länktexter. Lägg till aria-label eller aria-describedby för att ge kontext när länktexten är generisk."
  },
  {
    id: "2.4.5",
    name: "Multiple Ways",
    nameSwedish: "Flera sätt",
    level: "AA",
    principle: "Operable",
    description: "More than one way is available to locate a web page within a set of web pages.",
    eaaCritical: false,
    commonIssues: [
      "Sidor kan bara nås via navigeringsmenyn utan sökfunktion eller webbplatskarta"
    ],
    suggestedFix: "Tillhandahåll minst två av: webbplatssökning, webbplatskarta, navigeringshierarki, eller breadcrumbs."
  },
  {
    id: "2.4.6",
    name: "Headings and Labels",
    nameSwedish: "Rubriker och etiketter",
    level: "AA",
    principle: "Operable",
    description: "Headings and labels describe topic or purpose.",
    eaaCritical: false,
    commonIssues: [
      "Rubriker är generiska och icke-beskrivande (t.ex. 'Sektion 1')",
      "Formuläretiketter beskriver inte vad som ska fyllas i"
    ],
    suggestedFix: "Skriv beskrivande rubriker och etiketter som tydligt förklarar innehållets syfte."
  },
  {
    id: "2.4.7",
    name: "Focus Visible",
    nameSwedish: "Fokus synlig",
    level: "AA",
    principle: "Operable",
    description: "Any keyboard operable user interface has a mode where the keyboard focus indicator is visible.",
    eaaCritical: true,
    commonIssues: [
      "CSS outline: none eller outline: 0 tar bort fokusborden",
      "Anpassad fokusindikatorer är för subtila"
    ],
    suggestedFix: "Ta aldrig bort fokusindikatorn med CSS. Om du anpassar den, se till att den är tydlig med tillräcklig kontrast (minst 3:1)."
  },
  {
    id: "2.4.8",
    name: "Location",
    nameSwedish: "Plats",
    level: "AAA",
    principle: "Operable",
    description: "Information about the user's location within a set of web pages is available.",
    eaaCritical: false,
    commonIssues: [
      "Ingen breadcrumb eller annan platsindikator på djupa sidor"
    ],
    suggestedFix: "Implementera breadcrumbs, markera aktiv sida i navigationerna, eller visa webbplatshierarki."
  },
  {
    id: "2.4.9",
    name: "Link Purpose (Link Only)",
    nameSwedish: "Länkens syfte (enbart länk)",
    level: "AAA",
    principle: "Operable",
    description: "A mechanism is available to identify the purpose of each link from the link text alone.",
    eaaCritical: false,
    commonIssues: [
      "Länktexter kräver omgivande kontext för att förstås"
    ],
    suggestedFix: "Gör varje länktext självbeskrivande, utan behov av omgivande kontext."
  },
  {
    id: "2.4.10",
    name: "Section Headings",
    nameSwedish: "Avsnittsrubriker",
    level: "AAA",
    principle: "Operable",
    description: "Section headings are used to organize the content.",
    eaaCritical: false,
    commonIssues: [
      "Långa sidor saknar rubrikstruktur",
      "Innehåll är inte organiserat med meningsfulla avsnitt"
    ],
    suggestedFix: "Använd rubrikhierarkin (h1–h6) konsekvent för att dela upp innehåll i logiska avsnitt."
  },
  // WCAG 2.2 NYA KRITERIER
  {
    id: "2.4.11",
    name: "Focus Appearance",
    nameSwedish: "Fokusens utseende",
    level: "AA",
    principle: "Operable",
    description: "The keyboard focus indicator has sufficient area and contrast: the focus area is at least as large as a 2 CSS pixel perimeter and the focus color has at least 3:1 contrast change.",
    eaaCritical: true,
    commonIssues: [
      "Fokusborder är för tunn (1px) för att uppfylla ytakravet",
      "Fokusindikatorn har för låg kontrast mot bakgrunden"
    ],
    suggestedFix: "Implementera en fokusindikator med minst 2px tjocklek runt hela elementet och 3:1 kontrastförhållande. Testa med tangentbordsnavigation."
  },
  {
    id: "2.4.12",
    name: "Focus Appearance (Enhanced)",
    nameSwedish: "Fokusens utseende (förbättrad)",
    level: "AAA",
    principle: "Operable",
    description: "The keyboard focus indicator has an area of at least the perimeter of the unfocused component × 2 CSS pixels, and a contrast ratio of at least 3:1 between focused and unfocused states.",
    eaaCritical: false,
    commonIssues: [
      "Fokusindikator uppfyller AA men inte det förstärkta AAA-kravet"
    ],
    suggestedFix: "Utöka fokusindikatorn så att arean är minst elementets perimeter × 2px och kontrasten är minst 3:1."
  },
  {
    id: "2.4.13",
    name: "Focus Appearance (AAA)",
    nameSwedish: "Fokusens utseende (AAA)",
    level: "AAA",
    principle: "Operable",
    description: "Keyboard focus indicator is highly visible with enhanced contrast and size requirements.",
    eaaCritical: false,
    commonIssues: [
      "Fokusindikatorn saknar tillräcklig synlighet för användare med nedsatt syn"
    ],
    suggestedFix: "Skapa en kraftfull, tydlig fokusindikator med hög kontrast och tillräcklig storlek."
  },

  // Guideline 2.5 – Input Modalities
  {
    id: "2.5.1",
    name: "Pointer Gestures",
    nameSwedish: "Pekarens gester",
    level: "A",
    principle: "Operable",
    description: "All functionality using multipoint or path-based gestures can also be operated with a single pointer.",
    eaaCritical: true,
    commonIssues: [
      "Svep-gester för navigering saknar alternativa knappar",
      "Kartor och diagram kräver nyptning för zoom"
    ],
    suggestedFix: "Tillhandahåll enkelpeksknappar som alternativ till alla flerpekar- eller banbaserade gester."
  },
  {
    id: "2.5.2",
    name: "Pointer Cancellation",
    nameSwedish: "Avbrytning av pekare",
    level: "A",
    principle: "Operable",
    description: "For single pointer functionality, at least one of: no down-event, can abort/undo, up-event reversal, or essential exception applies.",
    eaaCritical: false,
    commonIssues: [
      "Åtgärder aktiveras vid mousedown/touchstart istället för mouseup/click",
      "Det går inte att avbryta en oavsiktlig knapptryckning"
    ],
    suggestedFix: "Aktivera åtgärder vid mouseup/click-händelse, inte mousedown. Låt användaren avbryta genom att flytta pekaren bort från elementet."
  },
  {
    id: "2.5.3",
    name: "Label in Name",
    nameSwedish: "Etikett i namn",
    level: "A",
    principle: "Operable",
    description: "For UI components with labels that include text or images of text, the accessible name contains the visible text.",
    eaaCritical: true,
    commonIssues: [
      "aria-label ersätter synlig text istället för att innehålla den",
      "Knappens tillgängliga namn matchar inte den synliga texten"
    ],
    suggestedFix: "Se till att det tillgängliga namnet (aria-label, aria-labelledby) innehåller den synliga texten som delsträng."
  },
  {
    id: "2.5.4",
    name: "Motion Actuation",
    nameSwedish: "Rörelseaktivering",
    level: "A",
    principle: "Operable",
    description: "Functionality triggered by device or user motion can be operated by UI components and motion can be disabled.",
    eaaCritical: false,
    commonIssues: [
      "Skaka-för-att-ångra kan inte stängas av",
      "Rörelsestyrd funktionalitet saknar alternativ"
    ],
    suggestedFix: "Tillhandahåll ett UI-alternativ för all rörelsestyrd funktionalitet. Låt användaren stänga av rörelsedetektering."
  },
  {
    id: "2.5.5",
    name: "Target Size (Enhanced)",
    nameSwedish: "Målstorlek (förbättrad)",
    level: "AAA",
    principle: "Operable",
    description: "The size of the target for pointer inputs is at least 44 by 44 CSS pixels.",
    eaaCritical: false,
    commonIssues: [
      "Knappar och länkars klickyta är för liten (under 44×44px)"
    ],
    suggestedFix: "Se till att alla interaktiva element är minst 44×44 CSS-pixlar i storlek, inklusive padding."
  },
  {
    id: "2.5.6",
    name: "Concurrent Input Mechanisms",
    nameSwedish: "Samtida inmatningsmekanismer",
    level: "AAA",
    principle: "Operable",
    description: "Web content does not restrict use of input modalities available on a platform.",
    eaaCritical: false,
    commonIssues: [
      "Sidan blockerar användning av touch-inmatning",
      "JavaScript begränsar tillgängliga inmatningssätt"
    ],
    suggestedFix: "Ta bort restriktioner som hindrar användning av alla tillgängliga inmatningsmetoder (mus, touch, tangentbord, penna)."
  },
  // WCAG 2.2 NYA KRITERIER
  {
    id: "2.5.7",
    name: "Dragging Movements",
    nameSwedish: "Dragningsrörelser",
    level: "AA",
    principle: "Operable",
    description: "All functionality using dragging movements can be achieved with a single pointer without dragging, unless dragging is essential.",
    eaaCritical: true,
    commonIssues: [
      "Dra-och-släpp-funktionalitet saknar alternativ för användare som inte kan dra",
      "Sorteringslistor kräver dra-och-släpp utan knappalternativ"
    ],
    suggestedFix: "Implementera knappar eller andra enkelpekskontroller som alternativ till drag-och-släpp för all funktionalitet."
  },
  {
    id: "2.5.8",
    name: "Target Size (Minimum)",
    nameSwedish: "Målstorlek (minimum)",
    level: "AA",
    principle: "Operable",
    description: "The size of the target is at least 24 by 24 CSS pixels, or has sufficient spacing.",
    eaaCritical: true,
    commonIssues: [
      "Kryssrutor och radioknappar är för små att klicka på",
      "Ikoner i verktygsfält har för liten klickyta"
    ],
    suggestedFix: "Se till att interaktiva element är minst 24×24 CSS-pixlar, eller att det finns tillräcklig marginal runt elementet."
  },

  // ─── PRINCIPLE 3: UNDERSTANDABLE ────────────────────────────────────────────

  // Guideline 3.1 – Readable
  {
    id: "3.1.1",
    name: "Language of Page",
    nameSwedish: "Sidans språk",
    level: "A",
    principle: "Understandable",
    description: "The default human language of each web page can be programmatically determined.",
    eaaCritical: false,
    commonIssues: [
      "HTML-elementet saknar lang-attribut",
      "Fel språkkod används (t.ex. 'en' på en svensk sida)"
    ],
    suggestedFix: "Lägg till korrekt lang-attribut på html-elementet, t.ex. <html lang=\"sv\"> för svenska sidor."
  },
  {
    id: "3.1.2",
    name: "Language of Parts",
    nameSwedish: "Delarnas språk",
    level: "AA",
    principle: "Understandable",
    description: "The human language of each passage or phrase can be programmatically determined.",
    eaaCritical: false,
    commonIssues: [
      "Citat och fraser på annat språk saknar lang-attribut",
      "Engelska produktnamn på en svensk sida uttalas felaktigt av skärmläsare"
    ],
    suggestedFix: "Märk upp text på annat språk med lang-attribut på omgivande element, t.ex. <span lang=\"en\">lorem ipsum</span>."
  },
  {
    id: "3.1.3",
    name: "Unusual Words",
    nameSwedish: "Ovanliga ord",
    level: "AAA",
    principle: "Understandable",
    description: "A mechanism is available for identifying specific definitions of words used in an unusual or restricted way.",
    eaaCritical: false,
    commonIssues: [
      "Facktermer och jargong förklaras inte"
    ],
    suggestedFix: "Tillhandahåll ordlista, definitioner i texten, eller glossary-komponent för facktermer."
  },
  {
    id: "3.1.4",
    name: "Abbreviations",
    nameSwedish: "Förkortningar",
    level: "AAA",
    principle: "Understandable",
    description: "A mechanism for identifying the expanded form or meaning of abbreviations is available.",
    eaaCritical: false,
    commonIssues: [
      "Förkortningar används utan förklaring första gången"
    ],
    suggestedFix: "Använd <abbr>-elementet med title-attribut, eller skriv ut förkortningar vid första användningen."
  },
  {
    id: "3.1.5",
    name: "Reading Level",
    nameSwedish: "Läsnivå",
    level: "AAA",
    principle: "Understandable",
    description: "When text requires more than lower secondary education level, supplemental content is available.",
    eaaCritical: false,
    commonIssues: [
      "Komplex text saknar förenklad version"
    ],
    suggestedFix: "Erbjud en lättläst version av komplex text, eller förenkla originaltexten."
  },
  {
    id: "3.1.6",
    name: "Pronunciation",
    nameSwedish: "Uttal",
    level: "AAA",
    principle: "Understandable",
    description: "A mechanism for identifying the specific pronunciation of words is available where meaning is ambiguous without pronunciation.",
    eaaCritical: false,
    commonIssues: [
      "Ord med tvetydigt uttal saknar uttalsvägledning"
    ],
    suggestedFix: "Tillhandahåll fonetisk transkription eller ljudfiler för ord vars uttal är tvetydigt."
  },

  // Guideline 3.2 – Predictable
  {
    id: "3.2.1",
    name: "On Focus",
    nameSwedish: "Vid fokus",
    level: "A",
    principle: "Understandable",
    description: "Receiving focus does not automatically trigger a change of context.",
    eaaCritical: false,
    commonIssues: [
      "Dropdown-menyer öppnar ny sida när alternativ fokuseras",
      "Formulär skickas automatiskt när fält fokuseras"
    ],
    suggestedFix: "Undvik kontextändring vid enbart fokus. Kräv alltid användarinteraktion (klick eller Enter) för att trigga ändringar."
  },
  {
    id: "3.2.2",
    name: "On Input",
    nameSwedish: "Vid inmatning",
    level: "A",
    principle: "Understandable",
    description: "Changing the setting of a UI component does not automatically cause a change of context unless the user has been advised.",
    eaaCritical: false,
    commonIssues: [
      "Radioknappar eller checkboxar navigerar automatiskt till ny sida vid val",
      "Select-element skickar formuläret automatiskt vid ändring"
    ],
    suggestedFix: "Kräv en explicit skicka-knapp för formulär. Om automatisk kontextändring vid inmatning behövs, informera användaren i förväg."
  },
  {
    id: "3.2.3",
    name: "Consistent Navigation",
    nameSwedish: "Konsekvent navigering",
    level: "AA",
    principle: "Understandable",
    description: "Navigational mechanisms that are repeated on multiple pages occur in the same relative order.",
    eaaCritical: false,
    commonIssues: [
      "Navigeringens ordning förändras mellan sidor",
      "Breadcrumbs och sidfot visas på olika platser på olika sidor"
    ],
    suggestedFix: "Behåll navigeringselement i samma relativa ordning på alla sidor."
  },
  {
    id: "3.2.4",
    name: "Consistent Identification",
    nameSwedish: "Konsekvent identifiering",
    level: "AA",
    principle: "Understandable",
    description: "Components with the same functionality are identified consistently.",
    eaaCritical: false,
    commonIssues: [
      "Sökfält kallas olika saker på olika sidor ('Sök', 'Hitta', 'Filtrera')",
      "Stäng-knappar har olika ikoner och texter på olika sidor"
    ],
    suggestedFix: "Använd konsekvent terminologi och ikoner för samma funktionalitet på hela webbplatsen."
  },
  {
    id: "3.2.5",
    name: "Change on Request",
    nameSwedish: "Förändring på begäran",
    level: "AAA",
    principle: "Understandable",
    description: "Changes of context are initiated only by user request or a mechanism to turn off automatic changes is available.",
    eaaCritical: false,
    commonIssues: [
      "Automatiska omdirigeringar sker utan användarens begäran"
    ],
    suggestedFix: "Ta bort automatiska kontextändringar. Låt användaren explicit initiera alla kontextförändringar."
  },
  // WCAG 2.2 NYA KRITERIER
  {
    id: "3.2.6",
    name: "Consistent Help",
    nameSwedish: "Konsekvent hjälp",
    level: "A",
    principle: "Understandable",
    description: "Help mechanisms appear in the same location across pages.",
    eaaCritical: true,
    commonIssues: [
      "Hjälplänk eller kontaktinformation förekommer på olika platser på olika sidor",
      "Chatt-widget visas på vissa sidor men inte andra"
    ],
    suggestedFix: "Placera hjälpmekanismer (kontaktlänk, chatteknapp, FAQ-länk) på samma plats på alla sidor, t.ex. konsekvent i sidhuvudet eller sidfoten."
  },

  // Guideline 3.3 – Input Assistance
  {
    id: "3.3.1",
    name: "Error Identification",
    nameSwedish: "Identifiering av fel",
    level: "A",
    principle: "Understandable",
    description: "If an input error is automatically detected, the item that is in error is identified and the error is described to the user in text.",
    eaaCritical: true,
    commonIssues: [
      "Felmeddelanden saknar referens till vilket fält som är felaktigt",
      "Felmeddelanden visas enbart visuellt utan koppling till formulärfältet"
    ],
    suggestedFix: "Visa tydliga textfelmeddelanden direkt kopplade till fältet (via aria-describedby). Flytta fokus till felmeddelandet eller det felaktiga fältet."
  },
  {
    id: "3.3.2",
    name: "Labels or Instructions",
    nameSwedish: "Etiketter eller instruktioner",
    level: "A",
    principle: "Understandable",
    description: "Labels or instructions are provided when content requires user input.",
    eaaCritical: true,
    commonIssues: [
      "Formulärfält saknar synliga etiketter",
      "Datumformat eller krav specificeras inte för fältet"
    ],
    suggestedFix: "Ge alla formulärfält synliga etiketter. Beskriv förväntade format och krav (t.ex. 'ÅÅÅÅ-MM-DD') nära fältet."
  },
  {
    id: "3.3.3",
    name: "Error Suggestion",
    nameSwedish: "Felförslag",
    level: "AA",
    principle: "Understandable",
    description: "If an input error is automatically detected and suggestions for correction are known, the suggestion is provided to the user.",
    eaaCritical: true,
    commonIssues: [
      "Felmeddelanden anger bara att fältet är fel, inte hur det ska korrigeras",
      "Valideringsfel ger ingen vägledning om korrekt format"
    ],
    suggestedFix: "Ange specifika korrigeringsförslag i felmeddelanden, t.ex. 'Ange e-post i formatet namn@exempel.se'."
  },
  {
    id: "3.3.4",
    name: "Error Prevention (Legal, Financial, Data)",
    nameSwedish: "Felförebyggande (juridik, finans, data)",
    level: "AA",
    principle: "Understandable",
    description: "For pages causing legal commitments or financial transactions, submissions are reversible, checked, or confirmed.",
    eaaCritical: true,
    commonIssues: [
      "Beställningar kan inte ångras eller granskas innan slutgiltig bekräftelse",
      "Permanent radering av data ber inte om bekräftelse"
    ],
    suggestedFix: "Implementera granskningssteg och bekräftelse för alla köp, betalningar och juridiska åtaganden. Erbjud möjlighet att ångra."
  },
  {
    id: "3.3.5",
    name: "Help",
    nameSwedish: "Hjälp",
    level: "AAA",
    principle: "Understandable",
    description: "Context-sensitive help is available.",
    eaaCritical: false,
    commonIssues: [
      "Komplexa formulär saknar sammanhangsbaserad hjälp"
    ],
    suggestedFix: "Tillhandahåll kontextuell hjälptext, tooltips eller länk till hjälpsida nära komplexa formulärfält."
  },
  {
    id: "3.3.6",
    name: "Error Prevention (All)",
    nameSwedish: "Felförebyggande (alla)",
    level: "AAA",
    principle: "Understandable",
    description: "For pages requiring user submission, submissions are reversible, checked, or confirmed.",
    eaaCritical: false,
    commonIssues: [
      "Alla formulärinlämningar saknar bekräftelse- eller ångra-möjlighet"
    ],
    suggestedFix: "Ge alla formulärinlämningar möjlighet till granskning och bekräftelse."
  },
  // WCAG 2.2 NYA KRITERIER
  {
    id: "3.3.7",
    name: "Redundant Entry",
    nameSwedish: "Redundant inmatning",
    level: "A",
    principle: "Understandable",
    description: "Information previously entered is auto-populated or available to select from, unless re-entry is essential.",
    eaaCritical: true,
    commonIssues: [
      "Leveransadress måste fyllas i igen trots att faktureringsadress angetts",
      "Kontaktuppgifter måste matas in på nytt i flerstegsformulär"
    ],
    suggestedFix: "Förifyll formulärfält med tidigare angiven information. Erbjud kryssruta 'Samma som fakturaadress' eller liknande lösning."
  },
  {
    id: "3.3.8",
    name: "Accessible Authentication (Minimum)",
    nameSwedish: "Tillgänglig autentisering (minimum)",
    level: "AA",
    principle: "Understandable",
    description: "Cognitive function tests (like solving puzzles or transcribing characters) are not required for authentication, unless an alternative is available.",
    eaaCritical: true,
    commonIssues: [
      "CAPTCHA kräver igenkänning av förvrängda tecken utan tillgängligt alternativ",
      "Inloggning kräver memorering av lösenord utan möjlighet att använda lösenordshanterare"
    ],
    suggestedFix: "Tillåt inklistring av lösenord. Ersätt eller komplettera bild-CAPTCHA med tillgängligt alternativ (t.ex. e-postlänk, SMS-kod). Stöd lösenordshanterare via autocomplete-attribut."
  },
  {
    id: "3.3.9",
    name: "Accessible Authentication (Enhanced)",
    nameSwedish: "Tillgänglig autentisering (förbättrad)",
    level: "AAA",
    principle: "Understandable",
    description: "Cognitive function tests are not required for any step of the authentication process.",
    eaaCritical: false,
    commonIssues: [
      "Autentisering kräver kognitiv uppgift som lösenordsigenkänning utan alternativ"
    ],
    suggestedFix: "Implementera autentisering helt utan kognitiva tester, t.ex. via e-postlänk, passkey eller biometri."
  },

  // ─── PRINCIPLE 4: ROBUST ────────────────────────────────────────────────────

  // Guideline 4.1 – Compatible
  {
    id: "4.1.1",
    name: "Parsing",
    nameSwedish: "Tolkning",
    level: "A",
    principle: "Robust",
    description: "In content implemented using markup languages, elements have complete start and end tags, are nested correctly, have no duplicate IDs, and meet specification requirements. (Obsolete in WCAG 2.2 – treated as always satisfied.)",
    eaaCritical: false,
    commonIssues: [
      "Duplicerade ID-attribut i DOM",
      "Felaktig nästling av HTML-element"
    ],
    suggestedFix: "Se till att ID-attribut är unika på sidan och att HTML är välformad. Använd validator.w3.org för kontroll."
  },
  {
    id: "4.1.2",
    name: "Name, Role, Value",
    nameSwedish: "Namn, roll, värde",
    level: "A",
    principle: "Robust",
    description: "For all UI components, the name and role can be programmatically determined; states, properties, and values can be set; and changes are notified to user agents.",
    eaaCritical: true,
    commonIssues: [
      "Anpassade komponenter saknar korrekt ARIA-roll",
      "Dynamiska tillståndsändringar (expanderat/kollapserat) kommuniceras inte programmatiskt",
      "Formulärkontroller saknar tillgängligt namn"
    ],
    suggestedFix: "Använd semantisk HTML. Lägg till ARIA-roller, -tillstånd och -egenskaper på anpassade widgets. Uppdatera aria-expanded, aria-checked etc. dynamiskt."
  },
  {
    id: "4.1.3",
    name: "Status Messages",
    nameSwedish: "Statusmeddelanden",
    level: "AA",
    principle: "Robust",
    description: "Status messages can be programmatically determined through role or properties so they can be announced by assistive technology without receiving focus.",
    eaaCritical: true,
    commonIssues: [
      "Succémeddelanden efter formulärinlämning kommuniceras inte till skärmläsare",
      "Varningar och infopaneler saknar role='alert' eller aria-live"
    ],
    suggestedFix: "Lägg till role='status' eller role='alert' (beroende på angelägenhetsgrad) på behållare för statusmeddelanden. Använd aria-live='polite' för icke-kritiska uppdateringar."
  },
]

export default wcag22
