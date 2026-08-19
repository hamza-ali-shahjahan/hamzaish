# 0004 — Platform sign-in is an email magic link, not a phone code

- **Date**: 2026-08-16
- **Status**: DECIDED by the operator. Recorded with its trade-off intact, because this
  one was chosen against the recommendation and the reasoning should survive the build.
- **Decision**: The platform's front door is a **Supabase email magic link**. No phone
  number, no OTP, no WhatsApp, in the first version.
- **Why**: (the case for it) It is free, it needs no new provider, Supabase ships it, and
  it removes an entire class of delivery failure, cost and fraud from the first build.
  Every day not spent wiring an SMS gateway is a day spent on the first-session design —
  which is the thing that actually determines whether anyone ships.
- **Alternatives considered**: the recommendation this overrode — phone number as identity, verified by WhatsApp code
  with SMS fallback. The argument was that the stated audience — office boys, blue-collar
  workers, people written off — typically has a phone habit and not an email habit, so an
  email front door may quietly exclude precisely the people the product exists for. That
  argument is not withdrawn; it is deferred and made measurable.
- **What would prove it wrong**: the **`magic_link_sent` → `magic_link_clicked` rate,
  split by city tier**. Below **60% for non-metro cities**, email has stopped being a
  preference and become a defect — because the drop-off is not disinterest, it is people
  who never saw the email. A second signal: qualitative reports in the five validation
  conversations that "I do not really use email."
- **Revisit trigger**: at **200 platform signups**, or the first validation conversation
  where a target-profile person says email is a barrier — whichever comes first.
- **Cost of reversing later**: moderate but bounded. Identity would move from email to
  phone on `builders`, requiring a migration and a linking flow for existing accounts.
  Cheaper now than at 10,000 builders — which is why the trigger is set at 200, not later.
