// Privacy policy — a REAL route from day one, because the marketing footer links here
// and a launchable product needs one (store reviews, Stripe, GDPR requests all ask).
// The copy below is a minimal honest placeholder: replace the bracketed sections with
// your real practices before launch — shipping a policy you don't follow is worse
// than shipping none.
export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 prose prose-neutral dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: [DATE — set at launch]</p>
      <h2>What we collect</h2>
      <p>
        Account details you give us (email, name), and product usage events we record to
        operate and improve the service. [List your analytics tooling — e.g. PostHog —
        and whether IPs are stored.]
      </p>
      <h2>What we never do</h2>
      <p>We do not sell your personal data. [Adjust if untrue — and reconsider.]</p>
      <h2>Where data lives</h2>
      <p>[Name your processors: hosting, database, payments, email, error tracking.]</p>
      <h2>Your rights</h2>
      <p>
        Email us to export or delete your data: [SUPPORT_EMAIL]. We respond within 30 days.
      </p>
    </main>
  );
}
