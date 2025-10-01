import { test, expect } from '@playwright/test';

test('Työntekijä ohjautuu EmployeeHome-näkymään', async ({ page }) => {
  // Simuloidaan työntekijä käyttäjä
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({
      id: '001',
      etunimi: 'Pekka',
      rooli: 'työntekijä'
    }));
  });

  // Mockataan poissaolot API
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

  // Mene suoraan EmployeeHome-näkymään
  await page.goto('http://localhost:5173/home');

  // Tarkista että tervetuloa-viesti näkyy
  await expect(page.getByRole('heading', { name: /Tervetuloa, Pekka/i })).toBeVisible();
});

test('Esihenkilö ohjautuu ManagerView-näkymään', async ({ page }) => {
  // Simuloidaan esihenkilö käyttäjä
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({
      id: '002',
      etunimi: 'Maija',
      rooli: 'esihenkilo'
    }));
  });

  // Mockataan poissaolot API
  await page.route('http://localhost:3001/api/absences', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'm1',
          employeeId: '123',
          employeeName: 'Testi User',
          startDate: '2025-10-05',
          endDate: '2025-10-07',
          reason: 'sairasloma',
          status: 'odottaa',
          esihenkiloId: '002'
        }
      ])
    })
  );

  // Mene suoraan ManagerView-näkymään
  await page.goto('http://localhost:5173/manager');

  // Tarkista että odottavat hakemukset näkyy
  await expect(page.locator('section:has-text("Odottavat")')).toBeVisible();
});

test('Työntekijä ei pääse ManagerView-näkymään', async ({ page }) => {
  // Simuloidaan työntekijä käyttäjä
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({
      id: '003',
      etunimi: 'Kalle',
      rooli: 'työntekijä'
    }));
  });

  await page.goto('http://localhost:5173/manager');

  // Tarkista että virheilmoitus näkyy
  await expect(page.getByRole('heading', { name: /Ei käyttöoikeutta/i })).toBeVisible();
});
