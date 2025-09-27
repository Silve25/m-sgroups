/* formulaire.js — événements uniques → Apps Script
 * Evénements (1x / session) :
 * 1) page_loaded : envoi enrichi (IP/ville/pays) via pixel GET
 * 2) form_full   : quand les CTA deviennent "enabled"
 * 3) cta_click   : au premier clic (email OU whatsapp)
 *
 * Test: ajouter ?axdebug=1 à l’URL pour ignorer la dédup client.
 */
(function(){
  'use strict';

  var TG_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx3az1IwYpwlllXMaNz7C6vW8X4R9BCgq0zewmtXxF0ZsN79aOZWhfdgDyXbhGrzJlEgA/exec';
  var DEBUG = /\baxdebug=1\b/i.test(location.search);
  var SS = { SID:'ax_sid', OPEN:'ax_sent_open', FORM:'ax_sent_form', CTA:'ax_sent_cta' };

  var $  = function(s,root){ return (root||document).querySelector(s); };
  var trim = function(v){ return (v||'').toString().trim(); };
  var now  = function(){ return Date.now(); };

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
    var b64 = btoa(unescape(encodeURIComponent(utf8)));
    return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  // Transport: pixel GET unique (évite les courses et CORS)
  function sendEvent(event, payload){
    var bodyStr = JSON.stringify(Object.assign({ event: event, ts: now(), sid: SID }, payload||{}));
    try{ new Image().src = TG_ENDPOINT + '?data=' + b64url(bodyStr) + '&_t=' + now(); }catch(_){}
  }

  // IP enrichie
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

  // ===== DOM =====
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
    var countryCode = fCountry ? String(fCountry.value||'') : '';
    var countryName = '';
    if(fCountry){
      var opt = fCountry.options[fCountry.selectedIndex];
      countryName = opt ? trim(opt.textContent||opt.innerText||'') : '';
    }
    return {
      prenom:      trim(fFirst && fFirst.value),
      nom:         trim(fLast  && fLast.value),
      email:       trim(fEmail && fEmail.value),
      telephone:   trim(fPhone && fPhone.value),
      pays:        countryCode || countryName || '',
      pays_label:  countryName || '',
      montant_eur: fAmount ? Number(fAmount.value) : null,
      duree_mois:  fDur ? Number(fDur.value) : null,
      objet:       trim(fPurpose && fPurpose.value),
      consent:     !!(fConsent && fConsent.checked)
    };
  }

  // Trigger #1 — page_loaded (enrichi, 1 seul envoi)
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

    var watchdog = setTimeout(function(){
      if (sent) return;
      sendEvent('page_loaded', meta);
      ssSet(SS.OPEN,'1');
      sent = true;
    }, 1200);

    fetchIpInfo(1800).then(function(info){
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

  // Trigger #2 — form_full
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
  }

  function bindFormWatchers(){
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
    [fFirst,fLast,fEmail,fPhone,fCountry,fDur,fPurpose,fAmount,fConsent].forEach(function(el){
      if(!el) return;
      var evt = (el && (el.type==='checkbox' || (el.tagName||'').toUpperCase()==='SELECT')) ? 'change' : 'input';
      el.addEventListener(evt, maybeSendFormFull);
      el.addEventListener('change', maybeSendFormFull);
    });
    setTimeout(maybeSendFormFull, 0);
    window.addEventListener('load',      maybeSendFormFull);
    window.addEventListener('pageshow',  maybeSendFormFull);
  }

  // Trigger #3 — cta_click
  function sendCTAOnce(kind){
    if (ssHas(SS.CTA)) return;
    if (!ctasEnabled()) return;
    var snap = snapshotLead();
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

  function init(){ sendPageLoadedOnce(); bindFormWatchers(); bindCTAs(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
