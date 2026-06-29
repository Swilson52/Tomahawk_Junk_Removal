# B2B Email Outreach System

An automated outreach system for reaching businesses that regularly need junk
removal — HOAs, apartment/multifamily property managers, realtors, property
management companies, contractors, estate-sale companies, and offices/retail.

It builds on the same Resend setup the quote form already uses.

---

## What's included

| Piece | Path | What it does |
|-------|------|--------------|
| Target segments | `lib/segments.js` | The business types you can target |
| Email templates | `lib/templates.js` | A tailored, branded email per segment |
| Compliance helpers | `lib/compliance.js` | CAN-SPAM footer, unsubscribe links/signing |
| Contacts + lists | `lib/contacts.js` | CSV loading, suppression list, send log |
| Sending engine | `lib/mailer.js` | Batching, rate limiting, dedupe, dry-run |
| Campaign runner | `scripts/send-campaign.js` | The command you actually run |
| Unsubscribe page | `pages/api/unsubscribe.js` | Honors opt-outs (legally required) |
| Example contacts | `data/contacts.example.csv` | Copy this to start your own list |

---

## Quick start

1. **Install dependencies** (first time only):

   ```bash
   npm install
   ```

2. **Configure environment.** Copy `.env.example` to `.env.local` and fill in
   the outreach values (see the `B2B outreach` section in that file). At minimum
   for a real send you need:
   - `RESEND_API_KEY`
   - `OUTREACH_FROM_EMAIL` — a sender on a **domain you've verified in Resend**
   - `BUSINESS_ADDRESS` — a real physical mailing address (**required by law**)
   - `SITE_URL` — where the unsubscribe link points

3. **Build your contact list.** Copy the example and edit:

   ```bash
   cp data/contacts.example.csv data/contacts.csv
   ```

   Columns: `email,firstName,company,city,segment`. Only `email` and `segment`
   are required (everything else just personalizes the copy). Real lists in
   `data/` are gitignored so prospect data never lands in the repo.

4. **Preview an email** before sending anything:

   ```bash
   npm run send-campaign -- --file data/contacts.csv --preview manager@example-hoa.com
   ```

5. **Dry run** (renders + shows the plan, sends nothing — this is the default):

   ```bash
   npm run send-campaign -- --file data/contacts.csv
   ```

6. **Send for real**, starting small:

   ```bash
   # send to just the first 5 HOA contacts
   npm run send-campaign -- --file data/contacts.csv --segment hoa --limit 5 --live
   ```

---

## Command reference

```
node scripts/send-campaign.js --file <csv> [options]

--file <path>      Contacts CSV (required)
--segment <key>    Only send to this segment; also the default for blank rows
--limit <n>        Cap sends this run (great for testing). Default: no cap
--delay <ms>       Delay between sends (rate limiting). Default: 600
--live             Actually send. Without it, it's a DRY RUN
--force            Re-send to contacts already in the send log
--preview <email>  Print the rendered email for one contact and exit
--help             Show help
```

Segment keys: `hoa`, `apartment`, `realtor`, `property_manager`, `contractor`,
`estate`, `office`.

---

## How it protects you

- **Dry run by default.** Nothing sends unless you pass `--live`.
- **No double-emailing.** Every live send is logged to `data/sent-log.json`.
  Re-running skips anyone already emailed for that segment (override with
  `--force`).
- **Suppression list.** Anyone who unsubscribes is added to
  `data/suppression.json` and is never emailed again.
- **Rate limiting.** A configurable delay between sends keeps you under
  Resend's limits and helps deliverability.
- **Personalization.** Templates greet people by name and reference their
  company and city when available.

---

## Staying legal & out of spam folders

Cold B2B email is legal in the U.S. under the **CAN-SPAM Act**, but only if you
follow the rules — which this system does by default:

1. **Accurate sender info.** From/Reply-To are set from your env config.
2. **Honest subject lines.** The templates describe the service plainly.
3. **A physical postal address** in every email — set `BUSINESS_ADDRESS`. Live
   sends are blocked until you do.
4. **A working unsubscribe** in every email (link + `List-Unsubscribe` header),
   honored automatically via the suppression list.

Deliverability tips:
- **Verify your sending domain in Resend** and set up SPF/DKIM (Resend walks you
  through it). Don't send outreach from a free Gmail address.
- **Start slow** — a few dozen a day, not hundreds — to warm up the domain.
- Keep `--delay` at 600ms or higher.

---

## Where opt-outs are stored (important for serverless)

`data/suppression.json` is the source of truth and is checked before every send.
When someone clicks unsubscribe, `pages/api/unsubscribe.js` tries to append to
that file **and** emails you a notification.

On serverless hosts (e.g. Vercel) the filesystem is read-only, so the file write
won't persist — that's why it also emails you. Two good options:

- **Run campaigns from your own machine/server** (with a persistent disk). The
  unsubscribe notifications tell you who to add; or pull opt-outs from Resend.
- **Or wire `addSuppression()` in `lib/contacts.js` to a database/KV store** if
  you want fully automated serverless opt-outs.

---

## Adding or editing templates

Each segment's copy lives in `lib/templates.js` under `TEMPLATES`. To tweak the
pitch for, say, realtors, edit the `realtor` entry. To add a new business type:

1. Add a key to `SEGMENTS` in `lib/segments.js`.
2. Add a matching entry to `TEMPLATES` in `lib/templates.js`.
3. Use the new key in your CSV's `segment` column.
