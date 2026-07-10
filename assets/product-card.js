const initializeProductCards = (root = document) => {
  root.querySelectorAll('[data-product-card]').forEach((card) => {
    if (card.dataset.productCardInitialized === 'true') return;
    card.dataset.productCardInitialized = 'true';

    const inputs = card.querySelectorAll('input[type="radio"]');
    const image = card.querySelector('.product-card-image');
    const productLinks = card.querySelectorAll('[data-product-card-link]');
    const price = card.querySelector('[data-product-card-price]');
    const comparePrice = card.querySelector('[data-product-card-compare-price]');
    const saleBadge = card.querySelector('[data-product-card-sale-badge]');
    const swatches = card.querySelectorAll('[data-product-card-swatch]');

    if (!image || inputs.length === 0) return;

    const defaultImage = image.getAttribute('src');

    swatches.forEach((swatch) => {
      swatch.style.backgroundColor = swatch.dataset.swatchColor;
      if (swatch.dataset.swatchImage) {
        swatch.style.backgroundImage = `url("${swatch.dataset.swatchImage}")`;
      }
    });

    const updateImage = (input, state = 'default') => {
      if (!input) return;

      const variantImage = input.getAttribute('data-image-url');
      const secondaryImage = input.getAttribute('data-secondary-image-url');
      const nextImage = state === 'hover'
        ? (secondaryImage || variantImage || defaultImage)
        : (variantImage || defaultImage);

      if (nextImage) {
        image.setAttribute('src', nextImage);
      }
    };

    const updateVariant = (input) => {
      if (!input) return;

      const variantId = input.getAttribute('data-variant-id');
      const variantPrice = input.getAttribute('data-price');
      const variantCompareAtPrice = input.getAttribute('data-compare-at-price');
      const rawPrice = Number(input.getAttribute('data-price-raw'));
      const rawCompareAtPrice = Number(input.getAttribute('data-compare-at-price-raw'));
      const isAvailable = input.getAttribute('data-available') === 'true';
      const isOnSale = rawCompareAtPrice > rawPrice;

      if (variantId) {
        productLinks.forEach((productLink) => {
          const url = new URL(productLink.href, window.location.origin);
          url.searchParams.set('variant', variantId);
          productLink.href = `${url.pathname}${url.search}${url.hash}`;
        });
      }

      if (price) {
        price.textContent = isAvailable ? variantPrice : 'Sold out';
      }

      if (comparePrice) {
        comparePrice.textContent = isAvailable && isOnSale ? variantCompareAtPrice : '';
        comparePrice.hidden = !(isAvailable && isOnSale);
      }

      if (saleBadge) {
        saleBadge.hidden = !(isAvailable && isOnSale);
      }
    };

    const selectVariant = (input) => {
      updateImage(input);
      updateVariant(input);
    };

    inputs.forEach((input) => {
      input.addEventListener('change', () => selectVariant(input));
    });

    image.addEventListener('mouseenter', () => {
      const selectedInput = card.querySelector('input[type="radio"]:checked') || inputs[0];
      updateImage(selectedInput, 'hover');
    });

    image.addEventListener('mouseleave', () => {
      const selectedInput = card.querySelector('input[type="radio"]:checked') || inputs[0];
      updateImage(selectedInput);
    });

    const firstChecked = card.querySelector('input[type="radio"]:checked') || inputs[0];
    if (firstChecked) {
      selectVariant(firstChecked);
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initializeProductCards());
} else {
  initializeProductCards();
}

document.addEventListener('shopify:section:load', (event) => initializeProductCards(event.target));
