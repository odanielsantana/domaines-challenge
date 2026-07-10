# Testing

## Static validation

```bash
npm run build:css
shopify theme check --path .
```

## End-to-end tests

Playwright starts and stops the Shopify preview automatically. Run:

```bash
npm test
```

By default, Playwright uses `http://127.0.0.1:9292`. To test another URL:

```bash
PLAYWRIGHT_BASE_URL="https://sua-loja.myshopify.com" npm test
```

To test this project's hosted store directly:

```bash
SHOPIFY_STOREFRONT_PASSWORD="sua-senha" npm run test:e2e:store
```

If the store is password protected:

```bash
SHOPIFY_STOREFRONT_PASSWORD="sua-senha" npm test
```

To run the tests interactively:

```bash
npm run test:e2e:ui
```

The **Product card showcase** section must use a product whose only variant option is Color and which has at least two colors. The fixture must also include an available variant with `compare_at_price` greater than `price` and a variant with the `custom.secondary_image` metafield. The suite intentionally fails when these required scenarios are missing.
