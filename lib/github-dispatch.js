// Best-effort bridge so opt-outs from the live website reach the automated
// pipeline's state.
//
// The site runs on Vercel (read-only filesystem), but the scheduled outreach
// runs in GitHub Actions and keeps its suppression list on a dedicated
// `outreach-state` branch. When someone unsubscribes, the API route fires a
// GitHub `repository_dispatch` event; a small workflow (outreach-unsubscribe.yml)
// is the single writer that appends the address to that branch — which the
// sender always checks before emailing.
//
// Everything here is best-effort and never throws: the unsubscribe route also
// records locally and emails the owner, so an opt-out is never lost if this
// path isn't configured.

// Fire a repository_dispatch event to record an unsubscribe.
// Requires OUTREACH_GH_TOKEN (a PAT with repo/contents+dispatch write) and
// OUTREACH_GH_REPO ("owner/repo"). Returns { ok, reason }.
async function dispatchUnsubscribe(email, fetchImpl = globalThis.fetch) {
  const token = process.env.OUTREACH_GH_TOKEN;
  const repo = process.env.OUTREACH_GH_REPO;
  if (!token || !repo) return { ok: false, reason: 'not configured' };
  if (typeof fetchImpl !== 'function') return { ok: false, reason: 'no fetch' };

  try {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'unsubscribe',
        client_payload: { email: String(email).trim().toLowerCase() },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 204) return { ok: true, reason: 'dispatched' };
    const text = await res.text().catch(() => '');
    return { ok: false, reason: `github ${res.status}: ${text.slice(0, 160)}` };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

module.exports = { dispatchUnsubscribe };
