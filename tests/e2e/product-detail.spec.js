const { test, expect } = require('@playwright/test');
const {
  openStorefront,
  getProductCard,
  getAlternativeSwatch,
  selectSwatch,
} = require('./helpers/storefront');

async function openAlternativeVariant(page, { availableOnly = false } = {}) {
  await openStorefront(page);
  const card = await getProductCard(page);
  const swatch = await getAlternativeSwatch(card, { availableOnly });
  const variantId = await swatch.getAttribute('data-variant-id');
  await selectSwatch(swatch);
  await card.locator('[data-product-card-link]').first().click();
  await expect(page).toHaveURL(new RegExp(`[?&]variant=${variantId}(?:&|$)`));
  return variantId;
}

test.describe('Product detail', () => {
  test('abre e mantém a variante selecionada no card', async ({ page }) => {
    const variantId = await openAlternativeVariant(page);
    const detail = page.locator('[data-product-detail]');

    await expect(detail).toBeVisible();
    await expect(detail.locator('[data-product-variant-id]')).toHaveValue(variantId);
    await expect(detail.locator('[data-product-color]:checked')).toHaveAttribute('data-variant-id', variantId);
    await expect(detail.locator('[data-product-primary-frame]:visible')).toHaveCount(1);
    expect(await detail.locator('[data-product-secondary-frame]:visible').count()).toBeLessThanOrEqual(1);
  });

  test('sincroniza mídia, preço, disponibilidade, formulário e URL', async ({ page }) => {
    await openAlternativeVariant(page);
    const detail = page.locator('[data-product-detail]');
    const swatch = await getAlternativeSwatch(detail);
    const variantId = await swatch.getAttribute('data-variant-id');
    const expectedPrimaryImage = await swatch.getAttribute('data-primary-image');

    await selectSwatch(swatch);

    await expect(detail.locator('[data-product-variant-id]')).toHaveValue(variantId);
    await expect(page).toHaveURL(new RegExp(`[?&]variant=${variantId}(?:&|$)`));
    await expect(detail.locator('[data-product-price]')).toHaveText(await swatch.getAttribute('data-price'));
    if (expectedPrimaryImage) {
      await expect(detail.locator('[data-product-primary-image]')).toHaveAttribute('src', expectedPrimaryImage);
    }

    const available = (await swatch.getAttribute('data-available')) === 'true';
    await expect(detail.locator('[data-product-add-button]')).toBeEnabled({ enabled: available });
    await expect(detail.locator('[data-product-payment-button]'))
      .toHaveAttribute('aria-disabled', String(!available));

    if (!available) {
      await expect(detail.locator('[data-product-payment-button]')).toHaveAttribute('inert', '');
    }
  });

  test('adiciona a variante selecionada ao carrinho', async ({ page }) => {
    const variantId = await openAlternativeVariant(page, { availableOnly: true });
    const detail = page.locator('[data-product-detail]');
    const title = await detail.locator('h1').innerText();

    await detail.locator('[data-product-add-button]').click();
    await page.waitForURL(/\/cart(?:\?|$)/);

    await expect(page.locator('form[action$="/cart"]')).toContainText(title);
    expect(page.url()).toContain('/cart');
    expect(variantId).toBeTruthy();
  });
});
