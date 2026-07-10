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

  test('seleciona inicialmente a primeira variante disponível', async ({ page }) => {
    const card = await getProductCard(page);
    const availableSwatches = card.locator('[data-option-value][data-available="true"]');

    test.skip(await availableSwatches.count() === 0, 'O produto não possui variantes disponíveis.');

    const checkedSwatch = card.locator('[data-option-value]:checked');
    await expect(checkedSwatch).toHaveCount(1);
    await expect(checkedSwatch).toHaveAttribute('data-available', 'true');
    await expect(checkedSwatch).toHaveAttribute(
      'data-variant-id',
      await availableSwatches.first().getAttribute('data-variant-id'),
    );
  });

  test('troca imagem, preço, badge e links ao selecionar uma cor', async ({ page }) => {
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

  test('mostra badge e preço riscado para uma variante em promoção', async ({ page }) => {
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

    test.skip(!saleSwatch, 'O produto não possui uma variante disponível em promoção.');
    await selectSwatch(saleSwatch);

    await expect(card.locator('[data-product-card-sale-badge]')).toBeVisible();
    await expect(card.locator('[data-product-card-compare-price]')).toBeVisible();
    await expect(card.locator('[data-product-card-compare-price]'))
      .toHaveText(await saleSwatch.getAttribute('data-compare-at-price'));
  });

  test('usa a imagem secundária no hover quando ela existe', async ({ page }) => {
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

    test.skip(!swatchWithSecondaryImage, 'O produto não possui imagem secundária configurada.');
    await selectSwatch(swatchWithSecondaryImage);
    const expectedSecondaryImage = await swatchWithSecondaryImage.getAttribute('data-secondary-image-url');
    const image = card.locator('.product-card-image');

    await image.hover();
    await expect(image).toHaveAttribute('src', expectedSecondaryImage);
  });
});

test.describe('Product card rendered by Liquid', () => {
  test.use({ javaScriptEnabled: false });

  test('tem estado inicial correto antes da inicialização do JavaScript', async ({ page }) => {
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
