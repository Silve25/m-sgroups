/* ================================
 * MSGROUPS — dashboard.js
 * ================================
 * Rôle : brancher l’UI au backend (Google Sheet via Apps Script)
 *
 * Sources possibles (dans cet ordre) :
 * 1) App Script même origine (GET ?list=1) → JSON brut
 * 2) App Script cross-origin mais via proxy CORS (config.CORS_PROXY_URL)
 * 3) Google Sheets GViz (si config.SHEET_ID publié au web)
 *
 * Config attendue (optionnelle) :
 *   window.DASHBOARD_CONFIG = {
 *     APP_SCRIPT_URL: 'https://script.google.com/macros/s/.../exec',
 *     SHEET_ID: '<spreadsheetId>',   // si publié au web
 *     SHEET_GID: 0,                  // onglet "sessions" (gid), facultatif
 *     CORS_PROXY_URL: 'https://ton-proxy.exemple/?url=' // facultatif
 *   }
 *
 * Ou utilise la constante APP_SCRIPT_URL fournie par l’utilisateur.
 * ================================ */

(() => {
  // ---- Config ----
  const CFG = {
    APP_SCRIPT_URL:
      (typeof window !== 'undefined' &&
        window.DASHBOARD_CONFIG &&
        window.DASHBOARD_CONFIG.APP_SCRIPT_URL) ||
      (typeof APP_SCRIPT_URL !== 'undefined' && APP_SCRIPT_URL) ||
      '',
    SHEET_ID:
      (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.SHEET_ID) || '',
    SHEET_GID:
      (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.SHEET_GID) || '',
    CORS_PROXY_URL:
      (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.CORS_PROXY_URL) || '',
  };

  // Noms de colonnes tels que définis dans code.gs (HEADERS)
  const COLS = [
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

  // ---- Helpers DOM ----
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, attrs={}) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    });
    return n;
  };

  // ---- State ----
  let RAW_ROWS = []; // chaque item: objet {col:value}
  let FILTERS = {
    period: '30d',
    from: null,
    to: null,
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    country: '',
    device_type: '',
    cta: '',
    email_state: '',
    search: ''
  };

  // ---- Fetchers ----

  // 1) Tente App Script GET ?list=1 (nécessite petite route côté Apps Script)
  async function fetchViaAppsScriptDirect() {
    if (!CFG.APP_SCRIPT_URL) return null;
    // Même origine : OK. Cross-origin : bloqué sans CORS → à contourner avec proxy ou hébergement même origine.
    const url = `${CFG.APP_SCRIPT_URL}?list=1`;
    const res = await fetch(url, { method:'GET', credentials:'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Si cross-origin sans CORS, le type sera "opaque" et la lecture échouera → catch en amont.
    const data = await res.json();
    if (!data || !Array.isArray(data.rows)) return null;
    return data.rows;
  }

  // 2) Tente Apps Script via proxy CORS (si fourni)
  async function fetchViaProxy() {
    if (!CFG.APP_SCRIPT_URL || !CFG.CORS_PROXY_URL) return null;
    const proxied = CFG.CORS_PROXY_URL + encodeURIComponent(CFG.APP_SCRIPT_URL + '?list=1');
    const res = await fetch(proxied);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.rows)) return null;
    return data.rows;
  }

  // 3) Fallback GViz (Sheet publié au web)
  async function fetchViaGViz() {
    if (!CFG.SHEET_ID) return null;
    const gidPart = CFG.SHEET_GID ? `&gid=${CFG.SHEET_GID}` : '';
    // GViz JSON endpoint (retourne du JS "google.visualization.Query.setResponse(...)")
    const url = `https://docs.google.com/spreadsheets/d/${CFG.SHEET_ID}/gviz/tq?tqx=out:json${gidPart}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GViz HTTP ${res.status}`);
    const text = await res.text();
    // Nettoyage GViz (retire "/*O_o*/\ngoogle.visualization.Query.setResponse(...);" )
    const jsonStr = text.replace(/^[^\(]*\(/, '').replace(/\);?$/, '');
    const parsed = JSON.parse(jsonStr);
    const table = parsed.table;
    if (!table || !table.cols || !table.rows) return null;

    // Mappe les colonnes GViz aux COLS exactes par position (assume l’ordre identique à HEADERS)
    const rows = table.rows.map(r => {
      const obj = {};
      for (let i=0; i<COLS.length; i++){
        const cell = r.c[i];
        obj[COLS[i]] = cell ? cell.v : '';
      }
      return obj;
    });
    return rows;
  }

  async function fetchAllRows() {
    // Essai 1: Apps Script direct (même origine)
    try {
      const rows = await fetchViaAppsScriptDirect();
      if (rows) return rows;
    } catch (e) {
      console.warn('Apps Script direct KO:', e.message);
    }
    // Essai 2: Proxy CORS
    try {
      const rows = await fetchViaProxy();
      if (rows) return rows;
    } catch (e) {
      console.warn('Apps Script via proxy KO:', e.message);
    }
    // Essai 3: GViz (feuille publiée)
    try {
      const rows = await fetchViaGViz();
      if (rows) return rows;
    } catch (e) {
      console.warn('GViz KO:', e.message);
    }
    throw new Error('Aucune source de données accessible (voir commentaire CORS en tête du fichier).');
  }

  // ---- Rendering helpers ----
  const fmtDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d)) return String(iso);
      return d.toLocaleString(undefined, {
        year:'numeric', month:'2-digit', day:'2-digit',
        hour:'2-digit', minute:'2-digit'
      });
    } catch { return String(iso) }
  };
  const yesNoBadge = (v) => {
    const ok = v === true || v === 'true' || v === 1 || v === '1';
    return ok
      ? `<span class="badge badge--ok">Oui</span>`
      : `<span class="badge">Non</span>`;
  };

  // CTA state → email state (placeholder demo)
  function computeEmailState(row) {
    // Démo simple : si cta_clicked et ts_cta < 30 min → "En attente"
    // si cta_clicked et ts_cta >= 30 min → "Non reçu" (par défaut)
    // Tu peux remplacer par un vrai check Zoho/Gmail côté serveur.
    if (truthy(row.cta_clicked)) {
      const ts = row.ts_cta ? new Date(row.ts_cta) : null;
      if (ts) {
        const diffMin = (Date.now() - ts.getTime()) / 60000;
        if (diffMin <= 30) return { label: 'En attente', cls: 'badge' };
      }
      return { label: 'Non reçu', cls: 'badge badge--warn' };
    }
    return { label: '—', cls: 'badge' };
  }

  const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1';

  // ---- Filters / Querying ----
  function applyFilters(rows) {
    const { period, from, to, utm_source, utm_medium, utm_campaign, country, device_type, cta, email_state, search } = FILTERS;

    let df = rows.slice();

    // Période
    let start = null, end = null;
    const today = new Date();
    end = new Date(today);
    end.setHours(23,59,59,999);

    if (period === 'today') {
      start = new Date(today); start.setHours(0,0,0,0);
    } else if (period === '7d') {
      start = new Date(today.getTime() - 6*86400000);
      start.setHours(0,0,0,0);
    } else if (period === '30d') {
      start = new Date(today.getTime() - 29*86400000);
      start.setHours(0,0,0,0);
    } else if (period === 'custom' && from && to) {
      start = new Date(from);
      end = new Date(to);
      end.setHours(23,59,59,999);
    }

    if (start) {
      df = df.filter(r => {
        const t = r.ts_open ? new Date(r.ts_open) : null;
        return t && t >= start && t <= end;
      });
    }

    if (utm_source)   df = df.filter(r => (r.utm_source||'')   === utm_source);
    if (utm_medium)   df = df.filter(r => (r.utm_medium||'')   === utm_medium);
    if (utm_campaign) df = df.filter(r => (r.utm_campaign||'') === utm_campaign);
    if (country)      df = df.filter(r => (r.country||'')      === country);
    if (device_type)  df = df.filter(r => (r.device_type||'')  === device_type);

    if (cta === 'clicked') df = df.filter(r => truthy(r.cta_clicked));
    if (cta === 'not')     df = df.filter(r => !truthy(r.cta_clicked));

    if (email_state) {
      df = df.filter(r => {
        const s = computeEmailState(r).label;
        if (email_state === 'received') return s === 'Reçu'; // placeholder (non utilisé ici)
        if (email_state === 'pending')  return s === 'En attente';
        if (email_state === 'notfound') return s === 'Non reçu';
        return true;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      df = df.filter(r => {
        return [
          r.session_id, r.form_prenom, r.form_nom, r.form_email,
          r.form_whatsapp, r.city, r.country
        ].some(v => (String(v||'').toLowerCase().includes(q)));
      });
    }

    return df;
  }

  function computeKPIs(df) {
    const total = df.length;
    // Actives 15 min (last_event récent)
    const active = df.filter(r => {
      const t = r.ts_last_update ? new Date(r.ts_last_update) : null;
      if (!t) return false;
      const diffMin = (Date.now() - t.getTime())/60000;
      return diffMin <= 15;
    }).length;

    const ctaCount = df.filter(r => truthy(r.cta_clicked)).length;
    const ctaRate = total ? (ctaCount / total) * 100 : 0;

    // Email reçus (placeholder = cta cliqué ET > 0 min && <=30 min ⇒ on reste "en attente", sinon "non reçu")
    // Ici on compte "reçus" comme 0 (sauf si tu branches un vrai check).
    const mail30 = 0;

    return { total, active, ctaCount, ctaRate, mail30 };
  }

  function buildDimensions(df) {
    const by = (key) => {
      const m = new Map();
      df.forEach(r => {
        const k = r[key] || '';
        m.set(k, (m.get(k) || 0) + 1);
      });
      return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
    };
    return {
      utm_source:  by('utm_source'),
      utm_medium:  by('utm_medium'),
      utm_campaign:by('utm_campaign'),
      country:     by('country'),
      referrer:    by('referrer')
    };
  }

  // ---- Rendering ----

  function renderKPIs(k) {
    $('#kpiSessions').textContent = k.total.toString();
    $('#kpiActive').textContent   = k.active.toString();
    $('#kpiCTA').textContent      = k.ctaCount.toString();
    $('#kpiCTARate').textContent  = `${k.ctaRate.toFixed(1)}%`;
    $('#kpiMail').textContent     = k.mail30.toString();
  }

  function renderFiltersOptions(rows) {
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b)));
    const setOpts = (sel, values, allLabel='Tous/Toutes') => {
      const elSel = $(sel);
      if (!elSel) return;
      const current = elSel.value;
      elSel.innerHTML = '';
      const first = el('option', { value:'', text: allLabel.includes('/') ? allLabel : 'Tous' });
      first.textContent = first.getAttribute('text') || allLabel;
      elSel.appendChild(first);
      values.forEach(v => {
        const o = el('option', { value:String(v) });
        o.textContent = String(v);
        elSel.appendChild(o);
      });
      if (current && values.includes(current)) elSel.value = current;
    };

    setOpts('#fUTMsource',   uniq(rows.map(r=>r.utm_source)),   'Toutes');
    setOpts('#fUTMmedium',   uniq(rows.map(r=>r.utm_medium)),   'Tous');
    setOpts('#fUTMcampaign', uniq(rows.map(r=>r.utm_campaign)), 'Toutes');
    setOpts('#fCountry',     uniq(rows.map(r=>r.country)),      'Tous');
  }

  function renderSessionsTable(df) {
    const tbody = $('#sessionsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    $('#listCount').textContent = String(df.length);

    df.forEach(r => {
      const tr = el('tr', { 'data-session-id': r.session_id || '' });

      const tdSession = el('td', { html: `<span class="mono">${r.session_id||'—'}</span>` });
      const tdOpen    = el('td', { text: fmtDate(r.ts_open) });
      const tdAcq     = el('td', { html: `<span class="muted">${r.utm_source||'—'}/${r.utm_medium||'—'}/${r.utm_campaign||'—'}</span>` });
      const tdGeo     = el('td', { text: `${r.country||'—'}${r.city? ' / '+r.city:''}` });
      const tdDevice  = el('td', { text: `${r.device_type||'—'} (${r.os||'?'}/${r.browser||'?'})` });
      const tdSteps   = el('td', { html: `<span class="badge">—</span>` }); // Placeholder: si tu as un nombre d'étapes
      const tdCTA     = el('td', { html: truthy(r.cta_clicked) ? `<span class="badge badge--ok">${r.cta_label||'Cliqué'}</span>` : `<span class="badge">—</span>` });

      const mail = computeEmailState(r);
      const tdMail   = el('td', { html: `<span class="${mail.cls}">${mail.label}</span>` });

      tr.append(tdSession, tdOpen, tdAcq, tdGeo, tdDevice, tdSteps, tdCTA, tdMail);

      // Double-clic → drawer
      tr.addEventListener('dblclick', () => openDrawer(r));

      tbody.appendChild(tr);
    });
  }

  function openDrawer(r) {
    $('#drawerSessionId').textContent = `session_id: ${r.session_id || '—'}`;
    $('#d_ts_open').textContent       = fmtDate(r.ts_open);
    $('#d_last_event').textContent    = r.last_event || '—';
    $('#d_ts_update').textContent     = fmtDate(r.ts_last_update);

    $('#d_referrer').textContent      = r.referrer || '—';
    $('#d_landing').textContent       = r.landing_url || '—';
    $('#d_utm').textContent           = `${r.utm_source||'—'}/${r.utm_medium||'—'}/${r.utm_campaign||'—'}`;

    $('#d_geo').textContent           = `${r.country||'—'}${r.city? ' / '+r.city:''}`;
    $('#d_device').textContent        = r.device_type || '—';
    $('#d_os_browser').textContent    = `${r.os||'—'} / ${r.browser||'—'}`;
    $('#d_screen').textContent        = `${r.viewport_width||'—'}×${r.viewport_height||'—'} @${r.device_pixel_ratio||'—'}`;
    $('#d_lang_tz').textContent       = `${r.language||'—'} / ${r.timezone_offset_min||'—'} min`;

    $('#d_name').textContent          = `${r.form_prenom||'—'} ${r.form_nom||''}`.trim();
    $('#d_email').textContent         = r.form_email || '—';
    $('#d_whatsapp').textContent      = r.form_whatsapp || '—';
    $('#d_pays_naiss').textContent    = `${r.form_pays||'—'}${r.form_date_naissance? ' / '+r.form_date_naissance:''}`;
    $('#d_montant_duree').textContent = `${r.form_montant_eur||'—'} € / ${r.form_duree_mois||'—'} mois`;
    $('#d_raison').textContent        = r.form_raison || '—';
    $('#d_statut_revenus').textContent= `${r.form_statut||'—'} / ${r.form_revenus||'—'}`;
    $('#d_pieces').textContent        = r.form_pieces || '—';

    $('#d_cta_label').textContent     = truthy(r.cta_clicked) ? (r.cta_label||'Cliqué') : '—';
    $('#d_ts_cta').textContent        = fmtDate(r.ts_cta);
    const mail = computeEmailState(r);
    $('#d_mail_state').innerHTML      = `<span class="${mail.cls}">${mail.label}</span>`;

    // Timeline (placeholder déduite)
    const tl = $('#d_timeline');
    tl.innerHTML = '';
    const addEvt = (t, evt, sub='') => {
      const node = el('div', { class:'tl' });
      node.innerHTML = `<time>${t}</time><div><div class="tl__evt">${evt}</div><div class="muted">${sub}</div></div>`;
      tl.appendChild(node);
    };
    addEvt(fmtDate(r.ts_open), 'session_start', '+0s');
    if (truthy(r.cta_clicked)) addEvt(fmtDate(r.ts_cta), 'cta_click');

    const drawer = $('#sessionDrawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
  }

  function renderQueue(df) {
    const tbody = $('#queueTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Critère: CTA cliqué dans les 30 dernières minutes
    const now = Date.now();
    const items = df.filter(r => truthy(r.cta_clicked) && r.ts_cta && (now - new Date(r.ts_cta).getTime())/60000 <= 30);

    if (!items.length) {
      const tr = el('tr',{class:'placeholder'});
      tr.innerHTML = `<td class="mono">—</td><td>—</td><td>—</td><td><span class="badge">En attente</span></td><td><button class="btn" disabled>Rechecker</button></td>`;
      tbody.appendChild(tr);
      return;
    }

    items.forEach(r => {
      const tr = el('tr');
      const deadlineMin = 30 - Math.floor((now - new Date(r.ts_cta).getTime())/60000);
      const state = computeEmailState(r);

      tr.innerHTML = `
        <td class="mono">${r.session_id||'—'}</td>
        <td>${r.cta_label||'—'}</td>
        <td>${deadlineMin} min</td>
        <td><span class="${state.cls}">${state.label}</span></td>
        <td><button class="btn" data-recheck="${r.session_id||''}">Rechecker</button></td>
      `;

      tr.querySelector('button[data-recheck]')?.addEventListener('click', () => {
        // Ici tu peux relancer un check côté serveur si tu ajoutes une route Apps Script
        // Pour l’instant, on force juste un refresh.
        boot(true);
      });

      tbody.appendChild(tr);
    });
  }

  // ---- Charts (placeholder) ----
  // Tu peux brancher Chart.js/Recharts plus tard. On inscrit juste un résumé texte.
  function renderCharts(df) {
    // Funnel (données fictives basées sur CTA)
    $('#chartFunnel').textContent = `Sessions: ${df.length} • CTA: ${df.filter(r=>truthy(r.cta_clicked)).length}`;

    // Devices
    const byDevice = new Map();
    df.forEach(r => {
      const k = r.device_type || '—';
      byDevice.set(k, (byDevice.get(k)||0)+1);
    });
    $('#chartDevices').textContent = Array.from(byDevice.entries()).map(([k,v])=>`${k}: ${v}`).join('  |  ') || '—';

    // Geo
    const byCountry = new Map();
    df.forEach(r => {
      const k = r.country || '—';
      byCountry.set(k, (byCountry.get(k)||0)+1);
    });
    const top5 = Array.from(byCountry.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
    $('#chartGeo').textContent = top5.map(([k,v]) => `${k}: ${v}`).join('  |  ') || '—';
  }

  // ---- Acquisition tables ----
  function renderAcquisition(df) {
    const toPct = (num, den) => den ? `${((num/den)*100).toFixed(1)}%` : '0.0%';

    // UTM table
    const utmMap = new Map();
    df.forEach(r => {
      const key = `${r.utm_source||''} / ${r.utm_medium||''} / ${r.utm_campaign||''}`;
      if (!utmMap.has(key)) utmMap.set(key, { sessions:0, cta:0, emails:0 });
      const obj = utmMap.get(key);
      obj.sessions += 1;
      if (truthy(r.cta_clicked)) obj.cta += 1;
      // emails : placeholder 0 (voir commentaire computeEmailState)
    });
    const utmBody = $('#utmTable tbody');
    utmBody.innerHTML = '';
    if (!utmMap.size) {
      utmBody.innerHTML = `<tr class="placeholder"><td class="mono muted">utm_source / utm_medium / utm_campaign</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`;
    } else {
      Array.from(utmMap.entries()).sort((a,b)=>b[1].sessions-a[1].sessions).forEach(([k,v])=>{
        const tr = el('tr');
        tr.innerHTML = `
          <td class="mono">${k}</td>
          <td>${v.sessions}</td>
          <td>${v.cta}</td>
          <td>${toPct(v.cta, v.sessions)}</td>
          <td>${v.emails}</td>
        `;
        utmBody.appendChild(tr);
      });
    }

    // Referrers
    const refMap = new Map();
    df.forEach(r => {
      const key = r.referrer || '—';
      if (!refMap.has(key)) refMap.set(key, { sessions:0, cta:0, emails:0 });
      const obj = refMap.get(key);
      obj.sessions += 1;
      if (truthy(r.cta_clicked)) obj.cta += 1;
    });
    const refBody = $('#refTable tbody');
    refBody.innerHTML = '';
    if (!refMap.size) {
      refBody.innerHTML = `<tr class="placeholder"><td class="muted">—</td><td>—</td><td>—</td><td>—</td></tr>`;
    } else {
      Array.from(refMap.entries()).sort((a,b)=>b[1].sessions-a[1].sessions).forEach(([k,v])=>{
        const tr = el('tr');
        tr.innerHTML = `
          <td>${k}</td>
          <td>${v.sessions}</td>
          <td>${v.cta}</td>
          <td>${v.emails}</td>
        `;
        refBody.appendChild(tr);
      });
    }
  }

  // ---- Alerts / sync info ----
  function renderAlerts(ok, msg='') {
    $('#lastSync').textContent = new Date().toLocaleString();
    const list = $('#alertsList');
    list.innerHTML = '';
    if (ok) {
      list.innerHTML = `<li class="pill pill--brand">Aucune alerte active</li>`;
      $('#ingestionErrors').textContent = '0';
    } else {
      list.innerHTML = `<li class="pill">⚠️ ${msg || 'Impossible de charger les données'}</li>`;
      $('#ingestionErrors').textContent = '1';
    }
  }

  // ---- Export CSV ----
  function exportCSV(rows) {
    if (!rows || !rows.length) return;
    const header = COLS.join(',');
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
      return s;
    };
    const lines = rows.map(r => COLS.map(c => esc(r[c])).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = el('a', { href:url, download:`msgroups_dashboard_${Date.now()}.csv` });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  // ---- UI events ----
  function bindEvents() {
    $('#btnReload')?.addEventListener('click', () => boot(true));
    $('#btnExport')?.addEventListener('click', () => exportCSV(applyFilters(RAW_ROWS)));

    $('#fPeriod')?.addEventListener('change', (e)=>{
      FILTERS.period = e.target.value;
      const custom = FILTERS.period === 'custom';
      $('#fFrom').disabled = !custom;
      $('#fTo').disabled = !custom;
      refresh();
    });
    $('#fFrom')?.addEventListener('change', (e)=>{ FILTERS.from = e.target.value || null; refresh(); });
    $('#fTo')?.addEventListener('change', (e)=>{ FILTERS.to = e.target.value || null; refresh(); });

    $('#fUTMsource')?.addEventListener('change', (e)=>{ FILTERS.utm_source = e.target.value; refresh(); });
    $('#fUTMmedium')?.addEventListener('change', (e)=>{ FILTERS.utm_medium = e.target.value; refresh(); });
    $('#fUTMcampaign')?.addEventListener('change', (e)=>{ FILTERS.utm_campaign = e.target.value; refresh(); });
    $('#fCountry')?.addEventListener('change', (e)=>{ FILTERS.country = e.target.value; refresh(); });
    $('#fDevice')?.addEventListener('change', (e)=>{ FILTERS.device_type = e.target.value; refresh(); });
    $('#fCTA')?.addEventListener('change', (e)=>{ FILTERS.cta = e.target.value; refresh(); });
    $('#fEmailState')?.addEventListener('change', (e)=>{ FILTERS.email_state = e.target.value; refresh(); });
    $('#fSearch')?.addEventListener('input', (e)=>{ FILTERS.search = e.target.value.trim(); refresh(); });

    $('#btnClearFilters')?.addEventListener('click', ()=>{
      FILTERS = { period:'30d', from:null, to:null, utm_source:'', utm_medium:'', utm_campaign:'', country:'', device_type:'', cta:'', email_state:'', search:'' };
      $('#fPeriod').value = '30d';
      $('#fFrom').value = ''; $('#fTo').value=''; $('#fFrom').disabled = true; $('#fTo').disabled = true;
      $('#fUTMsource').value=''; $('#fUTMmedium').value=''; $('#fUTMcampaign').value='';
      $('#fCountry').value=''; $('#fDevice').value=''; $('#fCTA').value=''; $('#fEmailState').value='';
      $('#fSearch').value='';
      refresh();
    });
  }

  // ---- Refresh pipeline ----
  function refresh() {
    const filtered = applyFilters(RAW_ROWS);
    renderKPIs(computeKPIs(filtered));
    renderFiltersOptions(RAW_ROWS);
    renderSessionsTable(filtered);
    renderQueue(filtered);
    renderCharts(filtered);
    renderAcquisition(filtered);
    renderAlerts(true);
  }

  async function boot(forceReload=false) {
    try {
      if (forceReload || !RAW_ROWS.length) {
        // Affiche un petit état "chargement" implicite (placeholder déjà en place)
        RAW_ROWS = await fetchAllRows();
        // Sanitize types
        RAW_ROWS = RAW_ROWS.map(r => {
          const o = {};
          COLS.forEach(k => o[k] = (k in r) ? r[k] : '');
          return o;
        });
      }
      refresh();
    } catch (e) {
      console.error(e);
      renderAlerts(false, e.message || 'Erreur de chargement');
    }
  }

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    boot();
  });

})();

/* ===========================================================
 * (Optionnel) Ajout côté Apps Script pour permettre ?list=1
 * ===========================================================
 * Dans ton code.gs, étends doGet pour retourner toutes les lignes :
 *
 * function doGet(e) {
 *   try {
 *     const q = e && e.parameter || {};
 *     if (q && q.session_id) { ...existant... }
 *     if (q && q.list == '1') {
 *       const sh = getSheet_();
 *       const header = HEADERS;
 *       const lastRow = sh.getLastRow();
 *       const rows = lastRow < 2 ? [] : sh.getRange(2, 1, lastRow-1, header.length).getValues();
 *       const out = rows.map(row => {
 *         const obj = {};
 *         header.forEach((h, i) => obj[h] = row[i]);
 *         return obj;
 *       });
 *       return json_(200, { ok:true, rows: out });
 *     }
 *     return json_(200, { ok:true, status:'alive', time: nowISO_(), sheet: SHEET_NAME });
 *   } catch (err) {
 *     return json_(400, { ok:false, error: String(err && err.message || err) });
 *   }
 * }
 *
 * Note: Apps Script n’ajoute pas d’entêtes CORS. Si ton HTML est hébergé ailleurs,
 * utilise le même déploiement (HTML Service) ou configure un proxy CORS interne.
 * =========================================================== */
