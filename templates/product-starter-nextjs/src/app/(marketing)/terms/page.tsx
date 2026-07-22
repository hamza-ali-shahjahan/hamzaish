// Terms of service — a REAL route from day one (the footer links here; payments and
// app-store reviews require it). Minimal honest placeholder: replace bracketed
// sections with terms you actually intend to enforce before launch.
export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 prose prose-neutral dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: [DATE — set at launch]</p>
      <h2>The service</h2>
      <p>
        {'{{PRODUCT_NAME}}'} is provided as-is, without warranty. We may change or
        discontinue features; material changes to paid features get [30] days notice.
      </p>
      <h2>Your account</h2>
      <p>
        You are responsible for your account and for using the service lawfully. We may
        suspend accounts that abuse the service or other users.
      </p>
      <h2>Billing</h2>
      <p>
        Paid plans bill via Stripe. [State your refund policy plainly — e.g. full refund
        within 14 days, no questions.] Cancel anytime; access runs to period end.
      </p>
      <h2>Liability</h2>
      <p>
        To the maximum extent permitted by law, our liability is limited to the amount you
        paid us in the last 12 months.
      </p>
      <h2>Contact</h2>
      <p>[SUPPORT_EMAIL]</p>
    </main>
  );
}
