const { expect } = require('@playwright/test');

function unavailable(message) {
  throw new Error(message);
}

async function openStorefront(page, path = '/') {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(path);
    } catch (error) {
      if (attempt === 3) {
        unavailable(`The storefront is not accessible: ${error.message}`);
        return;
      }
      await page.waitForTimeout(500 * attempt);
      continue;
    }
    const proxyError = page.getByRole('heading', { name: /Failed to render storefront/i });
    if (!(await proxyError.isVisible().catch(() => false))) break;
    if (attempt === 3) {
      unavailable('The Shopify CLI preview returned 502 after three attempts.');
      return;
    }
    await page.waitForTimeout(500 * attempt);
  }

  const invalidAccessToken = page.getByText(/access token provided is expired|access token.*invalid/i);
  if (await invalidAccessToken.isVisible().catch(() => false)) {
    unavailable(
      'The Shopify CLI session has expired. Authenticate again and restart `npm run dev` before running the tests.',
    );
    return;
  }

  const passwordInput = page.locator('#password-input, input[name="password"]').first();
  if (await passwordInput.isVisible().catch(() => false)) {
    const password = process.env.SHOPIFY_STOREFRONT_PASSWORD;
    if (!password) {
      unavailable(
        'The store is password protected. Set SHOPIFY_STOREFRONT_PASSWORD before running the tests.',
      );
      return;
    }

    await passwordInput.fill(password);
    await page.getByRole('button', { name: /enter|entrar/i }).click();
    await page.waitForLoadState('networkidle');
  }
}

async function getProductCard(page) {
  const card = page.locator('[data-product-card]').first();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    if (await card.isVisible().catch(() => false)) return card;
    if (attempt < 5) {
      await page.waitForTimeout(500 * attempt);
      await page.reload();
    }
  }

  await expect(card, 'Select a product in the Product card showcase section.').toBeVisible();
  return card;
}

async function getAlternativeSwatch(container, { availableOnly = false } = {}) {
  const allSwatches = container.locator('[data-option-value], [data-product-color]');
  expect(await allSwatches.count(), 'The test product must have at least two colors.').toBeGreaterThan(1);

  for (let index = 0; index < await allSwatches.count(); index += 1) {
    const candidate = allSwatches.nth(index);
    const isAvailable = (await candidate.getAttribute('data-available')) !== 'false';
    if (!(await candidate.isChecked()) && (!availableOnly || isAvailable)) {
      const id = await candidate.getAttribute('id');
      return container.locator(`[id="${id}"]`);
    }
  }

  throw new Error('No alternative color was found for the test.');
}

async function selectSwatch(swatch) {
  if (await swatch.isChecked()) return;
  const id = await swatch.getAttribute('id');
  expect(id, 'The color input must have an id associated with its label.').toBeTruthy();
  await swatch.locator(`xpath=following-sibling::label[@for="${id}"]`).click();
  await expect(swatch).toBeChecked();
}

module.exports = { openStorefront, getProductCard, getAlternativeSwatch, selectSwatch };
