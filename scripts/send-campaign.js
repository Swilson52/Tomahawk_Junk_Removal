#!/usr/bin/env node
/* eslint-disable no-console */
//
// Outreach campaign runner.
//
// Usage:
//   node scripts/send-campaign.js --file data/contacts.csv [options]
//
// Options:
//   --file <path>        Contacts CSV (required). Columns: email,firstName,company,city,segment
//   --segment <key>      Only send to this segment, and use it as the default for rows
//                        without one. Keys: hoa, apartment, realtor, property_manager,
//                        contractor, estate, office
//   --limit <n>          Cap sends this run (great for testing). Default: no cap
//   --delay <ms>         Delay between sends (rate limiting). Default: 600
//   --live               Actually send. WITHOUT this flag it's a DRY RUN (default)
//   --force              Ignore the sent-log and re-send to contacts already mailed
//   --preview <email>    Print the rendered subject/text for one contact and exit
//   --help               Show this help
//
// Environment (.env.local): RESEND_API_KEY, OUTREACH_FROM_EMAIL (or RESEND_FROM_EMAIL),
//   OUTREACH_REPLY_TO, BUSINESS_ADDRESS (required for --live), SITE_URL, UNSUBSCRIBE_SECRET.

const fs = require('fs');
const path = require('path');

// Load .env.local / .env if present (no dependency — tiny parser).
loadDotenv();

const { loadContacts } = require('../lib/contacts');
const { sendCampaign, planCampaign } = require('../lib/mailer');
const { buildEmail } = require('../lib/templates');
const { SEGMENT_KEYS } = require('../lib/segments');

function parseArgs(argv) {
  const args = { live: false, force: false, delay: 600, limit: 0 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--file': args.file = argv[++i]; break;
      case '--segment': args.segment = String(argv[++i] || '').toLowerCase(); break;
      case '--limit': args.limit = parseInt(argv[++i], 10) || 0; break;
      case '--delay': args.delay = parseInt(argv[++i], 10) || 0; break;
      case '--live': args.live = true; break;
      case '--force': args.force = true; break;
      case '--preview': args.preview = String(argv[++i] || '').toLowerCase(); break;
      case '--help': case '-h': args.help = true; break;
      default:
        console.error(`Unknown option: ${a}`);
        args.help = true;
    }
  }
  return args;
}

function printHelp() {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 26).join('\n').replace(/^\/\/ ?/gm, ''));
  console.log(`\nAvailable segments: ${SEGMENT_KEYS.join(', ')}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.file && !args.preview)) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  if (!args.file) {
    console.error('Error: --file is required.');
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), args.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: contacts file not found: ${filePath}`);
    process.exit(1);
  }

  const { contacts, skipped } = loadContacts(filePath, { defaultSegment: args.segment });
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} row(s) while loading:`);
    skipped.slice(0, 20).forEach((s) => console.log(`  - row ${s.row}: ${s.reason}`));
    if (skipped.length > 20) console.log(`  ...and ${skipped.length - 20} more`);
  }

  // Filter to one segment if requested.
  let list = contacts;
  if (args.segment) list = contacts.filter((c) => c.segment === args.segment);

  // Preview mode: render one email and exit.
  if (args.preview) {
    const c = list.find((x) => x.email === args.preview) || contacts.find((x) => x.email === args.preview);
    if (!c) {
      console.error(`No contact with email ${args.preview} found in file.`);
      process.exit(1);
    }
    const email = buildEmail(c);
    console.log(`\n=== PREVIEW: ${c.email} (${c.segment}) ===`);
    console.log(`Subject: ${email.subject}\n`);
    console.log(email.text);
    process.exit(0);
  }

  if (!list.length) {
    console.log('\nNo contacts to send to after filtering. Nothing to do.');
    process.exit(0);
  }

  // Show the plan before doing anything.
  const { toSend, skipped: planSkipped } = planCampaign(list, { force: args.force });
  const willSend = args.limit > 0 ? Math.min(args.limit, toSend.length) : toSend.length;

  console.log('\n────────────────────────────────────────');
  console.log(`  Campaign plan`);
  console.log('────────────────────────────────────────');
  console.log(`  Mode:           ${args.live ? '🔴 LIVE (will send real email)' : '🟢 DRY RUN (no email sent)'}`);
  console.log(`  Contacts loaded: ${contacts.length}`);
  if (args.segment) console.log(`  Segment filter:  ${args.segment}`);
  console.log(`  Eligible:        ${toSend.length}`);
  console.log(`  Skipped (supp./already sent): ${planSkipped.length}`);
  console.log(`  Will send now:   ${willSend}${args.limit ? `  (--limit ${args.limit})` : ''}`);
  console.log(`  Delay:           ${args.delay}ms between sends`);
  console.log('────────────────────────────────────────\n');

  if (args.live) {
    console.log('Sending live in 3 seconds... (Ctrl-C to abort)');
    await new Promise((r) => setTimeout(r, 3000));
  }

  const res = await sendCampaign({
    contacts: list,
    dryRun: !args.live,
    limit: args.limit,
    delayMs: args.delay,
    force: args.force,
    onProgress: ({ index, total, email, status }) => {
      const tag = status === 'sent' ? '✅' : status === 'dry-run' ? '·' : '❌';
      console.log(`  ${tag} [${index + 1}/${total}] ${email} (${status})`);
    },
  });

  console.log('\n────────────────────────────────────────');
  console.log(`  Done. ${args.live ? 'Sent' : 'Rendered'}: ${res.sent} · Failed: ${res.failed} · Skipped: ${res.skipped.length}`);
  console.log('────────────────────────────────────────');
  if (!args.live) {
    console.log('\nThis was a DRY RUN. Re-run with --live to actually send.');
  }
}

// --- tiny .env loader -------------------------------------------------------
function loadDotenv() {
  for (const name of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let [, key, val] = m;
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

main().catch((err) => {
  console.error('\nCampaign failed:', err.message);
  process.exit(1);
});
