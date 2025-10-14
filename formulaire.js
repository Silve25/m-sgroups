/* ============================================================================
 * MSGROUPS — Script principal (version autonome)
 * Compatible avec HTML fourni (id="lead-form", action="")
 * - Google Ads/GA4: page_loaded, form_full, cta_click, form_submit (+labels optionnels)
 * - Validation stricte (nom, email, téléphone intl, date + âge >= min)
 * - Étapes verrouillées + badges OK + “Suivant”
 * - Calcul prêt (mensualité, coût, total, date de fin) + sliders peints
 * - Persistance localStorage (7 jours) + restauration
 * - Lecteur vidéo (modal + erreur simulée unique après 2min)
 * - Carrousel témoignages + points
 * - Exit-intent (si form complet, >=90s, pas de clic CTA)
 * - Bannière FOMO texte fixe
 * - Smooth scroll ancres
 * - Soumission: e-mail prérempli (mailto)
 * ============================================================================ */

(function () {
  'use strict';

  // =========================
  // 0) CONFIG GLOBALE
  // =========================
  const CONFIG = {
    debugMode: true,
    minAge: 18,
    tauxInteret: 3,              // % / an (indicatif)
    videoLoadingTime: 120000,    // 2 min -> erreur simulée
    exitIntentDelay: 60000,      // (timer inoffensif, exit sur intention)
    lstoreKey: 'msgroups_form_v1',
    lstoreTTLms: 7 * 24 * 60 * 60 * 1000, // 7 jours
    emailTo: 'contact@msgroup.example',
    emailSubject: 'Demande de financement - MSGROUPS',
    promoText: "Offre valable jusqu'au 30 octobre 23:59"
  };

  // =========================
  // 1) Google Ads/Analytics
  // =========================
  const GADS = {
    adsId: 'AW-17600708002',
    convLabels: {
      page_loaded: null,
      form_full:   null,
      cta_click:   null,
      form_submit: null
    },
    events: {
      page_loaded: 'page_loaded',
      form_full:   'form_full',
      cta_click:   'cta_click',
      form_submit: 'form_submit'
    },
    ssKeys: {
      OPEN:   'ax_sent_open',
      FORM:   'ax_sent_form',
      CTA:    'ax_sent_cta',
      SUBMIT: 'ax_sent_submit'
    }
  };

  function gtagSafe() {
    if (typeof window.gtag !== 'function') return function(){};
    return window.gtag;
  }
  function fireEventOnce(ssKey, name, params){
    try {
      if (sessionStorage.getItem(ssKey)) return;
      sessionStorage.setItem(ssKey,'1');
    } catch(_) {}
    const g = gtagSafe();
    g('event', name, Object.assign({event_category:'lead_form', non_interaction:true}, params||{}));
    const label = GADS.convLabels[name];
    if (label) g('event','conversion', Object.assign({send_to:`${GADS.adsId}/${label}`}, params||{}));
  }
  function fireEvent(name, params){
    const g = gtagSafe();
    g('event', name, Object.assign({event_category:'lead_form'}, params||{}));
    const label = GADS.convLabels[name];
    if (label) g('event','conversion', Object.assign({send_to:`${GADS.adsId}/${label}`}, params||{}));
  }
  function trackPageLoadedOnce(){
    try {
      if (sessionStorage.getItem(GADS.ssKeys.OPEN)) return;
      sessionStorage.setItem(GADS.ssKeys.OPEN,'1');
    } catch(_){}
    fireEvent(GADS.events.page_loaded, {
      href: location.href,
      ref: document.referrer || '',
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_w: screen.width, screen_h: screen.height,
      dpr: window.devicePixelRatio || 1
    });
  }

  // =========================
  // 2) Sélecteurs DOM
  // =========================
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const form = $('#lead-form');

  // Champs
  const el = {
    prenom: $('#prenom'),
    nom: $('#nom'),
    dateNaissance: $('#date-naissance'),
    email: $('#email'),
    whatsapp: $('#whatsapp'),
    pays: $('#pays'),
    montant: $('#montant'),
    montantValue: $('#montant-value'),
    duree: $('#duree'),
    dureeValue: $('#duree-value'),
    raison: $('#raison'),
    statut: $('#statut'),
    revenus: $('#revenus'),
    piece1: $('#piece1'),
    piece2: $('#piece2'),
    piece3: $('#piece3'),
  };

  // État du formulaire
  const state = {
    step1Valid: false,
    step2Valid: false,
    step3Valid: false,
    formCompleted: false,
    validationErrors: { step1: [], step2: [], step3: [] },
    exitIntentShown: false,
    ctaClicked: false,
    pageStart: Date.now()
  };

  // =========================
  // 3) Helpers validation
  // =========================
  function isLeapYear(y){ return (y%4===0 && y%100!==0) || (y%400===0); }
  function getDaysInMonth(m, y){
    return {1:31,2:isLeapYear(y)?29:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31}[m] || 31;
  }
  function validateBirthDate(str){
    if (!str || str.length!==10) return {valid:false, age:0, error:'Format requis : JJ/MM/AAAA'};
    const [d,m,y] = str.split('/').map(n=>parseInt(n,10));
    if ([d,m,y].some(n=>Number.isNaN(n))) return {valid:false, age:0, error:'Date invalide'};
    const now = new Date();
    if (y < 1900 || y > now.getFullYear()) return {valid:false, age:0, error:`L'année doit être entre 1900 et ${now.getFullYear()}`};
    if (m<1 || m>12) return {valid:false, age:0, error:'Le mois doit être entre 01 et 12'};
    const maxD = getDaysInMonth(m,y);
    if (d<1 || d>maxD) return {valid:false, age:0, error:`${d}/${m}/${y} est invalide (max ${maxD})`};
    const bd = new Date(y, m-1, d);
    if (bd > now) return {valid:false, age:0, error:'La date ne peut pas être future'};
    let age = now.getFullYear()-y;
    const md = now.getMonth() - (m-1);
    const dd = now.getDate() - d;
    if (md < 0 || (md===0 && dd<0)) age--;
    if (age < CONFIG.minAge) return {valid:false, age, error:`Vous devez avoir au moins ${CONFIG.minAge} ans (vous avez ${age} ans)`};
    if (age > 120) return {valid:false, age, error:'Date de naissance improbable (>120 ans)'};
    return {valid:true, age, error:''};
  }
  function isValidEmail(email){
    const re=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(!re.test(email)) return false;
    const bad=['test.com','example.com','fake.com','temp.com','azerty.com'];
    const domain=(email.split('@')[1]||'').toLowerCase();
    if(bad.includes(domain)) return false;
    const tld=domain.split('.').pop();
    if(!tld || tld.length<2) return false;
    return true;
  }
  function isValidPhone(phone){
    const cleaned = (phone||'').replace(/\s+/g,'');
    if (!cleaned.startsWith('+')) return false;
    if (!/^\+\d{1,4}\d{6,14}$/.test(cleaned)) return false;
    const digits = cleaned.slice(1);
    if (/^(\d)\1+$/.test(digits)) return false;
    const bad = ['1234567890','0000000000','9999999999','1111111111'];
    if (bad.some(p=>cleaned.includes(p))) return false;
    return true;
  }
  function validateRaison(txt){
    const t=(txt||'').trim();
    if (t.length < 10) return {valid:false, error:'Minimum 10 caractères'};
    if (!/[a-zA-ZÀ-ÿ]/.test(t)) return {valid:false, error:'Doit contenir des lettres'};
    return {valid:true, error:''};
  }
  function validateName(n){
    const t=(n||'').trim();
    if (t.length<2) return {valid:false, error:'Minimum 2 caractères'};
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(t)) return {valid:false, error:'Caractères invalides'};
    return {valid:true, error:''};
  }

  // =========================
  // 4) Validations par étape
  // =========================
  function validateStep1(show=false){
    state.validationErrors.step1 = [];
    const prenomV = validateName(el.prenom.value);
    if (!el.prenom.value) state.validationErrors.step1.push('Prénom : champ vide');
    else if(!prenomV.valid) state.validationErrors.step1.push(`Prénom : ${prenomV.error}`);

    const nomV = validateName(el.nom.value);
    if (!el.nom.value) state.validationErrors.step1.push('Nom : champ vide');
    else if(!nomV.valid) state.validationErrors.step1.push(`Nom : ${nomV.error}`);

    const birthV = validateBirthDate(el.dateNaissance.value);
    if (!el.dateNaissance.value) state.validationErrors.step1.push('Date de naissance : champ vide');
    else if(!birthV.valid) state.validationErrors.step1.push(`Date de naissance : ${birthV.error}`);

    if (!el.email.value) state.validationErrors.step1.push('E-mail : champ vide');
    else if(!isValidEmail(el.email.value)) state.validationErrors.step1.push('E-mail : adresse invalide');

    if (!el.whatsapp.value) state.validationErrors.step1.push('WhatsApp : champ vide');
    else if(!isValidPhone(el.whatsapp.value)) state.validationErrors.step1.push('WhatsApp : numéro invalide (format international)');

    if (!el.pays.value) state.validationErrors.step1.push('Pays : non sélectionné');

    state.step1Valid = state.validationErrors.step1.length===0;
    if (CONFIG.debugMode && show && !state.step1Valid) console.log('❌ Étape 1', state.validationErrors.step1);

    refreshStepOKBadges();
    updateStepAccess();
    checkFormCompletion();
    return state.step1Valid;
  }

  function validateStep2(show=false){
    state.validationErrors.step2 = [];

    const montant = parseFloat(el.montant.value);
    if (Number.isNaN(montant) || montant<2000 || montant>200000)
      state.validationErrors.step2.push(`Montant : 2 000–200 000 € (actuel: ${montant||0} €)`);

    const duree = parseInt(el.duree.value,10);
    if (Number.isNaN(duree) || duree<6 || duree>120)
      state.validationErrors.step2.push(`Durée : 6–120 mois (actuel: ${duree||0})`);

    const r = validateRaison(el.raison.value);
    if (!el.raison.value) state.validationErrors.step2.push('Raison du projet : champ vide');
    else if(!r.valid) state.validationErrors.step2.push(`Raison du projet : ${r.error}`);

    state.step2Valid = state.validationErrors.step2.length===0;
    if (CONFIG.debugMode && show && !state.step2Valid) console.log('❌ Étape 2', state.validationErrors.step2);

    refreshStepOKBadges();
    updateStepAccess();
    checkFormCompletion();
    return state.step2Valid;
  }

  function validateStep3(show=false){
    state.validationErrors.step3 = [];
    if (!el.statut.value) state.validationErrors.step3.push('Statut professionnel : non sélectionné');
    if (!el.revenus.value) state.validationErrors.step3.push('Revenus réguliers : non sélectionné');
    state.step3Valid = state.validationErrors.step3.length===0;
    if (CONFIG.debugMode && show && !state.step3Valid) console.log('❌ Étape 3', state.validationErrors.step3);

    refreshStepOKBadges();
    checkFormCompletion();
    return state.step3Valid;
  }

  // =========================
  // 5) Calcul & sliders
  // =========================
  function calculerMensualite(montant, dureeMois, tauxAnnuel){
    const tm = tauxAnnuel/100/12;
    return (montant*tm)/(1-Math.pow(1+tm, -dureeMois));
  }
  function getDateFin(dureeMois){
    const d=new Date(); d.setMonth(d.getMonth()+parseInt(dureeMois||0,10));
    return d.toLocaleDateString('fr-FR',{year:'numeric', month:'long'});
  }
  const fmtEuro = (n)=> (Number(n)||0).toLocaleString('fr-FR',{minimumFractionDigits:2, maximumFractionDigits:2})+' €';
  const fmtMontant = (v)=> (v||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' €';

  function paintRange(input){
    if(!input) return;
    const min=+input.min||0, max=+input.max||100, val=+input.value||0;
    const pct=((val-min)*100)/(max-min);
    input.style.background=`linear-gradient(to right, var(--brand) 0%, var(--brand) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;
  }

  function afficherResumePret(){
    const montant = parseFloat(el.montant.value||'0');
    const duree   = parseInt(el.duree.value||'0',10);
    const taux    = CONFIG.tauxInteret;

    const mensualite = calculerMensualite(montant, duree, taux);
    const coutTotal  = mensualite * duree;
    const coutCredit = coutTotal - montant;
    const dateFin    = getDateFin(duree);

    let resume = $('#resume-pret');
    if (!resume){
      resume = document.createElement('div');
      resume.id='resume-pret';
      resume.style.cssText = `
        margin-top:1.2rem;padding:1rem;background:linear-gradient(135deg,#f7f8fb,#e6e8ef);
        border-left:4px solid var(--brand);border-radius:10px;font-size:.9rem;line-height:1.8;`;
      const raisonGroup = el.raison.closest('.form-group');
      raisonGroup.parentNode.insertBefore(resume, raisonGroup.nextSibling);
    }
    resume.innerHTML = `
      <div style="font-weight:600;color:var(--brand);margin-bottom:.6rem;font-size:1rem;">📊 Estimation de votre prêt</div>
      <div><strong>Vous souhaitez emprunter ${fmtEuro(montant)}</strong> sur <strong>${duree} mois</strong>.</div>
      <div style="margin-top:.4rem;color:var(--muted);font-size:.85rem;">Au taux indicatif de <strong>${taux}%</strong> par an :</div>
      <div style="margin-top:.6rem;padding:.7rem;background:#fff;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:.4rem;">
          <span style="color:var(--muted);">Mensualité :</span>
          <strong style="color:var(--brand);font-size:1.05rem;">${fmtEuro(mensualite)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:.4rem;padding-top:.5rem;border-top:1px dashed var(--line);">
          <span style="color:var(--muted);">Coût du crédit :</span>
          <strong>${fmtEuro(coutCredit)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:.5rem;border-top:1px dashed var(--line);">
          <span style="color:var(--muted);">Total à rembourser :</span>
          <strong>${fmtEuro(coutTotal)}</strong>
        </div>
      </div>
      <div style="margin-top:.6rem;color:var(--muted);font-size:.85rem;">Dernier paiement prévu en <strong>${dateFin}</strong></div>
      <div style="margin-top:.6rem;padding-top:.6rem;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem;font-style:italic;">
        ⚠️ Estimation indicative basée sur ${taux}%. Le taux final dépendra de votre dossier.
      </div>
    `;
  }

  function bindSliders(){
    if (el.montant && el.montantValue){
      el.montantValue.textContent = fmtMontant(+el.montant.value||0);
      paintRange(el.montant);
      el.montant.addEventListener('input', ()=>{
        el.montantValue.textContent = fmtMontant(+el.montant.value||0);
        paintRange(el.montant);
        afficherResumePret(); validateStep2(); saveFormData();
      });
    }
    if (el.duree && el.dureeValue){
      el.dureeValue.textContent = (el.duree.value||0) + ' mois';
      paintRange(el.duree);
      el.duree.addEventListener('input', ()=>{
        el.dureeValue.textContent = (el.duree.value||0) + ' mois';
        paintRange(el.duree);
        afficherResumePret(); validateStep2(); saveFormData();
      });
    }
  }

  // =========================
  // 6) Étapes, badges, “Suivant”
  // =========================
  function ensureOKBadge(summaryEl){
    if (!summaryEl) return null;
    let badge = summaryEl.querySelector('.ok-badge');
    if (!badge){
      badge = document.createElement('span');
      badge.className='ok-badge';
      badge.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#16a34a" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;
      badge.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;margin-left:8px;vertical-align:middle;';
      summaryEl.appendChild(badge);
    }
    return badge;
  }
  function refreshStepOKBadges(){
    const details = $$('details');
    if (details.length>=3){
      const b1=ensureOKBadge(details[0].querySelector('summary'));
      const b2=ensureOKBadge(details[1].querySelector('summary'));
      const b3=ensureOKBadge(details[2].querySelector('summary'));
      if (b1) b1.style.visibility = state.step1Valid?'visible':'hidden';
      if (b2) b2.style.visibility = state.step2Valid?'visible':'hidden';
      if (b3) b3.style.visibility = state.step3Valid?'visible':'hidden';
    }
  }
  function updateStepAccess(){
    const details = $$('details');
    if (details.length<3) return;
    const s1=details[0].querySelector('summary');
    const s2=details[1].querySelector('summary');
    const s3=details[2].querySelector('summary');
    if (!state.step1Valid){
      details[1].removeAttribute('open'); s2.style.opacity='.5'; s2.style.cursor='not-allowed';
    }else{ s2.style.opacity='1'; s2.style.cursor='pointer'; }
    if (!state.step1Valid || !state.step2Valid){
      details[2].removeAttribute('open'); s3.style.opacity='.5'; s3.style.cursor='not-allowed';
    }else{ s3.style.opacity='1'; s3.style.cursor='pointer'; }
  }
  function createNextButtons(){
    const ds = $$('details');
    ds.forEach((d, idx)=>{
      if (idx === ds.length-1) return;
      const content = d.querySelector('.step-content');
      if (!content) return;
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='btn-next-step';
      btn.textContent='Suivant →';
      btn.style.cssText='margin-top:1rem;padding:.8rem 2rem;background:var(--brand);color:#fff;border:none;border-radius:12px;font-weight:600;cursor:pointer;width:100%;max-width:300px;margin-left:auto;margin-right:auto;';
      btn.addEventListener('click', ()=>{
        let ok=false, errs=[];
        if (idx===0){ ok=validateStep1(true); errs=state.validationErrors.step1; }
        else if (idx===1){ ok=validateStep2(true); errs=state.validationErrors.step2; }
        if (!ok){
          notify('Informations incomplètes', 'Veuillez corriger :\n\n• '+errs.join('\n• '), 'warning');
          return;
        }
        d.open=false; const next = ds[idx+1]; if (next){ next.open=true; next.scrollIntoView({behavior:'smooth', block:'start'}); }
      });
      content.appendChild(btn);
    });
  }
  function preventStepOpening(){
    const ds=$$('details');
    ds.forEach((d, idx)=>{
      d.addEventListener('toggle', function(e){
        if (!this.open) return;
        if (idx===1 && !state.step1Valid){ e.preventDefault(); this.open=false; notify('Étape 1 incomplète','Complétez l’étape 1.','warning'); }
        if (idx===2 && (!state.step1Valid || !state.step2Valid)){ e.preventDefault(); this.open=false; notify('Étapes incomplètes','Complétez les étapes 1 et 2.','warning'); }
      });
    });
  }
  function checkFormCompletion(){
    const prev = state.formCompleted;
    state.formCompleted = state.step1Valid && state.step2Valid && state.step3Valid;
    if (state.formCompleted && !prev){
      fireEventOnce(GADS.ssKeys.FORM, GADS.events.form_full, {
        form_status:'complete', href: location.href,
        lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      if (!exitIntentTimer) startExitIntentTimer();
    }
  }

  // =========================
  // 7) Vidéos (modal + erreur)
  // =========================
  const singleVideoError = {
    title:'Problème réseau détecté',
    message:'Votre connexion semble instable. Veuillez vérifier votre connexion internet et réessayer ultérieurement.',
    code:'ERR_NETWORK_UNSTABLE'
  };
  function showVideoPlayer(author, locationTxt, durationTxt){
    const modal = document.createElement('div');
    modal.id='video-player-modal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
      <div style="background:#1a1a1a;max-width:900px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);">
        <div style="background:#2a2a2a;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3a3a3a;">
          <div>
            <div style="color:#fff;font-weight:600">${author||''}</div>
            <div style="color:#aaa;font-size:.85rem">📍 ${locationTxt||''} • ⏱️ ${durationTxt||''}</div>
          </div>
          <button id="close-video-modal" style="background:transparent;border:none;color:#888;font-size:1.5rem;cursor:pointer;width:40px;height:40px;">✕</button>
        </div>
        <div id="video-player-container" style="aspect-ratio:16/9;background:#000;display:flex;align-items:center;justify-content:center;position:relative;">
          <div id="video-loader" style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
            <div style="width:60px;height:60px;border:4px solid #333;border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;"></div>
            <div style="color:#fff;font-size:.95rem;">Chargement de la vidéo...</div>
          </div>
          <div id="video-error" style="display:none;flex-direction:column;align-items:center;gap:1rem;padding:2rem;text-align:center;max-width:520px;">
            <div style="font-size:48px;line-height:1;">⚠️</div>
            <div style="color:#fff;font-size:1.2rem;font-weight:600;">${singleVideoError.title}</div>
            <div style="color:#aaa;font-size:.95rem;line-height:1.6;">${singleVideoError.message}</div>
            <div style="margin-top:.5rem;padding:.4rem .6rem;background:#2a2a2a;border-radius:8px;font-family:monospace;font-size:.85rem;color:#dc2626;">Code: ${singleVideoError.code}</div>
            <button id="retry-video" style="margin-top:.6rem;padding:.7rem 2rem;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">🔄 Réessayer</button>
          </div>
        </div>
      </div>`;
    const style = document.createElement('style');
    style.textContent='@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
    document.body.appendChild(modal);
    setTimeout(()=>{ $('#video-loader').style.display='none'; $('#video-error').style.display='flex'; }, CONFIG.videoLoadingTime);
    $('#close-video-modal').addEventListener('click', ()=> modal.remove());
    $('#retry-video').addEventListener('click', ()=>{
      $('#video-error').style.display='none';
      $('#video-loader').style.display='flex';
      setTimeout(()=>{ $('#video-loader').style.display='none'; $('#video-error').style.display='flex'; }, CONFIG.videoLoadingTime);
    });
    modal.addEventListener('click', e=>{ if(e.target===modal) modal.remove(); });
    const esc=(e)=>{ if(e.key==='Escape'){ modal.remove(); document.removeEventListener('keydown',esc);} };
    document.addEventListener('keydown', esc);
  }
  function setupVideoPlayers(){
    $$('.video-card').forEach(card=>{
      card.setAttribute('tabindex','0');
      card.addEventListener('click', ()=>{
        const author = card.querySelector('.video-author')?.textContent||'';
        const locationTxt = card.querySelector('.video-location')?.textContent||'';
        const durationTxt = card.querySelector('.video-duration')?.textContent||'';
        showVideoPlayer(author, locationTxt, durationTxt);
      });
      card.addEventListener('keypress', (e)=>{ if(e.key==='Enter' || e.key===' ') card.click(); });
    });
  }

  // =========================
  // 8) Carrousel témoignages
  // =========================
  function setupCarousel(){
    const carousel = $('.testimonials-carousel');
    const dots = $$('.carousel-dot');
    if (!carousel || dots.length===0) return;
    let current = 0;
    function goTo(idx){
      const slides = $$('.testimonial-slide');
      if (idx<0 || idx>=slides.length) return;
      current = idx;
      const slideWidth = carousel.scrollWidth / slides.length;
      carousel.scrollTo({left: slideWidth*current, behavior:'smooth'});
      dots.forEach((d,i)=>{ if(i===current) d.classList.add('active'); else d.classList.remove('active'); });
    }
    dots.forEach((d,i)=> d.addEventListener('click', ()=>goTo(i)));
  }

  // =========================
  // 9) Persistance
  // =========================
  function saveFormData(){
    if (!form) return;
    const data = {};
    Array.from(form.elements).forEach(elm=>{
      if(!elm.name && !elm.id) return;
      const key = elm.id || elm.name;
      if (elm.type==='checkbox') data[key]=!!elm.checked;
      else if (elm.type==='radio'){ if(elm.checked) data[key]=elm.value; }
      else data[key]=elm.value;
    });
    data.__ts = Date.now();
    try{ localStorage.setItem(CONFIG.lstoreKey, JSON.stringify(data)); }catch(_){}
  }
  function loadFormData(){
    if (!form) return;
    let data=null;
    try { data = JSON.parse(localStorage.getItem(CONFIG.lstoreKey)||'null'); } catch(_){}
    if (!data) return;
    if (Date.now() - (data.__ts||0) > CONFIG.lstoreTTLms) { try{localStorage.removeItem(CONFIG.lstoreKey);}catch(_){ } return; }
    Array.from(form.elements).forEach(elm=>{
      const key = elm.id || elm.name;
      if (!(key in data)) return;
      const val = data[key];
      if (elm.type==='checkbox') elm.checked=!!val;
      else if (elm.type==='radio') elm.checked = (elm.value===val);
      else elm.value = val;
      elm.dispatchEvent(new Event('input', {bubbles:true}));
      elm.dispatchEvent(new Event('change', {bubbles:true}));
    });
  }
  function clearFormData(){ try{ localStorage.removeItem(CONFIG.lstoreKey); }catch(_){} }

  // =========================
  // 10) Date input format JJ/MM/AAAA
  // =========================
  function setupDateFormatting(){
    if (!el.dateNaissance) return;
    el.dateNaissance.type='text';
    el.dateNaissance.placeholder='JJ/MM/AAAA';
    el.dateNaissance.maxLength=10;
    el.dateNaissance.addEventListener('input', (e)=>{
      let v=e.target.value.replace(/\D/g,'');
      if (v.length>=2) v=v.slice(0,2)+'/'+v.slice(2);
      if (v.length>=5) v=v.slice(0,5)+'/'+v.slice(5,9);
      e.target.value=v; saveFormData();
    });
    el.dateNaissance.addEventListener('blur', function(){
      const v = validateBirthDate(this.value);
      if (this.value && !v.valid){ this.setCustomValidity(v.error); this.style.borderColor='#dc2626'; }
      else { this.setCustomValidity(''); this.style.borderColor=''; validateStep1(); }
    });
  }

  // =========================
  // 11) Bannière promo (texte fixe)
  // =========================
  function setupPromoBanner(){
    const b = $('.promo-banner');
    if (!b) return;
    b.textContent = CONFIG.promoText;
    b.style.background = '#000';
    b.style.color = '#fff';
    b.style.fontWeight = '600';
  }

  // =========================
  // 12) Notifications
  // =========================
  function notify(title, message, type='info'){
    const icons = {info:'ℹ️', success:'✅', warning:'⚠️', error:'❌'};
    alert(`${icons[type]||'ℹ️'} ${title}\n\n${message}`);
  }

  // =========================
  // 13) Smooth scroll + ancres
  // =========================
  function setupAnchors(){
    $$('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', function(e){
        const href=this.getAttribute('href');
        if (href==='#' || href==='#!') return;
        const target=$(href);
        if (target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
      });
    });
  }

  // =========================
  // 14) Exit-Intent
  // =========================
  let exitIntentTimer=null;
  function startExitIntentTimer(){ exitIntentTimer = setTimeout(()=>{}, CONFIG.exitIntentDelay); }
  function showExitIntentPopup(){
    if (state.exitIntentShown || !state.formCompleted) return;
    const elapsed = (Date.now()-state.pageStart)/1000;
    if (elapsed<90 || state.ctaClicked) return;
    state.exitIntentShown = true;

    const montant = fmtMontant(+el.montant.value||0);
    const duree = el.duree.value||'—';
    const deadline = new Date(); deadline.setHours(deadline.getHours()+72);
    const deadlineStr = deadline.toLocaleDateString('fr-FR',{day:'numeric', month:'long'});

    const pop = document.createElement('div');
    pop.id='exit-intent-popup';
    pop.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
    pop.innerHTML = `
      <div style="background:#fff;max-width:500px;width:100%;border-radius:16px;padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">🤭</div>
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:1rem;">Oups ! Vous partez déjà ?</h2>
        <p style="color:var(--muted);margin-bottom:1rem;">Votre demande de <strong style="color:var(--brand);">${montant}</strong> sur <strong>${duree} mois</strong> est prête.</p>
        <p style="font-weight:600;margin-bottom:1.2rem;padding:1rem;background:#f7f8fb;border-radius:10px;">
          ⏰ Obtenez vos ${montant} avant le<br><span style="color:var(--brand);font-size:1.05rem;">${deadlineStr}</span>
        </p>
        <button id="exit-intent-cta" style="width:100%;padding:1rem;background:var(--accent);color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;margin-bottom:.6rem;">📨 Finaliser ma demande maintenant</button>
        <button id="exit-intent-close" style="background:transparent;border:none;color:var(--muted);text-decoration:underline;cursor:pointer;">Non merci</button>
      </div>`;
    document.body.appendChild(pop);
    $('#exit-intent-cta').addEventListener('click', ()=>{
      pop.remove();
      const submitBtn = $('.cta-submit');
      if (submitBtn){ state.ctaClicked=true; submitBtn.scrollIntoView({behavior:'smooth',block:'center'}); submitBtn.style.animation='pulse 1s ease 3'; }
    });
    $('#exit-intent-close').addEventListener('click', ()=> pop.remove());
    pop.addEventListener('click', (e)=>{ if(e.target===pop) pop.remove(); });
  }
  document.addEventListener('mouseleave', (e)=>{ if (e.clientY<10) showExitIntentPopup(); });
  window.addEventListener('beforeunload', (e)=>{
    const elapsed=(Date.now()-state.pageStart)/1000;
    if (!state.exitIntentShown && state.formCompleted && !state.ctaClicked && elapsed>=90){
      e.preventDefault(); e.returnValue=''; showExitIntentPopup();
    }
  });

  // =========================
  // 15) Real-time + Persistance
  // =========================
  function setupRealTime(){
    $$('input, select, textarea').forEach(inp=>{
      inp.addEventListener('change', saveFormData);
      if (inp.tagName!=='SELECT') inp.addEventListener('input', saveFormData);
    });

    // Étape 1 champs : revalider à la volée
    [el.prenom, el.nom, el.dateNaissance, el.email, el.whatsapp, el.pays].forEach(i=>{
      if (!i) return;
      i.addEventListener('blur', ()=> validateStep1());
      i.addEventListener('change', ()=> validateStep1());
    });

    // Contraintes individuelles
    if (el.email){
      el.email.addEventListener('blur', function(){
        if (this.value && !isValidEmail(this.value)){ this.setCustomValidity('Adresse e-mail invalide'); this.style.borderColor='#dc2626'; }
        else { this.setCustomValidity(''); this.style.borderColor=''; }
      });
    }
    if (el.whatsapp){
      el.whatsapp.addEventListener('blur', function(){
        if (this.value && !isValidPhone(this.value)){ this.setCustomValidity('Numéro invalide'); this.style.borderColor='#dc2626'; }
        else { this.setCustomValidity(''); this.style.borderColor=''; }
      });
    }
    if (el.raison){
      el.raison.addEventListener('input', ()=> validateStep2());
      el.raison.addEventListener('blur', function(){
        const v=validateRaison(this.value);
        if (this.value && !v.valid){ this.setCustomValidity(v.error); this.style.borderColor='#dc2626'; }
        else { this.setCustomValidity(''); this.style.borderColor=''; }
      });
    }
    [el.statut, el.revenus].forEach(s=>{ if(s) s.addEventListener('change', ()=> validateStep3()); });
  }

  // =========================
  // 16) Tracking CTA (header/hero/submit)
  // =========================
  function snapshotLead(){ return {
    pays: el.pays?.value||'',
    montant: parseFloat(el.montant?.value||'0')||0,
    duree: parseInt(el.duree?.value||'0',10)||0
  }; }
  function bindCtaTracking(){
    const headerCTA = $('.cta-header');
    const heroCTA = $('.cta-primary');
    const submitBtn = $('.cta-submit');

    function sendOnce(){
      try { if (sessionStorage.getItem(GADS.ssKeys.CTA)) return false; sessionStorage.setItem(GADS.ssKeys.CTA,'1'); }
      catch(_){}
      return true;
    }

    if (headerCTA) headerCTA.addEventListener('click', ()=>{
      if (!sendOnce()) return;
      state.ctaClicked = true;
      fireEvent(GADS.events.cta_click, Object.assign({which:'header', href:location.href}, snapshotLead()));
    });
    if (heroCTA) heroCTA.addEventListener('click', ()=>{
      if (!sendOnce()) return;
      state.ctaClicked = true;
      fireEvent(GADS.events.cta_click, Object.assign({which:'hero', href:location.href}, snapshotLead()));
    });
    if (submitBtn) submitBtn.addEventListener('click', ()=>{
      if (!sendOnce()) return;
      state.ctaClicked = true;
      fireEvent(GADS.events.cta_click, Object.assign({which:'submit', href:location.href}, snapshotLead()));
    });
  }

  // =========================
  // 17) Soumission (mailto)
  // =========================
  function buildPrefilledEmail(){
    const prenom=(el.prenom.value||'').trim();
    const nom=(el.nom.value||'').trim();
    const fullName=`${prenom} ${nom}`.trim();
    const lines = [
      'Bonjour,',
      '',
      'Je me permets de vous contacter pour une demande de financement auprès de MSGROUPS.',
      `Je m'appelle ${fullName||'—'}, né(e) le ${el.dateNaissance.value||'—'}, et je réside en ${el.pays.value||'—'}.`,
      `Je souhaite obtenir un financement d'un montant de ${fmtMontant(parseFloat(el.montant.value||'0'))} sur ${el.duree.value||'—'} mois${el.raison.value?` pour ${el.raison.value}.`:`.`}`,
      `Ma mensualité estimée (taux indicatif ${CONFIG.tauxInteret}%/an) serait de ${fmtEuro(calculerMensualite(parseFloat(el.montant.value||'0'), parseInt(el.duree.value||'0',10), CONFIG.tauxInteret))}.`,
      '',
      'Voici mes coordonnées :',
      `• E-mail : ${el.email.value||'—'}`,
      `• WhatsApp : ${el.whatsapp.value||'—'}`,
      '',
      `Statut : ${el.statut.value||'—'}${el.revenus.value?`, ${el.revenus.value.toLowerCase()}`:''}`,
      `Pièces : ${[el.piece1?.checked?'carte d\'identité':null, el.piece2?.checked?'preuve de revenus':null, el.piece3?.checked?'relevé bancaire récent':null].filter(Boolean).join(' et ') || 'sur demande'}.`,
      '',
      'Bien cordialement,',
      `${fullName||''}`
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const subject = encodeURIComponent(CONFIG.emailSubject);
    const to = encodeURIComponent(CONFIG.emailTo);
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }

  function bindSubmit(){
    if (!form) return;
    form.setAttribute('novalidate','novalidate');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();

      const ok1 = validateStep1(true);
      const ok2 = validateStep2(true);
      const ok3 = validateStep3(true);
      if (!(ok1 && ok2 && ok3)){
        const parts=[];
        if (state.validationErrors.step1.length) parts.push('ÉTAPE 1 :\n  • '+state.validationErrors.step1.join('\n  • '));
        if (state.validationErrors.step2.length) parts.push('ÉTAPE 2 :\n  • '+state.validationErrors.step2.join('\n  • '));
        if (state.validationErrors.step3.length) parts.push('ÉTAPE 3 :\n  • '+state.validationErrors.step3.join('\n  • '));
        notify('Formulaire incomplet', parts.join('\n\n'), 'error');
        return;
      }

      // Tracking submit (1 seule fois)
      fireEventOnce(GADS.ssKeys.SUBMIT, GADS.events.form_submit, {href:location.href});

      // Ouvre le client mail
      const mailto = buildPrefilledEmail();
      window.location.href = mailto;

      // Nettoyage + feedback
      setTimeout(()=>{
        clearFormData();
        notify('✅ Demande prête dans votre messagerie', 'Veuillez vérifier votre application e-mail (brouillon ouvert).', 'success');
      }, 600);
    });
  }

  // =========================
  // 18) Divers
  // =========================
  function injectSummaryHoverStyle(){
    const s=document.createElement('style');
    s.textContent = `
      details > summary { padding:1rem .75rem !important; border-radius:10px; }
      details > summary:hover { background:rgba(30,102,255,.06); }
    `;
    document.head.appendChild(s);
  }

  // =========================
  // 19) INIT
  // =========================
  function init(){
    if (CONFIG.debugMode) console.log('🚀 Initialisation MSGROUPS…');

    setupPromoBanner();
    setupAnchors();
    setupVideoPlayers();
    setupCarousel();
    injectSummaryHoverStyle();

    // Sliders & calcul
    bindSliders();
    setTimeout(()=>{ afficherResumePret(); }, 150);

    // Étapes & UI
    createNextButtons();
    preventStepOpening();
    refreshStepOKBadges();
    updateStepAccess();

    // Persistance
    loadFormData();
    setupDateFormatting();
    setupRealTime();

    // Tracking
    bindCtaTracking();
    trackPageLoadedOnce();

    // Soumission
    bindSubmit();

    if (CONFIG.debugMode) console.log('✅ MSGROUPS — prêt.');
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
