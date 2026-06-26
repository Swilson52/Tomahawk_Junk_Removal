import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', details: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fire a Google Ads conversion when a visitor clicks the phone number to call.
  const trackPhoneClick = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-18244573282/5bGkCOr-r8AcEOKw2PtD' });
    }
  };

  // Fire a Google Ads conversion when a visitor submits the quote request form.
  const trackQuoteSubmit = () => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-18244573282/m7zXCJbXiMUcEOKw2PtD' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        trackQuoteSubmit();
        setFormData({ name: '', phone: '', email: '', details: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Tomahawk Junk Removal LLC</title>
        <meta name="description" content="Fast, reliable junk removal serving the Metro Atlanta Area. Same-day service available. Get a free quote today!" />
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
        .nav-logo { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--white); letter-spacing: 0.03em; text-transform: uppercase; }
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

        /* TRUST BAR — navy base, gold as a spark (rule + icons) */
        .trust-bar { background: var(--navy); padding: 16px 40px; display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; border-top: 3px solid var(--gold); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .trust-item { font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.92rem; color: var(--white); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }

        /* SECTIONS */
        .section { padding: 72px 40px; }
        .section-label { font-family: 'Saira Condensed', sans-serif; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); margin-bottom: 10px; }
        .section h2 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: clamp(2rem, 4.5vw, 3rem); color: var(--navy); text-transform: uppercase; letter-spacing: 0.01em; margin-bottom: 48px; }

        /* SERVICES */
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; max-width: 960px; margin: 0 auto; }
        .service-card { background: var(--bone); border-top: 4px solid var(--red); border-radius: 6px; padding: 28px 24px; }
        .service-card .icon { font-size: 2rem; margin-bottom: 14px; }
        .service-card h3 { font-family: 'Anton', sans-serif; font-weight: 400; font-size: 1.25rem; color: var(--navy); text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 10px; }
        .service-card p { font-size: 0.95rem; line-height: 1.6; color: #444; }

        /* HOW IT WORKS */
        .how-section { background: var(--navy); color: var(--white); text-align: center; }
        .how-section h2 { color: var(--white); margin-bottom: 48px; }
        .steps { display: flex; justify-content: center; gap: 0; flex-wrap: wrap; max-width: 860px; margin: 0 auto; }
        .step { flex: 1; min-width: 180px; max-width: 240px; padding: 0 20px 20px; position: relative; }
        .step:not(:last-child)::after { content: '→'; position: absolute; right: -10px; top: 32px; color: var(--gold); font-size: 1.5rem; }
        .step-num { width: 56px; height: 56px; border-radius: 50%; background: var(--gold); color: var(--navy); font-family: 'Anton', sans-serif; font-weight: 400; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .step h3 { font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; color: var(--gold); }
        .step p { font-size: 0.92rem; opacity: 0.8; line-height: 1.55; }

        /* FORM */
        .form-section { background: var(--bone); text-align: center; }
        .form-section h2 { text-align: center; }
        .form-wrap { max-width: 620px; margin: 0 auto; background: var(--white); border-radius: 8px; padding: 40px; box-shadow: 0 4px 30px rgba(16,36,68,0.1); border-top: 5px solid var(--red); text-align: left; }
        .form-intro { font-size: 0.98rem; line-height: 1.55; color: #444; margin-bottom: 24px; }
        .form-intro a { color: var(--red); font-weight: 700; text-decoration: none; white-space: nowrap; }
        .form-intro a:hover { text-decoration: underline; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .form-group label { font-size: 0.85rem; font-family: 'Saira Condensed', sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--navy); }
        .form-group input, .form-group select, .form-group textarea { padding: 11px 14px; border: 1.5px solid var(--steel); border-radius: 4px; font-family: 'Barlow', sans-serif; font-size: 0.95rem; color: var(--ink); outline: none; transition: border-color 0.2s; background: var(--white); }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--red); }
        .form-group textarea { resize: vertical; min-height: 100px; }
        .form-submit { width: 100%; background: var(--red); color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 15px; border: none; border-radius: 4px; border-bottom: 4px solid #8c0f0f; cursor: pointer; transition: background 0.2s, transform 0.15s; margin-top: 6px; }
        .form-submit:hover:not(:disabled) { background: #a8161f; transform: translateY(-2px); }
        .form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-msg { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; padding: 16px; border-radius: 6px; text-align: center; font-family: 'Saira Condensed', sans-serif; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 16px; }
        .error-msg { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 16px; border-radius: 6px; text-align: center; font-family: 'Saira Condensed', sans-serif; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 16px; }

        /* FOOTER */
        footer { background: var(--navy); color: rgba(255,255,255,0.7); text-align: center; padding: 28px 40px; font-size: 0.85rem; }
        footer strong { color: var(--gold); }
        footer a.footer-phone { color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: 0.03em; text-decoration: none; transition: color 0.2s; }
        footer a.footer-phone:hover { color: var(--gold); }

        /* STICKY MOBILE CALL BAR — hidden on desktop, shown on small screens */
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
          .form-row { grid-template-columns: 1fr; }
          .form-wrap { padding: 28px 20px; }
          .step:not(:last-child)::after { display: none; }
          .trust-bar { gap: 20px; padding: 14px 20px; }
          /* leave room for the sticky call bar */
          footer { padding-bottom: 84px; }
          .sticky-call { display: flex; align-items: center; justify-content: center; gap: 10px; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: var(--red); color: var(--white); font-family: 'Saira Condensed', sans-serif; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none; padding: 15px 16px; box-shadow: 0 -3px 14px rgba(0,0,0,0.25); border-top: 3px solid var(--gold); }
          .sticky-call:active { background: #a8161f; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo">Tomahawk <span>Junk Removal</span> LLC</div>
        <div className="nav-actions">
          <a href="tel:+14047717677" onClick={trackPhoneClick} className="nav-phone" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          (404) 771-7677
          </a>
          <a href="mailto:tomahawkjunkremoval@gmail.com" className="nav-email" aria-label="Email Tomahawk Junk Removal at tomahawkjunkremoval@gmail.com">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F6C035" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          tomahawkjunkremoval@gmail.com
          </a>
          <a href="/pricing" className="nav-pricing">Pricing</a>
          <a href="#quote" className="cta-nav">Get a Free Quote</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-eyebrow">Fast · Reliable · Affordable</div>
        <h1>We Haul It.<br /><em>You Forget It.</em></h1>
        <p>Same-day and next-day junk removal for homes and businesses. No hidden fees — just one call and it&apos;s gone.</p>
        <div className="hero-actions">
          <a href="tel:+14047717677" onClick={trackPhoneClick} className="hero-call" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            Call (404) 771-7677
          </a>
          <a href="#quote" className="hero-cta">Get My Free Quote →</a>
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

      {/* SERVICES */}
      <section className="section" style={{textAlign: 'center'}}>
        <p className="section-label">What We Remove</p>
        <h2>No Job Too Big or Too Small</h2>
        <div className="services-grid">
          <div className="service-card"><div className="icon">🏠</div><h3>Household Junk</h3><p>Old furniture, appliances, mattresses, and general clutter — cleared out fast.</p></div>
          <div className="service-card"><div className="icon">🏗️</div><h3>Construction Debris</h3><p>Drywall, lumber, roofing materials, and renovation waste hauled away safely.</p></div>
          <div className="service-card"><div className="icon">🏢</div><h3>Commercial Cleanouts</h3><p>Office furniture, equipment, and bulk waste removed with minimal disruption.</p></div>
          <div className="service-card"><div className="icon">🌿</div><h3>Yard Waste</h3><p>Brush, branches, leaves, and landscaping debris hauled and disposed of properly.</p></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <p className="section-label" style={{color: 'var(--gold)'}}>The Process</p>
        <h2>Ready in 3 Steps</h2>
        <div className="steps">
          <div className="step"><div className="step-num">1</div><h3>Request a Quote</h3><p>Fill out the form below and we&apos;ll reach out with a fast, no-obligation estimate.</p></div>
          <div className="step"><div className="step-num">2</div><h3>Schedule a Pickup</h3><p>Choose a time that works for you — same-day and next-day slots often available.</p></div>
          <div className="step"><div className="step-num">3</div><h3>We Haul It Away</h3><p>Our crew arrives, loads everything up, and leaves the space clean.</p></div>
        </div>
      </section>

      {/* QUOTE FORM */}
      <section className="section form-section" id="quote">
        <p className="section-label">Free Estimate</p>
        <h2>Get Your Quote Today</h2>
        <div className="form-wrap">
          <p className="form-intro">Takes 20 seconds — just the basics and we&apos;ll call you right back. Prefer to talk now? <a href="tel:+14047717677" onClick={trackPhoneClick}>Call (404) 771-7677</a>.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="John Smith" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone" placeholder="(404) 555-0100" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="details">What needs to go?</label>
              <textarea id="details" name="details" placeholder="E.g. old couch and a broken dresser in the garage, plus a few bags of yard debris." value={formData.details} onChange={handleChange} required />
            </div>
            <button type="submit" className="form-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Get My Free Quote →'}
            </button>
            {status === 'success' && <div className="success-msg">✅ Quote request sent! We&apos;ll be in touch shortly.</div>}
            {status === 'error' && <div className="error-msg">❌ Something went wrong. Please try again or call us directly.</div>}
          </form>
        </div>
      </section>

      {/* STICKY MOBILE CALL BAR */}
      <a href="tel:+14047717677" onClick={trackPhoneClick} className="sticky-call" aria-label="Call Tomahawk Junk Removal at (404) 771-7677">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
        Call Now — (404) 771-7677
      </a>

      {/* FOOTER */}
      <footer>
        <p style={{marginBottom: '10px'}}>Call us today: <a href="tel:+14047717677" onClick={trackPhoneClick} className="footer-phone">(404) 771-7677</a> &nbsp;·&nbsp; <a href="mailto:tomahawkjunkremoval@gmail.com" className="footer-phone">tomahawkjunkremoval@gmail.com</a></p>
        <p><strong>Tomahawk Junk Removal LLC</strong> &nbsp;|&nbsp; &copy; 2026 All Rights Reserved</p>
        <p style={{marginTop: '6px'}}>Licensed &amp; Insured &nbsp;·&nbsp; Serving the Metro Atlanta Area</p>
      </footer>
    </>
  );
}
