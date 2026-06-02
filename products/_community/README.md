# products/_community/

Community-contributed factory examples. **Empty until the first PR lands.**

## What lives here

Real products built by people other than the maintainer, submitted as evidence that the Hamzaish factory builds shippable things. Each subfolder mirrors the same skeleton as top-level `products/<slug>/`:

```
_community/<your-slug>/
├── product.config.json
├── README.md
├── scope.md
├── status.md
├── learnings.md
└── decisions/
```

## How to contribute

See [`docs/contributing.md`](../../docs/contributing.md#add-your-product-as-a-community-example) for the full flow. TL;DR:

1. Fork the repo
2. Add `products/_community/<your-slug>/` with the skeleton above
3. Prove the product exists + shipped (URL / repo / package / screencast)
4. PR — maintainer verifies, then merges with `verified_by: maintainer`

## What does NOT live here

- Maintainer's products (those stay at top-level `products/`)
- Products that haven't shipped yet (build first, then submit)
- Anything containing secrets, credentials, or proprietary internals — same rules as the rest of the repo
- Products that don't actually use Hamzaish — the contribution is the factory in action, not an unused badge
