// Google Places API (v1) client — finds target businesses by text query.
//
// Uses the Places "searchText" endpoint, which returns business name, address,
// website, and phone. It does NOT return email addresses — that's what the
// scraper (lib/discovery/scrape.js) is for.
//
// The HTTP client is injectable (`fetchImpl`) so the logic can be unit-tested
// with fixtures and runs anywhere fetch is available (Node 18+, GitHub Actions).

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

// Fields we ask Google to return. Keep this tight — you're billed by field set.
const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'nextPageToken',
].join(',');

function cityFromComponents(components) {
  if (!Array.isArray(components)) return '';
  const byType = (t) => components.find((c) => (c.types || []).includes(t));
  const locality = byType('locality') || byType('postal_town') || byType('sublocality');
  return locality ? (locality.longText || locality.shortText || '') : '';
}

// Normalize one Places result into our lead shape.
function toBusiness(place) {
  return {
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    city: cityFromComponents(place.addressComponents),
    website: place.websiteUri || '',
    phone: place.nationalPhoneNumber || '',
  };
}

// Search for businesses matching a text query (e.g. "HOA management in Marietta GA").
// Pages through results up to `maxResults`. Returns an array of business objects.
async function searchBusinesses(query, opts = {}) {
  const {
    apiKey = process.env.GOOGLE_PLACES_API_KEY,
    fetchImpl = globalThis.fetch,
    maxResults = 60,
    timeoutMs = 15000,
  } = opts;

  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is not set.');
  if (typeof fetchImpl !== 'function') throw new Error('No fetch implementation available.');

  const out = [];
  let pageToken;
  // Places returns up to 20 per page; loop pages until we hit maxResults.
  for (let page = 0; page < 5 && out.length < maxResults; page++) {
    const body = { textQuery: query, pageSize: 20 };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetchImpl(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Places API ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    for (const p of data.places || []) out.push(toBusiness(p));

    pageToken = data.nextPageToken;
    if (!pageToken) break;
    // The next_page_token needs a moment to become valid.
    await new Promise((r) => setTimeout(r, 1500));
  }

  return out.slice(0, maxResults);
}

module.exports = { searchBusinesses, toBusiness, cityFromComponents, FIELD_MASK };
