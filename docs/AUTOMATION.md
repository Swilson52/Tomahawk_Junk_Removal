# Fully Automated Outreach (lead discovery + scheduled sending)

This builds on the outreach engine in [`EMAIL_OUTREACH.md`](./EMAIL_OUTREACH.md)
and makes it **hands-off**: every weekday it finds new target businesses,
verifies their emails, and sends a small, capped batch — no command from you.

```
                 ┌─────────────────────────── GitHub Actions (scheduled) ───────────────────────────┐
  Google Places →│  find-leads.js: search → scrape website for email → verify (MX) → dedupe → queue  │
                 │  send-campaign.js --live: email a capped daily batch (verified, not opted out)     │
                 └──────────────┬─────────────────────────────────────────────┬─────────────────────┘
   state persists on the        │                                             │  opt-outs flow back in
   `outreach-state` branch ◄────┘                                             ▼
   (leads, sent-log, suppression)                          website /api/unsubscribe → repository_dispatch
                                                            → outreach-unsubscribe.yml writes suppression
```

## What it does on its own

1. **Finds businesses** via the Google Places API for each query you configure
   (HOAs, apartments, realtors, etc. in your service area).
2. **Scrapes each website** for a public contact email.
3. **Verifies** every email (format + the domain actually accepts mail) so bad
   addresses never get sent — this is what protects your sending reputation.
4. **De-dupes** against everyone already queued, emailed, or unsubscribed.
5. **Sends a small batch** (default 25/weekday) using the segment-matched
   templates, rate-limited, with a working unsubscribe in every message.
6. **Remembers everything** on the `outreach-state` branch so it never repeats.

> **Why capped + verified, not a firehose:** blasting unverified, scraped
> addresses is the fastest way to get your domain blacklisted — after which
> *none* of your email lands, including quote-form replies. Small, verified,
> daily batches are what keep deliverability healthy. Adjust the caps in
> `.github/workflows/outreach.yml` (`DISCOVER_LIMIT`, `DAILY_SEND_LIMIT`) once
> the domain is warmed up.

## One-time setup

### 1. Get a Google Places API key
- In [Google Cloud Console](https://console.cloud.google.com/): create a project,
  enable **Places API (New)**, and create an API key. (Free monthly credit
  applies; set a budget cap if you like.)

### 2. Verify your sending domain in Resend
- Add your domain in Resend and set up SPF/DKIM (don't send from a free Gmail
  address). Use an address on that domain for `OUTREACH_FROM_EMAIL`.

### 3. Define your targets
- Copy `config/targets.example.json` to `config/targets.json` and edit the
  queries for **your** cities and business types. One query per type-per-city
  works best. (`config/targets.json` is gitignored; to let the scheduled job use
  it, either commit it with `git add -f config/targets.json` or keep editing the
  example — the script falls back to the example if no `targets.json` exists.)

### 4. Add GitHub Actions secrets
In the repo: **Settings → Secrets and variables → Actions → New repository secret**.
Add each of these:

| Secret | Value |
|--------|-------|
| `GOOGLE_PLACES_API_KEY` | your Places key |
| `RESEND_API_KEY` | your Resend key |
| `OUTREACH_FROM_EMAIL` | e.g. `hello@tomahawkjunkremoval.com` (verified domain) |
| `OUTREACH_REPLY_TO` | where replies go |
| `BUSINESS_NAME` | `Tomahawk Junk Removal LLC` |
| `BUSINESS_ADDRESS` | your real mailing address (**required by law**) |
| `BUSINESS_PHONE` | `(404) 771-7677` |
| `BUSINESS_EMAIL` | `tomahawkjunkremoval@gmail.com` |
| `SITE_URL` | `https://tomahawkjunkremoval.com` |
| `UNSUBSCRIBE_SECRET` | a long random string |

### 5. Wire the live unsubscribe page to the pipeline
So opt-outs from real emails are honored automatically:
- Create a **fine-grained Personal Access Token** with **Contents: read/write**
  on this repo.
- In **Vercel → your project → Settings → Environment Variables**, add:
  - `OUTREACH_GH_TOKEN` = that PAT
  - `OUTREACH_GH_REPO` = `Swilson52/Tomahawk_Junk_Removal`
  - plus `BUSINESS_ADDRESS`, `SITE_URL`, `UNSUBSCRIBE_SECRET` (same values).

That's it. The schedule (weekday mornings) is in
`.github/workflows/outreach.yml` — change the `cron` line to retime it, or hit
**Run workflow** in the Actions tab to trigger a run on demand.

## Test it safely before going live

**Recommended first run — discover only, in GitHub Actions (real network so the
website email-scrape actually works):**

1. Add the secrets above.
2. Go to **Actions → Outreach automation → Run workflow**, leave
   **"Discover only"** checked (the default), and run it.
3. It finds + scrapes + verifies leads and commits them to the `outreach-state`
   branch **without sending any email**. Open `data/leads.csv` on that branch to
   review exactly who it found and how good the emails look.
4. Happy with the quality? Run the workflow again with **"Discover only"
   unchecked** to send a batch — or just let the weekday schedule take over
   (scheduled runs always send live).

You can also run the pieces locally (uses file storage in `data/`; note the
website scrape needs unrestricted outbound network to work):

```bash
GOOGLE_PLACES_API_KEY=... npm run find-leads -- --dry-run --limit 10
npm run send-campaign -- --file data/leads.csv            # dry run, sends nothing
npm run send-campaign -- --file data/leads.csv --limit 3 --live
```

## Tuning

- **Volume:** `DISCOVER_LIMIT` / `DAILY_SEND_LIMIT` in `outreach.yml`.
- **Who to target:** `config/targets.json`.
- **What the emails say:** `lib/templates.js` (per segment).
- **Schedule:** the `cron` in `outreach.yml`.

## How opt-outs stay honored

Every email carries a signed unsubscribe link and a `List-Unsubscribe` header.
When someone unsubscribes, the website route fires a `repository_dispatch`
event; `outreach-unsubscribe.yml` is the **only** writer that appends them to
`suppression.json` on the state branch, which the sender checks before every
send. The route also emails you as a backup. If you ever run campaigns from your
own machine instead, the same `data/suppression.json` is used directly.
