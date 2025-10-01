/* Tämä tarkistaa: 
    - Tervetuloa-viestin
    - Poissaolohakemus-napin
    - Poissaololistan renderöitymisen
    - Väripallojen olemassaolon ja oikean määrän
    - Yhteenvetotiedot käytetyistä päivistä 
    - Tyhjän poissaololistan käsittelyn
    - API-virheen käsittelyn
*/

import { test, expect } from '@playwright/test';

test.describe('EmployeeHome', () => {

  test('näyttää tervetuloa-viestin, poissaolot ja yhteenvetotiedot', async ({ page }) => {
    // Simuloidaan kirjautunut käyttäjä
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({
        id: '001',
        etunimi: 'Pekka'
      }));
    });

    // Mockataan GET /api/absences
    await page.route('http://localhost:3001/api/absences', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'e1',
            employeeId: '001',
            employeeName: 'Pekka',
            startDate: '2025-10-01',
            endDate: '2025-10-02',
            reason: 'loma',
            status: 'hyväksytty',
            esihenkiloId: '002'
          }
        ])
      })
    );

    await page.goto('http://localhost:5173/home');

    // 1. Tervetuloa-otsikko
    await expect(page.getByRole('heading', { name: /Tervetuloa, Pekka/i })).toBeVisible();

    // 2. Poissaolohakemus-nappi
    const button = page.getByRole('button', { name: /Lähetä poissaolohakemus/i });
    await expect(button).toBeVisible();

    // 3. Omat poissaolot -otsikko
    await expect(page.getByRole('heading', { name: /Omat poissaolot/i })).toBeVisible();

    // 4. Poissaololista renderöityy
    const absenceItems = page.locator('li.relative.border.rounded-lg');
    const absenceCount = await absenceItems.count();
    expect(absenceCount).toBeGreaterThan(0);

    // 5. Väripallot näkyvät jokaisessa poissaolossa
    const colorDots = page.locator('span.absolute.top-2.right-2');
    const dotCount = await colorDots.count();
    expect(dotCount).toBe(absenceCount);

    // 6. Yhteenvetotiedot näkyvät
    const summaryHeader = page.getByRole('heading', { name: /Vuoden käytetyt päivät/i });
    await expect(summaryHeader).toBeVisible();
    const summaryItems = page.locator('ul.space-y-1 > li');
    const summaryCount = await summaryItems.count();
    expect(summaryCount).toBeGreaterThan(0);
  });

  test('tyhjä poissaololista näyttää "Ei poissaoloja"', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ id: '002', etunimi: 'Maija' }));
    });

    // Mockataan tyhjä lista
    await page.route('http://localhost:3001/api/absences', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    );

    await page.goto('http://localhost:5173/home');
    await expect(page.getByText('Ei poissaoloja')).toBeVisible();
  });

  test('GET /api/absences epäonnistuu → virheilmoitus näkyy', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ id: '003', etunimi: 'Kalle' }));
    });

    // Mockataan virhe
    await page.route('http://localhost:3001/api/absences', route =>
      route.fulfill({ status: 500 })
    );

    await page.goto('http://localhost:5173/home');

    // Tarkista virheilmoitus
    await expect(page.getByText(/Poissaolojen haku epäonnistui/i)).toBeVisible();
  });

});
