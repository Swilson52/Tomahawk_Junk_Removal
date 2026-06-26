import Head from 'next/head';

// Pricing & services page — built on the SAME design system as the landing page
// (pages/index.js): identical nav, hero, trust bar, section/footer styles, fonts,
// and sticky mobile call bar. Content is the print flyer, re-expressed in that system.

const TIERS = [
  { icon: '🪑', name: 'Single Item', price: '$75–$125', desc: 'Chairs, mattresses, small appliances, TVs', cap: '~1 Item', fill: 18 },
  { icon: '📦', name: 'Small Load', price: '$125–$185', desc: 'Small cleanups, boxes, single-room junk', cap: '~¼ Truck', fill: 30 },
  { icon: '🛋️', name: 'Medium Load', price: '$195–$285', desc: 'Furniture, appliances, garage cleanouts', cap: '~½ Truck', fill: 52, feature: true },
  { icon: '🚪', name: 'Large Load', price: '$300–$485', desc: 'Full room cleanouts, heavy debris', cap: '~¾ Truck', fill: 76 },
  { icon: '🚛', name: 'Full Truck Load', price: '$500–$750+', desc: 'Complete home or property cleanouts', cap: 'Full Truck', fill: 100 },
];

const REMOVE = [
  { icon: '🛋️', title: 'Furniture Removal', items: ['Couch / Sofa', 'Sectional Sofa', 'Mattress & Box Spring', 'Dining Table Set', 'Dressers / Cabinets', 'Office Furniture'] },
  { icon: '🧊', title: 'Appliance Removal', items: ['Refrigerator', 'Washer / Dryer', 'Stove / Oven', 'Dishwasher', 'Microwave', 'Water Heater'] },
  { icon: '🌿', title: 'Outdoor & Yard Waste', items: ['Yard Debris Cleanup', 'Tree Branch Removal', 'Hot Tub Removal', 'Shed Demolition & Removal', 'Fence Removal'] },
  { icon: '🏗️', title: 'Construction Debris', items: ['Drywall Debris', 'Wood / Lumber', 'Concrete / Brick', 'Roofing Materials', 'Tile / Flooring Debris'] },
  { icon: '🏚️', title: 'Specialty Cleanouts', items: ['Garage Cleanout', 'Attic Cleanout', 'Storage Unit Cleanout', 'Estate Cleanout', 'Eviction Cleanout', 'Office Cleanout'] },
];

const HAZARD = [
  { icon: '🎨', label: 'Paints & Chemicals' },
  { icon: '⛽', label: 'Gasoline or Fuel' },
  { icon: '🔋', label: 'Batteries' },
  { icon: '🦺', label: 'Asbestos' },
  { icon: '🔥', label: 'Propane Tanks' },
  { icon: '☣️', label: 'Biohazard Waste' },
  { icon: '🛞', label: 'Tires' },
  { icon: '❄️', label: 'Refrigerants' },
];

const HAZARD_PRICING = [
  { lab: 'Paint Cans', val: '$10–$25', ea: 'each' },
  { lab: 'Tires', val: '$15–$40', ea: 'each' },
  { lab: 'Propane Tanks', val: '$20–$60', ea: 'each' },
  { lab: 'Chemical Containers', val: 'Varies', ea: ' ' },
];

const INCLUDED = [
  'Loading & hauling',
  'Cleanup after removal',
  'Responsible disposal & recycling',
  'Donation drop-offs when possible',
  'Friendly, professional service',
  'Licensed & insured',
];

export default function Pricing() {
  // Fire the Website Phone Click conversion (gtag is loaded site-wide by _document.js).
  const trackPhoneClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-18244573282/5bGkCOr-r8AcEOKw2PtD' });
    }
  };

  return (
    <>
      <Head>
        <title>Pricing &amp; Services — Tomahawk Junk Removal LLC</title>
        <meta name="description" content="See upfront junk removal pricing for Metro Atlanta — from single items to full truck loads. Furniture, appliances, construction debris, cleanouts and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #102444; --red: #D4202C; --gold: #F6C035;
          --white: #FFFFFF; --bone: #F4F6F8; --steel: #B9BFC6; --ink: #0A1322;
        }
        body { font-family: 'Barlow', sans-serif; color: var(--ink); background: var(--white); }

        /* NAV */
        nav { background: var(--navy); display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .nav-logo { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--white); letter-spacing: 0.03em; text-transform: uppercase; text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        nav a.cta-nav { background: var(--red); color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 10px 24px; border-radius: 4px; text-decoration: none; transition: background 0.2s; }
        nav a.cta-nav:hover { background: #a8161f; }
        nav a.nav-pricing { color: var(--gold); border: 1.5px solid var(--gold); font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 18px; border-radius: 4px; text-decoration: none; transition: background 0.2s, color 0.2s; white-space: nowrap; }
        nav a.nav-pricing:hover { background: var(--gold); color: var(--navy); }
        .nav-actions { display: flex; align-items: center; gap: 22px; }
        nav a.nav-phone { color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.05rem; letter-spacing: 0.03em; text-decoration: none; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: color 0.2s; }
        nav a.nav-phone svg { stroke: var(--gold); flex-shrink: 0; }
        nav a.nav-phone:hover { color: var(--gold); }
        nav a.nav-email { color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 1rem; letter-spacing: 0.02em; text-decoration: none; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: color 0.2s; }
        nav a.nav-email svg { stroke: var(--gold); flex-shrink: 0; }
        nav a.nav-email:hover { color: var(--gold); }

        /* HERO */
        .hero { background: var(--navy); color: var(--white); padding: 80px 40px 70px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-55deg, transparent, transparent 38px, rgba(255,255,255,0.03) 38px, rgba(255,255,255,0.03) 40px); pointer-events: none; }
        .hero-eyebrow { display: inline-block; background: var(--gold); color: var(--navy); font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 14px; border-radius: 2px; margin-bottom: 22px; }
        .hero h1 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(2.8rem, 7vw, 5rem); line-height: 0.98; text-transform: uppercase; letter-spacing: 0.01em; margin-bottom: 18px; }
        .hero h1 em { color: var(--red); font-style: normal; }
        .hero p { font-size: 1.1rem; opacity: 0.85; max-width: 520px; margin: 0 auto 36px; line-height: 1.65; }
        .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .hero-cta { display: inline-block; background: var(--red); color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px 40px; border-radius: 4px; text-decoration: none; border-bottom: 4px solid #8c0f0f; transition: transform 0.15s, background 0.2s; }
        .hero-cta:hover { background: #a8161f; transform: translateY(-2px); }
        .hero-call { display: inline-flex; align-items: center; gap: 9px; background: var(--gold); color: var(--navy); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.05em; text-transform: uppercase; padding: 16px 34px; border-radius: 4px; text-decoration: none; border-bottom: 4px solid #c9971c; transition: transform 0.15s, background 0.2s; }
        .hero-call:hover { background: #ffce4a; transform: translateY(-2px); }

        /* TRUST BAR */
        .trust-bar { background: var(--navy); padding: 16px 40px; display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; border-top: 3px solid var(--gold); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .trust-item { font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.92rem; color: var(--white); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }

        /* SECTIONS */
        .section { padding: 72px 40px; }
        .section-alt { background: var(--bone); }
        .section-label { font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); margin-bottom: 10px; }
        .section h2 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(2rem, 4.5vw, 3rem); color: var(--navy); text-transform: uppercase; letter-spacing: 0.01em; margin-bottom: 48px; }
        .section-note { max-width: 640px; margin: -30px auto 44px; font-size: 0.98rem; color: #555; line-height: 1.55; text-align: center; }

        /* PRICING TIERS */
        .price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(178px, 1fr)); gap: 20px; max-width: 1080px; margin: 0 auto; }
        .price-card { background: var(--white); border: 1px solid #e7eaee; border-top: 4px solid var(--navy); border-radius: 6px; padding: 26px 18px; text-align: center; display: flex; flex-direction: column; }
        .price-card.feature { border-top-color: var(--red); box-shadow: 0 10px 28px rgba(16,36,68,0.12); }
        .price-card .p-icon { font-size: 2rem; margin-bottom: 10px; }
        .price-card h3 { font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--navy); }
        .price-card .price { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 1.7rem; color: var(--red); margin: 8px 0; }
        .price-card .p-desc { font-size: 0.88rem; color: #555; line-height: 1.45; flex: 1; }
        .price-bar { height: 7px; border-radius: 4px; background: #e6e9ee; margin: 16px 0 8px; overflow: hidden; }
        .price-bar span { display: block; height: 100%; background: var(--navy); border-radius: 4px; }
        .price-card.feature .price-bar span { background: var(--red); }
        .price-cap { font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #9aa1ad; }

        /* DETAILED REMOVE CARDS */
        .remove-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 24px; max-width: 1080px; margin: 0 auto; text-align: left; }
        .remove-card { background: var(--white); border: 1px solid #e7eaee; border-top: 4px solid var(--red); border-radius: 6px; padding: 24px 22px; }
        .remove-card .rc-head { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
        .remove-card .rc-head .icon { font-size: 1.5rem; }
        .remove-card h3 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 1.12rem; color: var(--navy); text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.05; }
        .remove-card ul { list-style: none; }
        .remove-card li { display: flex; align-items: flex-start; gap: 9px; font-size: 0.93rem; color: #3a3f47; padding: 5px 0; line-height: 1.3; }
        .remove-card li::before { content: '✓'; color: var(--red); font-weight: 700; flex: none; }

        /* HAZARDOUS (navy) */
        .haz-section { background: var(--navy); color: var(--white); text-align: center; }
        .haz-section h2 { color: var(--white); }
        .haz-sub { max-width: 540px; margin: -30px auto 40px; color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.55; }
        .haz-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 22px 14px; max-width: 760px; margin: 0 auto 36px; }
        .haz-item { text-align: center; }
        .haz-item .hz-icon { font-size: 1.9rem; display: block; margin-bottom: 8px; }
        .haz-item span { font-size: 0.8rem; color: rgba(255,255,255,0.78); line-height: 1.25; display: block; letter-spacing: 0.02em; }
        .haz-pricing { max-width: 760px; margin: 0 auto; border: 1px solid rgba(246,192,53,0.45); border-radius: 6px; background: rgba(255,255,255,0.04); padding: 22px 18px; }
        .haz-pricing .hp-title { font-family: 'Saira Condensed', sans-serif; font-weight: 700; letter-spacing: 0.16em; font-size: 0.8rem; text-transform: uppercase; color: var(--gold); text-align: center; margin-bottom: 18px; }
        .haz-pricing .hp-row { display: flex; flex-wrap: wrap; justify-content: space-around; gap: 16px; text-align: center; }
        .haz-pricing .hp-row .lab { font-size: 0.82rem; color: rgba(255,255,255,0.7); margin-bottom: 4px; }
        .haz-pricing .hp-row .val { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 1.2rem; color: #fff; }
        .haz-pricing .hp-row .ea { font-size: 0.7rem; color: rgba(255,255,255,0.5); }

        /* INCLUDED */
        .included-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 6px 30px; max-width: 780px; margin: 0 auto; text-align: left; list-style: none; }
        .included-grid li { display: flex; align-items: center; gap: 12px; font-size: 1rem; color: #333; padding: 12px 0; border-bottom: 1px solid #ececec; }
        .included-grid li .ck { width: 24px; height: 24px; border-radius: 50%; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; flex: none; }

        /* PAYMENT + SERVICE AREA */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; max-width: 880px; margin: 0 auto; text-align: left; align-items: start; }
        .info-card h3 { font-family: 'Saira Condensed', sans-serif; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--navy); font-size: 1.1rem; margin-bottom: 18px; }
        .pay-chips { display: flex; flex-wrap: wrap; gap: 10px; }
        .pay-chip { display: inline-flex; align-items: center; gap: 7px; background: var(--white); border: 1.5px solid var(--navy); border-radius: 6px; padding: 9px 15px; font-family: 'Saira Condensed', sans-serif; font-weight: 600; letter-spacing: 0.04em; color: var(--navy); font-size: 0.95rem; }
        .pay-guarantee { margin-top: 18px; display: flex; align-items: center; gap: 9px; color: #b8860b; font-family: 'Saira Condensed', sans-serif; font-weight: 700; letter-spacing: 0.04em; font-size: 1rem; }
        .serve-area { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 2rem; color: var(--navy); text-transform: uppercase; line-height: 1.02; }
        .serve-area em { color: var(--red); font-style: normal; }
        .serve-note { margin-top: 12px; color: #555; font-size: 0.95rem; line-height: 1.5; }

        /* CTA BAND */
        .cta-band { background: var(--navy); text-align: center; color: var(--white); }
        .cta-band h2 { color: var(--white); margin-bottom: 14px; }
        .cta-band p { max-width: 520px; margin: 0 auto 32px; opacity: 0.85; font-size: 1.05rem; line-height: 1.6; }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        footer { background: var(--navy); color: rgba(255,255,255,0.7); text-align: center; padding: 28px 40px; font-size: 0.85rem; }
        footer strong { color: var(--gold); }
        footer a.footer-phone { color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.03em; text-decoration: none; transition: color 0.2s; }
        footer a.footer-phone:hover { color: var(--gold); }

        /* STICKY MOBILE CALL BAR */
        .sticky-call { display: none; }

        /* RESPONSIVE */
        @media (max-width: 880px) {
          nav a.nav-email { display: none; }
        }
        @media (max-width: 600px) {
          nav { padding: 12px 16px; }
          .nav-logo { font-size: 1.15rem; }
          .nav-actions { gap: 12px; }
          nav a.nav-phone { font-size: 0.9rem; gap: 5px; }
          nav a.nav-phone svg { width: 16px; height: 16px; }
          nav a.cta-nav { padding: 9px 12px; font-size: 0.82rem; }
          nav a.nav-pricing { padding: 7px 11px; font-size: 0.82rem; }
          .hero { padding: 60px 24px 50px; }
          .hero-actions { flex-direction: column; gap: 12px; }
          .hero-call, .hero-cta { width: 100%; justify-content: center; text-align: center; }
          .section { padding: 54px 24px; }
          .info-grid { grid-template-columns: 1fr; gap: 30px; }
          .cta-actions { flex-direction: column; }
          .cta-actions a { width: 100%; justify-content: center; text-align: center; }
          .trust-bar { gap: 20px; padding: 14px 20px; }
          footer { padding-bottom: 84px; }
          .sticky-call { display: flex; align-items: center; justify-content: center; gap: 10px; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: var(--red); color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none; padding: 15px 16px; box-shadow: 0 -3px 14px rgba(0,0,0,0.25); border-top: 3px solid var(--gold); }
          .sticky-call:active { background: #a8161f; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">Tomahawk <span>Junk Removal</span> LLC</a>
        <div className="nav-actions">
          <a href="tel:+14047717677" onClick={trackPhoneClick} className="nav-phone" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          (404) 771-7677
          </a>
          <a href="mailto:tomahawkjunkremoval@gmail.com" className="nav-email" aria-label="Email Tomahawk Junk Removal at tomahawkjunkremoval@gmail.com">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          tomahawkjunkremoval@gmail.com
          </a>
          <a href="/" className="nav-pricing">Home</a>
          <a href="/#quote" className="cta-nav">Get a Free Quote</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">Upfront · Honest · No Surprises</div>
        <h1>Upfront Pricing.<br /><em>No Surprises.</em></h1>
        <p>Transparent, flat-rate junk removal for Metro Atlanta. See what it costs before we ever show up — then get an exact quote in one quick call.</p>
        <div className="hero-actions">
          <a href="tel:+14047717677" onClick={trackPhoneClick} className="hero-call" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            Call (404) 771-7677
          </a>
          <a href="/#quote" className="hero-cta">Get My Free Quote →</a>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-item">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          Licensed &amp; Insured
        </div>
        <div className="trust-item">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Same-Day Service Available
        </div>
        <div className="trust-item">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          Upfront Pricing
        </div>
        <div className="trust-item">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Eco-Friendly Disposal
        </div>
      </div>

      {/* PRICING */}
      <section className="section" style={{ textAlign: 'center' }}>
        <p className="section-label">Pricing Guide</p>
        <h2>How Much Will It Cost?</h2>
        <p className="section-note">Pricing is based on how much space your items take up in the truck. Here&apos;s a general guide — call or text for an exact, no-obligation quote.</p>
        <div className="price-grid">
          {TIERS.map((t) => (
            <div key={t.name} className={`price-card${t.feature ? ' feature' : ''}`}>
              <div className="p-icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <div className="price">{t.price}</div>
              <div className="p-desc">{t.desc}</div>
              <div className="price-bar"><span style={{ width: `${t.fill}%` }} /></div>
              <div className="price-cap">{t.cap}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE REMOVE */}
      <section className="section section-alt" style={{ textAlign: 'center' }}>
        <p className="section-label">What We Remove</p>
        <h2>No Job Too Big or Too Small</h2>
        <div className="remove-grid">
          {REMOVE.map((c) => (
            <div key={c.title} className="remove-card">
              <div className="rc-head"><span className="icon">{c.icon}</span><h3>{c.title}</h3></div>
              <ul>{c.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* HAZARDOUS */}
      <section className="section haz-section">
        <p className="section-label" style={{ color: 'var(--gold)' }}>Hazardous &amp; Restricted</p>
        <h2>Items We Handle Differently</h2>
        <p className="haz-sub">Some items require special disposal fees or can&apos;t be accepted. Just ask — we&apos;ll let you know up front.</p>
        <div className="haz-grid">
          {HAZARD.map((h) => (
            <div key={h.label} className="haz-item">
              <span className="hz-icon">{h.icon}</span>
              <span>{h.label}</span>
            </div>
          ))}
        </div>
        <div className="haz-pricing">
          <div className="hp-title">Hazardous Disposal Pricing</div>
          <div className="hp-row">
            {HAZARD_PRICING.map((p) => (
              <div key={p.lab}>
                <div className="lab">{p.lab}</div>
                <div className="val">{p.val}</div>
                <div className="ea">{p.ea}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="section" style={{ textAlign: 'center' }}>
        <p className="section-label">Always Included</p>
        <h2>Included With Every Job</h2>
        <ul className="included-grid">
          {INCLUDED.map((i) => (
            <li key={i}><span className="ck">✓</span>{i}</li>
          ))}
        </ul>
      </section>

      {/* PAYMENT + SERVICE AREA */}
      <section className="section section-alt">
        <div className="info-grid">
          <div className="info-card">
            <h3>Payment Options</h3>
            <div className="pay-chips">
              <span className="pay-chip">💵 Cash</span>
              <span className="pay-chip">💳 Credit / Debit</span>
              <span className="pay-chip">🅥 Venmo</span>
              <span className="pay-chip">⚡ Zelle</span>
            </div>
            <div className="pay-guarantee">⭐ 5-Star Service Guaranteed</div>
          </div>
          <div className="info-card">
            <h3>We Proudly Serve</h3>
            <div className="serve-area">Metro <em>Atlanta</em> Area</div>
            <p className="serve-note">📍 Willing to travel further for larger jobs — just ask when you call.</p>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section cta-band">
        <h2>Ready to Clear It Out?</h2>
        <p>Get a fast, no-obligation quote — most jobs can be scheduled same-day or next-day.</p>
        <div className="cta-actions">
          <a href="tel:+14047717677" onClick={trackPhoneClick} className="hero-call" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            Call (404) 771-7677
          </a>
          <a href="/#quote" className="hero-cta">Get My Free Quote →</a>
        </div>
      </section>

      {/* STICKY MOBILE CALL BAR */}
      <a href="tel:+14047717677" onClick={trackPhoneClick} className="sticky-call" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        Call Now — (404) 771-7677
      </a>

      {/* FOOTER */}
      <footer>
        <p style={{ marginBottom: '10px' }}>Call us today: <a href="tel:+14047717677" onClick={trackPhoneClick} className="footer-phone">(404) 771-7677</a> &nbsp;·&nbsp; <a href="mailto:tomahawkjunkremoval@gmail.com" className="footer-phone">tomahawkjunkremoval@gmail.com</a></p>
        <p><strong>Tomahawk Junk Removal LLC</strong> &nbsp;|&nbsp; &copy; 2026 All Rights Reserved</p>
        <p style={{ marginTop: '6px' }}>Licensed &amp; Insured &nbsp;·&nbsp; Serving the Metro Atlanta Area</p>
      </footer>
    </>
  );
}
