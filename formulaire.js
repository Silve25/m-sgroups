/* formulaire.js — Telemetry 3 triggers → Google Apps Script (anti-CORS, IP best-effort)
 * Couvre le site NL (leadForm) :
 *  - page_loaded : dès l’ouverture (avec IP/ville/pays best-effort)
 *  - form_full   : quand les champs clés sont valides (prénom, nom, email, téléphone, consentement)
 *  - cta_click   : au 1er clic sur #ctaEmail ou #ctaWhats
 *
 * Ne modifie PAS le comportement de tes CTA existants (aucun preventDefault).
 * Dédup par sessionStorage (1 envoi / type d’événement / session).
 */
(function(){
  'use strict';

  /* ===== CONFIG ===== */
  // Nouvel Apps Script (fourni)
  var TG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyY-E0u153av5YoypMl-GW5mxkW62lhwmooQGI0HRfy-7Uh0Ia6yk4IvuNmWsprQvjpqA/exec';

  // Ajoute ?axdebug=1 à l’URL pour forcer un nouveau SID et ignorer la dédup
  var DEBUG = /\baxdebug=1\b/i.test(location.search);

  // Clés de sessionStorage
  var SS = { SID:'ax_sid', OPEN:'ax_sent_open', FORM:'ax_sent_form', CTA:'ax_sent_cta' };

  /* ===== UTILS ===== */
  var $  = function(s,root){ return (root||document).querySelector(s); };
  var $$ = function(s,root){ return Array.prototype.slice.call((root||document).querySelectorAll(s)); };
  var trim   = function(v){ return (v||'').toString().trim(); };
  var digits = function(v){ return (v||'').replace(/\D+/g,''); };
  var now    = function(){ return Date.now(); };

  function ssGet(k){ try{return sessionStorage.getItem(k);}catch(_){return null;} }
  function ssSet(k,v){ try{sessionStorage.setItem(k,v);}catch(_){ } }
  function ssHas(k){ return DEBUG ? false : !!ssGet(k); } // en debug, on renvoie toujours false

  function getSID(){
    var sid = ssGet(SS.SID);
    if(!sid){ sid = (Date.now().toString(36)+Math.random().toString(36).slice(2,10)); ssSet(SS.SID, sid); }
    if (DEBUG) sid = sid + '-d' + Math.floor(Math.random()*1e6);
    return sid;
  }
  var SID = getSID();

  function b64url(utf8){
    var b64 = btoa(unescape(encodeURIComponent(utf8)));
    return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  // Transport anti-CORS : sendBeacon + fetch(no-cors) + pixel GET
  function sendEvent(event, payload){
    var bodyStr = JSON.stringify(Object.assign({ event: event, ts: now(), sid: SID }, payload||{}));

    // 1) sendBeacon (text/plain)
    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon(TG_ENDPOINT, new Blob([bodyStr], {type:'text/plain'}));
      }
    }catch(_){}

    // 2) fetch simple (no-cors)
    try{
      fetch(TG_ENDPOINT, { method:'POST', mode:'no-cors', keepalive:true, body: bodyStr });
    }catch(_){}

    // 3) GET pixel (fallback)
    try{ new Image().src = TG_ENDPOINT + '?data=' + b64url(bodyStr); }catch(_){}
  }

  // IP only (aucune permission), enrichi ville/pays (best-effort)
  function fetchIpInfo(timeoutMs){
    timeoutMs = timeoutMs || 1500;
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
  if(!form){ console.warn('[formulaire.js] #leadForm introuvable'); return; }

  // Champs clés du formulaire NL
  var fFirst   = $('#firstName');
  var fLast    = $('#lastName');
  var fEmail   = $('#email');
  var fPhone   = $('#phone');
  var fCountry = $('#country');        // <select>
  var fDur     = $('#duration');       // mois (string)
  var fPurpose = $('#purpose');
  var fAmount  = $('#amount');         // slider (number string)
  var fConsent = $('#consent');        // checkbox

  var ctaEmail = $('#ctaEmail');
  var ctaWhats = $('#ctaWhats');

  /* ===== Validations (cohérentes avec ton script inline) ===== */
  var emailOK = function(s){ s = String(s||'').trim().toLowerCase(); return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s); };
  // Téléphone international très tolérant (+…, au moins 8–9 chiffres)
  var phoneOK = function(s){
    var t = String(s||'').trim();
    if(!/^\+\d[\d\s-]{5,}$/.test(t)) return false;
    return digits(t).length >= 9; // simple filet de sécurité
  };

  // Snapshot des données utiles (noms NL → clés FR pour lisibilité côté Telegram)
  function snapshotLead(){
    return {
      prenom:     trim(fFirst && fFirst.value),
      nom:        trim(fLast  && fLast.value),
      email:      trim(fEmail && fEmail.value),
      telephone:  trim(fPhone && fPhone.value),
      pays:       (fCountry && fCountry.value) || '',
      montant_eur: (fAmount && Number(fAmount.value)) || null,
      duree_mois:  (fDur && Number(fDur.value)) || null,
      objet:       trim(fPurpose && fPurpose.value) || '',
      consent:     !!(fConsent && fConsent.checked)
    };
  }

  function formIsComplete(d){
    return !!( d
      && d.prenom
      && d.nom
      && emailOK(d.email)
      && phoneOK(d.telephone)
      && d.consent === true
    );
  }

  /* ===== Trigger #1 — page_loaded (avec watchdog) ===== */
  function sendPageLoadedOnce(){
    if (ssHas(SS.OPEN)) return;

    var sent = false;
    var meta = {
      href: location.href,
      ref: document.referrer || '',
      ua: navigator.userAgent,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: { w: screen.width, h: screen.height, dpr: window.devicePixelRatio||1 }
    };

    // Fallback si IP lente (>1s)
    var watchdog = setTimeout(function(){
      if (sent) return;
      sendEvent('page_loaded', meta);
      ssSet(SS.OPEN,'1');
      sent = true;
    }, 1000);

    fetchIpInfo(1500).then(function(info){
      if (sent) return;
      clearTimeout(watchdog);
      sendEvent('page_loaded', Object.assign({}, meta, {
        ip: (info && info.ip) || undefined,
        geo: (info && info.loc) || undefined
      }));
      ssSet(SS.OPEN,'1');
      sent = true;
    }).catch(function(){
      if (sent) return;
      clearTimeout(watchdog);
      sendEvent('page_loaded', meta);
      ssSet(SS.OPEN,'1');
      sent = true;
    });
  }

  /* ===== Trigger #2 — form_full (autofill-safe) =====
   * Écoute input/change + re-teste à load/pageshow (bfcache Safari/Chrome)
   * Dédup 1x / session.
   */
  function maybeSendFormFull(){
    if (ssHas(SS.FORM)) return;
    var snap = snapshotLead();
    if (!formIsComplete(snap)) return;

    sendEvent('form_full', {
      data: snap,
      href: location.href,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    ssSet(SS.FORM,'1');
  }

  function bindFormWatchers(){
    // Tous les inputs pertinents
    [fFirst,fLast,fEmail,fPhone,fCountry,fDur,fPurpose,fAmount,fConsent].forEach(function(el){
      if(!el) return;
      var evt = (el.type==='checkbox' || el.tagName==='SELECT') ? 'change' : 'input';
      el.addEventListener(evt, maybeSendFormFull);
      // certains navigateurs ne déclenchent pas tout de suite l’input sur autofill
      el.addEventListener('change', maybeSendFormFull);
    });

    // Tests initiaux
    setTimeout(maybeSendFormFull, 0);
    window.addEventListener('load',      maybeSendFormFull);
    window.addEventListener('pageshow',  maybeSendFormFull);
  }

  /* ===== Trigger #3 — cta_click =====
   * Observe les clics (sans empêcher tes handlers existants).
   * 1 seul envoi / session (premier CTA).
   */
  function sendCTAOnce(kind){
    if (ssHas(SS.CTA)) return;
    var snap = snapshotLead();
    if (!formIsComplete(snap)) return; // évite d’envoyer si invalide (même logique que form_full)
    sendEvent('cta_click', { which: kind, data: snap, href: location.href });
    ssSet(SS.CTA,'1');
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
