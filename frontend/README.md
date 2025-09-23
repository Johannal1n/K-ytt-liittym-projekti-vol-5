
# Poissaolosovellus

Tämä on Reactilla ja Tailwind CSS:llä rakennettu poissaolosovellus, jossa käyttäjät voivat kirjautua sisään, tarkastella poissaoloja, lähettää poissaolohakemuksia ja tarkastella tiimin poissaoloja kalenterinäkymässä.

Frontend lähettää pyyntöjä backendille, backend tallentaa poissaolot tietokantaan ja palauttaa tiedot takaisin frontendille, joka näyttää ne käyttäjälle.

## Ominaisuudet / Frontend

- 🔐 **Kirjautuminen**
  - Käyttäjät tunnistetaan käyttäjätunnuksen ja salasanan perusteella.
  - Käyttäjätiedot haetaan staattisesta `users.ts`-tiedostosta.
  - Kirjautumisen jälkeen käyttäjä ohjataan roolinsa mukaiseen näkymään.

- 🧑‍💼 **Roolipohjaiset näkymät**
  - **Työntekijä** ohjataan `/home`-näkymään, jossa näkyvät omat poissaolot ja painikkeet lomakkeen lähetykseen ja kalenteriin.
  - **Esihenkilö** ohjataan `/manager`-näkymään, jossa näkyvät tiimin poissaolot ryhmiteltynä tilan mukaan.

- 📅 **Kalenterinäkymä** (`/calendar`)
  - Näyttää tiimin poissaolot kahden viikon tai kuukausinäkymässä.
  - Värikoodaus eri poissaolosyille (loma, saldovapaa, sairaus, muu).
  - Navigointipainikkeet: edellinen, nykyinen, seuraava, viikko/kuukausinäkymä.
  - Käytettävissä molemmille rooleille.

- 📝 **Poissaolohakemuslomake** (`/form`)
  - Käyttäjä voi lähettää uuden poissaolohakemuksen.
  - Lomake tarkistaa pakolliset kentät ja päivämäärien oikeellisuuden.
  - Esihenkilö asetetaan automaattisesti lomakkeen tiedoista.

- 🔄 **Navigointi**
  - Kaikissa näkymissä on painikkeet siirtymiseen etusivulle, kalenteriin ja uloskirjautumiseen.
  - Esihenkilö voi myös lähettää lomakkeita kuten työntekijä.

## Teknologiat

- ⚛️ React
- 💨 Tailwind CSS
- 🗂️ localStorage käyttäjätietojen tallentamiseen
- 🧭 react-router-dom reititykseen
- 📦 Vite kehitysympäristönä

## Reitit

| Reitti       | Näkymä               | Rooli         |
|--------------|----------------------|---------------|
| `/`          | Kirjautuminen        | Kaikki        |
| `/home`      | Työntekijän etusivu  | Työntekijä    |
| `/manager`   | Esihenkilön etusivu  | Esihenkilö    |
| `/calendar`  | Kalenterinäkymä      | Molemmat      |
| `/form`      | Poissaolohakemus     | Molemmat      |



### BACKEND

🗄️ Tietokanta (Prisma + SQLite)

Käytät Prisma ORM:ää (työkalu, jolla voit työskennellä tietokantojen kanssa ilman, että kirjoitat suoraan SQL-kyselyitä) SQLite-tietokannan kanssa.
schema.prisma määrittelee Absence-mallin:
Jokaisella poissaololla (Absence) on:
    id (UUID, automaattisesti luotu)
    employeeName, employeeId
    startDate, endDate
    reason (loma, saldovapaa, sairaus, muu…)
    status (odottaa, hyväksytty, hylätty, palautettu)
    esihenkiloId (asetetaan automaattisesti työntekijän datasta)
    createdAt (lisäyksen aikaleima)



Palvelin pyörii portissa 3001 ja kaikki reitit alkavat /api.

1. POST /api/absences → createAbsence

Luo uuden poissaolon.
Tarkistaa, että kaikki pakolliset kentät (employeeName, employeeId, startDate, endDate, reason) on annettu.
Validioi päivämäärät.
Statuksen määritys:

    Jos syy = loma tai saldovapaa → odottaa
    Muuten → hyväksytty

Hakee users.ts-tiedostosta työntekijän ja lisää automaattisesti hänen esihenkiloId:n.
Tallentaa poissaolon tietokantaan.

➡️ Vastaa 201 Created ja palauttaa uuden poissaolon JSON-muodossa.

2. GET /api/absences → getAbsences

Hakee kaikki poissaolot tietokannasta.
Järjestää ne createdAt-kentän mukaan (uusin ensin).
Palauttaa listan JSONina.

3. PATCH /api/absences/:id → updateAbsenceStatus

Päivittää olemassa olevan poissaolon tilan.
Saa status-kentän bodysta, esim.:
{ "status": "hyväksytty" }
Käyttää normalize()-funktiota ääkkösten/välilyöntien varalta, jotta esim. "hyvaksytty" toimii.
Sallittuja tiloja ovat:
    hyväksytty
    hylätty
    palautettu

Jos id:tä ei löydy, palauttaa 404.
Jos status ei kelpaa, palauttaa 400.
Muuten palauttaa 200 OK ja päivitetyn poissaolon.

4. GET / (juuri)

Testireitti, joka palauttaa "Poissaolosovellus käynnissä!".

5. PATCH /api/_test

Testireitti, joka vain tulostaa bodyn serverilogiikkaan.

Hyödyllinen debuggaamiseen.

🧭 Kokonaiskuva

Frontend (React/Vite) pyytää dataa http://localhost:3001/api/absences jne.

Backend vastaa näihin pyyntöihin:

Tallentaa ja hakee poissaolot (Prisman kautta SQLiteen).

Päivittää poissaolon tilan.

Käyttäjien ja esihenkilöiden väliset suhteet haetaan staattisesta users.ts-tiedostosta (ei vielä tietokannasta).

👉 Käytännössä siis backend on kevyt REST API, jossa on vain yksi resurssi: Absence.
Frontend hoitaa kirjautumisen ja roolit, mutta backend hallinnoi poissaolojen CRUD-toimintoja.

##### KÄYNNISTYS

1. Asenna riippuvuudet: npm install

2. Käynnistä ensin backend npm run dev ja sitten frontend npm run dev
  

## Huomioita

- Käyttäjätiedot ovat kovakoodattuna `users.ts`-tiedostossa.
- Poissaolot haetaan backendistä reitiltä `http://localhost:3001/api/absences`.
- Sovellus ei sisällä kirjautumisen suojausta (esim. tokenit), vaan toimii demotarkoituksessa.

### Frontend lähettää pyyntöjä backendille, backend tallentaa poissaolot tietokantaan ja palauttaa tiedot takaisin frontendille, joka näyttää ne käyttäjälle

© 2025 Poissaolosovellus
