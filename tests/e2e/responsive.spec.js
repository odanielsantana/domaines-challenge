const { test, expect } = require('@playwright/test');
const { openStorefront, getProductCard } = require('./helpers/storefront');

test('o product card permanece dentro da viewport', async ({ page }) => {
  await openStorefront(page);
  const card = await getProductCard(page);
  const box = await card.boundingBox();

  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
});

test('a página de produto responde ao tamanho da viewport', async ({ page }) => {
  await openStorefront(page);
  const card = await getProductCard(page);
  await card.locator('[data-product-card-link]').first().click();

  const detail = page.locator('[data-product-detail]');
  await expect(detail).toBeVisible();
  const viewportWidth = page.viewportSize().width;
  await expect(detail).toHaveCSS('flex-direction', viewportWidth < 750 ? 'column' : 'row');
  await expect(detail.locator('[data-product-primary-image]')).toBeVisible();
  await expect(detail.locator('[data-product-add-button]')).toBeVisible();
});
