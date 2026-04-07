// EAA – European Accessibility Act-specifika krav utanför WCAG
export const eaaRequirements = [
  {
    id: "EAA-1",
    category: "Support",
    title: "Tillgänglig kundservice",
    description: "Kundservice och support ska vara tillgängliga för personer med funktionsnedsättning, inklusive via alternativa kommunikationskanaler.",
    checkItems: [
      "Telefonsupport finns tillgänglig under normala öppettider",
      "Alternativa kontaktvägar erbjuds (e-post, chatt, texttelefon)",
      "Supportpersonal är utbildad att hjälpa användare med funktionsnedsättning",
      "Väntetider och öppettider kommuniceras tydligt",
      "Callback-möjlighet erbjuds om väntetider är långa"
    ]
  },
  {
    id: "EAA-2",
    category: "Dokumentation",
    title: "Tillgänglig produktdokumentation",
    description: "All produktdokumentation, inklusive användarhandböcker, hjälpguider och teknisk dokumentation, ska vara tillgänglig.",
    checkItems: [
      "Användarhandböcker finns i digitalt tillgängligt format (HTML eller taggad PDF)",
      "Dokumentation kan läsas med skärmläsare",
      "Bilder och diagram i dokumentationen har alternativtexter",
      "Tabeller i dokumentationen är korrekt uppmärkta",
      "Dokumentation är tillgänglig på webbplatsen utan kostnad",
      "Versioner för utskrift uppfyller kontrastkrav"
    ]
  },
  {
    id: "EAA-3",
    category: "Alternativa format",
    title: "Tillhandahållande av alternativa format",
    description: "Information och innehåll ska kunna levereras i alternativa format på begäran av användare med funktionsnedsättning.",
    checkItems: [
      "Tryckt material finns tillgängligt i alternativa format (lättläst, stor stil, punktskrift) på begäran",
      "Digitalt innehåll kan exporteras i tillgängligt format",
      "Processen för att begära alternativa format är enkel och tillgänglig",
      "Svarstid för alternativa format kommuniceras tydligt",
      "Alternativa format är kostnadsfria eller till rimlig kostnad"
    ]
  },
  {
    id: "EAA-4",
    category: "Tillgänglighetsredogörelse",
    title: "Tillgänglighetsredogörelse och återkoppling",
    description: "En tydlig tillgänglighetsredogörelse ska finnas publicerad och en fungerande återkopplingsmekanism ska tillhandahållas.",
    checkItems: [
      "Tillgänglighetsredogörelse är publicerad och lätt att hitta",
      "Redogörelsen innehåller en kontaktuppgift för tillgänglighetsfeedback",
      "Återkopplingsformulär eller e-postadress för tillgänglighetsproblem finns",
      "Svar på tillgänglighetsrapporter ges inom rimlig tid (max 30 dagar rekommenderas)",
      "Redogörelsen anger konformitetsnivå och eventuella kända brister",
      "Redogörelsen anger datum för senaste granskning",
      "Länk till tillgänglighetsredogörelse finns i sidfoten på alla sidor"
    ]
  },
  {
    id: "EAA-5",
    category: "Produktinformation",
    title: "Tillgänglig produktinformation och förpackning",
    description: "Information om produktens tillgänglighetsfunktioner ska kommuniceras tydligt och vara tillgänglig för alla potentiella kunder.",
    checkItems: [
      "Tillgänglighetsfunktioner beskrivs tydligt i produktbeskrivningen",
      "Information om kompatibilitet med hjälpmedel (skärmläsare, tangentbordsnavigation) anges",
      "Bilder av produkten inkluderar alt-text som beskriver tillgänglighetsrelevanta egenskaper",
      "Köpprocess är tillgänglig för personer med funktionsnedsättning",
      "Orderbekräftelse och kvitton skickas i tillgängligt format",
      "Villkor och integritetspolicy är tillgängliga i enkelt och tydligt språk"
    ]
  },
  {
    id: "EAA-6",
    category: "Teknisk information",
    title: "Tekniska tillgänglighetskrav för tjänster",
    description: "Digitala tjänster ska utformas och tillhandahållas enligt EAA:s tekniska krav som går utöver grundläggande webbdostillgänglighet.",
    checkItems: [
      "Tjänsten fungerar med vanliga hjälpmedel och assistiv teknik",
      "Betalningsflöden är tillgängliga och stöder alla betalningsmetoder",
      "E-post och meddelanden från tjänsten skickas i tillgängligt format",
      "Avtalsdokumentation kan undertecknas digitalt tillgängligt",
      "Notiser och påminnelser är konfigurerbara för tillgänglighet",
      "API:er för integration exponerar tillgänglighetsinformation"
    ]
  }
]

export default eaaRequirements
