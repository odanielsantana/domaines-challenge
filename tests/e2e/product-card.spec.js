const { test, expect } = require('@playwright/test');
const {
  openStorefront,
  getProductCard,
  getAlternativeSwatch,
  selectSwatch,
} = require('./helpers/storefront');

test.describe('Product card', () => {
  test.beforeEach(async ({ page }) => {
    await openStorefront(page);
  });

  test('initially selects the first available variant', async ({ page }) => {
    const card = await getProductCard(page);
    const availableSwatches = card.locator('[data-option-value][data-available="true"]');

    expect(
      await availableSwatches.count(),
      'The test product must have at least one available variant.',
    ).toBeGreaterThan(0);

    const checkedSwatch = card.locator('[data-option-value]:checked');
    await expect(checkedSwatch).toHaveCount(1);
    await expect(checkedSwatch).toHaveAttribute('data-available', 'true');
    await expect(checkedSwatch).toHaveAttribute(
      'data-variant-id',
      await availableSwatches.first().getAttribute('data-variant-id'),
    );
  });

  test('updates image, price, badge, and links when selecting a color', async ({ page }) => {
    const card = await getProductCard(page);
    const swatch = await getAlternativeSwatch(card);
    const variantId = await swatch.getAttribute('data-variant-id');
    const expectedImage = await swatch.getAttribute('data-image-url');
    const expectedPrice = await swatch.getAttribute('data-price');
    const price = card.locator('[data-product-card-price]');
    const comparePrice = card.locator('[data-product-card-compare-price]');

    await selectSwatch(swatch);

    await expect(swatch).toBeChecked();
    if (expectedImage) {
      await expect(card.locator('.product-card-image')).toHaveAttribute('src', expectedImage);
    }

    const links = card.locator('[data-product-card-link]');
    await expect(links).toHaveCount(2);
    for (let index = 0; index < await links.count(); index += 1) {
      const href = await links.nth(index).getAttribute('href');
      expect(new URL(href, page.url()).searchParams.get('variant')).toBe(variantId);
    }

    const isAvailable = (await swatch.getAttribute('data-available')) === 'true';
    const hasMarkdownPrice = Number(await swatch.getAttribute('data-compare-at-price-raw'))
      > Number(await swatch.getAttribute('data-price-raw'));
    const isOnSale = isAvailable && hasMarkdownPrice;

    await expect(price).toHaveText(isAvailable ? expectedPrice : 'Sold out');
    await expect(comparePrice).toHaveJSProperty('hidden', !isOnSale);
    if (isOnSale) {
      await expect(comparePrice).toHaveText(await swatch.getAttribute('data-compare-at-price'));
    }

    await expect(card.locator('[data-product-card-sale-badge]'))
      .toHaveJSProperty('hidden', !isOnSale);
  });

  test('shows the badge and compare-at price for a variant on sale', async ({ page }) => {
    const card = await getProductCard(page);
    const swatches = card.locator('[data-option-value][data-available="true"]');
    let saleSwatch;

    for (let index = 0; index < await swatches.count(); index += 1) {
      const candidate = swatches.nth(index);
      const compareAtPrice = Number(await candidate.getAttribute('data-compare-at-price-raw'));
      const price = Number(await candidate.getAttribute('data-price-raw'));

      if (compareAtPrice > price) {
        saleSwatch = candidate;
        break;
      }
    }

    expect(saleSwatch, 'The test product must have an available variant on sale.').toBeTruthy();
    await selectSwatch(saleSwatch);

    await expect(card.locator('[data-product-card-sale-badge]')).toBeVisible();
    await expect(card.locator('[data-product-card-compare-price]')).toBeVisible();
    await expect(card.locator('[data-product-card-compare-price]'))
      .toHaveText(await saleSwatch.getAttribute('data-compare-at-price'));
  });

  test('uses the secondary image on hover', async ({ page }) => {
    const card = await getProductCard(page);
    const swatches = card.locator('[data-option-value]');
    let swatchWithSecondaryImage;

    for (let index = 0; index < await swatches.count(); index += 1) {
      const candidate = swatches.nth(index);
      if (await candidate.getAttribute('data-secondary-image-url')) {
        swatchWithSecondaryImage = candidate;
        break;
      }
    }

    expect(
      swatchWithSecondaryImage,
      'The test product must have a variant with a secondary image.',
    ).toBeTruthy();
    await selectSwatch(swatchWithSecondaryImage);
    const expectedSecondaryImage = await swatchWithSecondaryImage.getAttribute('data-secondary-image-url');
    const image = card.locator('.product-card-image');

    await image.hover();
    await expect(image).toHaveAttribute('src', expectedSecondaryImage);
  });
});

test.describe('Product card rendered by Liquid', () => {
  test.use({ javaScriptEnabled: false });

  test('has the correct initial state before JavaScript initialization', async ({ page }) => {
    await openStorefront(page);
    const card = await getProductCard(page);
    const checkedSwatch = card.locator('[data-option-value]:checked');

    await expect(checkedSwatch).toHaveCount(1);

    const isAvailable = (await checkedSwatch.getAttribute('data-available')) === 'true';
    const price = Number(await checkedSwatch.getAttribute('data-price-raw'));
    const compareAtPrice = Number(await checkedSwatch.getAttribute('data-compare-at-price-raw'));
    const isOnSale = isAvailable && compareAtPrice > price;

    await expect(card.locator('[data-product-card-price]'))
      .toHaveText(isAvailable ? await checkedSwatch.getAttribute('data-price') : 'Sold out');
    await expect(card.locator('[data-product-card-sale-badge]'))
      .toHaveJSProperty('hidden', !isOnSale);
    await expect(card.locator('[data-product-card-compare-price]'))
      .toHaveJSProperty('hidden', !isOnSale);

    if (isOnSale) {
      await expect(card.locator('[data-product-card-compare-price]'))
        .toHaveText(await checkedSwatch.getAttribute('data-compare-at-price'));
    }
  });
});
