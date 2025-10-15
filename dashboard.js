/* ================================
 * MSGROUPS — dashboard.js (CSV edition)
 * Lit la feuille Google Sheets via export CSV public
 * ================================ */

(() => {
  // ---- Config ----
  // 1) On lit d’abord une URL de feuille (celle que tu as fournie) — format ".../d/<ID>/edit?gid=<GID>#gid=<GID>"
  // 2) Si absente, on regarde window.DASHBOARD_CONFIG.SHEET_URL
  // 3) Sinon, on essaie window.DASHBOARD_CONFIG.SHEET_ID + SHEET_GID
  const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/10FmzIA0Ou9zsOn5m_-z7okCeWlhD7ZRhVyTDWmpa5K0/edit?gid=70713818#gid=70713818';

  const CFG = {
    SHEET_URL:
      (typeof window !== 'undefined' &&
        window.DASHBOARD_CONFIG &&
        window.DASHBOARD_CONFIG.SHEET_URL) ||
      DEFAULT_SHEET_URL,
    SHEET_ID:
      (typeof window !== 'undefined' &&
        window.DASHBOARD_CONFIG &&
        window.DASHBOARD_CONFIG.SHEET_ID) || '',
    SHEET_GID:
      (typeof window !== 'undefined' &&
        window.DASHBOARD_CONFIG &&
        window.DASHBOARD_CONFIG.SHEET_GID) || '',
    // On garde la possibilité d’un App Script en secours si tu veux plus tard
    APP_SCRIPT_URL:
      (typeof window !== 'undefined' &&
        window.DASHBOARD_CONFIG &&
        window.DASHBOARD_CONFIG.APP_SCRIPT_URL) ||
      (typeof APP_SCRIPT_URL !== 'undefined' ? APP_SCRIPT_URL : '')
  };

  // ---- Colonnes attendues (doivent matcher exactement les entêtes de la feuille) ----
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
  let RAW_ROWS = [];
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

  // ------------------------------------------------------------------
  //                FETCH GOOGLE SHEETS (CSV EXPORT)
  // ------------------------------------------------------------------
  function getCsvExportUrl() {
    // Tente d’extraire ID et GID depuis SHEET_URL
    // Ex: https://docs.google.com/spreadsheets/d/<ID>/edit?gid=<GID>#gid=<GID>
    const m = String(CFG.SHEET_URL || '').match(/\/d\/([a-zA-Z0-9-_]+)\/.*?[?&]gid=(\d+)/);
    const sheetId = m ? m[1] : (CFG.SHEET_ID || '');
    const gid = m ? m[2] : (CFG.SHEET_GID || '');
    if (!sheetId || !gid) return '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  // CSV parser tolérant (gère guillemets et virgules)
  function parseCSV(text) {
    const rows = [];
    let i = 0, field = '', row = [], inQuotes = false;
    while (i < text.length) {
      const char = text[i];

      if (inQuotes) {
        if (char === '"') {
          if (text[i+1] === '"') { // escape ""
            field += '"'; i += 2; continue;
          } else {
            inQuotes = false; i++; continue;
          }
        } else {
          field += char; i++; continue;
        }
      } else {
        if (char === '"') {
          inQuotes = true; i++; continue;
        }
        if (char === ',') {
          row.push(field); field = ''; i++; continue;
        }
        if (char === '\r') { i++; continue; }
        if (char === '\n') {
          row.push(field); rows.push(row); field = ''; row = []; i++; continue;
        }
        field += char; i++;
      }
    }
    // dernier champ
    row.push(field);
    rows.push(row);
    return rows;
  }

  function normalizeHeaderKey(k) {
    return String(k || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  function mapCsvToObjects(rows2d) {
    if (!rows2d || !rows2d.length) return [];
    const header = rows2d[0].map(h => String(h || '').trim());
    const idxByHeader = new Map(); // clé exacte
    header.forEach((h, i) => idxByHeader.set(h, i));

    // aussi un mapping normalisé (au cas où il y aurait des petits écarts d’espaces/casse)
    const idxByNorm = new Map();
    header.forEach((h, i) => idxByNorm.set(normalizeHeaderKey(h), i));

    const out = [];
    for (let r = 1; r < rows2d.length; r++) {
      const row = rows2d[r];
      if (!row || row.length === 0) continue;
      const obj = {};
      COLS.forEach(col => {
        // priorité: match exact, sinon match normalisé
        let i = idxByHeader.get(col);
        if (typeof i !== 'number') {
          i = idxByNorm.get(normalizeHeaderKey(col));
        }
        obj[col] = (typeof i === 'number') ? row[i] : '';
      });
      out.push(cleanTypes(obj));
    }
    return out;
  }

  function cleanTypes(o) {
    const asNumber = (v) => {
      if (v === null || v === undefined || v === '') return '';
      const n = Number(String(v).replace(',', '.'));
      return isFinite(n) ? n : '';
    };
    const asBool = (v) => {
      const s = String(v).trim().toLowerCase();
      return (s === 'true' || s === '1' || s === 'oui' || s === 'yes');
    };

    // nombres
    ['timezone_offset_min','screen_width','screen_height','viewport_width','viewport_height','device_pixel_ratio','form_montant_eur','form_duree_mois'].forEach(k=>{
      o[k] = asNumber(o[k]);
    });
    // bool
    o['cta_clicked'] = asBool(o['cta_clicked']);

    // dates: on ne force pas de parsing ici; on garde la string ISO/texte pour fmtDate()
    return o;
  }

  async function fetchRowsFromCSV() {
    const url = getCsvExportUrl();
    if (!url) throw new Error('URL de CSV Google Sheets invalide (id/gid manquants).');
    const res = await fetch(url, { method:'GET' });
    if (!res.ok) {
      throw new Error(`Impossible de lire la feuille (HTTP ${res.status}). Vérifie que la feuille est partagée en lecture publique.`);
    }
    const text = await res.text();
    const rows2d = parseCSV(text);
    return mapCsvToObjects(rows2d);
  }

  async function fetchAllRows() {
    // On privilégie la feuille CSV
    const viaCsv = await fetchRowsFromCSV();
    if (viaCsv && viaCsv.length) return viaCsv;

    // (Fallback optionnel) — si tu veux tenter App Script ensuite
    if (CFG.APP_SCRIPT_URL) {
      try {
        const res = await fetch(CFG.APP_SCRIPT_URL + '?list=1');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.rows)) return data.rows;
        }
      } catch {}
    }
    throw new Error('Aucune donnée trouvée dans la feuille.');
  }

  // ------------------------------------------------------------------
  //                          RENDERING
  // ------------------------------------------------------------------
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
  const truthy = (v) => v === true || v === 'true' || v === 1 || v === '1';

  const yesNoBadge = (v) => truthy(v)
    ? `<span class="badge badge--ok">Oui</span>`
    : `<span class="badge">Non</span>`;

  function computeEmailState(row) {
    // Démo simple basée sur CTA + fenêtre 30min
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

  function applyFilters(rows) {
    const { period, from, to, utm_source, utm_medium, utm_campaign, country, device_type, cta, email_state, search } = FILTERS;

    let df = rows.slice();

    // Période
    let start = null, end = null;
    const today = new Date();
    end = new Date(today); end.setHours(23,59,59,999);

    if (period === 'today') {
      start = new Date(today); start.setHours(0,0,0,0);
    } else if (period === '7d') {
      start = new Date(today.getTime() - 6*86400000); start.setHours(0,0,0,0);
    } else if (period === '30d') {
      start = new Date(today.getTime() - 29*86400000); start.setHours(0,0,0,0);
    } else if (period === 'custom' && from && to) {
      start = new Date(from);
      end = new Date(to); end.setHours(23,59,59,999);
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
        if (email_state === 'received') return s === 'Reçu'; // placeholder
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
    const active = df.filter(r => {
      const t = r.ts_last_update ? new Date(r.ts_last_update) : null;
      if (!t) return false;
      const diffMin = (Date.now() - t.getTime())/60000;
      return diffMin <= 15;
    }).length;

    const ctaCount = df.filter(r => truthy(r.cta_clicked)).length;
    const ctaRate = total ? (ctaCount / total) * 100 : 0;
    const mail30 = 0; // placeholder

    return { total, active, ctaCount, ctaRate, mail30 };
  }

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
      const first = el('option', { value:'' });
      first.textContent = allLabel;
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
      const tdSteps   = el('td', { html: `<span class="badge">—</span>` });
      const tdCTA     = el('td', { html: truthy(r.cta_clicked) ? `<span class="badge badge--ok">${r.cta_label||'Cliqué'}</span>` : `<span class="badge">—</span>` });

      const mail = computeEmailState(r);
      const tdMail   = el('td', { html: `<span class="${mail.cls}">${mail.label}</span>` });

      tr.append(tdSession, tdOpen, tdAcq, tdGeo, tdDevice, tdSteps, tdCTA, tdMail);

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

    // Timeline minimale
    const tl = $('#d_timeline');
    tl.innerHTML = '';
    const addEvt = (t, evt, sub='') => {
      const node = el('div', { class:'tl' });
      node.innerHTML = `<time>${t}</time><div><div class="tl__evt">${evt}</div><div class="muted">${sub}</div></div>`;
      tl.appendChild(node);
    };
    if (r.ts_open) addEvt(fmtDate(r.ts_open), 'session_start', '+0s');
    if (truthy(r.cta_clicked) && r.ts_cta) addEvt(fmtDate(r.ts_cta), 'cta_click');

    const drawer = $('#sessionDrawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
  }

  function renderQueue(df) {
    const tbody = $('#queueTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

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
        boot(true);
      });

      tbody.appendChild(tr);
    });
  }

  function renderCharts(df) {
    $('#chartFunnel').textContent = `Sessions: ${df.length} • CTA: ${df.filter(r=>truthy(r.cta_clicked)).length}`;

    const byDevice = new Map();
    df.forEach(r => {
      const k = r.device_type || '—';
      byDevice.set(k, (byDevice.get(k)||0)+1);
    });
    $('#chartDevices').textContent = Array.from(byDevice.entries()).map(([k,v])=>`${k}: ${v}`).join('  |  ') || '—';

    const byCountry = new Map();
    df.forEach(r => {
      const k = r.country || '—';
      byCountry.set(k, (byCountry.get(k)||0)+1);
    });
    const top5 = Array.from(byCountry.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
    $('#chartGeo').textContent = top5.map(([k,v]) => `${k}: ${v}`).join('  |  ') || '—';
  }

  function renderAcquisition(df) {
    const toPct = (num, den) => den ? `${((num/den)*100).toFixed(1)}%` : '0.0%';

    // UTM
    const utmMap = new Map();
    df.forEach(r => {
      const key = `${r.utm_source||''} / ${r.utm_medium||''} / ${r.utm_campaign||''}`;
      if (!utmMap.has(key)) utmMap.set(key, { sessions:0, cta:0, emails:0 });
      const obj = utmMap.get(key);
      obj.sessions += 1;
      if (truthy(r.cta_clicked)) obj.cta += 1;
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
        RAW_ROWS = await fetchAllRows();
        // Assure que toutes les colonnes existent
        RAW_ROWS = RAW_ROWS.map(r => {
          const o = {}; COLS.forEach(k => o[k] = (k in r) ? r[k] : '');
          return o;
        });
      }
      refresh();
    } catch (e) {
      console.error(e);
      renderAlerts(false, e.message || 'Erreur de chargement');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    boot();
  });

})();
