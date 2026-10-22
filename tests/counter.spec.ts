import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('CA-01: el contador comienza en cero', async ({ page }) => {
  await expect(page.getByLabel('Valor del contador')).toHaveText('0');
});

test('CA-02: un clic incrementa el contador a uno', async ({ page }) => {
  await page.getByRole('button', { name: 'Sumar', exact: true }).click();
  await expect(page.getByLabel('Valor del contador')).toHaveText('1');
});

test('CA-03: tres clics incrementan el contador a tres', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Sumar', exact: true });
  await button.click();
  await button.click();
  await button.click();
  await expect(page.getByLabel('Valor del contador')).toHaveText('3');
});
