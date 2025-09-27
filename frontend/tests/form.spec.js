import { test, expect } from '@playwright/test';

test('Lomakkeen syöttö ja nappi toimii', async ({ page }) => {
  await page.goto('http://localhost:5174/form');

  // Täytä lomake
  await page.selectOption('select[name="reason"]', 'loma'); 
  await page.fill('input[name="startDate"]', '2025-10-01'); 
  await page.fill('input[name="endDate"]', '2025-10-05');

  // Lähetä lomake
  await page.click('button:text("Lähetä")');

  // Tarkista, että alert tulee näkyviin (Poissaolohakemuksen lähetys)
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('Poissaolohakemus lähetetty!');
    await dialog.accept();
  });
});
