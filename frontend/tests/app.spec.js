import { test, expect } from '@playwright/test';

test('Navigointi toimii sidebarin kautta', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Jos sivupalkki on linkkejä, hae roolin perusteella
  await page.getByRole('link', { name: /Etusivulle/i }).click();

  // Tarkista, että otsikko näkyy etusivulla
  await expect(page.getByRole('heading', { name: 'Poissaolosovellus', level: 1 })).toBeVisible();
});
