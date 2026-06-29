// Contact list + suppression handling for outreach campaigns.
//
// Contacts live in a CSV (see data/contacts.example.csv). Real lists belong in
// gitignored files — never commit prospect data. The suppression list records
// everyone who has unsubscribed; it is the source of truth and is always
// checked before sending.

const fs = require('fs');
const path = require('path');
const { isValidSegment } = require('./segments');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SUPPRESSION_FILE = path.join(DATA_DIR, 'suppression.json');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent-log.json');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Minimal RFC-pragmatic email check — enough to skip obviously broken rows.
function looksLikeEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// A small CSV parser that handles quoted fields, escaped quotes (""), commas
// inside quotes, and CRLF line endings. Avoids pulling in a dependency.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (ch === '\r') {
      // swallow; handled by the following \n (or end of file below)
    } else {
      field += ch;
    }
  }
  // Flush the final field/row if the file didn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((c) => c.trim() !== ''));
}

// Load and validate contacts from a CSV file.
// Required column: email. Optional: firstName, company, city, segment.
// `defaultSegment` fills in rows that omit a segment.
// Returns { contacts: [...], skipped: [{row, reason}] }.
function loadContacts(filePath, { defaultSegment } = {}) {
  const text = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(text);
  if (!rows.length) return { contacts: [], skipped: [] };

  const header = rows[0].map((h) => h.trim());
  const idx = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const emailIdx = idx('email');
  if (emailIdx === -1) {
    throw new Error('Contacts file must have an "email" column.');
  }
  const firstNameIdx = idx('firstName');
  const companyIdx = idx('company');
  const cityIdx = idx('city');
  const segmentIdx = idx('segment');

  const contacts = [];
  const skipped = [];
  const seen = new Set();

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const email = normalizeEmail(cells[emailIdx]);
    if (!email) { skipped.push({ row: r + 1, reason: 'missing email' }); continue; }
    if (!looksLikeEmail(email)) { skipped.push({ row: r + 1, reason: `invalid email: ${email}` }); continue; }
    if (seen.has(email)) { skipped.push({ row: r + 1, reason: `duplicate in file: ${email}` }); continue; }
    seen.add(email);

    const segment = (segmentIdx > -1 ? String(cells[segmentIdx] || '').trim() : '') || defaultSegment || '';
    if (!segment) { skipped.push({ row: r + 1, reason: `no segment for ${email} (set one in the CSV or pass --segment)` }); continue; }
    if (!isValidSegment(segment)) { skipped.push({ row: r + 1, reason: `unknown segment "${segment}" for ${email}` }); continue; }

    contacts.push({
      email,
      firstName: firstNameIdx > -1 ? String(cells[firstNameIdx] || '').trim() : '',
      company: companyIdx > -1 ? String(cells[companyIdx] || '').trim() : '',
      city: cityIdx > -1 ? String(cells[cityIdx] || '').trim() : '',
      segment: segment.toLowerCase(),
    });
  }
  return { contacts, skipped };
}

function readJsonSafe(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Suppression (unsubscribe) list ---------------------------------------

function loadSuppression() {
  const data = readJsonSafe(SUPPRESSION_FILE, { emails: [] });
  return new Set((data.emails || []).map(normalizeEmail));
}

function isSuppressed(email, set) {
  const s = set || loadSuppression();
  return s.has(normalizeEmail(email));
}

// Append an email to the suppression list (idempotent). Returns true if added.
function addSuppression(email, meta = {}) {
  ensureDataDir();
  const norm = normalizeEmail(email);
  const data = readJsonSafe(SUPPRESSION_FILE, { emails: [], records: [] });
  data.emails = data.emails || [];
  data.records = data.records || [];
  if (data.emails.map(normalizeEmail).includes(norm)) return false;
  data.emails.push(norm);
  data.records.push({ email: norm, at: new Date().toISOString(), ...meta });
  fs.writeFileSync(SUPPRESSION_FILE, JSON.stringify(data, null, 2));
  return true;
}

// --- Sent log (dedupe across campaign runs) --------------------------------

// Returns a Map of "email|segment" -> ISO timestamp of last send.
function loadSentLog() {
  const data = readJsonSafe(SENT_LOG_FILE, { sends: [] });
  const map = new Map();
  for (const s of data.sends || []) {
    map.set(`${normalizeEmail(s.email)}|${s.segment}`, s.at);
  }
  return map;
}

function recordSends(entries) {
  ensureDataDir();
  const data = readJsonSafe(SENT_LOG_FILE, { sends: [] });
  data.sends = data.sends || [];
  for (const e of entries) {
    data.sends.push({
      email: normalizeEmail(e.email),
      segment: e.segment,
      at: new Date().toISOString(),
      id: e.id || null,
    });
  }
  fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(data, null, 2));
}

function alreadySent(email, segment, sentMap) {
  return (sentMap || loadSentLog()).has(`${normalizeEmail(email)}|${segment}`);
}

module.exports = {
  DATA_DIR,
  SUPPRESSION_FILE,
  SENT_LOG_FILE,
  normalizeEmail,
  looksLikeEmail,
  parseCsv,
  loadContacts,
  loadSuppression,
  isSuppressed,
  addSuppression,
  loadSentLog,
  recordSends,
  alreadySent,
};
