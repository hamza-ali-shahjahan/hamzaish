// Wire to your waitlist endpoint. Examples:
// - Tally form: POST to https://api.tally.so/<form-id>
// - Resend Audiences API: POST to your own /api endpoint that wraps it
// - Airtable webhook: POST to your zap

const ENDPOINT = '/api/waitlist'; // replace with your real endpoint

document.getElementById('waitlist-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('waitlist-status');
  const email = e.target.querySelector('input[type=email]').value;
  status.textContent = 'Joining…';
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('failed');
    status.textContent = 'You\'re in. Check your inbox.';
    status.className = 'text-sm text-green-600 mt-2';
    e.target.reset();
  } catch {
    status.textContent = 'Something went wrong — try again?';
    status.className = 'text-sm text-red-600 mt-2';
  }
});
