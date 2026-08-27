# Anchored Checkout — taking money without leaving the page

> **The house name for it: Anchored Checkout.** Anchored twice over — the *payment*
> is anchored to your page (no redirect), and the *pay button* is anchored to the
> frame (never scrolls away).
>
> The industry terms, so you can talk to anyone about it: this is an **embedded**
> (or **on-site**) checkout, as opposed to a **hosted** or **redirect** checkout.
> Stripe's name for the embedded piece is the **Payment Element**; the redirect
> alternative is **Stripe Checkout**. The container is a **modal dialog** on
> desktop that becomes a **bottom sheet** on mobile, with a **sticky action bar**
> (also called a persistent primary action, or a pinned CTA).

**Use this every time a product takes payment inside a modal.** Every rule below
was a real defect on dinorun.lol, 2026-08-28 — not a precaution.

---

## Why not just use Stripe Checkout?

Because it navigates. Hosted Checkout is a different page on a Stripe domain, and
the user comes back via a `return_url`. That is fine for most products and fatal
for any product whose promise is that it never leaves the page. It also means the
moment of highest purchase intent happens somewhere you do not control and cannot
instrument.

Embedded is more work. This playbook is that work, already done.

---

## The two lines that make it non-negotiable

### Server: `allow_redirects: 'never'`

```ts
const intent = await stripe.paymentIntents.create({
  amount: PRICE_CENTS,
  currency: 'usd',
  automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
})
```

**This is the load-bearing line.** Plain `automatic_payment_methods: { enabled: true }`
includes redirect-based methods — iDEAL, Bancontact, przelewy24 — and any customer
who picks one gets navigated off your site mid-purchase. `allow_redirects: 'never'`
restricts the intent to methods that complete in place: card and wallets.

Do not "fix" this later by adding a `return_url`. A `return_url` is the admission
that you navigate.

### Client: `redirect: 'if_required'`

```ts
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  redirect: 'if_required',
})
```

Paired with the server line above, there is no payment method in the set that
*could* redirect. The two go together; neither alone is sufficient.

---

## The action bar must live outside the scroll area

A payment form is tall. On a phone, a Pay button placed after it is below the fold
at the exact moment the user has decided to buy.

```
dialog                    ← flex column, max-height capped
├── head                  ← flex: none
├── body                  ← flex: 1 1 auto; min-height: 0; overflow-y: auto
└── action bar            ← flex: none   ← the button lives HERE
```

```css
dialog.modal[open] {
  display: flex;
  flex-direction: column;
}
.modal__body {
  flex: 1 1 auto;
  min-height: 0;      /* ← without this the child grows instead of scrolling */
  overflow-y: auto;
}
.modal__foot {
  flex: none;
}
```

**`min-height: 0` is the whole trick.** A flex child's default `min-height: auto`
means it refuses to shrink below its content, so the dialog grows past its
`max-height` and the "sticky" footer scrolls off with everything else. This is the
single most common reason a sticky modal footer silently does not stick.

**Guard `display: flex` on `[open]`.** Author styles beat the UA stylesheet, so an
unguarded `dialog { display: flex }` overrides `dialog:not([open]) { display: none }`
and your modal is visible when closed.

**Verify it, do not eyeball it.** Inject a tall spacer, scroll the body to the
bottom, and assert the footer moved zero pixels:

```ts
const before = foot.getBoundingClientRect().top
body.scrollTop = 9999
expect(foot.getBoundingClientRect().top).toBe(before)
```

---

## Three platform traps

### 1. React's `onClose` never fires on `<dialog>`

The `close` event **does not bubble**, and React's synthetic system misses it. The
symptom is nasty: ESC closes the dialog visually, but your state never updates —
so the URL hash stays set and **`document.body.style.overflow` is left `hidden`,
silently locking the whole page**.

Handle it natively, and drive ESC through your own close path via `cancel`
(which is cancelable) rather than trusting a native event you have seen an engine
skip:

```ts
useEffect(() => {
  const dialog = dialogRef.current
  if (!dialog) return
  const onCancel = (e: Event) => { e.preventDefault(); if (openRef.current) close() }
  const onClose = () => { if (openRef.current) close() }
  dialog.addEventListener('cancel', onCancel)
  dialog.addEventListener('close', onClose)
  return () => {
    dialog.removeEventListener('cancel', onCancel)
    dialog.removeEventListener('close', onClose)
  }
}, [close])
```

### 2. Tailwind preflight breaks dialog centering

Preflight zeroes `margin` on every element, which kills the UA's
`dialog:modal { margin: auto }` and pins your modal to the top-left corner.

```css
dialog.modal { margin: auto; }              /* desktop: centered      */
@media (max-width: 640px) {
  dialog.modal { margin: auto auto 0; }     /* mobile: bottom sheet   */
}
```

### 3. Mobile needs the safe area

```css
@media (max-width: 640px) {
  .modal__foot { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
}
```

Otherwise the pay button sits under the home indicator on modern iPhones.

---

## Structure: Provider / Body / Foot

The button is outside the scroll area but must reflect state from the form inside
it — busy, error, succeeded. A `form` id attribute submits but cannot show state,
so use a small context:

- **Provider** — fetches the client secret, owns `status` / `busy` / `message`,
  wraps everything in Stripe's `<Elements>`.
- **Body** — renders `<PaymentElement>` and registers the confirm handler.
- **Foot** — the button; reads status, calls the registered handler.

Your modal host takes an optional `Foot` and optional `Provider` per modal entry,
so non-payment modals stay plain.

---

## Behave well before the keys exist

A checkout that white-screens without configuration is a checkout nobody can set
up. Return a real state, and **say which variable is missing without printing its
value**:

```ts
if (!secretKey || secretKey.startsWith('sk_test_replace')) {
  return Response.json({
    error: 'not_configured',
    secretKeyPresent: Boolean(secretKey),
    secretKeyLength: secretKey?.length ?? 0,       // 18 = placeholder; ~107 = real
    looksLikePlaceholder: secretKey?.startsWith('sk_test_replace') ?? false,
  }, { status: 503 })
}
```

Key **length** is decisive and leaks nothing. A prefix is public information; the
key is not. This diagnostic turned "not configured, no idea why" into a
five-second answer on a live session, and it stays in the product.

---

## The checks that prove it

```
✓ pay button moves 0px when the body scrolls 660px
✓ ESC clears the hash, unlocks body scroll, and returns focus to the trigger
✓ the back button closes the modal instead of leaving the site
✓ zero document loads across the whole purchase
✓ the modal is a bottom sheet under 640px and fully on screen
```

Detect a navigation with a token stamped on `window`, **not** with Playwright's
`framenavigated` — a hash change is a same-document navigation, so `framenavigated`
fires on every modal open and the test is useless.

```ts
await page.evaluate(() => { (window as any).__alive = true })
// … the entire purchase …
expect(await page.evaluate(() => (window as any).__alive)).toBe(true)
expect(await page.evaluate(() => performance.getEntriesByType('navigation').length)).toBe(1)
```

---

## Reference implementation

dinorun.lol, `src/components/modal/` + `src/app/api/payment-intent/route.ts`,
with the contract sweep in `e2e/nav-contract.spec.ts`. 28 checks, green against
both localhost and the deployed site.

## Provenance

Every rule here is a defect from one session (2026-08-28): the scroll-locked page
from React's missing `onClose`, the top-left modal from Tailwind preflight, the
pay button below the fold on a phone, and the `min-height: 0` that made the
action bar actually stick.
