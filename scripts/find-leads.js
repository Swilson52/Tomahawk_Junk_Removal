#!/usr/bin/env node
/* eslint-disable no-console */
//
// Automated lead discovery.
//
// Finds target businesses via Google Places, scrapes their websites for a
// contact email, verifies it, and appends new, deduped, deliverable leads to a
// CSV that the campaign sender (scripts/send-campaign.js) then emails.
//
// Usage:
//   node scripts/find-leads.js [options]
//
// Options:
//   --config <path>   Targets file (default: config/targets.json, else example)
//   --out <path>      Leads CSV to append to (default: data/leads.csv)
//   --limit <n>       Stop after adding N new leads this run (0 = no cap)
//   --per-query <n>   Max businesses pulled per search query (default from config/20)
//   --delay <ms>      Pause between site scrapes (default 800)
//   --dry-run         Discover and report, but don't write to the CSV
//   --help
//
// Environment (.env.local): GOOGLE_PLACES_API_KEY (required).

const fs = require('fs');
const path = require('path');

loadDotenv();

const { discoverLeads } = require('../lib/discovery/discover');
const {
  loadContacts, loadSuppression, loadSentLog, normalizeEmail,
} = require('../lib/contacts');

const LEAD_COLUMNS = ['email', 'firstName', 'company', 'city', 'segment', 'source', 'website', 'phone'];

function parseArgs(argv) {
  const a = { limit: 0, delay: 800, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--config': a.config = argv[++i]; break;
      case '--out': a.out = argv[++i]; break;
      case '--limit': a.limit = parseInt(argv[++i], 10) || 0; break;
      case '--per-query': a.perQuery = parseInt(argv[++i], 10) || 0; break;
      case '--delay': a.delay = parseInt(argv[++i], 10) || 0; break;
      case '--dry-run': a.dryRun = true; break;
      case '--help': case '-h': a.help = true; break;
      default: console.error(`Unknown option: ${argv[i]}`); a.help = true;
    }
  }
  return a;
}

function resolveConfig(arg) {
  const candidates = [
    arg && path.resolve(process.cwd(), arg),
    path.resolve(process.cwd(), 'config/targets.json'),
    path.resolve(process.cwd(), 'config/targets.example.json'),
  ].filter(Boolean);
  for (const p of candidates) if (fs.existsSync(p)) return p;
  throw new Error('No targets config found. Create config/targets.json.');
}

function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Collect every email we should NOT re-discover: already queued, already
// emailed, or unsubscribed.
function knownEmails(outPath) {
  const known = new Set();
  for (const e of loadSuppression()) known.add(e);
  for (const key of loadSentLog().keys()) known.add(key.split('|')[0]);
  if (fs.existsSync(outPath)) {
    const { contacts } = loadContacts(outPath, { defaultSegment: 'office' });
    for (const c of contacts) known.add(normalizeEmail(c.email));
  }
  return known;
}

function appendLeads(outPath, leads) {
  const exists = fs.existsSync(outPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const lines = [];
  if (!exists) lines.push(LEAD_COLUMNS.join(','));
  for (const l of leads) lines.push(LEAD_COLUMNS.map((k) => csvCell(l[k])).join(','));
  fs.appendFileSync(outPath, lines.join('\n') + '\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 24).join('\n').replace(/^\/\/ ?/gm, ''));
    process.exit(0);
  }

  const configPath = resolveConfig(args.config);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const targets = config.targets || [];
  const outPath = path.resolve(process.cwd(), args.out || 'data/leads.csv');
  const perQuery = args.perQuery || config.perQuery || 20;

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('Error: GOOGLE_PLACES_API_KEY is not set. Add it to .env.local.');
    process.exit(1);
  }

  console.log('\n────────────────────────────────────────');
  console.log('  Lead discovery');
  console.log('────────────────────────────────────────');
  console.log(`  Config:    ${path.relative(process.cwd(), configPath)}`);
  console.log(`  Targets:   ${targets.length} queries`);
  console.log(`  Per query: ${perQuery} businesses`);
  console.log(`  Output:    ${path.relative(process.cwd(), outPath)}${args.dryRun ? '  (DRY RUN — not writing)' : ''}`);
  console.log('────────────────────────────────────────\n');

  const known = knownEmails(outPath);
  console.log(`  Skipping ${known.size} already-known address(es).\n`);

  const { leads, stats } = await discoverLeads({
    targets,
    known,
    perQuery,
    delayMs: args.delay,
    onProgress: ({ phase, query, business, email, status }) => {
      if (phase === 'search') console.log(`  🔎 ${query}`);
      else if (phase === 'add') console.log(`     ✅ ${business} → ${email}`);
      else if (phase === 'verify' || phase === 'scrape' || phase === 'dedupe')
        console.log(`     ·  ${business || ''} (${status})`);
    },
  });

  const finalLeads = args.limit > 0 ? leads.slice(0, args.limit) : leads;

  console.log('\n────────────────────────────────────────');
  console.log('  Discovery summary');
  console.log('────────────────────────────────────────');
  console.log(`  Businesses scanned: ${stats.businesses}`);
  console.log(`  No website:         ${stats.noWebsite}`);
  console.log(`  No email found:     ${stats.noEmail}`);
  console.log(`  Failed verify:      ${stats.failedVerify}`);
  console.log(`  Duplicates skipped: ${stats.duplicate}`);
  console.log(`  New leads found:    ${leads.length}`);
  console.log(`  Writing this run:   ${finalLeads.length}${args.limit ? `  (--limit ${args.limit})` : ''}`);
  console.log('────────────────────────────────────────');

  if (!finalLeads.length) {
    console.log('\nNo new leads to add.');
    return;
  }
  if (args.dryRun) {
    console.log('\nDRY RUN — these would be added:');
    finalLeads.forEach((l) => console.log(`  ${l.segment.padEnd(16)} ${l.email.padEnd(34)} ${l.company}`));
    return;
  }
  appendLeads(outPath, finalLeads);
  console.log(`\nAppended ${finalLeads.length} lead(s) to ${path.relative(process.cwd(), outPath)}.`);
  console.log('Next: dry-run the campaign, then send.');
  console.log(`  npm run send-campaign -- --file ${path.relative(process.cwd(), outPath)}`);
}

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
  console.error('\nDiscovery failed:', err.message);
  process.exit(1);
});
