CSS = r"""
/* SetuVidya preview stylesheet.
   Mirrors the tokens in app/globals.css and tailwind.config.ts. */

:root{
  --ink:#0B1B2B; --navy:#12314F; --indigo:#2B4A8B; --indigo-lift:#385DA8;
  --brass:#A8802C; --brass-text:#86661F; --brass-on-dark:#C6A04E; --numeral:#7C8B9F;
  --teal:#0F6A72; --body:#475669; --muted:#5F6E80;
  --rule:#DDE3EA; --surface:#F4F6F9; --paper:#FFFFFF;
  --radius:4px; --shell:78rem;
  --serif:"Source Serif 4",Georgia,"Times New Roman",serif;
  --sans:"IBM Plex Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --ease:cubic-bezier(.22,1,.36,1);
}

*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:6rem}
body{
  background:var(--paper); color:var(--body);
  font-family:var(--sans); font-size:16px; line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
h1,h2,h3,h4{font-family:var(--serif);color:var(--ink);font-weight:600;letter-spacing:-.011em;text-wrap:balance}
h1{font-size:clamp(2rem,1.6rem + 1.25vw,2.875rem);line-height:1.12;letter-spacing:-.016em}
h2{font-size:clamp(1.625rem,1.42rem + .7vw,2.125rem);line-height:1.2;letter-spacing:-.012em}
h3{font-size:clamp(1.2rem,1.12rem + .28vw,1.44rem);line-height:1.3;letter-spacing:-.008em}
h4{font-size:clamp(1.0625rem,1.03rem + .1vw,1.125rem);line-height:1.4}
p{text-wrap:pretty}
a{color:inherit;text-decoration:none}
img,svg{display:block;max-width:100%}
ul,ol{list-style:none}
:focus-visible{outline:2px solid var(--indigo);outline-offset:3px;border-radius:2px}
::selection{background:rgba(43,74,139,.14);color:var(--ink)}

.shell{width:100%;max-width:var(--shell);margin:0 auto;padding:0 20px}
@media(min-width:640px){.shell{padding:0 32px}}
@media(min-width:1024px){.shell{padding:0 40px}}

.skip{position:absolute;left:-9999px;top:0;z-index:100;background:var(--ink);color:#fff;padding:12px 20px}
.skip:focus{left:0}

/* ---------------------------------------------------------------- header */
/* White bar, as in reference Option 1. The official logo reads fully here. */
.header{position:sticky;top:0;z-index:50;background:#fff;
  border-bottom:1px solid var(--rule);transition:box-shadow .3s}
.header.scrolled{box-shadow:0 12px 32px -14px rgba(11,27,43,.18)}
.header .shell{display:flex;align-items:center;justify-content:space-between;gap:24px;height:76px}

.logo{display:inline-flex;align-items:center;gap:12px}
.logo svg{width:36px;height:36px;flex:none}
.logo-text{display:flex;flex-direction:column;line-height:1}
.logo-name{font-family:var(--serif);font-size:1.32rem;font-weight:600;letter-spacing:-.015em;color:var(--ink)}
.logo-sub{margin-top:4px;font-size:.66rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.logo.invert .logo-name{color:#fff}
.logo.invert .logo-sub{color:rgba(255,255,255,.7)}

.nav{display:none}
@media(min-width:1080px){.nav{display:block}}
.nav ul{display:flex;align-items:center;gap:34px}
.navlink{position:relative;padding:8px 0;font-size:.95rem;font-weight:500;color:var(--body);
  transition:color .2s;display:inline-flex;align-items:center;gap:6px;background:none;border:0;
  font-family:inherit;cursor:pointer}
.navlink:hover,.navlink[data-active="true"]{color:var(--ink)}
.navlink-pending{color:var(--muted);cursor:default}
.navlink-pending::after{display:none}
.dm-pending{display:block;padding:12px 0;font-family:var(--serif);font-size:1.22rem;
  font-weight:600;color:var(--muted)}
.navlink::after{content:"";position:absolute;left:0;bottom:-6px;height:1.5px;width:100%;
  background:var(--brass);transform:scaleX(0);transform-origin:left;transition:transform .26s cubic-bezier(.4,0,.2,1)}
.navlink:hover::after,.navlink[data-active="true"]::after{transform:scaleX(1)}
.navlink .chev{transition:transform .2s}
.navlink[aria-expanded="true"] .chev{transform:rotate(180deg)}

.has-menu{position:relative}
.menu{position:absolute;left:50%;top:100%;transform:translateX(-50%);padding-top:16px;
  width:min(46rem,calc(100vw - 3rem));display:none}
.has-menu[data-open="true"] .menu{display:block}
.menu-inner{border:1px solid var(--rule);background:var(--paper);border-radius:var(--radius);
  overflow:hidden;box-shadow:0 12px 32px -14px rgba(11,27,43,.22),0 2px 6px -2px rgba(11,27,43,.08)}

/* 2x2 mega-menu: identical footprint per service, hairline gutters.
   Scoped under .menu-inner so it outranks the .nav ul flex rule above. */
.menu-inner .mm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;
  align-items:stretch;background:var(--rule)}
.menu-inner .mm-grid > li{display:block;min-width:0}
.mm-card{display:flex;gap:16px;height:100%;padding:20px;background:var(--paper);
  transition:background .2s}
.mm-card:hover,.mm-card:focus-visible{background:var(--surface)}
.mm-icon{flex:none;display:grid;place-items:center;width:40px;height:40px;margin-top:2px;
  border:1px solid var(--rule);border-radius:var(--radius);background:var(--surface);
  color:var(--navy);transition:background .2s,border-color .2s}
.mm-icon svg{width:19px;height:19px}
.mm-card:hover .mm-icon{background:var(--paper);border-color:rgba(18,49,79,.3)}
.mm-text{min-width:0}
.mm-title{display:block;font-family:var(--serif);font-size:1.02rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.mm-blurb{display:block;margin-top:6px;font-size:.88rem;line-height:1.6;color:var(--body)}
.mm-explore{display:inline-flex;align-items:center;gap:6px;margin-top:12px;
  font-size:.85rem;font-weight:500;color:var(--indigo)}
.mm-explore span{transition:transform .2s var(--ease)}
.mm-card:hover .mm-explore span{transform:translateX(2px)}
.mm-all{display:flex;align-items:center;justify-content:center;gap:8px;
  border-top:1px solid var(--rule);background:rgba(244,246,249,.6);padding:14px 20px;
  font-size:.89rem;font-weight:500;color:var(--ink);transition:background .2s,color .2s}
.mm-all:hover{background:var(--surface);color:var(--indigo)}
.mm-all span{transition:transform .2s var(--ease)}
.mm-all:hover span{transform:translateX(4px)}

/* mobile: the same four cards, stacked */
.dm-card{display:flex;gap:14px;padding:14px;border:1px solid var(--rule);
  border-radius:var(--radius);background:var(--paper);transition:background .2s}
.dm-card:hover{background:var(--surface)}
.dm-card .mm-icon{width:36px;height:36px}
.dm-card .mm-icon svg{width:17px;height:17px}
.dm-card .mm-title{font-family:var(--sans);font-size:.97rem}
.dm-card .mm-blurb{margin-top:4px;font-size:.85rem}
/* scoped past ".drawer nav > ul > li > a", which would otherwise style this
   as a top-level serif nav item */
.drawer nav .dm-all{display:flex;align-items:center;gap:8px;margin:0 0 16px;padding:12px 14px;
  border:1px solid var(--rule);border-radius:var(--radius);background:rgba(244,246,249,.6);
  font-family:var(--sans);font-size:.89rem;font-weight:500;color:var(--ink)}
.drawer nav .dm-card{padding:14px}

.header-cta{display:none;align-items:center;gap:16px}
@media(min-width:1080px){.header-cta{display:flex}}

.burger{display:inline-flex;width:44px;height:44px;align-items:center;justify-content:center;
  background:none;border:0;color:var(--ink);cursor:pointer;margin-right:-8px}
@media(min-width:1080px){.burger{display:none}}

.drawer{position:fixed;inset:0;z-index:60;display:none}
.drawer[data-open="true"]{display:block}
.drawer-scrim{position:absolute;inset:0;background:rgba(11,27,43,.45)}
.drawer-panel{position:absolute;inset-block:0;right:0;width:100%;max-width:24rem;background:var(--paper);
  display:flex;flex-direction:column;box-shadow:0 12px 32px -14px rgba(11,27,43,.4)}
.drawer-head{display:flex;align-items:center;justify-content:space-between;height:74px;
  padding:0 20px;border-bottom:1px solid var(--rule);flex:none}
.drawer nav{flex:1;overflow-y:auto;padding:24px 20px}
.drawer nav > ul > li > a{display:block;padding:12px 0;font-family:var(--serif);font-size:1.22rem;font-weight:600;color:var(--ink)}
.drawer .sub{margin:0 0 12px;display:grid;gap:8px}
.drawer-foot{flex:none;padding:20px;border-top:1px solid var(--rule);display:grid;gap:12px}

/* ---------------------------------------------------------------- buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--radius);
  padding:12px 20px;font-size:.95rem;font-weight:500;font-family:inherit;cursor:pointer;border:1px solid transparent;
  transition:background-color .2s var(--ease),color .2s,border-color .2s,box-shadow .2s,transform .1s}
.btn:active{transform:translateY(1px)}
.btn-primary{background:var(--indigo);color:#fff;box-shadow:0 1px 2px rgba(11,27,43,.04)}
.btn-primary:hover{background:var(--indigo-lift);box-shadow:0 12px 32px -14px rgba(11,27,43,.22)}
.btn-secondary{border-color:rgba(18,49,79,.25);color:var(--navy);background:transparent}
.btn-secondary:hover{border-color:rgba(18,49,79,.6);background:rgba(18,49,79,.04)}
.btn-onDark{border-color:rgba(255,255,255,.3);color:#fff;background:transparent}
.btn-onDark:hover{border-color:rgba(255,255,255,.7);background:rgba(255,255,255,.1)}
.btn-ghost{color:var(--indigo);padding:8px 0;border:0}
.btn-ghost:hover{text-decoration:underline;text-underline-offset:4px}
.btn-lg{padding:14px 28px;font-size:1rem}
.btn-sm{padding:9px 16px;font-size:.88rem}
.btn:disabled{opacity:.55;cursor:not-allowed}

/* --------------------------------------------------------------- sections */
.section{position:relative;isolation:isolate;overflow:hidden;padding:64px 0}
@media(min-width:640px){.section{padding:80px 0}}
@media(min-width:1024px){.section{padding:96px 0}}
.section.tight{padding:56px 0}
.section.surface{background:var(--surface)}
.section.ink{background:var(--ink);color:rgba(255,255,255,.75)}
.section.bordered{border-top:1px solid var(--rule)}
.motif{position:absolute;inset:0;z-index:-10;pointer-events:none;overflow:hidden}
.motif svg{width:100%;height:100%}

.kicker{display:flex;align-items:center;gap:12px;margin-bottom:14px;font-size:.78rem;
  font-weight:600;letter-spacing:.02em;color:var(--brass-text)}
.kicker-rule{display:block;height:1px;width:28px;background:rgba(168,128,44,.7);flex:none}
.sec-head{max-width:48rem}
.sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
.sec-head.center .kicker{justify-content:center}
.sec-head.center .lede{margin-left:auto;margin-right:auto}
.sec-head .lede{margin-top:14px;max-width:62ch;font-size:clamp(1.0625rem,1.02rem + .16vw,1.125rem);line-height:1.7;color:var(--body)}
.sec-head.invert .kicker{color:var(--brass-on-dark)}
.sec-head.invert h2,.sec-head.invert h1{color:#fff}
.sec-head.invert .lede{color:rgba(255,255,255,.7)}
.lede{font-size:clamp(1.0625rem,1.02rem + .16vw,1.125rem);line-height:1.7}
.prose{max-width:68ch}

/* ------------------------------------------------------------------- hero */
.hero{position:relative;isolation:isolate;overflow:hidden;border-bottom:1px solid var(--rule)}
.hero::before{content:"";position:absolute;inset:0;z-index:-9;
  background:linear-gradient(to bottom,rgba(244,246,249,.8),rgba(255,255,255,.6) 60%,var(--paper))}
.hero .shell{display:grid;gap:56px;padding-top:64px;padding-bottom:64px}
@media(min-width:1024px){
  .hero .shell{grid-template-columns:1.05fr 1fr;align-items:center;gap:64px;padding-top:96px;padding-bottom:96px}
}
.hero-note{margin-top:32px;max-width:28rem;border-left:2px solid rgba(168,128,44,.5);padding-left:16px;
  font-size:.92rem;line-height:1.7;color:var(--muted)}
.hero-photo{width:100%;height:auto;border:1px solid var(--rule);border-radius:var(--radius);
  object-fit:cover}

.hero-actions{margin-top:36px;display:flex;flex-direction:column;gap:12px}
@media(min-width:640px){.hero-actions{flex-direction:row;align-items:center;gap:16px}}

.page-hero{position:relative;isolation:isolate;overflow:hidden;border-bottom:1px solid var(--rule);
  padding:56px 0}
@media(min-width:1024px){.page-hero{padding:96px 0}}
.page-hero::before{content:"";position:absolute;inset:0;z-index:-9;
  background:linear-gradient(to bottom,rgba(244,246,249,.7),var(--paper))}
.page-hero h1{font-size:clamp(2.1rem,1.5rem + 2.4vw,3.25rem);line-height:1.1;letter-spacing:-.018em;max-width:56rem}
.crumbs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:32px;font-size:.85rem;color:var(--muted)}
.crumbs a:hover{color:var(--indigo)}
.crumbs .sep{color:var(--rule)}
.crumbs [aria-current]{color:var(--body)}

/* ------------------------------------------------------------------ cards */
.panel{position:relative;border:1px solid var(--rule);background:var(--paper);border-radius:var(--radius)}
.panel.interactive{transition:border-color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
.panel.interactive:hover,.panel.interactive:focus-within{
  transform:translateY(-2px);border-color:rgba(18,49,79,.3);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22),0 2px 6px -2px rgba(11,27,43,.08)}

.grid-cells{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  border-radius:var(--radius);overflow:hidden}
.grid-cells > li{background:var(--paper);padding:28px}
@media(min-width:640px){.grid-cells{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.grid-cells.c3{grid-template-columns:repeat(3,1fr)}
  .grid-cells.c4{grid-template-columns:repeat(4,1fr)}
  .grid-cells.c5{grid-template-columns:repeat(5,1fr)}}
@media(min-width:768px) and (max-width:1023px){.grid-cells.c5{grid-template-columns:repeat(3,1fr)}}
.grid-cells > li.navy{background:var(--navy);color:rgba(255,255,255,.75);
  display:flex;flex-direction:column;justify-content:space-between}
.grid-cells > li.navy p{font-family:var(--serif);font-style:italic;font-size:1.12rem;line-height:1.6;color:#fff}
.grid-cells > li.navy a{margin-top:24px;display:inline-flex;gap:8px;color:#fff;font-weight:500;font-size:.93rem}
.grid-cells > li.navy a:hover{color:#C6A04E}

.cell-title{margin-top:20px;font-family:var(--sans);font-size:1.02rem;font-weight:600;color:var(--ink)}
.cell-body{margin-top:10px;font-size:.93rem}
.icon{color:var(--navy)}
.icon-brass{color:var(--brass)}

.cols-2{display:grid;gap:24px}
@media(min-width:1024px){.cols-2{grid-template-columns:repeat(2,1fr)}}
.cols-3{display:grid;gap:24px}
@media(min-width:640px){.cols-3{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.cols-3{grid-template-columns:repeat(3,1fr)}}
.split{display:grid;gap:48px}
@media(min-width:1024px){.split{grid-template-columns:.85fr 1.15fr;gap:80px}}
.split-even{display:grid;gap:48px}
@media(min-width:1024px){.split-even{grid-template-columns:1fr 1fr;gap:64px}}

.tag-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
.tag{border:1px solid var(--rule);background:rgba(244,246,249,.7);border-radius:var(--radius);
  padding:4px 10px;font-size:.83rem;color:var(--body)}
.tag.plain{border-color:transparent;background:none;color:var(--muted)}

.checklist{display:grid;gap:12px}
@media(min-width:640px){.checklist.two{grid-template-columns:repeat(2,1fr);column-gap:32px}}
.checklist li{display:flex;gap:10px;font-size:.94rem;align-items:flex-start}
.check{flex:none;margin-top:6px;width:6px;height:6px;border-radius:999px;background:var(--brass)}

.numeral{font-family:var(--serif);line-height:1;color:var(--numeral)}
.numeral.brass{color:var(--brass)}

/* ------------------------------------------------------------------ track */
.track{display:grid;gap:40px 32px;margin-top:56px}
@media(min-width:640px){.track{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.track.cols-4{grid-template-columns:repeat(4,1fr)}
  .track.cols-3{grid-template-columns:repeat(3,1fr)}}
.track li{position:relative}
.track-line{display:none;position:absolute;left:0;right:0;top:9px;height:1px;background:var(--rule)}
@media(min-width:640px){.track-line{display:block}}
.track.invert .track-line{background:rgba(255,255,255,.2)}
.track-node{position:relative;display:block;width:18px;height:18px;border-radius:999px;
  border:2px solid var(--navy);background:var(--paper)}
.track.invert .track-node{border-color:var(--brass);background:var(--ink)}
.track-node.last{background:var(--brass);border-color:var(--brass)}
.track-title{margin-top:20px;font-family:var(--serif);font-size:1.06rem;font-weight:600;line-height:1.35;color:var(--ink)}
.track.invert .track-title{color:#fff}
.track-num{color:var(--brass);margin-right:8px;font-variant-numeric:tabular-nums}
.track-note{margin-top:8px;font-size:.93rem}
.track.invert .track-note{color:rgba(255,255,255,.65)}

/* -------------------------------------------------------------- accordion */
.accordion{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.acc-item + .acc-item{border-top:1px solid var(--rule)}
.acc-btn{display:flex;width:100%;gap:24px;align-items:flex-start;justify-content:space-between;
  padding:20px 0;text-align:left;background:none;border:0;cursor:pointer;font-family:inherit;transition:color .2s}
.acc-btn:hover{color:var(--indigo)}
.acc-btn > span:first-child{font-family:var(--sans);font-size:1.02rem;font-weight:500;line-height:1.45;color:var(--ink)}
.acc-icon{position:relative;flex:none;margin-top:2px;width:28px;height:28px;border:1px solid var(--rule);
  border-radius:var(--radius);transition:background .2s,border-color .2s}
.acc-icon::before,.acc-icon::after{content:"";position:absolute;left:50%;top:50%;background:var(--navy);
  transform:translate(-50%,-50%);transition:opacity .2s,background .2s}
.acc-icon::before{width:11px;height:1.5px}
.acc-icon::after{width:1.5px;height:11px}
.acc-item[data-open] .acc-icon{background:var(--indigo);border-color:var(--indigo)}
.acc-item[data-open] .acc-icon::before{background:#fff}
.acc-item[data-open] .acc-icon::after{opacity:0}
.acc-panel{padding:0 40px 24px 0}
.acc-panel p{max-width:68ch;font-size:.97rem}

/* ------------------------------------------------------------------- form */
.field{display:block;margin-bottom:8px;font-size:.9rem;font-weight:500;color:var(--ink)}
.field .opt{font-weight:400;color:var(--muted)}
.input,.select,.textarea{width:100%;border:1px solid var(--rule);background:var(--paper);border-radius:var(--radius);
  padding:12px 16px;font-size:.97rem;color:var(--ink);font-family:inherit;
  transition:border-color .2s,box-shadow .2s}
.input:hover,.select:hover,.textarea:hover{border-color:rgba(18,49,79,.35)}
.input:focus,.select:focus,.textarea:focus{outline:0;border-color:var(--indigo);box-shadow:0 0 0 2px rgba(43,74,139,.15)}
.textarea{resize:vertical}
.input[aria-invalid],.select[aria-invalid],.textarea[aria-invalid]{border-color:rgba(185,28,28,.7)}
.form-grid{display:grid;gap:24px}
@media(min-width:640px){.form-grid{grid-template-columns:repeat(2,1fr)}}
.form-row{margin-bottom:24px}
.err{margin-top:8px;font-size:.85rem;color:#b91c1c}
.alert{display:flex;gap:12px;border:1px solid rgba(185,28,28,.4);background:#fef2f2;color:#991b1b;
  padding:14px 16px;border-radius:var(--radius);font-size:.92rem;margin-bottom:24px}
.dropzone{display:flex;align-items:center;gap:12px;border:1px dashed var(--rule);border-radius:var(--radius);
  padding:16px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.93rem}
.dropzone:hover{border-color:rgba(18,49,79,.45);background:var(--surface)}
.consent{display:flex;gap:12px;align-items:flex-start;cursor:pointer;font-size:.9rem}
.consent input{margin-top:5px;flex:none;width:16px;height:16px;accent-color:var(--indigo)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.note{margin-top:24px;border-left:2px solid var(--brass);background:var(--surface);padding:24px;border-radius:var(--radius)}
.note.flat{margin-top:40px}
.section.ink .note{background:transparent;color:rgba(255,255,255,.85);
  font-family:var(--serif);font-style:italic;font-size:1.1rem;line-height:1.7;padding:0 0 0 24px}

.detail-list{display:flex;gap:16px;border-bottom:1px solid var(--rule);padding:20px 0}
.detail-list:last-child{border-bottom:0}
.detail-label{font-size:.82rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.detail-value{margin-top:6px;font-size:.98rem;color:var(--ink)}
.detail-value.ph{color:var(--muted);font-style:italic}

.subhead{font-family:var(--sans);font-size:.85rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.08em;color:var(--muted)}

/* ----------------------------------------------------------------- footer */
/* Brand navy, matching the header. Every text alpha in this block was
   measured against #053058 and clears AA (5.08:1 at the lightest). */
.footer{background:#053058;color:rgba(255,255,255,.65);padding:56px 0 40px}
@media(min-width:1024px){.footer{padding:80px 0}}
.footer-grid{display:grid;gap:40px}
/* Tablet: two columns wrap naturally rather than one tall stack. */
@media(min-width:640px){.footer-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:40px 48px}}
/* Desktop: four columns; Get in Touch gets the width its two-up rows need. */
@media(min-width:1024px){.footer-grid{grid-template-columns:1fr .78fr .92fr 1.75fr;gap:36px}}
.footer h2{font-family:var(--sans);font-size:.8rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.08em;color:#fff}
.footer ul{margin-top:20px;display:grid;gap:10px;font-size:.93rem}
.footer address span[style*="block"]{color:rgba(255,255,255,.75)}
.footer a:hover{color:#18AA87}
.footer .tagline{margin-top:24px;max-width:20rem;font-family:var(--serif);font-style:italic;
  font-size:1.05rem;line-height:1.6;color:rgba(255,255,255,.8)}
.footer .meaning{margin-top:16px;max-width:20rem;font-size:.9rem;line-height:1.7;color:rgba(255,255,255,.65)}
.socials{margin-top:28px;display:flex;gap:12px}
.socials a{display:grid;place-items:center;width:44px;height:44px;border:1px solid rgba(255,255,255,.15);
  border-radius:var(--radius);color:rgba(255,255,255,.6);transition:border-color .2s,color .2s}
.socials a:hover,.socials a:focus-visible{border-color:rgba(24,170,135,.6);color:#18AA87}
.socials svg{width:17px;height:17px}
.footer-bar{margin-top:24px;border-top:1px solid rgba(255,255,255,.1);padding-top:24px;
  font-size:.85rem;color:rgba(255,255,255,.55);display:flex;flex-direction:column;gap:16px}
@media(min-width:640px){.footer-bar{flex-direction:row;align-items:center;justify-content:space-between}}
.footer address{font-style:normal}
.ph{color:rgba(255,255,255,.55);font-style:italic}

/* -------------------------------------------------------------------- CTA */
.cta{position:relative;isolation:isolate;overflow:hidden;background:var(--ink);padding:56px 0}
.cta::before{content:"";position:absolute;inset:0;z-index:-9;
  background:linear-gradient(to right,var(--ink),rgba(11,27,43,.95),rgba(18,49,79,.4))}
.cta .shell{display:flex;flex-direction:column;align-items:flex-start;gap:32px}
@media(min-width:1024px){.cta .shell{flex-direction:row;align-items:center;justify-content:space-between}}
.cta h2{color:#fff;max-width:42rem}
.cta p{margin-top:16px;color:rgba(255,255,255,.7)}
.cta-actions{display:flex;flex-direction:column;gap:12px;flex:none}
@media(min-width:640px){.cta-actions{flex-direction:row}}

/* ----------------------------------------------------------------- motion */
@keyframes draw{from{stroke-dashoffset:var(--dash,1000)}to{stroke-dashoffset:0}}
@keyframes node{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.span-path{stroke-dasharray:var(--dash,1000);animation:draw 1.5s cubic-bezier(.33,1,.68,1) forwards}
.span-node{transform-box:fill-box;transform-origin:center;opacity:0;
  animation:node .42s cubic-bezier(.34,1.4,.64,1) forwards}
.reveal{opacity:1}
html[data-reveal="on"] .reveal{opacity:0}
html[data-reveal="on"] .reveal[data-shown="true"]{animation:rise .62s var(--ease) forwards}
.hero-span{width:100%;height:auto}
.span-labels{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:4px}
.span-labels li{display:flex;align-items:center;gap:4px;font-size:.82rem;font-weight:500;color:var(--body)}
.span-labels span{color:var(--brass)}
@media(min-width:640px){.span-labels{display:none}}
@media(max-width:639px){.span-label{display:none}}
.book-hero-photo{width:100%;max-width:48rem;height:auto;margin-top:56px;
  border:1px solid var(--rule);border-radius:var(--radius);object-fit:cover}
.book-mockup{width:100%;max-width:48rem;margin-top:56px}

@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;
    transition-duration:.001ms !important}
  .reveal,.span-node{opacity:1 !important;transform:none !important}
  .span-path{stroke-dashoffset:0 !important}
}

/* ------------------------------------------------------- student reviews */
.review-notice{margin-top:32px;max-width:52rem;border-left:2px solid var(--brass);
  background:var(--paper);padding:20px;border-radius:var(--radius);font-size:.92rem;color:var(--body)}
.review-card{display:flex;flex-direction:column;height:100%;padding:28px}
.review-stars{display:flex;gap:2px;margin-bottom:12px}
.review-stars svg{width:15px;height:15px;color:var(--brass)}
.review-quote{font-family:var(--serif);font-size:2.2rem;line-height:1;color:rgba(168,128,44,.7)}
.review-text{margin-top:8px;font-size:.97rem;line-height:1.7}
.review-text.pending{font-style:italic;color:var(--muted)}
.review-by{display:flex;align-items:center;gap:14px;margin-top:28px;
  border-top:1px solid var(--rule);padding-top:20px}
.review-avatar{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:999px;
  border:1px solid rgba(18,49,79,.2);background:var(--surface);
  font-size:.85rem;font-weight:600;letter-spacing:.04em;color:var(--navy)}
.review-name{display:block;font-size:.97rem;font-weight:600;color:var(--ink)}
.review-loc{display:block;font-size:.87rem;color:var(--muted)}
.review-card blockquote{flex:1}

/* ------------------------------------------------------- published books */
.bk-grid{display:grid;gap:40px 24px;margin-top:48px;grid-template-columns:1fr}
@media(min-width:640px){.bk-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.bk-grid{grid-template-columns:repeat(3,1fr)}}
.bk-card{display:flex;flex-direction:column;height:100%}
.bk-open{position:relative;display:block;width:100%;padding:0;border:1px solid var(--rule);
  border-radius:var(--radius);overflow:hidden;background:var(--paper);cursor:pointer;
  transition:transform .3s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
.bk-open:hover,.bk-open:focus-visible{transform:translateY(-4px);border-color:rgba(18,49,79,.3);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22),0 2px 6px -2px rgba(11,27,43,.08)}
.bk-open img{width:100%;height:auto;display:block}
.bk-hint{position:absolute;left:0;right:0;bottom:0;background:rgba(11,27,43,.85);color:#fff;
  padding:10px 0;font-size:.85rem;font-weight:500;opacity:0;transition:opacity .3s}
.bk-open:hover .bk-hint,.bk-open:focus-visible .bk-hint{opacity:1}
.bk-meta{margin-top:16px}
.bk-meta h3{font-family:var(--serif);font-size:1.06rem;font-weight:600;line-height:1.35;color:var(--ink)}
.bk-sub{margin-top:4px;font-size:.9rem;color:var(--muted)}
.bk-author{margin-top:12px;font-size:.88rem}
.bk-meta > div{font-size:.88rem;margin-top:4px}
.bk-muted{color:var(--muted)}
.bk-k{color:var(--muted);font-size:.8rem}

.bk-lightbox{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:16px}
@media(min-width:640px){.bk-lightbox{padding:32px}}
.bk-lightbox[hidden]{display:none}
.bk-scrim{position:absolute;inset:0;background:rgba(11,27,43,.8)}
.bk-dialog{position:relative;display:flex;flex-direction:column;width:100%;max-width:56rem;
  max-height:100%;background:var(--paper);border-radius:var(--radius);overflow:hidden;
  box-shadow:0 12px 32px -14px rgba(11,27,43,.5)}
.bk-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex:none;
  border-bottom:1px solid var(--rule);padding:16px 20px}
@media(min-width:640px){.bk-head{padding:16px 28px}}
.bk-headtext{min-width:0}
.bk-head h3{font-family:var(--serif);font-size:1.1rem;font-weight:600;color:var(--ink)}
.bk-head p{margin-top:2px;font-size:.87rem;color:var(--muted)}
.bk-close{flex:none;width:44px;height:44px;margin:-6px -10px 0 0;border:0;background:none;
  font-size:1.6rem;line-height:1;color:var(--ink);cursor:pointer;border-radius:var(--radius)}
.bk-close:hover{background:var(--surface)}
.bk-tabs{display:flex;gap:4px;flex:none;border-bottom:1px solid var(--rule);padding:12px 20px}
@media(min-width:640px){.bk-tabs{padding:12px 28px}}
.bk-tab{border:0;background:none;font-family:inherit;font-size:.88rem;font-weight:500;color:var(--body);
  padding:6px 14px;border-radius:var(--radius);cursor:pointer;transition:background .2s,color .2s}
.bk-tab:hover{background:var(--surface)}
.bk-tab[aria-selected="true"]{background:var(--indigo);color:#fff}
.bk-body{flex:1;overflow-y:auto;background:var(--surface);padding:20px}
@media(min-width:640px){.bk-body{padding:28px}}
.bk-body img{display:block;margin:0 auto;width:100%;max-width:28rem;height:auto;
  border:1px solid var(--rule);border-radius:var(--radius);background:var(--paper)}
.bk-details{max-width:28rem;margin:24px auto 0;display:grid;gap:6px;font-size:.88rem}
.bk-details > div{display:flex;gap:12px}
.bk-details dt{width:6rem;flex:none;color:var(--muted)}
.bk-nav{display:flex;align-items:center;justify-content:space-between;flex:none;
  border-top:1px solid var(--rule);padding:12px 20px}
@media(min-width:640px){.bk-nav{padding:12px 28px}}
.bk-nav button{border:0;background:none;font-family:inherit;font-size:.9rem;font-weight:500;
  color:var(--body);cursor:pointer;padding:8px;border-radius:var(--radius)}
.bk-nav button:hover{color:var(--indigo)}
.bk-nav p{font-size:.85rem;color:var(--muted)}

/* whole services card is one click target, matching the React build */
.svc-card{position:relative}
.svc-stretch::after{content:"";position:absolute;inset:0}

/* -------------------------------------------------------- research domains */
.rd-grid{display:grid;gap:24px;margin-top:48px;grid-template-columns:1fr}
@media(min-width:1024px){.rd-grid{grid-template-columns:repeat(2,1fr)}}
.rd-card{display:flex;flex-direction:column;height:100%;padding:28px;
  border:1px solid var(--rule);border-radius:var(--radius);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease)}
.rd-card:hover{border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22),0 2px 6px -2px rgba(11,27,43,.08)}
.rd-icon{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--rule);
  border-radius:var(--radius);background:var(--surface);color:var(--navy)}
.rd-icon svg{width:20px;height:20px}
.rd-card h3{margin-top:20px;font-family:var(--serif);font-size:1.14rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.rd-intro{margin-top:10px;font-size:.93rem;line-height:1.65}
.rd-label{margin-top:24px;font-family:var(--sans);font-size:.78rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.rd-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.rd-chip{border:1px solid var(--rule);background:rgba(244,246,249,.7);border-radius:var(--radius);
  padding:4px 10px;font-size:.83rem;color:var(--body)}
.rd-chip.rd-tool{border-color:rgba(168,128,44,.35);background:rgba(168,128,44,.06)}
.rd-more{padding:4px 4px;font-size:.83rem;color:var(--muted)}
.rd-extra{margin-top:8px}
.rd-scope{margin-top:20px;border-left:2px solid var(--brass);padding-left:14px;
  font-size:.87rem;color:var(--muted)}
.rd-toggle{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;margin-top:24px;
  border:0;background:none;font-family:inherit;font-size:.88rem;font-weight:500;color:var(--indigo);
  cursor:pointer;padding:4px 0;border-radius:var(--radius)}
.rd-toggle:hover{color:var(--indigo-lift)}
.rd-chev{transition:transform .2s}
.rd-toggle[aria-expanded="true"] .rd-chev{transform:rotate(180deg)}
.rd-note{display:flex;gap:16px;margin-top:40px;padding:24px;border-left:2px solid var(--brass);
  background:var(--paper);border-radius:var(--radius)}
.rd-note p{max-width:56rem;font-size:.93rem}
.rd-cta{display:flex;flex-direction:column;align-items:flex-start;gap:24px;margin-top:40px;
  padding:28px;border:1px solid var(--rule);border-radius:var(--radius);background:var(--paper)}
@media(min-width:640px){.rd-cta{flex-direction:row;align-items:center;justify-content:space-between;padding:32px}}
.rd-cta h3{font-family:var(--serif);font-size:1.24rem;font-weight:600;color:var(--ink)}
.rd-cta p{margin-top:6px;font-size:.95rem}
.rd-cta .btn{flex:none}

/* ----------------------------------------------- understanding your thesis */
.ta-list{margin-top:48px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.ta-item + .ta-item{border-top:1px solid var(--rule)}
.ta-btn{display:flex;width:100%;align-items:center;gap:20px;padding:20px 0;text-align:left;
  background:none;border:0;cursor:pointer;font-family:inherit;transition:color .2s}
@media(min-width:640px){.ta-btn{gap:28px}}
.ta-btn:hover{color:var(--indigo)}
.ta-num{flex:none;font-family:var(--serif);font-size:1.5rem;font-weight:600;line-height:1;
  font-variant-numeric:tabular-nums;color:var(--numeral);transition:color .2s}
.ta-item[data-open] .ta-num{color:var(--brass)}
.ta-head{flex:1;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}
.ta-title{font-family:var(--serif);font-size:1.08rem;font-weight:600;line-height:1.35;color:var(--ink)}
.ta-tag{border:1px solid var(--rule);background:var(--surface);border-radius:var(--radius);
  padding:2px 8px;font-size:.72rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.1em;color:var(--muted)}
.ta-icon{position:relative;flex:none;width:28px;height:28px;border:1px solid var(--rule);
  border-radius:var(--radius);transition:background .2s,border-color .2s}
.ta-icon::before,.ta-icon::after{content:"";position:absolute;left:50%;top:50%;background:var(--navy);
  transform:translate(-50%,-50%);transition:opacity .2s,background .2s}
.ta-icon::before{width:11px;height:1.5px}
.ta-icon::after{width:1.5px;height:11px}
.ta-item[data-open] .ta-icon{background:var(--indigo);border-color:var(--indigo)}
.ta-item[data-open] .ta-icon::before{background:#fff}
.ta-item[data-open] .ta-icon::after{opacity:0}
.ta-panel{padding-bottom:32px}
@media(min-width:640px){.ta-panel{padding-left:3.9rem}}
.ta-inner{animation:rise .26s var(--ease)}
.ta-p{max-width:68ch;font-size:.95rem;margin-bottom:14px}
.ta-p:last-child{margin-bottom:0}
.ta-label{margin-top:24px;font-family:var(--sans);font-size:.78rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.ta-points{display:grid;gap:8px 32px;margin-top:12px;max-width:48rem}
@media(min-width:640px){.ta-points{grid-template-columns:repeat(2,1fr)}}
.ta-points li{display:flex;align-items:flex-start;gap:10px;font-size:.92rem}
.ta-dot{flex:none;margin-top:8px;width:6px;height:6px;border-radius:999px;background:var(--brass)}
.ta-examples{display:grid;gap:12px;margin-top:24px}
.ta-ex{border:1px solid var(--rule);border-radius:var(--radius);background:var(--surface);padding:16px}
.ta-ex-label{font-size:.76rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.ta-ex-text{margin-top:8px;max-width:68ch;padding-left:24px;text-indent:-24px;
  font-size:.9rem;line-height:1.65;color:var(--ink)}
.ta-note{margin-top:24px;max-width:68ch;border-left:2px solid var(--brass);padding-left:14px;
  font-size:.88rem;color:var(--muted)}
.ta-cta{display:flex;flex-direction:column;align-items:flex-start;gap:24px;margin-top:40px;
  padding:28px;border:1px solid var(--rule);border-radius:var(--radius);background:var(--surface)}
@media(min-width:640px){.ta-cta{flex-direction:row;align-items:center;justify-content:space-between;padding:32px}}
.ta-cta h3{font-family:var(--serif);font-size:1.24rem;font-weight:600;color:var(--ink)}
.ta-cta p{margin-top:6px;max-width:68ch;font-size:.95rem}
.ta-cta .btn{flex:none}

/* ------------------------------------------- universities & institutions */
.im-marquee{position:relative;margin-top:48px;overflow:hidden}
.im-track{display:flex;width:max-content;animation:im-scroll var(--im-duration,48s) linear infinite;
  will-change:transform}
@keyframes im-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
/* pause for anyone reading it, by pointer or by keyboard */
.im-marquee:hover .im-track,.im-marquee:focus-within .im-track{animation-play-state:paused}
.im-strip{display:flex;flex-shrink:0;align-items:stretch}
.im-strip > li{display:flex}
.im-tile{display:flex;flex-direction:column;align-items:center;gap:14px;flex:none;
  width:216px;padding:8px 16px}
@media(min-width:640px){.im-tile{width:240px;padding:8px 20px}}
.im-logo{display:grid;place-items:center;width:100%;height:88px;padding:0 20px;
  border:1px solid var(--rule);border-radius:var(--radius);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease)}
.im-tile:hover .im-logo,.im-tile:focus-visible .im-logo{border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22),0 2px 6px -2px rgba(11,27,43,.08)}
/* height-capped, width follows the source: never stretched or cropped */
.im-logo img{max-height:56px;width:auto;max-width:100%;object-fit:contain;display:block;
  opacity:.8;filter:grayscale(1);transition:opacity .3s var(--ease),filter .3s var(--ease)}
.im-tile:hover .im-logo img,.im-tile:focus-visible .im-logo img{opacity:1;filter:grayscale(0)}
.im-name{text-align:center;font-size:.82rem;font-weight:500;line-height:1.35;color:var(--body);
  transition:color .2s}
.im-tile:hover .im-name{color:var(--ink)}
.im-fade{position:absolute;inset-block:0;width:48px;z-index:10;pointer-events:none}
@media(min-width:640px){.im-fade{width:96px}}
.im-fade-l{left:0;background:linear-gradient(to right,var(--paper),rgba(255,255,255,0))}
.im-fade-r{right:0;background:linear-gradient(to left,var(--paper),rgba(255,255,255,0))}
.im-disclaimer{max-width:48rem;margin:40px auto 0;text-align:center;font-size:.86rem;
  line-height:1.65;color:var(--muted)}

@media(prefers-reduced-motion:reduce){
  /* stop the motion and let the strip be scrolled, so no logo is reachable
     only by waiting for the animation */
  .im-track{animation:none !important;transform:none !important}
  .im-marquee{overflow-x:auto}
}

/* ------------------------------------------------------------- commerce */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0}
.bk-buy-row{margin-top:20px}
.bk-price-tbc{font-size:.88rem;font-weight:400;color:var(--muted)}
.pb{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}
.pb-now{font-size:1.02rem;font-weight:600;color:var(--ink)}
.pb-lg .pb-now{font-size:1.25rem}
.pb-mrp{font-size:.88rem;color:var(--muted);text-decoration:line-through}
.pb-badge{border:1px solid rgba(168,128,44,.4);background:rgba(168,128,44,.08);
  border-radius:var(--radius);padding:2px 6px;font-size:.74rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.04em;color:var(--brass-text)}
.bk-buy{margin-top:12px;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid rgba(18,49,79,.25);border-radius:var(--radius);background:none;
  padding:10px 16px;font-family:inherit;font-size:.88rem;font-weight:500;color:var(--navy);
  cursor:pointer;transition:border-color .2s,background .2s}
.bk-buy:hover{border-color:rgba(18,49,79,.6);background:rgba(18,49,79,.04)}

.cm-cart-btn{position:fixed;right:20px;bottom:20px;z-index:40;display:inline-flex;
  align-items:center;gap:10px;border:1px solid rgba(18,49,79,.2);border-radius:var(--radius);
  background:var(--ink);color:#fff;padding:14px 20px;font-family:inherit;font-size:.92rem;
  font-weight:500;cursor:pointer;box-shadow:0 12px 32px -14px rgba(11,27,43,.4)}
.cm-cart-btn[hidden]{display:none}
.cm-count{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;
  border-radius:999px;background:var(--brass);color:var(--ink);font-size:.78rem;font-weight:600}
.cm-overlay{position:fixed;inset:0;z-index:70;display:flex;justify-content:flex-end}
.cm-overlay[hidden]{display:none}
.cm-scrim{position:absolute;inset:0;background:rgba(11,27,43,.7)}
.cm-panel{position:relative;display:flex;flex-direction:column;height:100%;width:100%;
  max-width:32rem;background:var(--paper);box-shadow:0 12px 32px -14px rgba(11,27,43,.5)}
.cm-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none;
  border-bottom:1px solid var(--rule);padding:16px 20px}
@media(min-width:640px){.cm-head{padding:16px 28px}}
.cm-head h2{font-family:var(--serif);font-size:1.15rem;font-weight:600;color:var(--ink)}
.cm-close{width:44px;height:44px;margin-right:-8px;border:0;background:none;font-size:1.6rem;
  line-height:1;color:var(--ink);cursor:pointer;border-radius:var(--radius)}
.cm-close:hover{background:var(--surface)}
.cm-body{flex:1;overflow-y:auto;padding:24px 20px}
@media(min-width:640px){.cm-body{padding:24px 28px}}
.cm-foot{flex:none;border-top:1px solid var(--rule);padding:20px;display:grid;gap:12px}
@media(min-width:640px){.cm-foot{padding:20px 28px}}
.cm-line{display:flex;justify-content:space-between;gap:16px;padding:20px 0;
  border-bottom:1px solid var(--rule);flex-wrap:wrap}
.cm-line h4{font-family:var(--serif);font-size:.99rem;font-weight:600;color:var(--ink)}
.cm-line-unit{margin-top:4px;font-size:.85rem;color:var(--muted)}
/* padding, not just text: a 16px-tall target fails the WCAG 24px minimum */
.cm-remove{margin-top:6px;border:0;background:none;padding:8px 0;font-family:inherit;
  font-size:.85rem;font-weight:500;color:var(--indigo);cursor:pointer;min-height:32px}
.cm-remove:hover{text-decoration:underline}
.cm-qty{display:inline-flex;align-items:center;border:1px solid var(--rule);border-radius:var(--radius)}
.cm-qty button{width:44px;height:44px;border:0;background:none;color:var(--navy);cursor:pointer;
  font-size:1.1rem;line-height:1}
.cm-qty button:hover{background:var(--surface)}
.cm-qty span{width:40px;text-align:center;font-size:.95rem;font-weight:500;color:var(--ink)}
.cm-totals{margin-top:24px;border:1px solid var(--rule);border-radius:var(--radius);
  background:var(--surface);padding:20px;display:grid;gap:8px;font-size:.92rem}
.cm-totals div{display:flex;justify-content:space-between;gap:16px}
.cm-totals .cm-grand{border-top:1px solid var(--rule);padding-top:8px;font-weight:500;color:var(--ink)}
.cm-tbc{color:var(--muted)}
.cm-note{margin-top:20px;border-left:2px solid var(--brass);background:var(--surface);
  border-radius:var(--radius);padding:16px;font-size:.87rem;color:var(--body)}
.cm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;gap:12px;text-align:center;padding:0 24px}
.cm-empty strong{color:var(--ink)}
.cm-empty p{font-size:.9rem;color:var(--muted);max-width:20rem}
.cm-grid{display:grid;gap:20px}
@media(min-width:640px){.cm-grid{grid-template-columns:repeat(2,1fr)}.cm-span2{grid-column:span 2}}
.cm-field{margin-bottom:8px;display:block;font-size:.88rem;font-weight:500;color:var(--ink)}
.cm-err{margin-top:8px;font-size:.84rem;color:#b91c1c}
.cm-alert{margin-bottom:20px;display:flex;gap:12px;border:1px solid rgba(185,28,28,.4);
  background:#fef2f2;color:#991b1b;padding:12px 16px;border-radius:var(--radius);font-size:.9rem}
.cm-summary{margin-top:28px}
.cm-summary h3{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;
  color:var(--muted);font-family:var(--sans)}
.cm-summary table{width:100%;margin-top:12px;font-size:.88rem;border-collapse:collapse}
.cm-summary th{text-align:left;font-weight:500;color:var(--muted);padding:8px 0;
  border-bottom:1px solid var(--rule)}
.cm-summary td{padding:10px 0;border-bottom:1px solid var(--rule)}
.cm-summary .num{text-align:right}
.cm-buy-book{display:flex;gap:20px}
.cm-buy-book img{height:160px;width:auto;border:1px solid var(--rule);border-radius:var(--radius);
  object-fit:contain;flex:none}
.cm-buy-meta{min-width:0;font-size:.87rem}
.cm-buy-meta h3{font-family:var(--serif);font-size:1.05rem;font-weight:600;color:var(--ink);line-height:1.35}
.cm-buy-meta dl{margin-top:12px;display:grid;gap:4px}
.cm-buy-meta dl div{display:flex;gap:8px}
.cm-buy-meta dt{color:var(--muted)}
.cm-price-big{margin-top:16px;font-size:1.02rem;font-weight:600;color:var(--ink)}
.cm-qty-row{margin-top:28px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.cm-ok{margin-top:16px;font-family:var(--serif);font-size:1.2rem;font-weight:600;color:var(--ink)}
.cm-steps{margin-top:12px;display:grid;gap:8px;font-size:.91rem}
.cm-steps li{display:flex;gap:12px}
.cm-steps span{font-family:var(--serif);color:var(--brass)}

.hrs{display:grid;gap:6px;margin-top:8px;font-size:.95rem}
/* stacked: the day range is too long to sit opposite its time in a narrow
   column, and half-wrapping looked ragged */
.hrs > div + div{margin-top:6px}
.hrs dt{color:var(--body)}
.hrs dd.hrs-open{font-weight:500;color:var(--ink)}
.hrs dd.hrs-closed{color:var(--muted)}
.hrs-dark{margin-top:4px;max-width:15rem;font-size:.93rem}
.hrs-dark dt{color:rgba(255,255,255,.7)}
.hrs-dark dd.hrs-open{color:#fff;font-weight:500}
.hrs-dark dd.hrs-closed{color:rgba(255,255,255,.55);font-weight:400}

.svc-card{position:relative;overflow:hidden}
.svc-bar{position:absolute;inset-inline:0;top:0;height:4px}
.svc-royal .svc-bar{background:#1E3A8A}.svc-teal .svc-bar{background:#0F6A72}
.svc-saffron .svc-bar{background:#A8802C}.svc-purple .svc-bar{background:#5B3E8E}
.svc-tile{display:grid;place-items:center;width:48px;height:48px;border-radius:var(--radius-lg);
  border:1px solid}
.svc-royal .svc-tile{border-color:rgba(30,58,138,.25);background:rgba(30,58,138,.07);color:#1E3A8A}
.svc-teal .svc-tile{border-color:rgba(15,106,114,.25);background:rgba(15,106,114,.07);color:#0F6A72}
.svc-saffron .svc-tile{border-color:rgba(168,128,44,.3);background:rgba(168,128,44,.09);color:#86661F}
.svc-purple .svc-tile{border-color:rgba(91,62,142,.25);background:rgba(91,62,142,.07);color:#5B3E8E}
.svc-num{font-family:var(--serif);font-size:2.6rem;line-height:1}
/* alphas measured against the surface fill: each clears 3:1 for large text */
.svc-royal .svc-num{color:rgba(30,58,138,.6)}.svc-teal .svc-num{color:rgba(15,106,114,.7)}
.svc-saffron .svc-num{color:rgba(134,102,31,.95)}.svc-purple .svc-num{color:rgba(91,62,142,.65)}

.sd-identity{margin-top:32px;padding:24px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper)}
@media(min-width:640px){.sd-identity{padding:28px}}
.sd-name{font-family:var(--serif);font-size:1.35rem;font-weight:600;line-height:1.3;color:var(--ink)}
@media(min-width:640px){.sd-name{font-size:1.55rem}}
/* height follows the source: the logo is never stretched or cropped */
.sd-logo{display:block;width:100%;max-width:24rem;height:auto;object-fit:contain}
.sd-text{margin-top:20px;max-width:62ch;font-size:1.02rem;line-height:1.7}

.pbh-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:48px}
@media(min-width:640px){.pbh-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:1024px){.pbh-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
.pbh-card{display:block;height:100%;padding:16px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
.pbh-card:hover{transform:translateY(-2px);border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22)}
.pbh-card img{display:block;width:100%;height:auto;border:1px solid var(--rule);
  border-radius:var(--radius);object-fit:cover}
.pbh-title{display:block;margin-top:14px;font-family:var(--serif);font-size:.95rem;
  font-weight:600;line-height:1.35;color:var(--ink)}
.pbh-card:hover .pbh-title{color:var(--indigo)}
.pbh-author{display:block;margin-top:4px;font-size:.82rem;color:var(--muted)}
.pbh-all{margin-top:40px;text-align:center}
.pbh-all a{font-size:.95rem;font-weight:500;color:var(--indigo)}

.wsc-part{margin-top:48px;font-family:var(--sans);font-size:.8rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.13em;color:var(--muted)}
.wsc-part-2{margin-top:64px}
.wsc-grid{display:grid;gap:24px;margin-top:24px;grid-template-columns:1fr}
@media(min-width:640px){.wsc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.wsc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.wsc-card{display:flex;flex-direction:column;height:100%;padding:24px;
  border:1px solid var(--rule);border-radius:var(--radius-lg);background:var(--paper)}
.wsc-num{font-family:var(--serif);font-size:1.05rem;font-weight:600;color:#13866B}
.wsc-title{margin-top:12px;font-family:var(--serif);font-size:1.02rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.wsc-body{margin-top:10px;font-size:.93rem}
#why-scholars-choose .cols-3{margin-top:24px}

.sj-wrap{margin-top:32px;overflow-x:auto}
.sj-table{width:100%;min-width:46rem;border-collapse:collapse;text-align:left;font-size:.92rem}
.sj-table th{padding:12px 16px 12px 0;border-bottom:1px solid var(--rule);font-size:.8rem;
  font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.sj-table td{padding:16px 16px 16px 0;border-bottom:1px solid var(--rule);vertical-align:top}
.sj-name{font-weight:500;color:var(--ink)}

.rc-grid{display:grid;gap:24px;margin-top:40px}
@media(min-width:1024px){.rc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.rc-card{display:flex;flex-direction:column;height:100%;padding:28px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper)}
.rc-card h3{font-family:var(--serif);font-size:1.22rem;font-weight:600;color:var(--ink)}
.rc-sub{margin-top:6px;font-size:.88rem;color:var(--muted)}
.rc-body{margin-top:12px;flex:1;font-size:.95rem}
.rc-cta{margin-top:24px;display:inline-block;font-size:.92rem;font-weight:500;color:#13866B}
.rc-cta:hover{text-decoration:underline}
.rc-pending{margin-top:24px;font-size:.88rem;color:var(--muted)}
.mm-pending{opacity:.6;cursor:default}
.faq-group + .faq-group{margin-top:48px}
.faq-group-title{font-family:var(--sans);font-size:.8rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.13em;color:var(--muted);margin-bottom:20px}

.pv-grid{display:grid;gap:24px;margin-top:40px}
@media(min-width:1024px){.pv-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pv-card{display:flex;flex-direction:column;height:100%;padding:24px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper)}
@media(min-width:640px){.pv-card{padding:28px}}
.pv-kicker{font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;
  color:var(--brass-text)}
.pv-card h3{margin-top:12px;font-family:var(--serif);font-size:1.12rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.pv-body{margin-top:12px;flex:1;font-size:.93rem}
.pv-cta{margin-top:24px;font-size:.9rem;font-weight:500;color:var(--indigo)}
.pv-cta:hover{text-decoration:underline}

.rv-rail-wrap{margin-top:48px}
.rv-rail{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;
  scroll-behavior:smooth;padding-bottom:8px;-ms-overflow-style:none;scrollbar-width:none}
.rv-rail::-webkit-scrollbar{display:none}
.rv-rail > li{flex:0 0 84%;scroll-snap-align:start}
@media(min-width:640px){.rv-rail > li{flex:0 0 calc((100% - 24px) / 2)}}
@media(min-width:1024px){.rv-rail > li{flex:0 0 calc((100% - 48px) / 3)}}
.rv-controls{display:flex;align-items:center;gap:12px;margin-top:24px}
.rv-prev,.rv-next{display:grid;place-items:center;width:44px;height:44px;border-radius:999px;
  border:1px solid var(--rule);background:var(--paper);color:var(--ink);font-size:1.2rem;
  cursor:pointer;transition:border-color .2s}
.rv-prev:hover,.rv-next:hover{border-color:rgba(18,49,79,.4)}
.rv-prev[disabled],.rv-next[disabled]{opacity:.35;cursor:default}
.rv-hint{font-size:.86rem;color:var(--muted)}
@media(prefers-reduced-motion:reduce){.rv-rail{scroll-behavior:auto}}

.section-compact{padding-block:48px}
@media(min-width:1024px){.section-compact{padding-block:56px}}
.idx-title{font-family:var(--sans);font-size:.8rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.13em;color:var(--muted)}

.idx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:32px}
@media(min-width:640px){.idx-grid{gap:24px}}
@media(min-width:1024px){.idx-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
.idx-tile{display:grid;place-items:center;height:58px;padding:0 16px;border:1px solid var(--rule);
  border-radius:var(--radius);background:var(--paper)}
.idx-logo{display:block;max-height:34px;width:auto;max-width:100%;object-fit:contain}
.idx-label{display:block;margin-top:12px;font-size:.88rem;font-weight:600;color:var(--ink)}
.idx-label + .idx-note-sm{margin-top:4px}
.idx-note-sm{display:block;margin-top:12px;font-size:.82rem;line-height:1.6;color:var(--muted)}
.idx-link{display:block;border-radius:var(--radius)}
.idx-link:hover{opacity:.9}

/* ------------------------------------------------- research guide hub */
.shell-narrow{max-width:48rem}
.gp-grid{display:grid;gap:24px;margin-top:48px}
@media(min-width:1024px){.gp-grid{grid-template-columns:repeat(2,1fr)}}
.gp-card{position:relative;overflow:hidden;padding:24px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper)}
@media(min-width:640px){.gp-card{padding:32px}}
.gp-bar{position:absolute;inset-inline:0;top:0;height:4px}
.gp-royal .gp-bar{background:#1E3A8A}.gp-teal .gp-bar{background:#0F6A72}
.gp-card h3{font-family:var(--serif);font-size:1.3rem;font-weight:600;color:var(--ink)}
.gp-intro{margin-top:8px;font-size:.94rem}
.gp-steps{margin-top:24px;display:grid;gap:8px}
.gp-step{display:flex;align-items:center;gap:14px;padding:10px 12px;border:1px solid transparent;
  border-radius:var(--radius);transition:background .2s,border-color .2s}
.gp-step:hover{background:var(--surface);border-color:var(--rule)}
.gp-num{display:grid;place-items:center;flex:none;width:32px;height:32px;border:1px solid;
  border-radius:var(--radius);font-size:.78rem;font-weight:600;font-variant-numeric:tabular-nums}
.gp-royal .gp-num{border-color:rgba(30,58,138,.25);background:rgba(30,58,138,.07);color:#1E3A8A}
.gp-teal .gp-num{border-color:rgba(15,106,114,.25);background:rgba(15,106,114,.07);color:#0F6A72}
.gp-label{flex:1;font-size:.93rem;font-weight:500;color:var(--ink)}
.gp-arrow{color:var(--muted)}
.gp-step:hover .gp-arrow{color:var(--indigo)}
.gp-all{margin-top:40px;text-align:center}
.gp-all a{font-size:.95rem;font-weight:500;color:var(--indigo)}

.gh-block + .gh-block{margin-top:64px}
.gh-block h2{font-family:var(--serif);font-size:1.5rem;font-weight:600;color:var(--ink)}
.gh-intro{margin-top:8px;max-width:68ch}
.gh-grid{display:grid;gap:16px;margin-top:28px}
@media(min-width:640px){.gh-grid{grid-template-columns:repeat(2,1fr)}}
.gh-card{display:flex;gap:16px;height:100%;padding:20px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
.gh-card:hover{transform:translateY(-2px);border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22)}
.gh-card .gp-num{width:36px;height:36px}
.gh-title{display:block;font-family:var(--serif);font-size:1.02rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.gh-desc{display:block;margin-top:6px;font-size:.89rem;color:var(--body)}
.gh-read{display:block;margin-top:10px;font-size:.86rem;font-weight:500;color:var(--indigo)}

.gd-crumb{font-size:.86rem;color:var(--muted)}
.gd-crumb a{color:var(--indigo)}
.gd-here{color:var(--ink)}
.gd-step-of{margin-top:28px;font-size:.82rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.08em;color:var(--muted)}
.gd-h{margin-top:40px;font-family:var(--sans);font-size:.8rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.gd-p{margin-top:12px;font-size:1.02rem;line-height:1.7}
.gd-how{margin-top:12px;display:grid;gap:20px}
.gd-how li{display:flex;gap:16px}
.gd-n{font-family:var(--serif);font-size:1.1rem;font-weight:600;color:var(--brass-text)}
.gd-step{display:block;font-weight:500;color:var(--ink)}
.gd-text{display:block;margin-top:4px;font-size:.96rem}
.gd-diagram{margin-top:12px;padding:24px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--surface)}
@media(min-width:640px){.gd-diagram{padding:32px}}
.gd-diagram figcaption{font-size:.78rem;font-weight:600;text-transform:uppercase;
  letter-spacing:.08em;color:var(--muted)}
.gd-diagram ol{margin-top:20px}
.gd-node{display:flex;align-items:center;gap:12px;font-size:.95rem;font-weight:500;color:var(--ink)}
.gd-dot{display:grid;place-items:center;flex:none;width:32px;height:32px;border:1px solid;
  border-radius:999px;font-size:.8rem;font-weight:600}
.gp-royal .gd-dot{border-color:rgba(30,58,138,.25);background:rgba(30,58,138,.06);color:#1E3A8A}
.gp-teal .gd-dot{border-color:rgba(15,106,114,.25);background:rgba(15,106,114,.06);color:#0F6A72}
.gd-link{display:block;width:1px;height:20px;margin-left:16px;opacity:.4}
.gp-royal .gd-link{background:#1E3A8A}.gp-teal .gd-link{background:#0F6A72}
.gd-ex{display:grid;gap:16px;margin-top:12px}
@media(min-width:640px){.gd-ex{grid-template-columns:repeat(2,1fr)}}
.gd-strong{border:1px solid rgba(15,106,114,.3);background:rgba(15,106,114,.05);
  border-radius:var(--radius-lg);padding:20px}
.gd-weak{border:1px solid var(--rule);background:var(--surface);
  border-radius:var(--radius-lg);padding:20px}
.gd-ex-label{font-size:.82rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;
  color:var(--muted)}
.gd-strong .gd-ex-label{color:#0F6A72}
.gd-ex p + p{margin-top:10px;font-size:.95rem}
.gd-list{margin-top:12px;display:grid;gap:10px}
.gd-list li{position:relative;padding-left:24px;font-size:.96rem}
.gd-mistakes li::before{content:"";position:absolute;left:4px;top:9px;width:6px;height:6px;
  border-radius:999px;background:var(--brass)}
.gd-checks li::before{content:"\2713";position:absolute;left:0;top:0;color:#0F6A72;font-weight:700}
.gd-take{margin-top:40px;border-left:2px solid var(--brass);background:var(--surface);
  border-radius:var(--radius-lg);padding:24px}
.gd-take p + p{margin-top:8px;font-family:var(--serif);font-size:1.1rem;line-height:1.65;
  color:var(--ink)}
.gd-nav{margin-top:48px;display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--rule);
  padding-top:28px}
@media(min-width:640px){.gd-nav{flex-direction:row;align-items:center;justify-content:space-between}}
.gd-nav a{font-size:.92rem;font-weight:500;color:var(--indigo)}
.gd-nav .gd-back{color:var(--muted);font-weight:400}
.gd-rel{margin-top:16px;display:grid;gap:12px}
@media(min-width:640px){.gd-rel{grid-template-columns:repeat(3,1fr)}}
.gd-rel a{display:block;height:100%;padding:16px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper);font-size:.92rem;font-weight:500;
  color:var(--ink);transition:border-color .2s,color .2s}
.gd-rel a:hover{border-color:rgba(18,49,79,.25);color:var(--indigo)}
.gd-rel-kind{display:block;margin-top:4px;font-size:.8rem;font-weight:400;color:var(--muted)}

/* ------------------------------------------- research teaser + updates */
.rt-grid{display:grid;gap:20px;margin-top:48px;grid-template-columns:1fr}
@media(min-width:640px){.rt-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.rt-grid{grid-template-columns:repeat(4,1fr)}}
.rt-card{position:relative;display:flex;flex-direction:column;height:100%;overflow:hidden;
  padding:24px;border:1px solid var(--rule);border-radius:var(--radius-lg);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
.rt-card:hover{transform:translateY(-2px);border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22)}
.rt-bar{position:absolute;inset-inline:0;top:0;height:4px}
.rt-royal .rt-bar{background:#1E3A8A}.rt-teal .rt-bar{background:#0F6A72}
.rt-purple .rt-bar{background:#5B3E8E}.rt-saffron .rt-bar{background:#A8802C}
.rt-tile{display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-lg);
  border:1px solid}
.rt-royal .rt-tile{border-color:rgba(30,58,138,.25);background:rgba(30,58,138,.07);color:#1E3A8A}
.rt-teal .rt-tile{border-color:rgba(15,106,114,.25);background:rgba(15,106,114,.07);color:#0F6A72}
.rt-purple .rt-tile{border-color:rgba(91,62,142,.25);background:rgba(91,62,142,.07);color:#5B3E8E}
.rt-saffron .rt-tile{border-color:rgba(168,128,44,.3);background:rgba(168,128,44,.09);color:#86661F}
.rt-card h3{margin-top:20px;font-family:var(--serif);font-size:1.04rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.rt-count{margin-top:8px;font-size:.87rem;color:var(--muted)}
.rt-subs{margin-top:12px;flex:1;font-size:.9rem}
.rt-toggle{align-self:flex-start;margin-top:16px;padding:0;border:0;background:none;font-family:inherit;font-size:.86rem;font-weight:500;color:var(--indigo);cursor:pointer}
.rt-toggle:hover{color:var(--indigo-lift)}
.rt-thesis{margin-top:40px;padding:28px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--surface)}
@media(min-width:640px){.rt-thesis{padding:32px}}
.rt-thesis h3{font-family:var(--serif);font-size:1.22rem;font-weight:600;color:var(--ink)}
.rt-thesis-sub{margin-top:8px;max-width:68ch;font-size:.94rem}
.rt-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.rt-chips li{display:flex;align-items:center;gap:8px;border:1px solid var(--rule);
  background:var(--paper);border-radius:999px;padding:6px 14px;font-size:.85rem;color:var(--body)}
.rt-num{font-family:var(--serif);font-weight:600;color:var(--brass-text)}
.rt-link{display:inline-block;margin-top:28px;font-size:.93rem;font-weight:500;color:var(--indigo)}
.rt-link:hover{color:var(--indigo-lift)}

.eu-note{margin-top:24px;max-width:56rem;border-left:2px solid var(--brass);
  background:var(--paper);border-radius:var(--radius);padding:16px;font-size:.9rem;color:var(--body)}
.eu-controls{display:grid;gap:20px;margin-top:40px}
.eu-search{position:relative;display:block}
.eu-search input{width:100%;border:1px solid var(--rule);border-radius:var(--radius-lg);
  background:var(--paper);padding:14px 18px;font-family:inherit;font-size:.95rem;color:var(--ink)}
.eu-search input:focus{outline:none;border-color:var(--indigo);box-shadow:0 0 0 2px rgba(43,74,139,.15)}
.eu-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.eu-chip{flex:none;border:1px solid var(--rule);background:var(--paper);border-radius:999px;
  padding:8px 16px;font-family:inherit;font-size:.85rem;font-weight:500;color:var(--body);cursor:pointer;
  transition:background .2s,color .2s,border-color .2s}
.eu-chip:hover{border-color:rgba(18,49,79,.35);color:var(--ink)}
.eu-chip[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:#fff}
.eu-featured,.eu-grid{list-style:none}
.eu-featured{margin-top:32px}
.eu-grid{display:grid;gap:24px;margin-top:24px}
@media(min-width:640px){.eu-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.eu-grid{grid-template-columns:repeat(3,1fr)}}
.eu-card{display:flex;flex-direction:column;height:100%;padding:24px;border:1px solid var(--rule);
  border-radius:var(--radius-lg);background:var(--paper);
  transition:border-color .3s var(--ease),box-shadow .3s var(--ease),transform .3s var(--ease)}
.eu-card:hover{transform:translateY(-2px);border-color:rgba(18,49,79,.25);
  box-shadow:0 12px 32px -14px rgba(11,27,43,.22)}
.eu-feat .eu-card{padding:32px}
.eu-meta{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.eu-tag{border:1px solid;border-radius:var(--radius);padding:2px 8px;font-size:.72rem;
  font-weight:600;text-transform:uppercase;letter-spacing:.1em}
.eu-royal{border-color:rgba(30,58,138,.25);background:rgba(30,58,138,.06);color:#1E3A8A}
.eu-teal{border-color:rgba(15,106,114,.25);background:rgba(15,106,114,.06);color:#0F6A72}
.eu-purple{border-color:rgba(91,62,142,.25);background:rgba(91,62,142,.06);color:#5B3E8E}
.eu-saffron{border-color:rgba(168,128,44,.3);background:rgba(168,128,44,.08);color:#86661F}
.eu-date{font-size:.82rem;color:var(--muted)}
.eu-card h3{margin-top:16px;font-family:var(--serif);font-size:1.08rem;font-weight:600;
  line-height:1.35;color:var(--ink)}
.eu-feat .eu-card h3{font-size:1.8rem}
.eu-card h3 a{color:inherit}
.eu-card h3 a:hover{color:var(--indigo)}
.eu-excerpt{margin-top:12px;flex:1;font-size:.93rem}
.eu-feat .eu-excerpt{font-size:1rem}
.eu-more{margin-top:20px;font-size:.88rem;font-weight:500;color:var(--indigo)}
.eu-empty{margin-top:40px;border:1px solid var(--rule);border-radius:var(--radius-lg);
  background:var(--paper);padding:32px;text-align:center;color:var(--body)}
.eu-all{margin-top:40px;text-align:center}

/* ------------------------------------------------------- approved hero */
/* One integrated banner. The desk visual is a background layer bled to the
   right edge and faded into the surface: no border, card, rounded container
   or visible rectangular edge. */
.hero{position:relative;isolation:isolate;overflow:hidden;background:var(--surface);
  border-bottom:1px solid var(--rule)}
/* Hidden below sm: there is no width for the visual to sit beside the copy,
   and overlaying it puts body text on top of the mug and laptop. */
.hero-visual{display:none;position:absolute;inset-block:0;right:0;z-index:-1;
  background-size:cover;background-position:center right;pointer-events:none}
@media(min-width:640px){.hero-visual{display:block;width:86%}}
@media(min-width:1024px){.hero-visual{width:70%}}
@media(min-width:1440px){.hero-visual{width:68%}}
.hero-fade{position:absolute;inset:0;z-index:-1;pointer-events:none;
  /* The opaque run clears the widest text element (the trust row) before the
     dissolve begins, so no copy sits over the books. */
  /* Opaque only as far as the copy reaches, then a quick dissolve so the
     book spines and mug stay crisp. */
  background:linear-gradient(to right,
    var(--surface) 0%, var(--surface) 36%,
    rgba(244,246,249,.88) 48%, rgba(244,246,249,.45) 60%, rgba(244,246,249,0) 76%)}
.hero-fade-top{position:absolute;inset-inline:0;top:0;height:64px;z-index:-1;pointer-events:none;
  background:linear-gradient(to bottom,var(--surface),rgba(244,246,249,0))}
.hero-fade-bottom{position:absolute;inset-inline:0;bottom:0;height:64px;z-index:-1;pointer-events:none;
  background:linear-gradient(to top,var(--surface),rgba(244,246,249,0))}
.hero .shell{display:block;padding-block:64px}
@media(min-width:640px){.hero .shell{padding-block:80px}}
@media(min-width:1024px){.hero .shell{padding-block:112px}}
.hero-copy{max-width:34rem}
@media(min-width:1024px){.hero-copy{max-width:46rem}}
.hero-eyebrow{display:flex;align-items:center;gap:16px;font-size:.78rem;font-weight:600;
  text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.hero-rule{display:block;width:40px;height:2px;background:#13866B}
.hero-title{margin-top:24px;font-family:var(--serif);font-weight:600;
  font-size:clamp(1.95rem,1.35rem + 1.55vw,2.7rem);line-height:1.14;letter-spacing:-.018em}
.hero-lead{display:block;color:#053058}
.hero-accent{display:block;color:#13866B}
@media(min-width:1024px){.hero-accent{white-space:nowrap}}
.hero-sub{margin-top:24px;max-width:34rem;color:var(--body)}
.hero-actions{margin-top:36px;display:flex;flex-direction:column;gap:12px}
@media(min-width:640px){.hero-actions{flex-direction:row;align-items:center;gap:16px}}
.hero .btn-primary{background:#13866B;border-color:#13866B;color:#fff}
.hero .btn-primary:hover{background:#117459;border-color:#117459}
.hero .btn-secondary{border-color:rgba(19,134,107,.4);background:var(--paper);color:#13866B}
.hero .btn-secondary:hover{border-color:#13866B;background:rgba(19,134,107,.06)}
/* One horizontal row from large up; wraps only on narrow screens. */
.hero-trust{display:flex;flex-wrap:wrap;align-items:center;gap:12px 12px;margin-top:40px}
@media(min-width:1024px){.hero-trust{flex-wrap:nowrap}}
.hero-trust li{display:flex;align-items:center;gap:12px;flex:none}
.hero-trust li + li::before{content:"";display:block;width:1px;height:28px;background:var(--rule)}
.hero-trust-item{display:flex;align-items:center;gap:8px}
.hero-trust-item svg{flex:none;color:#053058;width:16px;height:16px}
.hero-trust-item span{white-space:nowrap;font-size:.78rem;font-weight:500;color:var(--body)}

.footer-touch{display:inline-flex;align-items:center;gap:8px;margin-top:20px;font-size:.93rem;
  font-weight:500;color:#18AA87}
.footer-touch:hover{color:#fff}

.footer-logo-tile{display:inline-block;background:#fff;border-radius:var(--radius-lg);padding:8px 12px}
.footer-logo-tile .logo-img{height:48px}
.follow{margin-top:32px}
.follow .socials{margin-top:16px;display:flex;gap:12px}
/* circular, white with navy icon, teal on hover */
.follow .socials a{display:grid;place-items:center;width:44px;height:44px;border-radius:999px;
  background:#fff;color:#053058;border:0;transition:background .2s,color .2s}
.follow .socials a:hover,.follow .socials a:focus-visible{background:#18AA87;color:#fff}

/* Get in Touch: Phone and WhatsApp share a row; Email and Office span it. */
.ft-contact{margin-top:20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:0 20px;font-size:.93rem;font-style:normal}
.ft-full{grid-column:1 / -1}
/* one 12px gap per item: the wrapper adds none of its own */
.ft-contact > .ft-full{margin-bottom:0}
.ft-lower{display:flex;flex-wrap:wrap;justify-content:space-between;gap:20px 32px;align-items:flex-start;
  margin-top:4px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);font-size:.93rem}
.ft-label{display:block;color:rgba(255,255,255,.55)}
.ft-lower .follow{margin-top:0}
.ft-lower .follow .socials{margin-top:10px}
.ft-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ft-head .footer-touch{margin-top:0;font-size:.86rem}
/* Footer hours: day and time share a line. Same words, one line each. */
.ft-lower .hrs > div{display:flex;flex-wrap:wrap;gap:0 10px}
/* one line per day only where the column is wide enough */
@media(min-width:1024px){.ft-lower .hrs > div{flex-wrap:nowrap;white-space:nowrap}}
.ft-lower .hrs dt,.ft-lower .hrs dd{margin:0}

/* ------------------------------------------------ brand logo + navy nav */
.logo-img{display:block;height:52px;width:auto;object-fit:contain}
/* White bar: navy text, teal-deep (4.52:1 on white) for hover and active */
.nav .navlink{color:#053058}
.nav .navlink:hover,.nav .navlink[data-active="true"]{color:#13866B}
.nav .navlink-pending{color:var(--muted)}
.navlink::after{background:#13866B}
.header .btn-primary{background:#13866B;border-color:#13866B;color:#fff}
.header .btn-primary:hover{background:#117459;border-color:#117459}
#burger{color:#053058}

/* ------------------------------------------------------------ preview bar */
.preview-bar{background:#0B1B2B;color:rgba(255,255,255,.72);font-size:.8rem;padding:8px 0;
  border-bottom:1px solid rgba(255,255,255,.12)}
.preview-bar .shell{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.preview-bar strong{color:#C6A04E;font-weight:600}

/* The home page is visible in the markup; the router only swaps which one is
   shown once JavaScript takes over. */
/* Routing owns page visibility outright. There is deliberately no no-JS
   fallback here: a rule that shows every .page would let any change to the
   reveal flag dump all routes onto one screen. */
.page{display:none}
.page[data-active="true"]{display:block}
"""
