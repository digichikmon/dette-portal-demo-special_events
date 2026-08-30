/* ============================================================
   D'ETTE SERVICES — SPECIAL EVENTS PORTAL
   Vanilla JS. Single-page app: client-side view router, an
   interactive calendar with hover popovers, working forms,
   timezone-sync preview, and toast confirmations.

   No framework, no build step. Data lives in memory (resets on
   reload) — wire `state.events` to your backend to persist.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Reference data ---------- */
  var TODAY = "2026-06-10"; // demo "today"

  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MON3   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DOW3   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var DOW2   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  var WEEK_START = 0; // 0 = Sunday, 1 = Monday

  var TZ_LABEL = {
    "America/Chicago":"Houston (Central)", "America/New_York":"New York (Eastern)",
    "America/Denver":"Denver (Mountain)", "America/Los_Angeles":"Los Angeles (Pacific)",
    "Europe/London":"London (GMT/BST)", "Europe/Paris":"Paris (CET)",
    "Asia/Dubai":"Dubai (GST)", "Asia/Riyadh":"Riyadh (AST)",
    "Asia/Kolkata":"Mumbai / Delhi (IST)", "Asia/Tokyo":"Tokyo (JST)",
    "Australia/Sydney":"Sydney (AEST)"
  };
  var TZ_CITY = {
    "America/Chicago":"Houston", "America/New_York":"New York", "America/Denver":"Denver",
    "America/Los_Angeles":"Los Angeles", "Europe/London":"London", "Europe/Paris":"Paris",
    "Asia/Dubai":"Dubai", "Asia/Riyadh":"Riyadh", "Asia/Kolkata":"Mumbai", "Asia/Tokyo":"Tokyo",
    "Australia/Sydney":"Sydney"
  };
  var TZ_OPTS = [
    ["America/Chicago","Central Time — Houston, Chicago"],
    ["America/New_York","Eastern Time — New York, Miami"],
    ["America/Denver","Mountain Time — Denver, Phoenix"],
    ["America/Los_Angeles","Pacific Time — Los Angeles, Seattle"],
    ["Europe/London","London (GMT/BST)"],
    ["Europe/Paris","Paris / Rome / Madrid (CET)"],
    ["Asia/Dubai","Dubai (GST)"],
    ["Asia/Riyadh","Riyadh (AST)"],
    ["Asia/Kolkata","Mumbai / Delhi (IST)"],
    ["Asia/Tokyo","Tokyo (JST)"],
    ["Australia/Sydney","Sydney (AEST)"]
  ];
  var CATS = ["Corporate gala","Birthday celebration","Anniversary party","Graduation party","Holiday party","Fundraiser / charity event","Product launch","Award ceremony","Retirement party","Baby shower","Bridal shower","Rehearsal dinner","Venue walkthrough","Catering tasting","Décor consultation","Entertainment / DJ meeting","Photography session","Other special event"];

  var EMERGENCY = [
    { role:"Emergency", name:"911", desc:"Police · Fire · Ambulance" },
    { role:"Directory assistance", name:"411", desc:"Local listings" },
    { role:"Poison control", name:"1-800-222-1222", desc:"24-hour hotline" }
  ];
  var VENDORS = [
    { role:"Event planner", name:"D'Ette Services", l1:"contact@example.com", l2:"(555) 555-5555" },
    { role:"Venue", name:"The Magnolia Ballroom", l1:"events@magnoliaballroom.example", l2:"(713) 555-0110" },
    { role:"Caterer", name:"Riviera Cuisine", l1:"info@rivieracuisine.example", l2:"(713) 555-0133" },
    { role:"Photographer / videographer", name:"Frame & Light Studio", l1:"hello@frameandlight.example", l2:"(713) 555-0155" },
    { role:"Entertainment / DJ", name:"SoundWave Events", l1:"book@soundwaveevents.example", l2:"(713) 555-0177" },
    { role:"Décor & florals", name:"Luxe Events Co.", l1:"design@luxeevents.example", l2:"(713) 555-0199" }
  ];
  var ICE = [
    { role:"Primary contact", name:"Jordan Morrison", desc:"Event host", phone:"(713) 555-0211" },
    { role:"Secondary contact", name:"Alex Morrison", desc:"Co-host / family contact", phone:"(713) 555-0233" }
  ];
  var CALENDAR_PRODUCTS = [
    { media:"Wall · Special Events 2027", title:"Special Events Wall Calendar", desc:"12 months · writing lines · QR code · ICE page", price:"$48.00", btn:"Add" },
    { media:"Desk · Special Events 2027", title:"Special Events Desk Calendar", desc:"12 months · writing lines · QR code · ICE page", price:"$36.00", btn:"Add" },
    { media:"White-label · 2027", title:"White-label Calendar", desc:"Same design · your name + logo · ~2 week turnaround", price:"On request", btn:"Request" }
  ];
  var MERCH_PRODUCTS = [
    { media:"Custom Event Tee", title:"Personalised Event Tee", desc:"Front: event logo or photo · Back: date + saying", price:"$32.00", btn:"Add" },
    { media:"Framed Event Print", title:"Framed Keepsake Print", desc:"Event photo + date · custom layout · multiple sizes", price:"$54.00", btn:"Add" },
    { media:"Branded Item", title:"Custom Branded Item", desc:"Your event logo · refined layout · multiple options", price:"From $24.00", btn:"Add" }
  ];

  var NAV = [
    { num:"01", label:"Dashboard",       view:"dashboard" },
    { num:"02", label:"Add to calendar", view:"add" },
    { num:"03", label:"Event contacts",  view:"contacts" },
    { num:"04", label:"Shop",            view:"shop" }
  ];

  /* ---------- App state ---------- */
  var state = {
    view: "login",
    authTab: "login",
    calYear: 2026,
    calMonth: 5, // June (0-indexed)
    events: [
      { date:"2026-06-10", title:"Venue walkthrough — The Magnolia Ballroom", category:"Venue",    time:"10:00", location:"Houston" },
      { date:"2026-06-17", title:"Catering tasting — Riviera Cuisine",        category:"Catering", time:"12:00", location:"Houston" },
      { date:"2026-06-17", title:"Florals preview — Luxe Events Co.",          category:"Décor",    time:"15:30", location:"Houston" },
      { date:"2026-06-22", title:"Décor consultation — Luxe Events Co.",       category:"Décor",    time:"14:00", location:"Houston" },
      { date:"2026-06-28", title:"Corporate Gala — Morrison Group",            category:"Gala",     time:"18:00", location:"Houston" }
    ]
  };

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function catColor(cat) {
    var c = (cat || "").toLowerCase();
    if (c.indexOf("gala") >= 0 || c.indexOf("award") >= 0 || c.indexOf("corporate") >= 0) return "#A09060";
    if (c.indexOf("venue") >= 0) return "#9A6A4F";
    if (c.indexOf("cater") >= 0 || c.indexOf("tasting") >= 0) return "#5E7A4A";
    if (c.indexOf("décor") >= 0 || c.indexOf("decor") >= 0 || c.indexOf("floral") >= 0) return "#A8694F";
    if (c.indexOf("photo") >= 0) return "#6B6258";
    if (c.indexOf("birthday") >= 0 || c.indexOf("anniversary") >= 0 || c.indexOf("shower") >= 0 || c.indexOf("bridal") >= 0) return "#B07A8F";
    if (c.indexOf("entertain") >= 0 || c.indexOf("dj") >= 0) return "#4F7A8C";
    return "#9A6A4F";
  }
  function fmtTime(t) {
    if (!t) return "";
    var p = t.split(":"), h = +p[0], m = +p[1];
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + String(m).padStart(2, "0") + " " + ap;
  }
  function dateLong(ds) {
    var p = ds.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return DOW3[dt.getDay()] + ", " + MON3[+p[1] - 1] + " " + (+p[2]);
  }
  function eventsOn(ds) {
    return state.events.filter(function (e) { return e.date === ds; });
  }
  function upcoming() {
    return state.events
      .filter(function (e) { return e.date >= TODAY; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.time < b.time ? -1 : 1); });
  }

  /* ---------- Calendar model ---------- */
  function buildCalendar() {
    var y = state.calYear, m = state.calMonth;
    var startDow = (new Date(y, m, 1).getDay() - WEEK_START + 7) % 7;
    var daysIn = new Date(y, m + 1, 0).getDate();
    var cells = [];
    var i;
    for (i = 0; i < startDow; i++) cells.push({ empty: true });
    for (var d = 1; d <= daysIn; d++) {
      var ds = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      cells.push({ empty: false, day: d, dateStr: ds, events: eventsOn(ds), isToday: ds === TODAY });
    }
    while (cells.length % 7 !== 0) cells.push({ empty: true });
    return cells;
  }

  /* ---------- View renderers ---------- */
  function renderLogin() {
    var isLogin = state.authTab === "login";
    var form = isLogin ? loginForm() : registerForm();
    return '' +
      '<div class="auth-page">' +
        '<aside class="auth-aside">' +
          '<span class="eyebrow">D\'Ette Services · Special Events Portal</span>' +
          '<div>' +
            '<div class="wordmark">D\'Ette</div>' +
            '<p class="tagline">Corporate galas, milestone celebrations, anniversaries — scheduled, confirmed, and synced to your own calendar.</p>' +
          '</div>' +
          '<div class="foot">Demo build · Dom Design Studio · Not for production</div>' +
          '<div class="watermark">✦</div>' +
        '</aside>' +
        '<main class="auth-main">' +
          '<div class="auth-form">' +
            '<div class="auth-toggle">' +
              '<button data-action="tab-login" class="' + (isLogin ? "active" : "") + '">Sign in</button>' +
              '<button data-action="tab-register" class="' + (!isLogin ? "active" : "") + '">Create account</button>' +
            '</div>' +
            form +
          '</div>' +
        '</main>' +
      '</div>';
  }
  function loginForm() {
    return '' +
      '<span class="eyebrow">Welcome back</span>' +
      '<h1>Sign in</h1>' +
      '<p class="sub">Access your event calendar, contacts, and orders.</p>' +
      '<label>Email</label><input type="email" value="contact@example.com">' +
      '<label>Password</label><input type="password" value="password">' +
      '<label>Sign in as</label>' +
      '<select><option>Special event client</option><option>Wedding client</option><option>Real estate client</option><option>Vendor / partner</option></select>' +
      '<button class="btn btn--block" data-action="signin">Sign in</button>' +
      '<p class="note">A prototype — any details sign you in to the demo dashboard.</p>';
  }
  function registerForm() {
    return '' +
      '<span class="eyebrow">New here</span>' +
      '<h1>Create your account</h1>' +
      '<p class="sub">Verification keeps the calendar private to people you\'ve invited.</p>' +
      '<div class="field-row">' +
        '<div><label>First name</label><input type="text" placeholder="First name"></div>' +
        '<div><label>Last name</label><input type="text" placeholder="Last name"></div>' +
      '</div>' +
      '<label>Email</label><input type="email" placeholder="you@email.com">' +
      '<label>I\'m joining as</label>' +
      '<select><option>Special event client</option><option>Wedding client</option><option>Real estate client</option><option>Vendor / partner</option></select>' +
      '<button class="btn btn--block" data-action="signin">Create account</button>' +
      '<p class="note">A verification step would sit here in the live build — kept open for the demo.</p>';
  }

  function renderShell() {
    var titles = {
      dashboard: ["Special Events Portal", "Your Event Calendar"],
      add:       ["Special Events Portal · Step 02", "Add to Calendar"],
      contacts:  ["Special Events Portal · Step 03", "Event Contacts"],
      shop:      ["Special Events Portal · Step 04", "Shop"]
    };
    var t = titles[state.view] || titles.dashboard;
    var content = state.view === "add" ? renderAdd()
                : state.view === "contacts" ? renderContacts()
                : state.view === "shop" ? renderShop()
                : renderDashboard();

    var nav = NAV.map(function (n) {
      return '<a data-action="nav" data-view="' + n.view + '" class="' + (state.view === n.view ? "active" : "") + '">' +
        '<span class="num">' + n.num + '</span><span>' + n.label + '</span></a>';
    }).join("");

    return '' +
      '<div class="app">' +
        '<aside class="sidebar">' +
          '<div class="sidebar__brand">' +
            '<span class="eyebrow">D\'Ette Services</span>' +
            '<div class="wordmark">D\'Ette</div>' +
            '<div class="sub">Special Events</div>' +
          '</div>' +
          '<nav class="sidebar__nav">' + nav +
            '<a class="signout" data-action="signout"><span class="num">↩</span><span>Sign out</span></a>' +
          '</nav>' +
          '<div class="sidebar__foot">Demo build · Prototype</div>' +
        '</aside>' +
        '<main class="main">' +
          '<div class="topbar">' +
            '<div><span class="eyebrow">' + esc(t[0]) + '</span><h1>' + esc(t[1]) + '</h1></div>' +
            '<div class="topbar__meta">' +
              '<span class="sync-badge">Synced to Google Calendar</span><br>' +
              '<strong>contact@example.com</strong><br>' +
              '<span>All times in client\'s local time</span>' +
            '</div>' +
          '</div>' +
          content +
        '</main>' +
      '</div>';
  }

  function renderDashboard() {
    var up = upcoming();
    var next = up[0];
    var hero = next ? '' +
      '<div class="hero">' +
        '<span class="eyebrow">Next on your calendar</span>' +
        '<h2>' + esc(next.title) + '</h2>' +
        '<div class="hero__meta">' +
          '<div><div class="k">Date</div><div class="v">' + esc(dateLong(next.date)) + '</div></div>' +
          '<div><div class="k">Time</div><div class="v">' + esc(fmtTime(next.time)) + ' CDT</div></div>' +
          '<div><div class="k">Location</div><div class="v">' + esc(next.location || "") + '</div></div>' +
        '</div>' +
        '<div class="watermark">✦</div>' +
      '</div>' : "";

    var upRows = up.slice(0, 5).map(function (e) {
      var p = e.date.split("-"), color = catColor(e.category);
      return '' +
        '<div class="event-row">' +
          '<div class="event-row__date">' + (+p[2]) + '<span>' + MON3[+p[1] - 1].toUpperCase() + '</span></div>' +
          '<div class="event-row__body">' +
            '<h3>' + esc(e.title) + '</h3>' +
            '<div class="event-row__tags">' +
              '<span class="chip"><span class="dot" style="background:' + color + '"></span>' + esc(e.category) + '</span>' +
              '<span class="when">' + esc(fmtTime(e.time)) + ' CDT · ' + esc(e.location || "") + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join("") || '<p class="muted" style="font-size:13px;">No upcoming events.</p>';

    return '' +
      hero +
      '<div class="grid-2">' +
        '<div class="panel cal-panel">' + renderCalendar() + '</div>' +
        '<div class="panel">' +
          '<div class="panel__head"><h2>Upcoming</h2><span class="tag">Next 30 days</span></div>' +
          upRows +
        '</div>' +
      '</div>' +
      '<div class="grid-3 quicklinks">' +
        quickLink("Event Contacts", "Vendors & ICE", "Your venue, caterer, entertainment, décor, and emergency contacts.", "Open contacts", "contacts") +
        quickLink("2027 Calendar", "Pre-order", "Order your personalised 2027 special events calendar — wall or desk format.", "Order now", "shop") +
        quickLink("Event Merch", "Made to order", "Personalised keepsakes and branded items with your photo and event date.", "Visit shop", "shop") +
      '</div>';
  }
  function quickLink(title, tag, body, btn, view) {
    return '' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>' + esc(title) + '</h2><span class="tag">' + esc(tag) + '</span></div>' +
        '<p>' + esc(body) + '</p>' +
        '<button class="btn btn--ghost btn--block" data-action="go" data-view="' + view + '">' + esc(btn) + '</button>' +
      '</div>';
  }

  function renderCalendar() {
    var cells = buildCalendar();
    var dow = (WEEK_START === 1 ? ["Mo","Tu","We","Th","Fr","Sa","Su"] : DOW2);
    var dowHtml = dow.map(function (d) { return "<span>" + d + "</span>"; }).join("");

    var grid = cells.map(function (cell, idx) {
      if (cell.empty) return '<div class="day empty"></div>';
      var has = cell.events.length > 0;
      var classes = ["day"];
      if (cell.isToday) classes.push("today");
      if (has) classes.push("has-events");
      var row = Math.floor(idx / 7), col = idx % 7;
      if (row >= 3) classes.push("pop-above");
      if (col <= 1) classes.push("pop-left");
      else if (col >= 5) classes.push("pop-right");

      var dots = cell.events.slice(0, 4).map(function (e) {
        return '<span style="background:' + catColor(e.category) + '"></span>';
      }).join("");

      var pop = "";
      if (has) {
        var rows = cell.events.map(function (e) {
          return '' +
            '<div class="day-pop__row">' +
              '<span class="dot" style="background:' + catColor(e.category) + '"></span>' +
              '<div>' +
                '<div class="t">' + esc(e.title) + '</div>' +
                '<div class="m">' + esc(fmtTime(e.time)) + ' · ' + esc(e.category) + ' · ' + esc(e.location || "") + '</div>' +
              '</div>' +
            '</div>';
        }).join("");
        pop = '<div class="day-pop"><div class="day-pop__date">' + MON3[state.calMonth].toUpperCase() + " " + cell.day + '</div>' + rows + '</div>';
      }

      return '<div class="' + classes.join(" ") + '">' +
        '<span class="n">' + cell.day + '</span>' +
        '<div class="day__dots">' + dots + '</div>' +
        pop +
      '</div>';
    }).join("");

    return '' +
      '<div class="cal-head">' +
        '<div class="cal-head__left">' +
          '<h2>' + MONTHS[state.calMonth] + " " + state.calYear + '</h2>' +
          '<div class="cal-nav">' +
            '<button data-action="prev-month" aria-label="Previous month">‹</button>' +
            '<button data-action="next-month" aria-label="Next month">›</button>' +
          '</div>' +
        '</div>' +
        '<span class="se-badge">Special events only</span>' +
      '</div>' +
      '<div class="cal-dow">' + dowHtml + '</div>' +
      '<div class="cal-grid">' + grid + '</div>' +
      '<div class="cal-foot">' +
        '<span class="hint">Hover a date to preview its events.</span>' +
        '<button class="btn" data-action="go" data-view="add">+ Add to calendar</button>' +
      '</div>';
  }

  function renderAdd() {
    var catOpts = CATS.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join("");
    var tzOpts = TZ_OPTS.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join("");
    return '' +
      '<div class="grid-2--even grid-2">' +
        '<div class="panel">' +
          '<div class="panel__head"><h2>New event entry</h2><span class="tag">Special events only</span></div>' +
          '<label>Activity type</label><select id="ev-category">' + catOpts + '</select>' +
          '<label>Title / notes</label><input type="text" id="ev-title" value="Corporate Gala — Morrison Group" placeholder="e.g. Corporate Gala — Morrison Group">' +
          '<div class="field-row">' +
            '<div><label>Date</label><input type="date" id="ev-date" value="2026-07-12"></div>' +
            '<div><label>Time</label><input type="time" id="ev-time" value="18:00"></div>' +
          '</div>' +
          '<label>Client\'s timezone</label><select id="ev-tz">' + tzOpts + '</select>' +
          '<div class="tz-preview" id="tz-preview"></div>' +
          '<label>Client / organisation name</label><input type="text" id="ev-client" value="Morrison Group" placeholder="e.g. Morrison Group">' +
          '<label>Notes</label><textarea id="ev-notes" rows="2">Black-tie dress code. Guest count: 180. Preferred palette: navy and gold.</textarea>' +
          '<button class="btn btn--block" data-action="submit-event">Add to calendar</button>' +
        '</div>' +
        '<div class="panel steps">' +
          '<div class="panel__head"><h2>What happens next</h2><span class="tag">Behind the scenes</span></div>' +
          step("1", "Activity tagged — special events only", "Wedding and real estate activities are handled on their own separate portals.") +
          step("2", "Time synced to client\'s local timezone", "A client in Houston sees Houston time. A client in Dubai sees Dubai time. No manual conversion.") +
          step("3", "Synced to your Google Calendar", "The entry appears on Ms. D\'Ette\'s own calendar automatically, tagged and sorted.") +
          step("4", "Confirmation sent to client", "A summary with the date, local time, and activity details goes out automatically.") +
          '<div class="steps__note"><p>In this prototype, "Add to calendar" drops the event onto your calendar and fires a confirmation toast.</p></div>' +
        '</div>' +
      '</div>';
  }
  function step(i, h, p) {
    return '<div class="step"><div class="i">' + i + '</div><div><h3>' + esc(h) + '</h3><p>' + esc(p) + '</p></div></div>';
  }

  function renderContacts() {
    var emergency = EMERGENCY.map(function (c) {
      return '<div class="contact-card big"><span class="role">' + esc(c.role) + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p></div>';
    }).join("");
    var vendors = VENDORS.map(function (c) {
      return '<div class="contact-card"><span class="role">' + esc(c.role) + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.l1) + '</p><p>' + esc(c.l2) + '</p></div>';
    }).join("");
    var ice = ICE.map(function (c) {
      return '<div class="contact-card"><span class="role">' + esc(c.role) + '</span><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p><p>' + esc(c.phone) + '</p></div>';
    }).join("");
    var addVendor = '<div class="contact-card editable" data-action="add-contact"><span class="role">Add vendor</span><h3>+ New contact</h3><p>Name, role, phone, email</p></div>';
    var addIce = '<div class="contact-card editable" data-action="add-contact"><span class="role">Add contact</span><h3>+ New ICE contact</h3><p>Name, relation, phone</p></div>';

    return '' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>Emergency contacts</h2><span class="tag">Pre-printed on calendar</span></div>' +
        '<p class="panel__intro">These numbers appear on the printed 2027 Special Events Calendar\'s emergency page and here in the portal.</p>' +
        '<div class="grid-3">' + emergency + '</div>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>Event vendor directory</h2><span class="tag">Your team</span></div>' +
        '<p class="panel__intro">Every vendor on your event team, in one place. Special event contacts only.</p>' +
        '<div class="grid-3">' + vendors + addVendor + '</div>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>Client emergency contacts</h2><span class="tag">ICE — in case of emergency</span></div>' +
        '<p class="panel__intro">Added by the client — people to contact on their behalf if needed.</p>' +
        '<div class="grid-3">' + ice + addIce + '</div>' +
      '</div>';
  }

  function renderShop() {
    function card(p) {
      return '' +
        '<div class="product-card">' +
          '<div class="product-card__media">' + esc(p.media) + '</div>' +
          '<div class="product-card__body">' +
            '<h3>' + esc(p.title) + '</h3>' +
            '<p>' + esc(p.desc) + '</p>' +
            '<div class="product-card__row">' +
              '<span class="product-card__price">' + esc(p.price) + '</span>' +
              '<button class="btn btn--ghost btn--sm" data-action="shop-add" data-name="' + esc(p.title) + '">' + esc(p.btn) + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    return '' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>2027 Special Events Calendar</h2><span class="tag">Pre-order · Ships Oct 2026</span></div>' +
        '<p class="panel__intro">Wall and desk formats. Emergency / ICE page included. Special event content only.</p>' +
        '<div class="grid-3">' + CALENDAR_PRODUCTS.map(card).join("") + '</div>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel__head"><h2>Event Keepsakes & Merch</h2><span class="tag">Made to order</span></div>' +
        '<p class="panel__intro">Personalised keepsakes — custom photo tees, framed prints, and branded items.</p>' +
        '<div class="grid-3">' + MERCH_PRODUCTS.map(card).join("") + '</div>' +
        '<div class="shop-note"><p>Photo submitted by client → background removed → proof sent for approval → signed off → produced.</p></div>' +
      '</div>';
  }

  /* ---------- Render ---------- */
  var appEl;
  function render() {
    appEl.innerHTML = state.view === "login" ? renderLogin() : renderShell();
    if (state.view === "add") updateTzPreview();
  }

  function updateTzPreview() {
    var el = document.getElementById("tz-preview");
    if (!el) return;
    var tz = document.getElementById("ev-tz").value;
    var time = document.getElementById("ev-time").value || "18:00";
    el.innerHTML = '<strong>Synced to client\'s local time:</strong><br>Shows as <strong>' +
      esc(fmtTime(time)) + '</strong> for the client in <strong>' + esc(TZ_LABEL[tz] || tz) +
      '</strong> — auto-converted if you\'re in a different timezone.';
  }

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.innerHTML = '<span class="dot"></span><span class="msg"></span>';
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector(".msg").textContent = msg;
    // force reflow so the transition replays if already shown
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 4200);
  }

  /* ---------- Actions ---------- */
  function go(view) { state.view = view; render(); window.scrollTo(0, 0); }

  function submitEvent() {
    var cat = document.getElementById("ev-category").value;
    var title = document.getElementById("ev-title").value || cat;
    var date = document.getElementById("ev-date").value;
    var time = document.getElementById("ev-time").value;
    var tz = document.getElementById("ev-tz").value;
    var client = document.getElementById("ev-client").value || "the client";
    if (!date) { toast("Please choose a date for the event."); return; }
    state.events.push({ date: date, title: title, category: cat, time: time, location: TZ_CITY[tz] || "" });
    var p = date.split("-");
    state.calYear = +p[0];
    state.calMonth = +p[1] - 1;
    state.view = "dashboard";
    render();
    window.scrollTo(0, 0);
    toast('"' + cat + '" added for ' + client + " · synced to " + (TZ_LABEL[tz] || tz));
  }

  /* ---------- Event delegation ---------- */
  function init() {
    appEl = document.getElementById("app");

    appEl.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-action]");
      if (!el) return;
      var a = el.getAttribute("data-action");
      switch (a) {
        case "tab-login":    state.authTab = "login"; render(); break;
        case "tab-register": state.authTab = "register"; render(); break;
        case "signin":       go("dashboard"); break;
        case "signout":      go("login"); break;
        case "nav":
        case "go":           go(el.getAttribute("data-view")); break;
        case "prev-month":   stepMonth(-1); break;
        case "next-month":   stepMonth(1); break;
        case "submit-event": submitEvent(); break;
        case "add-contact":  toast("New contact form would open here (demo)"); break;
        case "shop-add":     toast("Added — " + el.getAttribute("data-name")); break;
      }
    });

    // live timezone preview on the add-event form
    appEl.addEventListener("input", function (ev) {
      if (ev.target.id === "ev-tz" || ev.target.id === "ev-time") updateTzPreview();
    });
    appEl.addEventListener("change", function (ev) {
      if (ev.target.id === "ev-tz" || ev.target.id === "ev-time") updateTzPreview();
    });

    render();
  }
  function stepMonth(delta) {
    var m = state.calMonth + delta, y = state.calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    state.calMonth = m; state.calYear = y;
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
