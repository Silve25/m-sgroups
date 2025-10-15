/* ===========================
   MSGROUPS — dashboard.js
   =========================== */

/** ========= 0) CONFIG ========= **/
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyaqL3zEvP_9fu3cOGOcDPa8Wa0le87vVA_iGTNhNPd0Zqg3bXtCo_GCtJUwRCzXGMc/exec';

/* OPTION 1 (recommandé pour CORS): publie la feuille "sessions" en CSV et colle ici l’URL publique */
const SHEET_CSV_URL = ''; // ex: 'https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out:csv&sheet=sessions'

/* OPTION 2 (même origine Apps Script): ajoute côté doGet(e) un handler ?list=1 qui renvoie tout le sheet en JSON
   if (q.list) { ... return json_(200, { ok:true, rows:[ {...}, ... ] }) } */

/** Nom exact des colonnes (ligne 1) côté Sheet */
const HEADERS = [
  'session_id','ts_open','referrer','landing_url','utm_source','utm_medium','utm_campaign',
  'country','city',
  'device_type','os','browser','user_agent',
  'screen_width','screen_height','viewport_width','viewport_height','device_pixel_ratio',
  'language','timezone_offset_min',
  'form_prenom','form_nom','form_email','form_whatsapp','form_pays','form_date_naissance',
  'form_montant_eur','form_duree_mois','form_raison','form_statut','form_revenus','form_pieces',
  'cta_clicked','cta_label','ts_cta',
  'last_event','ts_last_update'
];

/** ========= 1) STATE ========= **/
const State = {
  raw: [],
  view: [],
  filters: {
    period: '30d',
    from: null,
    to: null,
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    country: '',
    device: '',
    cta: '',
    emailState: '',
    q: ''
  },
  meta: {
    lastSync: null,
    ingestionErrors: 0
  }
};

/** ========= 2) UTILS ========= **/
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const toISO = d => (d instanceof Date ? d : new Date(d)).toISOString();
const parseNum = v => isFinite(+v) ? +v : null;
const parseBool = v => (v === true || v === 'true' || v === 1 || v === '1');

function parseDateSafe(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short', timeStyle: 'medium'
    }).format(typeof d === 'string' ? new Date(d) : d);
  } catch { return String(d); }
}
function fmtShortDate(d) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short', timeStyle: 'short'
    }).format(typeof d === 'string' ? new Date(d) : d);
  } catch { return String(d); }
}
function fmtInt(v, fallback = '—') {
  if (v === null || v === undefined || isNaN(+v)) return fallback;
  return new Intl.NumberFormat('fr-FR', {maximumFractionDigits:0}).format(+v);
}
function fmtPct(v) {
  if (!isFinite(v)) return '—';
  return (v*100).toFixed(0) + '%';
}
function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a,b)=> String(a).localeCompare(String(b)));
}
function inLastMinutes(dateValue, mins) {
  const d = parseDateSafe(dateValue);
  if (!d) return false;
  return (Date.now() - d.getTime()) <= mins*60*1000;
}
function minutesBetween(a, b) {
  const da = parseDateSafe(a), db = parseDateSafe(b);
  if (!da || !db) return null;
  return Math.abs( (db.getTime() - da.getTime()) / 60000 );
}
function csvToObjects(csvText, headers = HEADERS) {
  // naïf mais efficace : gère CSV standard, séparateur virgule, guillemets
  const rows = [];
  let i = 0, field = '', inQuotes = false, row = [];
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { rows.push(row); row = []; };

  while (i < csvText.length) {
    const c = csvText[i];
    if (inQuotes) {
      if (c === '"') {
        if (csvText[i+1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') pushField();
      else if (c === '\n') { pushField(); pushRow(); }
      else if (c === '\r') { /* ignore */ }
      else field += c;
    }
    i++;
  }
  if (field.length || row.length) { pushField(); pushRow(); }
  if (!rows.length) return [];

  const hdr = rows.shift().map(h => String(h).trim());
  const idx = headers.map(h => hdr.indexOf(h));
  return rows
    .filter(r => r.length && r.some(x => String(x).trim().length))
    .map(r => {
      const obj = {};
      headers.forEach((h, j) => { obj[h] = idx[j] >= 0 ? r[idx[j]] : ''; });
      return obj;
    });
}

/** ========= 3) DATA FETCH ========= **/
async function fetchAllSessions() {
  // MODE A: CSV public (recommandé si dashboard hébergé ailleurs — CORS OK)
  if (SHEET_CSV_URL) {
    const res = await fetch(SHEET_CSV_URL, {cache:'no-store'});
    const text = await res.text();
    return csvToObjects(text, HEADERS);
  }

  // MODE B: Apps Script même origine (ton doGet doit supporter ?list=1 et renvoyer { ok:true, rows:[...] })
  const url = APP_SCRIPT_URL + '?list=1';
  const res = await fetch(url, {cache:'no-store', credentials:'include'});
  const json = await res.json();
  if (!json || !json.ok || !Array.isArray(json.rows)) {
    throw new Error('Réponse inattendue de l’Apps Script (attendu rows[])');
  }
  return json.rows;
}

function hydrateRow(raw) {
  // Types & dérivés
  const r = {...raw};

  r.cta_clicked = parseBool(r.cta_clicked);
  r.form_montant_eur = parseNum(r.form_montant_eur);
  r.form_duree_mois  = parseNum(r.form_duree_mois);
  r.screen_width     = parseNum(r.screen_width);
  r.screen_height    = parseNum(r.screen_height);
  r.viewport_width   = parseNum(r.viewport_width);
  r.viewport_height  = parseNum(r.viewport_height);
  r.device_pixel_ratio = parseNum(r.device_pixel_ratio);
  r.timezone_offset_min = parseNum(r.timezone_offset_min);

  r.ts_open_date = parseDateSafe(r.ts_open);
  r.ts_cta_date  = parseDateSafe(r.ts_cta);
  r.ts_update_date = parseDateSafe(r.ts_last_update);

  // EmailState (30 min)
  // - received: last_event == 'mail_received' (dans les 30 min suivant CTA si CTA existe) OU sans CTA (ignore)
  // - pending: CTA < 30 min & pas mail_received
  // - notfound: CTA ≥ 30 min & pas mail_received
  let mailState = '';
  if (r.cta_clicked && r.ts_cta_date) {
    if (String(r.last_event).toLowerCase() === 'mail_received') {
      const diff = minutesBetween(r.ts_cta_date, r.ts_update_date || new Date());
      mailState = (diff !== null && diff <= 30) ? 'received' : 'received'; // reçu, on ne nuance pas plus ici
    } else {
      mailState = inLastMinutes(r.ts_cta_date, 30) ? 'pending' : 'notfound';
    }
  } else {
    mailState = ''; // pas de CTA → pas d’état email
  }
  r.mail_state_30 = mailState;

  // Étapes complétées (heuristique : step1 si form_nom/prenom/email ok ; step2 si montant/durée/raison ; step3 si statut/revenus)
  let steps = 0;
  if (r.form_prenom || r.form_nom || r.form_email) steps++;
  if (isFinite(r.form_montant_eur) || isFinite(r.form_duree_mois) || r.form_raison) steps++;
  if (r.form_statut || r.form_revenus) steps++;
  r.steps_done = steps;

  return r;
}

/** ========= 4) FILTERS + VIEW ========= **/
function applyFilters() {
  const f = State.filters;
  const now = new Date();
  let from = null, to = null;

  if (f.period === 'today') {
    from = new Date(); from.setHours(0,0,0,0);
    to = new Date();   to.setHours(23,59,59,999);
  } else if (f.period === '7d') {
    to = now;
    from = new Date(now.getTime() - 7*24*3600*1000);
  } else if (f.period === '30d') {
    to = now;
    from = new Date(now.getTime() - 30*24*3600*1000);
  } else if (f.period === 'custom' && f.from && f.to) {
    from = new Date(f.from + 'T00:00:00');
    to   = new Date(f.to   + 'T23:59:59');
  }

  let rows = State.raw;
  if (from && to) {
    rows = rows.filter(r => {
      const d = r.ts_open_date || r.ts_update_date;
      return d && d >= from && d <= to;
    });
  }

  if (f.utm_source)  rows = rows.filter(r => (r.utm_source || '')  === f.utm_source);
  if (f.utm_medium)  rows = rows.filter(r => (r.utm_medium || '')  === f.utm_medium);
  if (f.utm_campaign)rows = rows.filter(r => (r.utm_campaign || '')=== f.utm_campaign);
  if (f.country)     rows = rows.filter(r => (r.country || '')     === f.country);
  if (f.device)      rows = rows.filter(r => (r.device_type || '') === f.device);
  if (f.cta === 'clicked') rows = rows.filter(r => r.cta_clicked);
  if (f.cta === 'not')     rows = rows.filter(r => !r.cta_clicked);
  if (f.emailState)       rows = rows.filter(r => r.mail_state_30 === f.emailState);

  if (f.q && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    rows = rows.filter(r => {
      return [
        r.session_id, r.form_nom, r.form_prenom, r.form_email, r.form_whatsapp
      ].some(x => (x||'').toString().toLowerCase().includes(q));
    });
  }

  State.view = rows;
}

/** ========= 5) RENDER ========= **/
function renderKPIs() {
  const rows = State.view;
  // 1) sessions période
  $('#kpiSessions').textContent = fmtInt(rows.length);

  // 2) actives 15 min (ts_last_update ou ts_open)
  const active = rows.filter(r => inLastMinutes(r.ts_update_date || r.ts_open_date, 15)).length;
  $('#kpiActive').textContent = fmtInt(active);

  // 3) CTA + taux
  const ctaCount = rows.filter(r => r.cta_clicked).length;
  $('#kpiCTA').textContent = fmtInt(ctaCount);
  const rate = rows.length ? ctaCount / rows.length : 0;
  $('#kpiCTARate').textContent = fmtPct(rate);

  // 4) emails reçus (30 min)
  const mailOk = rows.filter(r => r.mail_state_30 === 'received').length;
  $('#kpiMail').textContent = fmtInt(mailOk);
}

function renderFiltersOptions() {
  const rows = State.raw;
  const utmS = uniq(rows.map(r => r.utm_source));
  const utmM = uniq(rows.map(r => r.utm_medium));
  const utmC = uniq(rows.map(r => r.utm_campaign));
  const countries = uniq(rows.map(r => r.country));

  fillSelect($('#fUTMsource'), utmS);
  fillSelect($('#fUTMmedium'), utmM);
  fillSelect($('#fUTMcampaign'), utmC);
  fillSelect($('#fCountry'), countries);
}
function fillSelect(sel, values) {
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Tous</option>';
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v || '—';
    sel.appendChild(opt);
  });
  // essaie de garder la sélection si encore valide
  const stillThere = values.includes(current);
  if (current && stillThere) sel.value = current;
}

function renderSessionsTable() {
  const tbody = $('#sessionsTable tbody');
  tbody.innerHTML = '';
  const rows = State.view;

  $('#listCount').textContent = fmtInt(rows.length);

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.className = 'placeholder';
    tr.innerHTML = `<td colspan="8" class="muted">Aucune session pour les filtres en cours.</td>`;
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${esc(r.session_id)}</td>
      <td>${esc(fmtShortDate(r.ts_open_date))}</td>
      <td class="mono"><span class="muted">${esc(r.utm_source||'—')}/${esc(r.utm_medium||'—')}/${esc(r.utm_campaign||'—')}</span><br><span class="muted">${esc(r.referrer||'—')}</span></td>
      <td>${esc(r.country||'—')}${r.city? ' / '+esc(r.city): ''}</td>
      <td>${esc(r.device_type||'—')}<br><span class="muted">${esc(r.os||'—')} / ${esc(r.browser||'—')}</span></td>
      <td><span class="badge">${r.steps_done}/3</span></td>
      <td>${r.cta_clicked ? `<span class="badge badge--warn">${esc(r.cta_label||'CTA')}</span>` : '<span class="badge">—</span>'}</td>
      <td>${renderMailBadge(r.mail_state_30)}</td>
    `;
    tr.addEventListener('dblclick', () => openDrawer(r));
    tbody.appendChild(tr);
  });
}
function renderMailBadge(state) {
  if (state === 'received') return '<span class="badge badge--ok">Reçu</span>';
  if (state === 'pending')  return '<span class="badge badge--warn">En attente</span>';
  if (state === 'notfound') return '<span class="badge badge--err">Non reçu</span>';
  return '<span class="badge">—</span>';
}
function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

function renderUTMTable() {
  const tbody = $('#utmTable tbody');
  tbody.innerHTML = '';
  const groups = groupBy(State.view, r => `${r.utm_source||''} / ${r.utm_medium||''} / ${r.utm_campaign||''}`);
  if (!Object.keys(groups).length) {
    tbody.innerHTML = `<tr class="placeholder"><td colspan="5" class="muted">—</td></tr>`;
    return;
  }
  Object.entries(groups).forEach(([k, arr]) => {
    const sessions = arr.length;
    const cta = arr.filter(r => r.cta_clicked).length;
    const conv = sessions ? cta / sessions : 0;
    const mails = arr.filter(r => r.mail_state_30 === 'received').length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${esc(k || '—')}</td>
      <td>${fmtInt(sessions)}</td>
      <td>${fmtInt(cta)}</td>
      <td>${fmtPct(conv)}</td>
      <td>${fmtInt(mails)}</td>
    `;
    tbody.appendChild(tr);
  });
}
function renderRefTable() {
  const tbody = $('#refTable tbody');
  tbody.innerHTML = '';
  const groups = groupBy(State.view, r => r.referrer || '—');
  if (!Object.keys(groups).length) {
    tbody.innerHTML = `<tr class="placeholder"><td colspan="4" class="muted">—</td></tr>`;
    return;
  }
  Object.entries(groups).forEach(([k, arr]) => {
    const sessions = arr.length;
    const cta = arr.filter(r => r.cta_clicked).length;
    const mails = arr.filter(r => r.mail_state_30 === 'received').length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${esc(k)}</td>
      <td>${fmtInt(sessions)}</td>
      <td>${fmtInt(cta)}</td>
      <td>${fmtInt(mails)}</td>
    `;
    tbody.appendChild(tr);
  });
}
function renderDevices() {
  const el = $('#chartDevices');
  const groups = groupBy(State.view, r => `${r.device_type||'—'} / ${r.os||'—'} / ${r.browser||'—'}`);
  const lines = Object.entries(groups)
    .sort((a,b)=> b[1].length - a[1].length)
    .slice(0,8)
    .map(([k,arr]) => `• ${k} — ${arr.length}`);
  el.textContent = lines.length ? lines.join('\n') : 'Aucune donnée';
}
function renderGeo() {
  const el = $('#chartGeo');
  const countries = Object.entries(groupBy(State.view, r => r.country || '—'))
    .sort((a,b)=> b[1].length - a[1].length)
    .slice(0,10)
    .map(([k,arr]) => `• ${k}: ${arr.length}`);
  el.textContent = countries.length ? countries.join('\n') : 'Aucune donnée';
}
function renderFunnel() {
  const el = $('#chartFunnel');
  const total = State.view.length;
  const s1 = State.view.filter(r => r.steps_done >= 1).length;
  const s2 = State.view.filter(r => r.steps_done >= 2).length;
  const s3 = State.view.filter(r => r.steps_done >= 3).length;
  const cta = State.view.filter(r => r.cta_clicked).length;
  const lines = [
    `Etape 1: ${s1}/${total} (${fmtPct(total? s1/total : 0)})`,
    `Etape 2: ${s2}/${total} (${fmtPct(total? s2/total : 0)})`,
    `Etape 3: ${s3}/${total} (${fmtPct(total? s3/total : 0)})`,
    `CTA: ${cta}/${total} (${fmtPct(total? cta/total : 0)})`,
  ];
  el.textContent = lines.join('\n');
}

function renderQueue30() {
  const tbody = $('#queueTable tbody');
  tbody.innerHTML = '';
  const now = new Date();
  const items = State.view
    .filter(r => r.cta_clicked && r.ts_cta_date)
    .filter(r => minutesBetween(r.ts_cta_date, now) <= 30)
    .sort((a,b)=> (a.ts_cta_date||0) - (b.ts_cta_date||0));

  if (!items.length) {
    const tr = document.createElement('tr');
    tr.className = 'placeholder';
    tr.innerHTML = `<td colspan="5" class="muted">Rien à vérifier pour l’instant.</td>`;
    tbody.appendChild(tr);
    return;
  }

  items.forEach(r => {
    const ddl = new Date(r.ts_cta_date.getTime() + 30*60000);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${esc(r.session_id)}</td>
      <td>${esc(r.cta_label || 'CTA')}</td>
      <td>${esc(fmtShortDate(ddl))}</td>
      <td>${renderMailBadge(r.mail_state_30)}</td>
      <td><button class="btn" data-recheck="${esc(r.session_id)}">Rechecker</button></td>
    `;
    tbody.appendChild(tr);
  });

  // bouton recheck (refresh data)
  $$('button[data-recheck]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await reloadAll(); // simple: on recharge tout
    });
  });
}

function renderAlerts() {
  const ul = $('#alertsList');
  ul.innerHTML = '';
  const alerts = [];

  // Exemples d’alertes simple:
  // - trop de “notfound” sur 30 min
  const pendingTooMany = State.view.filter(r => r.mail_state_30 === 'notfound').length;
  if (pendingTooMany >= 5) {
    alerts.push({severity:'warn', text:`${pendingTooMany} e-mails non reçus (>30 min) sur la période filtrée`});
  }

  // - incohérences device/screen
  const weirdScreens = State.view.filter(r => r.screen_width && r.screen_width < 240).length;
  if (weirdScreens) {
    alerts.push({severity:'warn', text:`${weirdScreens} sessions avec des écrans suspects (<240px)`});
  }

  if (!alerts.length) {
    const li = document.createElement('li');
    li.className = 'pill pill--brand';
    li.textContent = 'Aucune alerte active';
    ul.appendChild(li);
    return;
  }

  alerts.forEach(a => {
    const li = document.createElement('li');
    li.className = 'pill ' + (a.severity==='warn' ? 'pill--brand' : 'pill--ok');
    li.textContent = a.text;
    ul.appendChild(li);
  });

  $('#lastSync').textContent = State.meta.lastSync ? fmtShortDate(State.meta.lastSync) : '—';
  $('#ingestionErrors').textContent = String(State.meta.ingestionErrors || 0);
}

/** Drawer détails */
function openDrawer(r) {
  const dr = $('#sessionDrawer');
  $('#drawerSessionId').textContent = 'session_id: ' + (r.session_id || '—');

  // Identité
  $('#d_ts_open').textContent = fmtShortDate(r.ts_open_date);
  $('#d_last_event').textContent = r.last_event || '—';
  $('#d_ts_update').textContent = fmtShortDate(r.ts_update_date);

  // Acquisition
  $('#d_referrer').textContent = r.referrer || '—';
  $('#d_landing').textContent  = r.landing_url || '—';
  $('#d_utm').textContent      = `${r.utm_source||'—'} / ${r.utm_medium||'—'} / ${r.utm_campaign||'—'}`;

  // Contexte
  $('#d_geo').textContent = `${r.country||'—'}${r.city? ' / '+r.city : ''}`;
  $('#d_device').textContent = r.device_type || '—';
  $('#d_os_browser').textContent = `${r.os||'—'} / ${r.browser||'—'}`;
  $('#d_screen').textContent = `${fmtInt(r.screen_width,'—')}×${fmtInt(r.screen_height,'—')} • viewport ${fmtInt(r.viewport_width,'—')}×${fmtInt(r.viewport_height,'—')} • DPR ${r.device_pixel_ratio ?? '—'}`;
  $('#d_lang_tz').textContent = `${r.language||'—'} • TZ ${r.timezone_offset_min ?? '—'} min`;

  // Form
  $('#d_name').textContent = `${r.form_prenom||'—'} ${r.form_nom||''}`.trim();
  $('#d_email').textContent = r.form_email || '—';
  $('#d_whatsapp').textContent = r.form_whatsapp || '—';
  $('#d_pays_naiss').textContent = `${r.form_pays||'—'} / ${r.form_date_naissance||'—'}`;
  $('#d_montant_duree').textContent = `${isFinite(r.form_montant_eur)? fmtInt(r.form_montant_eur)+' €':'—'} / ${isFinite(r.form_duree_mois)? r.form_duree_mois+' mois':'—'}`;
  $('#d_raison').textContent = r.form_raison || '—';
  $('#d_statut_revenus').textContent = `${r.form_statut||'—'} / ${r.form_revenus||'—'}`;
  $('#d_pieces').textContent = r.form_pieces || '—';

  // CTA & email
  $('#d_cta_label').textContent = r.cta_clicked ? (r.cta_label || 'CTA') : '—';
  $('#d_ts_cta').textContent = r.cta_clicked ? fmtShortDate(r.ts_cta_date) : '—';
  $('#d_mail_state').innerHTML = renderMailBadge(r.mail_state_30);

  // Timeline (simple)
  const tl = $('#d_timeline');
  tl.innerHTML = '';
  const events = [];
  if (r.ts_open_date) events.push({ts:r.ts_open_date, evt:'session_start'});
  if (r.steps_done>=1) events.push({ts:r.ts_open_date, evt:'step1'});
  if (r.steps_done>=2) events.push({ts:r.ts_update_date || r.ts_open_date, evt:'step2'});
  if (r.steps_done>=3) events.push({ts:r.ts_update_date || r.ts_open_date, evt:'step3'});
  if (r.cta_clicked && r.ts_cta_date) events.push({ts:r.ts_cta_date, evt:'cta_click'});
  if (r.last_event) events.push({ts:r.ts_update_date || r.ts_cta_date || r.ts_open_date, evt:r.last_event});
  events.sort((a,b)=> (a.ts||0) - (b.ts||0));

  const firstTs = events.length ? (events[0].ts) : null;
  events.forEach(ev => {
    const delta = (firstTs && ev.ts) ? Math.round((ev.ts - firstTs)/1000) : 0;
    const div = document.createElement('div');
    div.className = 'tl';
    div.innerHTML = `
      <time>${esc(fmtShortDate(ev.ts))}</time>
      <div><div class="tl__evt">${esc(ev.evt)}</div><div class="muted">+${delta}s</div></div>
    `;
    tl.appendChild(div);
  });

  dr.classList.add('open');
  dr.setAttribute('aria-hidden','false');
}

/** Helpers groupBy */
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

/** ========= 6) CONTROLLERS ========= **/
function bindControls() {
  $('#fPeriod').addEventListener('change', (e)=>{
    State.filters.period = e.target.value;
    const custom = State.filters.period === 'custom';
    $('#fFrom').disabled = !custom;
    $('#fTo').disabled = !custom;
    refreshView();
  });
  $('#fFrom').addEventListener('change', (e)=>{ State.filters.from = e.target.value; refreshView(); });
  $('#fTo').addEventListener('change', (e)=>{ State.filters.to   = e.target.value; refreshView(); });

  $('#fUTMsource').addEventListener('change', e=>{ State.filters.utm_source = e.target.value; refreshView(); });
  $('#fUTMmedium').addEventListener('change', e=>{ State.filters.utm_medium = e.target.value; refreshView(); });
  $('#fUTMcampaign').addEventListener('change', e=>{ State.filters.utm_campaign = e.target.value; refreshView(); });

  $('#fCountry').addEventListener('change', e=>{ State.filters.country = e.target.value; refreshView(); });
  $('#fDevice').addEventListener('change', e=>{ State.filters.device = e.target.value; refreshView(); });

  $('#fCTA').addEventListener('change', e=>{ State.filters.cta = e.target.value; refreshView(); });
  $('#fEmailState').addEventListener('change', e=>{ State.filters.emailState = e.target.value; refreshView(); });

  $('#fSearch').addEventListener('input', e=>{ State.filters.q = e.target.value; refreshView(); });

  $('#btnClearFilters').addEventListener('click', ()=>{
    State.filters = { period:'30d', from:null, to:null, utm_source:'', utm_medium:'', utm_campaign:'', country:'', device:'', cta:'', emailState:'', q:'' };
    $('#fPeriod').value = '30d';
    $('#fFrom').value = ''; $('#fTo').value=''; $('#fFrom').disabled = true; $('#fTo').disabled = true;
    $('#fUTMsource').value = ''; $('#fUTMmedium').value=''; $('#fUTMcampaign').value='';
    $('#fCountry').value = ''; $('#fDevice').value='';
    $('#fCTA').value=''; $('#fEmailState').value='';
    $('#fSearch').value='';
    refreshView();
  });

  $('#btnReload').addEventListener('click', reloadAll);
  $('#btnExport').addEventListener('click', exportCurrentCSV);

  // fermer drawer (déjà géré par HTML inline, mais on double pour robustesse)
  $('#drawerClose')?.addEventListener('click', ()=>{
    const dr = $('#sessionDrawer');
    dr.classList.remove('open'); dr.setAttribute('aria-hidden','true');
  });
}

/** ========= 7) EXPORT ========= **/
function exportCurrentCSV() {
  const rows = State.view;
  if (!rows.length) { alert('Aucune ligne dans la vue.'); return; }
  const cols = HEADERS;
  const escCsv = s => `"${String(s??'').replace(/"/g,'""')}"`;
  const csv = [
    cols.map(escCsv).join(',')
  ].concat(rows.map(r => cols.map(c => escCsv(r[c])).join(','))).join('\n');

  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `msgroups_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** ========= 8) REFRESH CYCLE ========= **/
function refreshView() {
  applyFilters();
  renderKPIs();
  renderSessionsTable();
  renderUTMTable();
  renderRefTable();
  renderDevices();
  renderGeo();
  renderFunnel();
  renderQueue30();
  renderAlerts();
}

async function reloadAll() {
  try {
    $('body').style.cursor = 'progress';
    const raw = await fetchAllSessions();
    State.raw = raw
      .map(hydrateRow)
      .sort((a,b)=> (b.ts_open_date||0) - (a.ts_open_date||0));
    State.meta.lastSync = new Date();
    renderFiltersOptions();
    refreshView();
  } catch (err) {
    console.error(err);
    State.meta.ingestionErrors++;
    alert('Erreur de chargement des données. Vérifie l’URL CSV publiée OU le endpoint Apps Script (?list=1).');
  } finally {
    $('body').style.cursor = '';
  }
}

/** ========= 9) BOOT ========= **/
(function boot(){
  bindControls();
  reloadAll();
})();
