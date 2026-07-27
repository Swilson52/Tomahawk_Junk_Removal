#!/usr/bin/env node
/* eslint-disable no-console */
//
// Follow-up sequence runner.
//
// Re-touches contacts who already got an earlier step of the sequence. It reads
// the same master contact list as the initial campaign (data/leads.csv) for
// personalization and the send log for who-got-what-when, then emails everyone
// who is due for the next step.
//
// Usage:
//   node scripts/send-followups.js --file data/leads.csv --stage followup1 [options]
//
// Options:
//   --file <path>     Master contact list CSV (default: data/leads.csv)
//   --stage <name>    Which follow-up: followup1 (5+ days after initial) or
//                     followup2 (7+ days after followup1). Default: followup1
//   --limit <n>       Cap sends this run (0 = no cap)
//   --daily-cap <n>   Keep TOTAL sends today (initial + follow-ups) at or under n.
//                     Subtracts what's already gone out today from this run's cap.
//   --delay <ms>      Delay between sends (default 800)
//   --live            Actually send. WITHOUT this flag it's a DRY RUN (default)
//   --preview <email> Print the rendered follow-up for one contact and exit
//   --help
//
// Environment (.env.local): RESEND_API_KEY, OUTREACH_FROM_EMAIL (or RESEND_FROM_EMAIL),
//   OUTREACH_REPLY_TO, BUSINESS_ADDRESS (required for --live), SITE_URL, UNSUBSCRIBE_SECRET.

const fs = require('fs');
const path = require('path');

loadDotenv();

const { loadContacts, sentCountOnDay } = require('../lib/contacts');
const { sendFollowupCampaign } = require('../lib/mailer');
const { planFollowup, FOLLOWUP_STAGES } = require('../lib/followup');
const { buildEmail } = require('../lib/templates');

function parseArgs(argv) {
  const a = { stage: 'followup1', live: false, delay: 800, limit: 0, dailyCap: 0 };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--file': a.file = argv[++i]; break;
      case '--stage': a.stage = String(argv[++i] || '').toLowerCase(); break;
      case '--limit': a.limit = parseInt(argv[++i], 10) || 0; break;
      case '--daily-cap': a.dailyCap = parseInt(argv[++i], 10) || 0; break;
      case '--delay': a.delay = parseInt(argv[++i], 10) || 0; break;
      case '--live': a.live = true; break;
      case '--preview': a.preview = String(argv[++i] || '').toLowerCase(); break;
      case '--help': case '-h': a.help = true; break;
      default: console.error(`Unknown option: ${argv[i]}`); a.help = true;
    }
  }
  return a;
}

function printHelp() {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 33).join('\n').replace(/^\/\/ ?/gm, ''));
  console.log(`\nStages: ${Object.keys(FOLLOWUP_STAGES).join(', ')}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) { printHelp(); process.exit(0); }

  if (!FOLLOWUP_STAGES[args.stage]) {
    console.error(`Error: unknown stage "${args.stage}". Valid: ${Object.keys(FOLLOWUP_STAGES).join(', ')}`);
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), args.file || 'data/leads.csv');
  if (!fs.existsSync(filePath)) {
    console.error(`Error: contact list not found: ${filePath} (nothing to follow up on yet).`);
    process.exit(0); // not an error in the pipeline — just no leads file yet
  }

  const { contacts } = loadContacts(filePath, { defaultSegment: 'office' });

  // Preview mode: render one follow-up and exit.
  if (args.preview) {
    const c = contacts.find((x) => x.email === args.preview);
    if (!c) { console.error(`No contact with email ${args.preview} in ${filePath}.`); process.exit(1); }
    const email = buildEmail(c, { stage: args.stage });
    console.log(`\n=== PREVIEW: ${c.email} (${c.segment}, ${args.stage}) ===`);
    console.log(`Subject: ${email.subject}\n`);
    console.log(email.text);
    process.exit(0);
  }

  const { due, skipped } = planFollowup(contacts, { stage: args.stage });

  // Apply the shared daily cap: leave room for whatever already went out today.
  let effectiveLimit = args.limit;
  if (args.dailyCap > 0) {
    const already = sentCountOnDay();
    const remaining = Math.max(0, args.dailyCap - already);
    effectiveLimit = effectiveLimit > 0 ? Math.min(effectiveLimit, remaining) : remaining;
  }
  const willSend = effectiveLimit > 0 ? Math.min(effectiveLimit, due.length) : due.length;

  console.log('\n────────────────────────────────────────');
  console.log(`  Follow-up plan — ${args.stage}`);
  console.log('────────────────────────────────────────');
  console.log(`  Mode:            ${args.live ? '🔴 LIVE (will send real email)' : '🟢 DRY RUN (no email sent)'}`);
  console.log(`  Contacts loaded: ${contacts.length}`);
  console.log(`  Due for ${args.stage}: ${due.length}`);
  if (args.dailyCap > 0) console.log(`  Daily cap:       ${args.dailyCap} total (${sentCountOnDay()} already sent today)`);
  console.log(`  Will send now:   ${willSend}`);
  console.log(`  Delay:           ${args.delay}ms between sends`);
  console.log('────────────────────────────────────────\n');

  if (!willSend) {
    console.log('Nothing due for follow-up right now. Done.');
    return;
  }

  if (args.live) {
    console.log('Sending live in 3 seconds... (Ctrl-C to abort)');
    await new Promise((r) => setTimeout(r, 3000));
  }

  const res = await sendFollowupCampaign({
    contacts: due,
    stage: args.stage,
    dryRun: !args.live,
    limit: effectiveLimit,
    delayMs: args.delay,
    onProgress: ({ index, total, email, status }) => {
      const tag = status === 'sent' ? '✅' : status === 'dry-run' ? '·' : '❌';
      console.log(`  ${tag} [${index + 1}/${total}] ${email} (${status})`);
    },
  });

  console.log('\n────────────────────────────────────────');
  console.log(`  Done. ${args.live ? 'Sent' : 'Rendered'}: ${res.sent} · Failed: ${res.failed} · Skipped: ${skipped.length}`);
  console.log('────────────────────────────────────────');
  if (!args.live) console.log('\nThis was a DRY RUN. Re-run with --live to actually send.');
}

// --- tiny .env loader -------------------------------------------------------
function loadDotenv() {
  for (const name of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let [, k, v] = m;
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

main().catch((err) => {
  console.error('\nFollow-up run failed:', err.message);
  process.exit(1);
});
