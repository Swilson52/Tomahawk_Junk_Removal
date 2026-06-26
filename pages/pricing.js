import Head from 'next/head';

// The flyer is rendered verbatim (markup + inline SVGs) via dangerouslySetInnerHTML
// so it matches the print flyer exactly. gtag is loaded site-wide by _document.js,
// so the tel: links below fire the existing Website Phone Click conversion.

const FLYER_CSS = `
  :root{
    --navy:#16294c;
    --navy-deep:#101f3d;
    --red:#d8302c;
    --yellow:#f5b313;
    --cream:#f2f0e8;
    --ink:#1f2937;
    --muted:#6b7280;
    --line:#e5e7eb;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{
    background:#3a3f4a;
    font-family:'Inter',system-ui,sans-serif;
    color:var(--ink);
    padding:28px 16px;
    -webkit-font-smoothing:antialiased;
  }
  .flyer{
    width:100%;
    max-width:760px;
    margin:0 auto;
    background:#fff;
    box-shadow:0 22px 60px rgba(0,0,0,.45);
    overflow:hidden;
  }
  .display{font-family:'Anton',sans-serif;font-weight:400;letter-spacing:.5px;}
  .cond{font-family:'Oswald',sans-serif;}
  .eyebrow{
    font-family:'Oswald',sans-serif;font-weight:600;
    letter-spacing:.28em;text-transform:uppercase;font-size:13px;
  }

  /* ---------- HERO ---------- */
  .hero{
    position:relative;
    background:var(--navy);
    color:#fff;
    text-align:center;
    padding:46px 40px 40px;
    border-top:7px solid var(--red);
    background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 2px,transparent 2px 26px);
  }
  .badge{
    display:inline-block;background:var(--yellow);color:var(--navy);
    font-family:'Oswald',sans-serif;font-weight:700;letter-spacing:.22em;
    font-size:14px;padding:8px 20px;margin-bottom:24px;text-transform:uppercase;
  }
  .hero h1{
    font-family:'Anton',sans-serif;line-height:.92;text-transform:uppercase;
    font-size:74px;letter-spacing:.5px;
  }
  .hero h1 .red{color:var(--red);}
  .hero p.sub{
    margin:24px auto 0;max-width:480px;font-size:18px;color:#d7def0;line-height:1.5;
  }
  .phone-btn{
    display:inline-flex;align-items:center;gap:14px;
    background:var(--red);color:#fff;text-decoration:none;
    font-family:'Oswald',sans-serif;font-weight:700;font-size:34px;letter-spacing:1px;
    padding:14px 40px;margin:28px 0 30px;
  }
  .phone-btn svg{width:30px;height:30px;}
  .hero-feats{
    display:flex;flex-wrap:wrap;justify-content:center;gap:14px 30px;
    font-family:'Oswald',sans-serif;font-weight:600;color:var(--yellow);
    letter-spacing:.12em;font-size:14px;text-transform:uppercase;
  }
  .hero-feats span{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;}
  .hero-feats svg{width:15px;height:15px;}

  /* ---------- BRAND BAR ---------- */
  .brandbar{
    background:var(--red);color:#fff;
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 40px;
  }
  .brandbar .name{
    font-family:'Oswald',sans-serif;font-weight:700;font-size:28px;letter-spacing:.04em;
  }
  .brandbar .name .y{color:var(--yellow);}
  .brandbar .url{font-size:16px;color:#ffe1df;letter-spacing:.02em;text-decoration:none;}
  .brandbar .url:hover{color:#fff;}

  /* ---------- SECTION SHELL ---------- */
  section{padding:46px 40px;}
  .sec-head{text-align:center;margin-bottom:34px;}
  .sec-head .eyebrow{color:var(--red);display:block;margin-bottom:10px;}
  .sec-head h2{
    font-family:'Oswald',sans-serif;font-weight:700;color:var(--navy);
    font-size:40px;text-transform:uppercase;letter-spacing:.01em;
  }
  .sec-head .rule{width:64px;height:4px;background:var(--red);margin:14px auto 0;border-radius:2px;}

  /* ---------- PRICING ---------- */
  .price-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
  .price-card{
    border:1px solid var(--line);border-top:4px solid var(--navy);
    background:#fff;padding:22px 12px 18px;text-align:center;
    display:flex;flex-direction:column;
  }
  .price-card.t-red{border-top-color:var(--red);}
  .price-card.t-yellow{border-top-color:var(--yellow);}
  .p-icon{
    width:58px;height:58px;border-radius:50%;background:var(--navy);
    display:flex;align-items:center;justify-content:center;margin:0 auto 14px;
  }
  .p-icon.bg-red{background:var(--red);}
  .p-icon.bg-yellow{background:var(--yellow);}
  .p-icon svg{width:30px;height:30px;color:#fff;}
  .p-icon.bg-yellow svg{color:var(--navy);}
  .p-title{font-family:'Oswald',sans-serif;font-weight:700;color:var(--navy);font-size:16px;text-transform:uppercase;}
  .p-price{font-family:'Oswald',sans-serif;font-weight:700;color:var(--red);font-size:27px;margin:4px 0 8px;}
  .p-desc{font-size:12.5px;color:var(--muted);line-height:1.35;flex:1;}
  .p-bar{height:7px;border-radius:4px;background:#e3e3e3;margin:16px 0 8px;overflow:hidden;}
  .p-bar span{display:block;height:100%;border-radius:4px;background:var(--navy);}
  .p-bar.fill-red span{background:var(--red);}
  .p-bar.fill-yellow span{background:var(--yellow);}
  .p-cap{font-family:'Oswald',sans-serif;font-weight:600;letter-spacing:.14em;font-size:11px;color:#9aa1ad;text-transform:uppercase;}

  /* tri-color divider */
  .tri{height:6px;display:flex;}
  .tri i{flex:1;}
  .tri i:nth-child(1){background:var(--red);}
  .tri i:nth-child(2){background:var(--navy);}
  .tri i:nth-child(3){background:var(--yellow);}

  /* ---------- WHAT WE REMOVE ---------- */
  .remove{background:var(--cream);}
  .remove-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
  .rcard{
    background:#fff;border-top:4px solid var(--navy);padding:16px 16px 18px;
    box-shadow:0 1px 3px rgba(0,0,0,.05);
  }
  .rcard.t-red{border-top-color:var(--red);}
  .rcard.t-yellow{border-top-color:var(--yellow);}
  .rcard-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
  .r-icon{
    width:34px;height:34px;border-radius:7px;background:var(--navy);
    display:flex;align-items:center;justify-content:center;flex:none;
  }
  .r-icon svg{width:19px;height:19px;color:var(--yellow);}
  .r-icon.red svg{color:var(--red);}
  .rcard h3{font-family:'Oswald',sans-serif;font-weight:700;color:var(--navy);font-size:14.5px;text-transform:uppercase;line-height:1.05;}
  .rcard ul{list-style:none;}
  .rcard li{
    display:flex;align-items:flex-start;gap:8px;font-size:13.5px;color:#374151;
    padding:4px 0;line-height:1.25;
  }
  .rcard li svg{width:13px;height:13px;color:var(--red);flex:none;margin-top:3px;}

  /* ---------- HAZARDOUS + INCLUDED ---------- */
  .haz-wrap{background:var(--navy);display:grid;grid-template-columns:1.7fr 1fr;gap:0;}
  .haz{padding:38px 36px;color:#fff;}
  .haz .htitle{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
  .haz .htitle svg{width:26px;height:26px;color:var(--yellow);}
  .haz .htitle h2{font-family:'Oswald',sans-serif;font-weight:700;font-size:25px;text-transform:uppercase;}
  .haz .hsub{color:#aeb8cf;font-size:14px;margin-bottom:24px;}
  .haz-items{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:26px;}
  .haz-item{width:78px;text-align:center;}
  .haz-circle{
    width:52px;height:52px;border-radius:50%;border:2px solid var(--red);
    background:rgba(216,48,44,.12);display:flex;align-items:center;justify-content:center;
    margin:0 auto 7px;position:relative;
  }
  .haz-circle svg{width:24px;height:24px;color:#e2b6b4;}
  .haz-circle:after{
    content:"";position:absolute;width:120%;height:2.5px;background:var(--red);
    transform:rotate(-45deg);border-radius:2px;
  }
  .haz-item span{font-size:11px;color:#c2cadb;line-height:1.2;display:block;}
  .haz-pricing{
    border:1px solid rgba(245,179,19,.55);background:var(--navy-deep);
    padding:18px 16px 16px;
  }
  .haz-pricing .ph{
    text-align:center;font-family:'Oswald',sans-serif;font-weight:700;color:var(--yellow);
    letter-spacing:.18em;font-size:13px;text-transform:uppercase;margin-bottom:14px;
  }
  .haz-pricing .row{display:flex;justify-content:space-around;gap:10px;text-align:center;flex-wrap:wrap;}
  .haz-pricing .row .lab{font-size:13px;color:#c2cadb;margin-bottom:2px;}
  .haz-pricing .row .val{font-family:'Oswald',sans-serif;font-weight:700;color:#fff;font-size:21px;}
  .haz-pricing .row .ea{font-size:11px;color:#7e89a3;}

  .included{
    background:var(--cream);padding:38px 32px;border-left:4px solid var(--red);
  }
  .included h2{
    font-family:'Oswald',sans-serif;font-weight:700;color:var(--navy);font-size:21px;
    text-transform:uppercase;letter-spacing:.04em;padding-bottom:12px;
    border-bottom:2px solid var(--red);margin-bottom:18px;
  }
  .included li{display:flex;align-items:center;gap:11px;font-size:14.5px;color:#374151;padding:7px 0;list-style:none;}
  .included li svg{width:19px;height:19px;color:var(--red);flex:none;}

  /* ---------- FOOTER ---------- */
  .footer{background:var(--navy);color:#fff;padding:42px 40px 0;}
  .foot-grid{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:0;}
  .foot-col{padding:0 28px;}
  .foot-col:first-child{padding-left:0;}
  .foot-col:not(:last-child){border-right:1px solid rgba(255,255,255,.12);}
  .foot-col .eyebrow{color:var(--yellow);display:block;margin-bottom:16px;}
  .foot-phone{display:flex;align-items:center;gap:14px;margin-bottom:16px;text-decoration:none;color:#fff;}
  .foot-phone .circ{
    width:46px;height:46px;border-radius:50%;background:var(--red);
    display:flex;align-items:center;justify-content:center;flex:none;
  }
  .foot-phone .circ svg{width:22px;height:22px;color:#fff;}
  .foot-phone .num{font-family:'Oswald',sans-serif;font-weight:700;font-size:32px;letter-spacing:.5px;}
  .foot-contact{display:flex;align-items:center;gap:11px;color:#d7def0;font-size:15px;margin:9px 0;text-decoration:none;}
  .foot-contact:hover{color:#fff;}
  .foot-contact svg{width:17px;height:17px;color:var(--yellow);flex:none;}
  .foot-schedule{
    display:block;text-align:center;background:var(--red);color:#fff;text-decoration:none;
    font-family:'Oswald',sans-serif;font-weight:700;letter-spacing:.06em;font-size:17px;
    padding:14px;margin-top:18px;text-transform:uppercase;
  }
  .serve h3{font-family:'Anton',sans-serif;text-transform:uppercase;line-height:.95;font-size:50px;text-align:center;}
  .serve h3 .y{color:var(--yellow);}
  .serve .travel{display:flex;align-items:center;justify-content:center;gap:8px;color:#aeb8cf;font-size:14px;margin-top:14px;}
  .serve .travel svg{width:16px;height:16px;color:var(--red);}
  .pay li{display:flex;align-items:center;gap:13px;font-family:'Oswald',sans-serif;font-weight:600;font-size:18px;letter-spacing:.04em;padding:6px 0;list-style:none;}
  .pay .pi{
    width:34px;height:24px;border:1.6px solid var(--yellow);border-radius:5px;
    display:flex;align-items:center;justify-content:center;color:var(--yellow);
    font-family:'Oswald',sans-serif;font-weight:700;font-size:12px;flex:none;
  }
  .pay .pi svg{width:18px;height:14px;color:var(--yellow);}
  .pay .guarantee{display:flex;align-items:center;gap:10px;color:var(--yellow);font-family:'Oswald',sans-serif;font-weight:700;font-size:15px;letter-spacing:.04em;margin-top:14px;}
  .pay .guarantee svg{width:18px;height:18px;}

  .foot-bottom{
    display:flex;align-items:center;justify-content:space-between;gap:20px;
    border-top:1px solid rgba(255,255,255,.12);margin-top:36px;padding:24px 0 30px;
  }
  .foot-bottom .li{display:flex;align-items:center;gap:14px;}
  .foot-bottom .star{
    width:48px;height:48px;border-radius:50%;border:2px solid var(--yellow);
    display:flex;align-items:center;justify-content:center;flex:none;color:var(--yellow);
  }
  .foot-bottom .star svg{width:22px;height:22px;}
  .foot-bottom .li b{font-family:'Oswald',sans-serif;font-weight:700;font-size:18px;letter-spacing:.04em;display:block;text-transform:uppercase;}
  .foot-bottom .li small{color:#aeb8cf;font-size:13px;}
  .foot-bottom .tag{font-family:'Anton',sans-serif;font-size:32px;text-transform:uppercase;letter-spacing:.5px;text-align:right;}
  .foot-bottom .tag .red{color:var(--red);}

  /* ---------- BACK TO SITE ---------- */
  .back-home{
    display:block;max-width:760px;margin:18px auto 0;text-align:center;
    color:#cfd6e6;font-family:'Oswald',sans-serif;font-weight:600;letter-spacing:.1em;
    font-size:13px;text-transform:uppercase;text-decoration:none;
  }
  .back-home:hover{color:#fff;}

  /* ---------- RESPONSIVE ---------- */
  @media(max-width:720px){
    .hero h1{font-size:54px;}
    .price-grid,.remove-grid{grid-template-columns:repeat(2,1fr);}
    .haz-wrap{grid-template-columns:1fr;}
    .included{border-left:none;border-top:4px solid var(--red);}
    .foot-grid{grid-template-columns:1fr;}
    .foot-col{padding:24px 0;border-right:none!important;border-bottom:1px solid rgba(255,255,255,.12);}
    .foot-col:first-child{padding-top:0;}
    .foot-bottom{flex-direction:column;align-items:flex-start;}
    .foot-bottom .tag{text-align:left;font-size:26px;}
  }
`;

// Inline onclick fires the existing Website Phone Click conversion (gtag is global).
const TEL_TRACK = `onclick="if(window.gtag){window.gtag('event','conversion',{send_to:'AW-18244573282/5bGkCOr-r8AcEOKw2PtD'});}"`;

const FLYER_BODY = `
<div class="flyer">

  <!-- HERO -->
  <header class="hero">
    <span class="badge">Fast &middot; Reliable &middot; Affordable</span>
    <h1>We Haul It.<br><span class="red">You Forget It.</span></h1>
    <p class="sub">Same-day and next-day junk removal for homes &amp; businesses.<br>No hidden fees — just one call and it's gone.</p>
    <a class="phone-btn" href="tel:+14047717677" ${TEL_TRACK}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      404-771-7677
    </a>
    <div class="hero-feats">
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Licensed &amp; Insured</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Same-Day Service</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Upfront Pricing</span>
      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Eco-Friendly Disposal</span>
    </div>
  </header>

  <!-- BRAND BAR -->
  <div class="brandbar">
    <div class="name">TOMAHAWK <span class="y">JUNK REMOVAL</span> LLC</div>
    <a class="url" href="/">tomahawkjunk.com</a>
  </div>

  <!-- PRICING -->
  <section>
    <div class="sec-head">
      <span class="eyebrow">Pricing Guide</span>
      <h2>How Much Will It Cost?</h2>
      <div class="rule"></div>
    </div>
    <div class="price-grid">
      <div class="price-card t-red">
        <div class="p-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v8m12-8v8M6 11h12m-12 0-1 7m13-7 1 7M8 18v3m8-3v3"/></svg></div>
        <div class="p-title">Single Item</div>
        <div class="p-price">$75–$125</div>
        <div class="p-desc">Chairs, mattresses, small appliances, TVs</div>
        <div class="p-bar"><span style="width:18%"></span></div>
        <div class="p-cap">~1 Item</div>
      </div>
      <div class="price-card t-navy">
        <div class="p-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="8" y="13" width="8" height="8" rx="1"/></svg></div>
        <div class="p-title">Small Load</div>
        <div class="p-price">$125–$185</div>
        <div class="p-desc">Small cleanups, boxes, single-room junk</div>
        <div class="p-bar"><span style="width:30%"></span></div>
        <div class="p-cap">~¼ Truck</div>
      </div>
      <div class="price-card t-red">
        <div class="p-icon bg-red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3h12v-3a2 2 0 0 1 4 0v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/><path d="M5 19v2m14-2v2"/></svg></div>
        <div class="p-title">Medium Load</div>
        <div class="p-price">$195–$285</div>
        <div class="p-desc">Furniture, appliances, garage cleanouts</div>
        <div class="p-bar fill-red"><span style="width:52%"></span></div>
        <div class="p-cap">~½ Truck</div>
      </div>
      <div class="price-card t-navy">
        <div class="p-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="1"/><path d="M8 11h8"/></svg></div>
        <div class="p-title">Large Load</div>
        <div class="p-price">$300–$485</div>
        <div class="p-desc">Full room cleanouts, heavy debris</div>
        <div class="p-bar"><span style="width:76%"></span></div>
        <div class="p-cap">~¾ Truck</div>
      </div>
      <div class="price-card t-yellow">
        <div class="p-icon bg-yellow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 16V5a1 1 0 0 1 1-1h11v12H1z"/><path d="M13 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/></svg></div>
        <div class="p-title">Full Truck Load</div>
        <div class="p-price">$500–$750+</div>
        <div class="p-desc">Complete home or property cleanouts</div>
        <div class="p-bar fill-yellow"><span style="width:100%"></span></div>
        <div class="p-cap">Full Truck</div>
      </div>
    </div>
  </section>

  <div class="tri"><i></i><i></i><i></i></div>

  <!-- WHAT WE REMOVE -->
  <section class="remove">
    <div class="sec-head">
      <span class="eyebrow">What We Remove</span>
      <h2>No Job Too Big or Too Small</h2>
    </div>
    <div class="remove-grid">
      <div class="rcard t-red">
        <div class="rcard-head"><span class="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 13a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M6 19v2m12-2v2"/></svg></span><h3>Furniture Removal</h3></div>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Couch / Sofa</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Sectional Sofa</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Mattress &amp; Box Spring</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Dining Table Set</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Dressers / Cabinets</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Office Furniture</li>
        </ul>
      </div>
      <div class="rcard t-navy">
        <div class="rcard-head"><span class="r-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h0M9 10h0"/></svg></span><h3>Appliance Removal</h3></div>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Refrigerator</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Washer / Dryer</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Stove / Oven</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Dishwasher</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Microwave</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Water Heater</li>
        </ul>
      </div>
      <div class="rcard t-red">
        <div class="rcard-head"><span class="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 7 9h3l-4 6h4l-3 5h10l-3-5h4l-4-6h3z"/><path d="M12 22v-3"/></svg></span><h3>Outdoor &amp; Yard Waste</h3></div>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Yard Debris Cleanup</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Tree Branch Removal</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Hot Tub Removal</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Shed Demolition &amp; Removal</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Fence Removal</li>
        </ul>
      </div>
      <div class="rcard t-navy">
        <div class="rcard-head"><span class="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 4 6 6-9 9-6-6z"/><path d="m12 6 6 6"/><path d="M4 22 9 17"/></svg></span><h3>Construction Debris</h3></div>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Drywall Debris</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Wood / Lumber</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Concrete / Brick</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Roofing Materials</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Tile / Flooring Debris</li>
        </ul>
      </div>
      <div class="rcard t-yellow">
        <div class="rcard-head"><span class="r-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 3l9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-5h6v5"/></svg></span><h3>Specialty Cleanouts</h3></div>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Garage Cleanout</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Attic Cleanout</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Storage Unit Cleanout</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Estate Cleanout</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Eviction Cleanout</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Office Cleanout</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- HAZARDOUS + INCLUDED -->
  <div class="haz-wrap">
    <div class="haz">
      <div class="htitle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h2>Hazardous &amp; Restricted Items</h2>
      </div>
      <p class="hsub">Some items require special disposal fees or cannot be accepted.</p>
      <div class="haz-items">
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3 9 10l-5 5a2 2 0 0 0 3 3l5-5 7-7z"/><path d="m14 5 5 5"/></svg></div><span>Paints &amp; Chemicals</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10v16H3z"/><path d="M13 8h3l3 3v7a1.5 1.5 0 0 1-3 0v-4h-3"/><path d="M5 8h6"/></svg></div><span>Gasoline or Fuel</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="18" height="10" rx="1"/><path d="M22 11v2"/><path d="M8 4v3M14 4v3"/></svg></div><span>Batteries</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></svg></div><span>Asbestos</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="6" width="10" height="15" rx="2"/><path d="M10 6V3h4v3"/></svg></div><span>Propane Tanks</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="3"/><path d="M12 8V5m2.6 4.5 2.6-1.5m-2.6 4.5 2.6 1.5M9.4 9.5 6.8 8m2.6 4.5L6.8 14"/><path d="M9 19h6"/></svg></div><span>Biohazard Waste</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg></div><span>Tires</span></div>
        <div class="haz-item"><div class="haz-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><path d="M9 9h6M12 6v6"/></svg></div><span>Refrigerants</span></div>
      </div>
      <div class="haz-pricing">
        <div class="ph">Hazardous Disposal Pricing</div>
        <div class="row">
          <div><div class="lab">Paint Cans</div><div class="val">$10–$25</div><div class="ea">each</div></div>
          <div><div class="lab">Tires</div><div class="val">$15–$40</div><div class="ea">each</div></div>
          <div><div class="lab">Propane Tanks</div><div class="val">$20–$60</div><div class="ea">each</div></div>
          <div><div class="lab">Chemical Containers</div><div class="val">Varies</div><div class="ea">&nbsp;</div></div>
        </div>
      </div>
    </div>
    <div class="included">
      <h2>Included With Every Job</h2>
      <ul>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Loading &amp; hauling</li>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Cleanup after removal</li>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Responsible disposal &amp; recycling</li>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Donation drop-offs when possible</li>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Friendly, professional service</li>
        <li><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"/></svg>Licensed &amp; insured</li>
      </ul>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="foot-grid">
      <div class="foot-col">
        <span class="eyebrow">Text or Call Us Today!</span>
        <a class="foot-phone" href="tel:+14047717677" ${TEL_TRACK}>
          <span class="circ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
          <span class="num">404-771-7677</span>
        </a>
        <a class="foot-contact" href="mailto:tomahawkjunkremoval@gmail.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>tomahawkjunkremoval@gmail.com</a>
        <a class="foot-contact" href="/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>tomahawkjunk.com</a>
        <a class="foot-schedule" href="/#quote">Or Schedule an Appointment!</a>
      </div>
      <div class="foot-col serve">
        <span class="eyebrow" style="text-align:center;">We Proudly Serve</span>
        <h3>Metro<br><span class="y">Atlanta</span><br>Area</h3>
        <div class="travel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Willing to travel further for larger jobs</div>
      </div>
      <div class="foot-col pay">
        <span class="eyebrow">Payment Options</span>
        <ul>
          <li><span class="pi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="6"/></svg></span>Cash</li>
          <li><span class="pi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="10" x2="21" y2="10"/></svg></span>Credit / Debit</li>
          <li><span class="pi">V</span>Venmo</li>
          <li><span class="pi">Z</span>Zelle</li>
        </ul>
        <div class="guarantee"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>5-Star Service Guaranteed!</div>
      </div>
    </div>
    <div class="foot-bottom">
      <div class="li">
        <span class="star"><svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg></span>
        <div><b>Licensed &amp; Insured</b><small>Tomahawk Junk Removal LLC &middot; Metro Atlanta Area</small></div>
      </div>
      <div class="tag">Fast. <span class="red">Reliable.</span> Done Right.</div>
    </div>
  </footer>

</div>
<a class="back-home" href="/">&larr; Back to Home</a>
`;

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing &amp; Services — Tomahawk Junk Removal LLC</title>
        <meta name="description" content="See upfront junk removal pricing for Metro Atlanta — from single items to full truck loads. Furniture, appliances, construction debris, cleanouts and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: FLYER_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: FLYER_BODY }} />
    </>
  );
}
