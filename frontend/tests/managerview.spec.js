import { test, expect } from '@playwright/test';

test('ManagerView renderöityy oikein ja napit toimivat', async ({ page }) => {
  // Aseta localStorage käyttäjälle ennen sivun avausta
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: '1', rooli: 'esihenkilo' }));
  });

  // Mockataan GET /api/absences
  await page.route('http://localhost:3001/api/absences', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'a1',
          employeeName: 'Testi User',
          employeeId: '123',
          startDate: '2025-10-01',
          endDate: '2025-10-03',
          reason: 'loma',
          status: 'odottaa',
          esihenkiloId: '1'
        }
      ])
    })
  );

  // Mockataan PATCH /api/absences/:id
  await page.route('http://localhost:3001/api/absences/a1', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'a1',
        employeeName: 'Testi User',
        employeeId: '123',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        reason: 'loma',
        status: 'hyväksytty',
        esihenkiloId: '1',
        approvedDate: new Date().toISOString()
      })
    })
  );

  await page.goto('http://localhost:5174/manager');

  // Tarkista että oikea otsikko näkyy
  await expect(
    page.getByRole('heading', { name: 'Esihenkilön näkymä', level: 2 })
  ).toBeVisible();

  // Tarkista että odottava hakemus näkyy
  await expect(page.locator('section:has-text("Odottavat") article')).toHaveCount(1);
  await expect(page.getByText('Testi User')).toBeVisible();

  // Klikkaa Hyväksy-painiketta
  await page.getByRole('button', { name: 'Hyväksy' }).click();

  // Tarkista että se siirtyi hyväksyttyjen listalle
  await expect(page.locator('section:has-text("Hyväksytyt") article')).toHaveCount(1);
  await expect(page.locator('section:has-text("Odottavat") article')).toHaveCount(0);
});
