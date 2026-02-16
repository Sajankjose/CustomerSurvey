import { expect, test } from '@playwright/test';

test('happy path with graph tab and scheduling', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Aditi');

  for (let i = 0; i < 11; i += 1) {
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await page.getByRole('button', { name: 'SIP Illustration' }).click();
  await expect(page.getByText('SIP explainer')).toBeVisible();

  await page.getByLabel('Next month').click();
  await page.getByRole('button', { name: '15' }).first().click();
  await page.getByRole('button', { name: '10:00 AM' }).click();
  await expect(page.getByText('We’ll connect with you on')).toBeVisible();
});

test('shows validation copy', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Just one small detail missing 🙂')).toBeVisible();
});
