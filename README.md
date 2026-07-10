# Domaine Shopify Product Card Challenge

A headed Shopify theme implementation of Domaine's product card technical challenge. The product card was built from scratch with Liquid, Tailwind CSS, and vanilla JavaScript.

## Submission

- [Live storefront](https://domaines-challenge.myshopify.com)
- [GitHub repository](https://github.com/odanielsantana/domaines-challenge)

## Features

- Sale badge based on variant availability and markdown pricing.
- Current and compare-at prices synchronized with the selected variant.
- Color variant selection through accessible swatches.
- Primary product imagery updated when a swatch is selected.
- Variant-specific secondary imagery displayed on hover.
- Product title, vendor, and pricing information.
- First available variant selected automatically when the current variant is sold out.
- Sold-out state for unavailable variants.
- Variant selection preserved when navigating to the product page.
- Responsive behavior for desktop and mobile viewports.

## Technical approach

The card is implemented as a reusable Liquid snippet and rendered by a configurable Shopify section:

- `snippets/product-card.liquid` contains the card markup and variant data.
- `assets/product-card.js` synchronizes imagery, prices, badge state, links, and availability when a swatch changes.
- `sections/product-card-showcase.liquid` lets a merchant choose the showcased product in the theme editor.
- `src/tailwind.css` is compiled into `assets/tailwind.css`.

The implementation uses Shopify product and variant data rather than hard-coded product content. Native radio inputs and labels are used for keyboard-accessible swatches.

## Product configuration

For the complete experience, the selected Shopify product should have:

- At least two color variants.
- Color as its only variant option. Multi-option products, such as Color + Size,
  require a multi-option picker and are outside this component's scope.
- A featured image for each variant.
- `price` and `compare_at_price` values for variants on sale.
- A variant metafield named `custom.secondary_image` for the hover image.
- Inventory tracking configured to demonstrate available and sold-out states.

## Tech stack

- Shopify Online Store 2.0
- Liquid
- Tailwind CSS 4
- Vanilla JavaScript
- Playwright
- Shopify CLI and Theme Check

## Local development

### Requirements

- Node.js and npm
- Shopify CLI
- Access to a Shopify development store

Install dependencies:

```bash
npm install
```

Start the Tailwind watcher and Shopify theme preview together:

```bash
npm run dev
```

To run them separately:

```bash
npm run dev:css
npm run dev:shopify
```

## Validation and tests

Build the production Tailwind stylesheet:

```bash
npm run build:css
```

Run Shopify Theme Check:

```bash
shopify theme check --path .
```

Run the Playwright end-to-end suite against a local Shopify CLI preview:

```bash
npm test
```

Run the tests against the hosted storefront:

```bash
npm run test:e2e:store
```

If the storefront is password protected, provide its password through the environment:

```bash
SHOPIFY_STOREFRONT_PASSWORD="your-password" npm run test:e2e:store
```

The end-to-end coverage verifies variant selection, image changes, hover imagery, pricing and sale states, product links, add-to-cart behavior, availability, and responsive layouts. Sale and secondary-image scenarios are required test fixtures: the suite fails with a configuration message when either is missing.

## Theme structure

```text
assets/      Compiled styles, JavaScript, images, and icons
config/      Theme settings
layout/      Global theme layouts
sections/    Theme editor sections
snippets/    Reusable Liquid components
src/         Tailwind source stylesheet
templates/   Shopify JSON templates
tests/e2e/   Playwright end-to-end tests
```
