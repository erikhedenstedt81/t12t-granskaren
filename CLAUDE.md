# Projektinstruktioner

## Layout – alltid gäller
Appen ska alltid fylla hela viewport-höjden (100vh).
Ingen scrollning på body-nivå – all scrollning sker
inuti paneler med overflow-y: auto.

Grundprincipen för alla vyer:
- App-wrapper: height: 100vh, display: flex, 
  flex-direction: column
- Header: fast höjd, flex-shrink: 0
- Innehållsområde: flex: 1, overflow: hidden
- Scrollbara paneler inuti: overflow-y: auto, height: 100%
- Dropdowns och listor inuti paneler: 
  flex: 1 så de fyller tillgänglig höjd

Kontrollera alltid att ny kod följer detta mönster.

## Tillgänglighet – alltid gäller  
Appen granskar tillgänglighet och måste själv 
uppfylla WCAG 2.2 AA. Vid all ny kod:
- Alla interaktiva element ska nås med tangentbord
- Fokusindikator ska alltid vara synlig
- Formulärfält ska ha kopplat label-element
- Ikonknappar utan text ska ha aria-label

## Datalagring
All data lagras i localStorage via funktionerna 
i src/store/storage.js. Använd aldrig 
localStorage direkt i komponenter.
