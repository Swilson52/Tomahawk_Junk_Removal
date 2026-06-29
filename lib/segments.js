// Target business segments for Tomahawk Junk Removal's B2B outreach.
//
// Each segment maps to a tailored email template (see lib/templates.js). The
// `key` is what you put in the `segment` column of your contacts CSV. Keep the
// keys lowercase and stable — they are referenced by the contacts file, the
// campaign script, and the templates.

const SEGMENTS = {
  hoa: {
    key: 'hoa',
    label: 'HOA / Community Associations',
    // A one-line description of who this is and why they buy junk removal.
    audience: 'HOA boards and community association managers',
  },
  apartment: {
    key: 'apartment',
    label: 'Apartment & Multifamily',
    audience: 'apartment complex and multifamily property managers',
  },
  realtor: {
    key: 'realtor',
    label: 'Realtors & Real Estate Agents',
    audience: 'real estate agents and brokers',
  },
  property_manager: {
    key: 'property_manager',
    label: 'Property Management Companies',
    audience: 'residential and commercial property managers',
  },
  contractor: {
    key: 'contractor',
    label: 'Contractors & Remodelers',
    audience: 'general contractors, remodelers, and builders',
  },
  estate: {
    key: 'estate',
    label: 'Estate Sale & Senior Move',
    audience: 'estate sale companies and senior move managers',
  },
  office: {
    key: 'office',
    label: 'Offices, Retail & Restaurants',
    audience: 'office, retail, and restaurant operators',
  },
};

const SEGMENT_KEYS = Object.keys(SEGMENTS);

function isValidSegment(key) {
  return Object.prototype.hasOwnProperty.call(SEGMENTS, String(key || '').toLowerCase());
}

function getSegment(key) {
  return SEGMENTS[String(key || '').toLowerCase()] || null;
}

module.exports = { SEGMENTS, SEGMENT_KEYS, isValidSegment, getSegment };
