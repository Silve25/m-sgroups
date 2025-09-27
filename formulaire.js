/* formulaire.js — NL site → Apps Script (4 transports, CSP-safe)
 * Événements (1x / session) : page_loaded, form_full, cta_click
 * Debug: ajouter ?axdebug=1 à l’URL (nouveau SID + logs console + pas de dédup)
 */
(function(){
  'use strict';

  /* ===== CONFIG ===== */
  var TG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyY-E0u153av5YoypMl-GW5mxkW62lhwmooQGI0HRfy-7Uh0Ia6yk4IvuNmWsprQvjpqA/exec';
  var DEBUG = /\baxdebug=1\b/i.test(location.search);

  var SS = { SID:'ax_sid', OPEN:'ax_sent_open', FORM:'ax_sent_form', CTA:'ax_sent_cta' };

  /* ===== UTILS ===== */
  var $  = function(s,root){ return (root||document).querySelector(s); };
  var trim   = function(v){ return (v||'').toString().trim(); };
  var now    = function(){ return Date.now(); };

  function log(){ if(DEBUG) try{ console.log.apply(console, ['[ax]'].concat([].slice.call(arguments))); }catch(_){} }

  function ssGet(k){ try{return sessionStorage.getItem(k);}catch(_){return null;} }
  function ssSet(k,v){ try{sessionStorage.setItem(k,v);}catch(_){ } }
  function ssHas(k){ return DEBUG ? false : !!ssGet(k); }

  function getSID(){
    var sid = ssGet(SS.SID);
    if(!sid){ sid = (Date.now().toString(36)+Math.random().toString(36).slice(2,10)); ssSet(SS.SID, sid); }
    if (DEBUG) sid = sid + '-d' + Math.floor(Math.random()*1e6);
    return sid;
  }
  var SID = getSID();

  function b64url(utf8){
    try{
      var b64 = btoa(unescape(encodeURIComponent(utf8)));
      return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    }catch(e){ return ''; }
  }

  // 4 transports en chaîne : beacon → fetch → pixel ?data= → GET “plat”
  function sendEvent(event, payload){
    var bodyObj = Object.assign({ event:event, ts: now(), sid: SID }, payload||{});
    var bodyStr = JSON.stringify(bodyObj);
    var sent = false;

    // #1 sendBeacon (text/plain)
    try{
      if(navigator.sendBeacon){
        var ok = navigator.sendBeacon(TG_ENDPOINT, new Blob([bodyStr], {type:'text/plain'}));
        if (ok){ sent = true; log('beacon ok', event); }
      }
    }catch(e){ log('beacon err', e); }

    // #2 fetch no-cors
    if(!sent){
      try{
        fetch(TG_ENDPOINT, { method:'POST', mode:'no-cors', keepalive:true, body: bodyStr });
        sent = true; log('fetch no-cors fired', event);
      }catch(e){ log('fetch err', e); }
    }

    // #3 GET pixel (data base64url)
    try{
      var img1 = new Image();
      img1.referrerPolicy = 'no-referrer-when-downgrade';
      img1.src = TG_ENDPOINT + '?data=' + b64url(bodyStr);
      log('pixel ?data= fired', event);
    }catch(e){ log('pixel data err', e); }

    // #4 GET “plat” (paramètres simples — utile si ?data= bloqué/CSP)
    try{
      var q = new URLSearchParams();
      q.set('event', event);
      q.set('sid', SID);
      // on passe quelques champs simples lisibles par parsePayload_
      if (payload && payload.href) q.set('href', String(payload.href));
      if (payload && payload.lang) q.set('lang', String(payload.lang));
      if (payload && payload.tz)   q.set('tz',   String(payload.tz));
      if (payload && payload.ip)   q.set('ip',   String(payload.ip));
      // si data existe, on l’envoie JSON-stringifié à minima
      if (payload && payload.data){
        try{ q.set('data', JSON.stringify(payload.data)); }catch(_){}
      }
      var img2 = new Image();
      img2.referrerPolicy = 'no-referrer-when-downgrade';
      img2.src = TG_ENDPOINT + '?' + q.toString();
      log('pixel flat GET fired', event);
    }catch(e){ log('pixel flat err', e); }
  }

  // IP + ville/pays (best-effort, timeout)
  function fetchIpInfo(timeoutMs){
    timeoutMs = timeoutMs || 1800;
    var ctrl = new AbortController();
    var to = setTimeout(function(){ try{ctrl.abort();}catch(_){ } }, timeoutMs);

    return fetch('https://api.ipify.org?format=json', {signal:ctrl.signal, cache:'no-store'})
      .then(function(r){ return r.json(); })
      .then(function(j){
        clearTimeout(to);
        var ip = (j && j.ip) || '';
        return fetch('https://ipapi.co/'+ip+'/json/', {cache:'no-store'})
          .then(function(r2){ return r2.json(); })
          .then(function(j2){
            return {
              ip: ip,
              loc: {
                country: (j2 && (j2.country_name || j2.country)) || undefined,
                city:    (j2 && j2.city)    || undefined,
                region:  (j2 && j2.region)  || undefined
              }
            };
          })
          .catch(function(){ return { ip: ip, loc: null }; });
      })
      .catch(function(){ clearTimeout(to); return { ip:'', loc:null }; });
  }

  /* ===== DOM ===== */
  var form = $('#leadForm');
  if(!form){ console.warn('[ax] #leadForm introuvable'); return; }

  var fFirst   = $('#firstName');
  var fLast    = $('#lastName');
  var fEmail   = $('#email');
  var fPhone   = $('#phone');
  var fCountry = $('#country');
  var fDur     = $('#duration');
  var fPurpose = $('#purpose');
  var fAmount  = $('#amount');
  var fConsent = $('#consent');

  var ctaEmail = $('#ctaEmail');
  var ctaWhats = $('#ctaWhats');

  function ctasEnabled(){
    return !!(ctaEmail && ctaEmail.classList.contains('enabled')) ||
           !!(ctaWhats && ctaWhats.classList.contains('enabled'));
  }

  function snapshotLead(){
    var code = fCountry ? String(fCountry.value||'') : '';
    var label = '';
    if(fCountry){
      var opt = fCountry.options[fCountry.selectedIndex];
      label = opt ? trim(opt.textContent||opt.innerText||'') : '';
    }
    return {
      prenom:      trim(fFirst && fFirst.value),
      nom:         trim(fLast  && fLast.value),
      email:       trim(fEmail && fEmail.value),
      telephone:   trim(fPhone && fPhone.value),
      pays:        code || label || '',
      pays_label:  label || '',
      montant_eur: fAmount ? Number(fAmount.value) : null,
      duree_mois:  fDur ? Number(fDur.value) : null,
      objet:       trim(fPurpose && fPurpose.value),
      consent:     !!(fConsent && fConsent.checked)
    };
  }

  /* ===== #1 page_loaded ===== */
  function sendPageLoadedOnce(){
    if (ssHas(SS.OPEN)) return;

    var meta = {
      href: location.href,
      ref: document.referrer || '',
      ua: navigator.userAgent,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: { w: screen.width, h: screen.height, dpr: window.devicePixelRatio||1 }
    };

    // Watchdog: on envoie en <1s, puis on renvoie enrichi si IP arrive à temps
    var watchdog = setTimeout(function(){
      if (!ssHas(SS.OPEN)){
        sendEvent('page_loaded', meta);
        ssSet(SS.OPEN,'1');
        log('page_loaded watchdog');
      }
    }, 900);

    fetchIpInfo(1500).then(function(info){
      clearTimeout(watchdog);
      var enriched = Object.assign({}, meta, {
        ip: (info && info.ip) || undefined,
        geo: (info && info.loc) || undefined
      });
      // si on a déjà envoyé, on renvoie quand même (même SID → Apps Script dédupe)
      sendEvent('page_loaded', enriched);
      ssSet(SS.OPEN,'1');
      log('page_loaded enriched');
    }).catch(function(err){
      clearTimeout(watchdog);
      if (!ssHas(SS.OPEN)){
        sendEvent('page_loaded', meta);
        ssSet(SS.OPEN,'1');
        log('page_loaded fallback', err);
      }
    });
  }

  /* ===== #2 form_full ===== */
  function maybeSendFormFull(){
    if (ssHas(SS.FORM)) return;
    if (!ctasEnabled()) return;
    var snap = snapshotLead();
    sendEvent('form_full', {
      data: snap,
      href: location.href,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    ssSet(SS.FORM,'1');
    log('form_full sent');
  }

  function bindFormWatchers(){
    // Observer l’état des CTA (changement de class → enabled)
    if (ctaEmail || ctaWhats){
      var observer = new MutationObserver(function(muts){
        for (var i=0;i<muts.length;i++){
          if (muts[i].type === 'attributes' && muts[i].attributeName === 'class'){
            maybeSendFormFull();
          }
        }
      });
      if (ctaEmail) observer.observe(ctaEmail, {attributes:true});
      if (ctaWhats) observer.observe(ctaWhats, {attributes:true});
    }
    // Filets de sécu
    [fFirst,fLast,fEmail,fPhone,fCountry,fDur,fPurpose,fAmount,fConsent].forEach(function(el){
      if(!el) return;
      var evt = (el.type==='checkbox' || el.tagName==='SELECT') ? 'change' : 'input';
      el.addEventListener(evt, maybeSendFormFull);
      el.addEventListener('change', maybeSendFormFull);
    });
    setTimeout(maybeSendFormFull, 0);
    window.addEventListener('load',      maybeSendFormFull);
    window.addEventListener('pageshow',  maybeSendFormFull);
  }

  /* ===== #3 cta_click ===== */
  function sendCTAOnce(kind){
    if (ssHas(SS.CTA)) return;
    if (!ctasEnabled()) return;
    var snap = snapshotLead();

    // On envoie via 4 transports, et on laisse ta redirection faire sa vie.
    sendEvent('cta_click', { which: kind, data: snap, href: location.href });
    ssSet(SS.CTA,'1');
    log('cta_click', kind);
  }

  function bindCTAs(){
    if (ctaEmail){
      ctaEmail.addEventListener('click', function(){ sendCTAOnce('email'); }, {capture:false});
      ctaEmail.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ sendCTAOnce('email'); } });
    }
    if (ctaWhats){
      ctaWhats.addEventListener('click', function(){ sendCTAOnce('whatsapp'); }, {capture:false});
      ctaWhats.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ sendCTAOnce('whatsapp'); } });
    }
  }

  /* ===== INIT ===== */
  function init(){ bindFormWatchers(); bindCTAs(); sendPageLoadedOnce(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
