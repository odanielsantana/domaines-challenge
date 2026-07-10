# Testes

## Validação estática

```bash
npm run build:css
shopify theme check --path .
```

## Testes end-to-end

O Playwright inicia e encerra o preview Shopify automaticamente. Execute:

```bash
npm test
```

Por padrão, o Playwright acessa `http://127.0.0.1:9292`. Para testar outra URL:

```bash
PLAYWRIGHT_BASE_URL="https://sua-loja.myshopify.com" npm test
```

Para testar diretamente a loja deste projeto:

```bash
SHOPIFY_STOREFRONT_PASSWORD="sua-senha" npm run test:e2e:store
```

Se a loja estiver protegida por senha:

```bash
SHOPIFY_STOREFRONT_PASSWORD="sua-senha" npm test
```

Para acompanhar os testes visualmente:

```bash
npm run test:e2e:ui
```

O bloco **Product card showcase** deve ter um produto com pelo menos duas cores configurado. Para cobrir todos os cenários, configure também `compare_at_price` e o metafield `custom.secondary_image` nas variantes.
