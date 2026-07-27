// Follow-up sequencing.
//
// The initial campaign sends one cold email per contact. Most B2B replies come
// on the SECOND or THIRD touch, so this module figures out who is due for a
// follow-up: people who received an earlier step of the sequence long enough
// ago, haven't yet received the next step, and haven't unsubscribed.
//
// It reads the send log (who got what stage, and when — lib/contacts) and joins
// it against the master contact list (data/leads.csv) so each follow-up is still
// personalized. Replies land in the owner's inbox and aren't tracked here, so a
// follow-up may reach someone who already answered; the copy is written to be
// low-pressure and easy to ignore for exactly that reason.

const { loadSends, loadSuppression, isSuppressed, normalizeEmail } = require('./contacts');

const DAY_MS = 24 * 60 * 60 * 1000;

// Ordered follow-up stages. `prev` is the step that must have been sent first,
// and `afterDays` is the minimum wait since that step before this one fires.
const FOLLOWUP_STAGES = {
  followup1: { prev: 'initial', afterDays: 5 },
  followup2: { prev: 'followup1', afterDays: 7 },
};

function isFollowupStage(stage) {
  return Object.prototype.hasOwnProperty.call(FOLLOWUP_STAGES, String(stage || ''));
}

// email -> { stage -> latest send time in ms }
function sendsByEmailStage(sends) {
  const map = new Map();
  for (const s of sends) {
    const email = normalizeEmail(s.email);
    const stage = s.stage || 'initial';
    const at = Date.parse(s.at);
    if (Number.isNaN(at)) continue;
    if (!map.has(email)) map.set(email, {});
    const rec = map.get(email);
    if (!rec[stage] || at > rec[stage]) rec[stage] = at;
  }
  return map;
}

// Given the master contact list and a target follow-up stage, return the
// contacts due for that stage (oldest prior-touch first) plus a reason for each
// one skipped. Pure aside from reading the send log / suppression list.
function planFollowup(contacts, { stage = 'followup1', now = Date.now(), sends, suppression } = {}) {
  const cfg = FOLLOWUP_STAGES[stage];
  if (!cfg) throw new Error(`Unknown follow-up stage "${stage}". Valid: ${Object.keys(FOLLOWUP_STAGES).join(', ')}`);

  const byEmail = sendsByEmailStage(sends || loadSends());
  const supp = suppression || loadSuppression();

  const due = [];
  const skipped = [];
  const seen = new Set();

  for (const c of contacts) {
    const email = normalizeEmail(c.email);
    if (seen.has(email)) continue; // one follow-up per address, even if listed twice
    seen.add(email);

    const rec = byEmail.get(email);
    if (!rec || !rec[cfg.prev]) {
      skipped.push({ email, reason: `no "${cfg.prev}" send on record` });
      continue;
    }
    if (rec[stage]) {
      skipped.push({ email, reason: 'already sent this follow-up' });
      continue;
    }
    if (isSuppressed(email, supp)) {
      skipped.push({ email, reason: 'unsubscribed' });
      continue;
    }
    const ageDays = (now - rec[cfg.prev]) / DAY_MS;
    if (ageDays < cfg.afterDays) {
      skipped.push({ email, reason: `only ${ageDays.toFixed(1)}d since ${cfg.prev} (need ${cfg.afterDays})` });
      continue;
    }
    due.push({ ...c, email, _priorAt: rec[cfg.prev] });
  }

  // Re-touch the people who have been waiting longest, first.
  due.sort((a, b) => a._priorAt - b._priorAt);
  return { due: due.map(({ _priorAt, ...c }) => c), skipped };
}

module.exports = { FOLLOWUP_STAGES, isFollowupStage, planFollowup, sendsByEmailStage };
