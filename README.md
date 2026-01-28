# Santykių Klausimai

Gilių klausimų žaidimas poroms - mobiliai pritaikyta web aplikacija su 350 klausimų.

## Technologijos

- **Next.js 14** - React framework su App Router
- **TypeScript** - Tipų saugumas
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animacijos ir gestai
- **PWA** - Progressive Web App palaikymas

## Pradėti darbą

1. Įdiekite priklausomybes:
```bash
npm install
```

2. Paleiskite development serverį:
```bash
npm run dev
```

3. Atidarykite naršyklėje: [http://localhost:3000](http://localhost:3000)

## Build production versija

```bash
npm run build
npm start
```

## Funkcijos

### Pagrindinis žaidimas (/)
- Tinder stiliaus kortelės su klausimais
- Trys gestai:
  - **← Kairėn:** Praleisti klausimą
  - **→ Dešinėn:** Atsakyta į klausimą
  - **↑ Aukštyn:** Super like - išsaugoti į mėgstamiausius
- Haptinė grįžtamoji reakcija
- 350 klausimų iš 14 kategorijų

### Kategorijų filtravimas
- Šoninis meniu su visomis kategorijomis
- Multi-select pasirinkimas
- Minimaliai 1 kategorija turi būti pasirinkta
- Real-time klausimų skaičiavimas

### Super klausimai (/awesome)
- Peržiūrėti išsaugotus mėgstamiausius klausimus
- Navigacija tarp kortelių
- Automatinis nukreipimas, kai baigiasi visi klausimai

### Duomenų išsaugojimas
- LocalStorage persistence
- Įsimena atsakytus klausimus
- Įsimena pasirinktas kategorijas
- "Iš naujo pradėti" funkcionalumas

## Kategorijos

**Įjungtos pagal nutylėjimą (12):**
- Apie vaikystę ir praeitį
- Apie svajones ir ateitį
- Apie baimes ir pažeidžiamumą
- Apie meilę ir santykius
- Apie vertybes ir tikėjimą
- Apie asmenybę ir savęs pažinimą
- Apie mus
- Egzistenciniai klausimai
- Hipotetiniai klausimai
- Apie ryšį ir žmones
- Apie prasmę ir gyvenimo klausimus
- Apie jausmus ir vidinį pasaulį

**Išjungtos pagal nutylėjimą (3):**
- Intymūs klausimai
- Gilūs intymūs klausimai
- Atviri klausimai apie seksą

## Projekto struktūra

```
santykiuklausimai/
├── app/              # Next.js App Router puslapiai
├── components/       # React komponentai
├── context/          # React Context (būsenos valdymas)
├── hooks/            # Custom React hooks
├── lib/              # Utility funkcijos
├── types/            # TypeScript tipai
└── public/           # Statiniai failai (data.json, manifest.json)
```

## PWA

Aplikacija veikia kaip Progressive Web App:
- Offline palaikymas
- Instaliuojama į namų ekraną
- Optimizuota mobiliam
- Tamsus režimas

## Dizainas

- **Tema:** Tamsus režimas su šiltomis/romantiškoms spalvomis
- **Spalvos:** Violetiniai, rožiniai, šilti pilki tonai
- **Mobile-first:** Optimizuota telefono ekranams
- **Minimalus:** Dėmesys klausimams, be triukšmo
