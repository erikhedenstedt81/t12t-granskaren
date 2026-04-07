# Tillgänglighetsgranskaren

Ett lokalt verktyg för professionell WCAG 2.2-granskning och EAA-efterlevnad. Körs helt i webbläsaren – all data sparas i localStorage, ingen backend krävs.

## Kom igång

```bash
npm install
npm run dev
```

Öppna sedan `http://localhost:5173` i valfri modern webbläsare.

```bash
# Bygg för produktion
npm run build
```

## Vyer

### Dashboard
Startskärmen visar alla projekt med statistik: antal aktiva projekt, öppna fynd, kritiska fynd och åtgärdade fynd de senaste 30 dagarna. Varje projektkort har en SVG-progress-ring som visar hur stor andel av WCAG 2.2:s 87 kriterier som granskats.

- **Sök globalt** – sökfältet i headern söker i realtid bland alla fynd i alla projekt (titel, beskrivning, URL, WCAG-ID).
- **Inställningar** – kugghjulet öppnar inställningspanelen (granskarprofil, backup, import, rensa data).

### Projektöversikt
Tre flikar:
- **Fynd** – sorterbar tabell med alla fynd. Stöder gruppering per WCAG-princip, filtrering per kriterium och export till Jira.
- **WCAG-täckning** – 87-tile-rutnät som visar vilka kriterier som granskats och om de har öppna fynd.
- **EAA-status** – checklista för de 6 EAA-kraven med anteckningar och procentuell uppfyllnad.

### Granskning
Fynd-formulär i 5 steg:
1. **Sida** – URL och sidtitel
2. **Kriterium** – WCAG 2.2-sökruta med tangentbordsnavigation, eller EAA-krav
3. **Fyndet** – titel, teknisk beskrivning, kundförklaring, föreslagen åtgärd, berörda användargrupper
4. **Klassificering** – allvarlighetsgrad (auto-beräknas), nyckelflöde, status
5. **Screenshot** – drag-och-släpp bild, filuppladdning eller Cmd+V/Ctrl+V från urklipp

Kortkommando: `Ctrl+S` / `Cmd+S` sparar från vilket steg som helst.

### Tillgänglighetsrapport
Genererar en komplett HTML-rapport med:
- Försättsblad, sammanfattning, fyndtabell, teknisk bilaga och EAA-statussektion
- Filtrerbar per allvarlighetsgrad och sektion
- Stöd för kundlogotyp (PNG/JPG/SVG)
- Språkval: svenska eller engelska
- **Exportera HTML** – laddar ned en självständig `.html`-fil
- **Skriv ut / PDF** – öppnar webbläsarens utskriftsdialog med A4-layout

### Jira-export
Öppnas från fliken Fynd i projektöversikten. Välj fynd, ange projektnyckel (t.ex. `ACC`) och exportera antingen som:
- **JSON** – Jira REST API-format med wiki-markup i beskrivningsfälten
- **CSV** – direktimport via Jira CSV-importer

## Inställningar

Öppnas via kugghjulsknappen i Dashboard-headern.

- **Granskarprofil** – namn, e-post och företag. Prefylls automatiskt i nya projekt.
- **Standardspråk** – välj svenska eller engelska som standardspråk för nya rapporter.
- **Exportera backup** – laddar ned all data (projekt, fynd, EAA-status, inställningar) som en JSON-fil.
- **Importera backup** – återställer data från en tidigare exporterad backup.
- **Rensa all data** – tar bort all data permanent (tvåstegsbekräftelse).

## Allvarlighetsgrader

| Grad     | Förklaring |
|----------|-----------|
| Kritisk  | WCAG A + EAA-kritiskt + nyckelflöde |
| Hög      | WCAG A (eller AA + EAA-kritiskt) |
| Medium   | WCAG AA |
| Låg      | WCAG AAA |

Auto-beräkning kan alltid åsidosättas manuellt per fynd.

## Teknikstack

| Del        | Teknik |
|------------|--------|
| UI         | React 18 + Vite 6 |
| Stil       | Vanilla CSS med CSS custom properties |
| Data       | localStorage (ingen backend) |
| Standarder | WCAG 2.2 (87 kriterier), EAA 2025 (6 krav) |
| Export     | HTML-blob, window.print(), JSON, CSV |

## Kända begränsningar

- Data lagras per webbläsare och dator – ingen synkronisering mellan enheter.
- Screenshots lagras som base64 i localStorage; stora bilder kan begränsa localStorage-kapaciteten (~5 MB per domän).
- Verktyget kräver JavaScript och en modern webbläsare (Chrome 90+, Firefox 88+, Safari 14+).
- Ingen autentisering – lämpat för ensam granskare eller ett litet team på samma maskin.
