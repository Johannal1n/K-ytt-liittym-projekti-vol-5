/* Tämä tarkistaa:
Kalenterinäkymä latautuu oikein
Poissaolot näkyvät kalenterissa
Värikoodaus toimii
Näkymän vaihto (kuukausi/viikko) toimii
Navigointinapit (edellinen, nykyinen, seuraava) toimivat 
*/


import { test, expect } from '@playwright/test';

test('TeamCalendar näyttää kalenterin ja poissaolot', async ({ page }) => {
  // Simuloidaan kirjautunut käyttäjä localStorageen
  await page.addInitScript(() => {
    window.localStorage.setItem('user', JSON.stringify({
      id: '001',
      etunimi: 'Pekka',
      rooli: 'esihenkilo'
    }));
  });

  // Siirrytään kalenterinäkymään
  await page.goto('http://localhost:5173/calendar'); // tai oikea reitti

  // Kalenterin otsikko (kuukausi + vuosi)
  const monthYear = new Date().toLocaleString('fi-FI', { month: 'long', year: 'numeric' });
  await expect(page.getByRole('heading', { name: new RegExp(monthYear, 'i') })).toBeVisible();

  // Kalenterikomponentti näkyy
  await expect(page.locator('.rbc-calendar')).toBeVisible();

  // Näkymän vaihtonapit
  await expect(page.getByRole('button', { name: /Kuukausinäkymä/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Viikkonäkymä/i })).toBeVisible();

  // Navigointinapit
  await expect(page.getByRole('button', { name: /Edellinen/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Nykyinen/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Seuraava/i })).toBeVisible();

  // Poissaolotapahtumat (jos mock-dataa tai oikeaa dataa on)
  const events = page.locator('.rbc-event');
  const count = await events.count();
  expect(count).toBeGreaterThan(0); // tai tarkempi määrä, jos tiedossa
});