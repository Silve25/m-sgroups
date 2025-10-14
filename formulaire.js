/**
 * ============================================
 * MSGROUP - Demande de financement
 * Script principal - formulaire.js (version Ads, sans Apps Script)
 * ============================================
 * - Supprime les envois vers Apps Script (anciens/nouveaux)
 * - Tracking Google Ads via gtag(): page_loaded, form_full, cta_click, form_submit
 * - Countbar FOMO : texte fixe "Offre valable jusqu'au 30 octobre 23:59" (pas de minuteur)
 * - Conserve toutes les fonctionnalités UI/validation/localStorage/vidéo/etc.
 */

(function() {
    'use strict';

    // ========================================
    // 0. GOOGLE ADS / ANALYTICS — HELPERS
    // ========================================

    // ID Ads déjà présent dans le HTML: gtag('config','AW-17600708002')
    const GADS = {
        adsId: 'AW-17600708002',
        // Optionnel: ajoute ici tes labels de conversion si tu veux envoyer 'conversion' au lieu d'events custom
        // Exemple: form_submit: 'AbCdEfGhIjkLmNoP'
        convLabels: {
            page_loaded: null,
            form_full:   null,
            cta_click:   null,
            form_submit: null
        },
        // Noms d'événements personnalisés faciles à lire dans GA4/Ads
        events: {
            page_loaded: 'page_loaded',
            form_full:   'form_full',
            cta_click:   'cta_click',
            form_submit: 'form_submit'
        },
        // Déduplication session (équivalent aux flags SS.*)
        ssKeys: {
            OPEN:  'ax_sent_open',
            FORM:  'ax_sent_form',
            CTA:   'ax_sent_cta',
            SUBMIT:'ax_sent_submit'
        }
    };

    function gtagSafe(){
        // noop si gtag absent
        if (typeof window.gtag !== 'function') return function(){};
        return window.gtag;
    }

    function fireEventOnce(ssKey, name, params){
        try {
            if (sessionStorage.getItem(ssKey)) return;
            sessionStorage.setItem(ssKey,'1');
        } catch(_) { /* storage bloqué ? on envoie quand même */ }
        const g = gtagSafe();
        // Envoi event custom (toujours)
        g('event', name, Object.assign({
            event_category: 'lead_form',
            non_interaction: true
        }, params || {}));

        // Envoi conversion Ads si label fourni (facultatif)
        const label = GADS.convLabels[name];
        if (label) {
            g('event', 'conversion', Object.assign({
                send_to: `${GADS.adsId}/${label}`
            }, params || {}));
        }
    }

    function fireEvent(name, params){
        const g = gtagSafe();
        g('event', name, Object.assign({
            event_category: 'lead_form'
        }, params || {}));

        const label = GADS.convLabels[name];
        if (label) {
            g('event', 'conversion', Object.assign({
                send_to: `${GADS.adsId}/${label}`
            }, params || {}));
        }
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
        minWordsRaison: 1, // non utilisé désormais (garde-compat)
        exitIntentDelay: 60000,
        // countdown retiré → on affiche un texte fixe dans la bannière
        videoLoadingTime: 120000, // 2 minutes avant l'erreur vidéo
        debugMode: true
    };

    const ICONS = {
        ok: 'https://img.icons8.com/?size=100&id=YZHzhN7pF7Dw&format=png&color=16a34a',
        warning: 'https://img.icons8.com/?size=100&id=undefined&format=png&color=000000' // fallback
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
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
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
        const domain = email.split('@')[1] || '';
        if (suspiciousDomains.includes(domain)) return false;
        const domainParts = domain.split('.');
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) return false;
        return true;
    }

    function isValidPhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
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
        const trimmed = raison.trim();
        if (trimmed.length < 3) return { valid: false, error: 'Minimum 3 caractères requis' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Doit contenir des lettres' };
        return { valid: true, error: '' };
    }

    function validateName(name) {
        const trimmed = name.trim();
        if (trimmed.length < 2) return { valid: false, error: 'Minimum 2 caractères' };
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
        if (!nameRegex.test(trimmed)) return { valid: false, error: 'Caractères invalides détectés' };
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(trimmed);
        if (!hasLetters) return { valid: false, error: 'Doit contenir des lettres' };
        return { valid: true, error: '' };
    }

    function validateStep1() {
        formState.validationErrors.step1 = [];

        const prenom = document.getElementById('prenom').value.trim();
        const nom = document.getElementById('nom').value.trim();
        const dateNaissance = document.getElementById('date-naissance').value.trim();
        const email = document.getElementById('email').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        const pays = document.getElementById('pays').value;

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

        if (CONFIG.debugMode && formState.validationErrors.step1.length > 0) {
            console.log('❌ Étape 1 - Erreurs:', formState.validationErrors.step1);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        return formState.step1Valid;
    }

    function validateStep2() {
        formState.validationErrors.step2 = [];

        const montant = parseFloat(document.getElementById('montant').value);
        const duree = parseInt(document.getElementById('duree').value);
        const raison = document.getElementById('raison').value.trim();

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

        if (CONFIG.debugMode && formState.validationErrors.step2.length > 0) {
            console.log('❌ Étape 2 - Erreurs:', formState.validationErrors.step2);
        }

        refreshStepOKBadges();
        updateStepAccess();
        checkFormCompletion();

        return formState.step2Valid;
    }

    function validateStep3() {
        formState.validationErrors.step3 = [];

        const statut = document.getElementById('statut').value;
        const revenus = document.getElementById('revenus').value;

        if (!statut) formState.validationErrors.step3.push('Statut professionnel : non sélectionné');
        if (!revenus) formState.validationErrors.step3.push('Revenus réguliers : non sélectionné');

        formState.step3Valid = formState.validationErrors.step3.length === 0;

        if (CONFIG.debugMode && formState.validationErrors.step3.length > 0) {
            console.log('❌ Étape 3 - Erreurs:', formState.validationErrors.step3);
        }

        refreshStepOKBadges();
        checkFormCompletion();

        return formState.step3Valid;
    }

    // ========================================
    // 4. LECTEUR VIDÉO (erreur unique après 2 min)
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
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: #1a1a1a; max-width: 900px; width: 100%;
                border-radius: 12px; overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="
                    background: #2a2a2a; padding: 1rem 1.5rem;
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #3a3a3a;
                ">
                    <div>
                        <div style="color: white; font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">
                            ${author}
                        </div>
                        <div style="color: #888; font-size: 0.85rem;">
                            📍 ${location} • ⏱️ ${duration}
                        </div>
                    </div>
                    <button id="close-video-modal" style="
                        background: transparent; border: none; color: #888;
                        font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px;
                        display: flex; align-items: center; justify-content: center;
                        border-radius: 8px; transition: all 0.2s;
                    " title="Fermer">✕</button>
                </div>

                <div id="video-player-container" style="
                    aspect-ratio: 16/9; background: #000; display: flex;
                    align-items: center; justify-content: center; position: relative;
                ">
                    <div id="video-loader" style="
                        display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
                    ">
                        <div style="
                            width: 60px; height: 60px; border: 4px solid #333;
                            border-top-color: white; border-radius: 50%;
                            animation: spin 1s linear infinite;
                        "></div>
                        <div style="color: white; font-size: 0.95rem;">
                            Chargement de la vidéo...
                        </div>
                    </div>

                    <div id="video-error" style="
                        display: none; flex-direction: column; align-items: center; gap: 1rem;
                        padding: 2rem; text-align: center; max-width: 520px;
                    ">
                        <div style="display:flex;align-items:center;justify-content:center;">
                            <img id="video-warning-icon" src="${ICONS.warning}" alt="Avertissement" style="width:64px;height:64px;display:block;"/>
                        </div>
                        <div style="color: white; font-size: 1.3rem; font-weight: 600; margin-top: 0.5rem;">
                            ${singleVideoError.title}
                        </div>
                        <div style="color: #aaa; font-size: 0.95rem; line-height: 1.6;">
                            ${singleVideoError.message}
                        </div>
                        <div style="
                            margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: #2a2a2a;
                            border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: #dc2626;
                        ">
                            Code: ${singleVideoError.code}
                        </div>
                        <button id="retry-video" style="
                            margin-top: 0.75rem; padding: 0.75rem 2rem; background: #3b82f6; color: white;
                            border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600;
                            cursor: pointer; transition: all 0.2s;
                        ">🔄 Réessayer</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            #close-video-modal:hover { background:#3a3a3a!important; color:white!important; }
            #retry-video:hover { background:#2563eb!important; transform: translateY(-2px); }
        `;
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
            document.getElementById('video-loader').style.display = 'none';
            document.getElementById('video-error').style.display = 'flex';
        }, CONFIG.videoLoadingTime);

        document.getElementById('close-video-modal').addEventListener('click', () => modal.remove());
        document.getElementById('retry-video').addEventListener('click', () => {
            document.getElementById('video-error').style.display = 'none';
            document.getElementById('video-loader').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('video-loader').style.display = 'none';
                document.getElementById('video-error').style.display = 'flex';
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
                const author = this.querySelector('.video-author').textContent;
                const location = this.querySelector('.video-location').textContent;
                const duration = this.querySelector('.video-duration').textContent;
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
    // 6. LOCAL STORAGE
    // ========================================

    const STORAGE_KEY = 'msgroup_form_data';

    function saveFormData() {
        const formData = {
            prenom: document.getElementById('prenom')?.value || '',
            nom: document.getElementById('nom')?.value || '',
            dateNaissance: document.getElementById('date-naissance')?.value || '',
            email: document.getElementById('email')?.value || '',
            whatsapp: document.getElementById('whatsapp')?.value || '',
            pays: document.getElementById('pays')?.value || '',
            montant: document.getElementById('montant')?.value || '10000',
            duree: document.getElementById('duree')?.value || '36',
            raison: document.getElementById('raison')?.value || '',
            statut: document.getElementById('statut')?.value || '',
            revenus: document.getElementById('revenus')?.value || '',
            piece1: document.getElementById('piece1')?.checked || false,
            piece2: document.getElementById('piece2')?.checked || false,
            piece3: document.getElementById('piece3')?.checked || false,
            timestamp: Date.now()
        };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formData)); } catch(_){}
    }

    function loadFormData() {
        let saved;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch(_){}
        if (!saved) return;
        try {
            const formData = JSON.parse(saved);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - formData.timestamp > sevenDays) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            if (formData.prenom) document.getElementById('prenom').value = formData.prenom;
            if (formData.nom) document.getElementById('nom').value = formData.nom;
            if (formData.dateNaissance) document.getElementById('date-naissance').value = formData.dateNaissance;
            if (formData.email) document.getElementById('email').value = formData.email;
            if (formData.whatsapp) document.getElementById('whatsapp').value = formData.whatsapp;
            if (formData.pays) document.getElementById('pays').value = formData.pays;
            if (formData.montant) {
                document.getElementById('montant').value = formData.montant;
                updateSliderBackground(document.getElementById('montant'));
                document.getElementById('montant-value').textContent = formatMontant(formData.montant);
            }
            if (formData.duree) {
                document.getElementById('duree').value = formData.duree;
                updateSliderBackground(document.getElementById('duree'));
                document.getElementById('duree-value').textContent = formData.duree + ' mois';
            }
            if (formData.raison) document.getElementById('raison').value = formData.raison;
            if (formData.statut) document.getElementById('statut').value = formData.statut;
            if (formData.revenus) document.getElementById('revenus').value = formData.revenus;
            if (formData.piece1) document.getElementById('piece1').checked = true;
            if (formData.piece2) document.getElementById('piece2').checked = true;
            if (formData.piece3) document.getElementById('piece3').checked = true;

            if (CONFIG.debugMode) console.log('✅ Données restaurées');

            setTimeout(() => {
                validateStep1();
                validateStep2();
                validateStep3();
                afficherResumePret();
            }, 100);

        } catch (e) {
            console.error('Erreur lors du chargement:', e);
        }
    }

    function clearFormData() {
        try { localStorage.removeItem(STORAGE_KEY); } catch(_){}
    }

    // ========================================
    // 7. FORMAT AUTOMATIQUE DATE
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
            saveFormData();
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
    // 8. BANDEAU PROMO — TEXTE FIXE (sans minuteur)
    // ========================================

    function setupPromoBannerTextOnly() {
        const promoBanner = document.querySelector('.promo-banner');
        if (!promoBanner) return;
        promoBanner.style.background = '#000';
        promoBanner.style.color = '#fff';
        promoBanner.style.fontWeight = '600';
        promoBanner.textContent = 'Offre valable jusqu\'au 30 octobre 23:59';
    }

    // ========================================
    // 9. CALCULATEUR & SLIDERS
    // ========================================

    function calculerMensualite(montant, dureeEnMois, tauxAnnuel) {
        const tauxMensuel = tauxAnnuel / 100 / 12;
        const mensualite = (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeEnMois));
        return mensualite;
    }

    function getDateFin(dureeEnMois) {
        const dateFin = new Date();
        dateFin.setMonth(dateFin.getMonth() + parseInt(dureeEnMois));
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
        const montant = parseFloat(document.getElementById('montant').value);
        const duree = parseInt(document.getElementById('duree').value);
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
                font-size: 0.9rem; line-height: 1.8;
            `;
            const raisonGroup = document.getElementById('raison').closest('.form-group');
            raisonGroup.parentNode.insertBefore(resumeElement, raisonGroup.nextSibling);
        }

        resumeElement.innerHTML = `
            <div style="font-weight: 600; color: var(--brand); margin-bottom: 0.75rem; font-size: 1rem;">📊 Estimation de votre prêt</div>
            <div style="color: var(--text);">
                <strong>Vous souhaitez emprunter ${formatEuros(montant)}</strong> sur <strong>${duree} mois</strong>.
            </div>
            <div style="margin-top: 0.5rem; color: var(--muted); font-size: 0.85rem;">
                Au taux indicatif de <strong>${taux}%</strong> par an :
            </div>
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: white; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--muted);">Mensualité :</span>
                    <strong style="color: var(--brand); font-size: 1.1rem;">${formatEuros(mensualite)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--line);">
                    <span style="color: var(--muted);">Coût total du crédit :</span>
                    <strong style="color: var(--text);">${formatEuros(coutCredit)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px dashed var(--line);">
                    <span style="color: var(--muted);">Montant total à rembourser :</span>
                    <strong style="color: var(--text);">${formatEuros(coutTotal)}</strong>
                </div>
            </div>
            <div style="margin-top: 0.75rem; color: var(--muted); font-size: 0.85rem;">
                Dernier paiement prévu en <strong>${dateFin}</strong>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.8rem; font-style: italic;">
                ⚠️ Estimation indicative basée sur un taux de ${taux}%. Le taux final sera déterminé selon votre dossier.
            </div>
        `;
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
            saveFormData();
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
            saveFormData();
        });

        dureeValue.textContent = dureeSlider.value + ' mois';
        updateSliderBackground(dureeSlider);
    }

    // ========================================
    // 10. BOUTONS SUIVANT
    // ========================================

    function createNextButtons() {
        const details = document.querySelectorAll('details');
        details.forEach((detail, index) => {
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
                transition: all 0.2s; width: 100%; max-width: 300px; display: block; margin-left: auto; margin-right: auto;
            `;
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
    }

    // ========================================
    // 11. ACCÈS ÉTAPES + BADGES OK
    // ========================================

    function injectSummaryHitboxStyles() {
        const style = document.createElement('style');
        style.textContent = `
            details > summary {
                padding: 1rem 0.75rem !important;
                margin: -0.25rem -0.25rem 0 -0.25rem;
                border-radius: 10px;
                cursor: pointer;
            }
            details > summary:hover {
                background: rgba(30, 102, 255, 0.06);
            }
            .ok-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px; height: 20px;
                margin-left: 8px;
                vertical-align: middle;
            }
            .ok-badge img {
                width: 20px; height: 20px; display:block;
            }
        `;
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
        const previouslyCompleted = formState.formCompleted;
        const allValid = formState.step1Valid && formState.step2Valid && formState.step3Valid;
        formState.formCompleted = allValid;
        if (allValid && !previouslyCompleted) {
            // ——— form_full → envoi 1 seule fois
            fireEventOnce(GADS.ssKeys.FORM, GADS.events.form_full, {
                form_status: 'complete',
                href: location.href,
                lang: navigator.language,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
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
    // 12. EXIT INTENT (si > 1m30 & pas de clic CTA)
    // ========================================

    function startExitIntentTimer() {
        exitIntentTimer = setTimeout(() => {}, CONFIG.exitIntentDelay);
    }

    function showExitIntentPopup() {
        if (formState.exitIntentShown || !formState.formCompleted) return;
        const elapsed = (Date.now() - pageStartTime) / 1000;
        if (elapsed < 90 || ctaClicked) return;

        formState.exitIntentShown = true;

        const montant = formatMontant(document.getElementById('montant').value);
        const duree = document.getElementById('duree').value;

        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 72);
        const deadlineStr = deadline.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

        const popup = document.createElement('div');
        popup.id = 'exit-intent-popup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            padding: 1rem; animation: fadeIn 0.3s ease;
        `;

        popup.innerHTML = `
            <div style="
                background: white; max-width: 500px; width: 100%;
                border-radius: 16px; padding: 2.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.4s ease; text-align: center;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🤭</div>
                <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text); margin-bottom: 1rem;">Oups ! Vous partez déjà ?</h2>
                <p style="color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6;">
                    Vous avez presque terminé ! Votre demande de <strong style="color: var(--brand);">${montant}</strong> 
                    sur <strong>${duree} mois</strong> est prête.
                </p>
                <p style="color: var(--text); font-weight: 600; margin-bottom: 2rem; padding: 1rem; background: var(--bg-soft); border-radius: 10px;">
                    ⏰ Obtenez vos ${montant} avant le<br>
                    <span style="color: var(--brand); font-size: 1.1rem;">${deadlineStr}</span>
                </p>
                <button id="exit-intent-cta" style="
                    width: 100%; padding: 1rem 2rem; background: var(--accent); color: white;
                    border: none; border-radius: 12px; font-size: 1rem; font-weight: 700;
                    cursor: pointer; margin-bottom: 1rem; transition: all 0.2s;
                ">📨 Finaliser ma demande maintenant</button>
                <button id="exit-intent-close" style="
                    background: transparent; border: none; color: var(--muted);
                    font-size: 0.9rem; cursor: pointer; text-decoration: underline;
                ">Non merci, je reviendrai plus tard</button>
            </div>
        `;

        document.body.appendChild(popup);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            #exit-intent-cta:hover { background: #15a34a !important; transform: translateY(-2px); }
        `;
        document.head.appendChild(style);

        document.getElementById('exit-intent-cta').addEventListener('click', () => {
            popup.remove();
            const submitBtn = document.querySelector('.cta-submit');
            if (submitBtn) {
                ctaClicked = true;
                submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                submitBtn.style.animation = 'pulse 1s ease 3';
            }
        });
        document.getElementById('exit-intent-close').addEventListener('click', () => popup.remove());
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    }

    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 10) showExitIntentPopup();
    });
    window.addEventListener('beforeunload', (e) => {
        const elapsed = (Date.now() - pageStartTime) / 1000;
        if (!formState.exitIntentShown && formState.formCompleted && !ctaClicked && elapsed >= 90) {
            e.preventDefault();
            e.returnValue = '';
            showExitIntentPopup();
        }
    });

    // ========================================
    // 13. VALIDATION TEMPS RÉEL + SAVE
    // ========================================

    function setupRealTimeValidation() {
        const allInputs = document.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('change', saveFormData);
            if (input.tagName !== 'SELECT') {
                input.addEventListener('input', saveFormData);
            }
        });

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
    // 14. SOUMISSION (EMAIL PRÉREMPLI — SANS CONFIRMATION) + TRACKING
    // ========================================

    function buildPrefilledEmail() {
        const prenom = (document.getElementById('prenom').value || '').trim();
        const nom = (document.getElementById('nom').value || '').trim();
        const fullName = `${prenom} ${nom}`.trim();
        const dateNaissance = (document.getElementById('date-naissance').value || '').trim();
        const email = (document.getElementById('email').value || '').trim();
        const whatsapp = (document.getElementById('whatsapp').value || '').trim();
        const pays = (document.getElementById('pays').value || '').trim();
        const montantVal = parseFloat(document.getElementById('montant').value || '0');
        const montantFmt = formatMontant(montantVal);
        const dureeMois = (document.getElementById('duree').value || '').trim();
        const raison = (document.getElementById('raison').value || '').trim();
        const statut = (document.getElementById('statut').value || '').trim();
        const revenus = (document.getElementById('revenus').value || '').trim();

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
            'Je me permets de vous contacter pour une demande de financement auprès de MSGROUP.',
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

    const form = document.querySelector('form[action*="mailto"]');
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
                    allErrors.push(...formState.validationErrors.step1.map(e => '  • ' + e));
                }
                if (formState.validationErrors.step2.length > 0) {
                    allErrors.push('\nÉTAPE 2 - Votre prêt :');
                    allErrors.push(...formState.validationErrors.step2.map(e => '  • ' + e));
                }
                if (formState.validationErrors.step3.length > 0) {
                    allErrors.push('\nÉTAPE 3 - Votre profil :');
                    allErrors.push(...formState.validationErrors.step3.map(e => '  • ' + e));
                }
                showNotification('Formulaire incomplet', 'Veuillez corriger les erreurs suivantes :\n\n' + allErrors.join('\n'), 'error');
                return false;
            }

            // ——— TRACKING: form_submit (une seule fois par session)
            fireEventOnce(GADS.ssKeys.SUBMIT, GADS.events.form_submit, {
                href: location.href
            });

            const mailtoLink = buildPrefilledEmail();
            window.location.href = mailtoLink;

            setTimeout(() => {
                clearFormData();
                showNotification('✅ Demande prête dans votre messagerie', 'Veuillez vérifier votre application e-mail (brouillon ouvert).', 'success');
            }, 600);
        });
    }

    // ========================================
    // 15. CARROUSEL
    // ========================================

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

    // ========================================
    // 16. NOTIFICATIONS
    // ========================================

    function showNotification(title, message, type = 'info') {
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
        alert(`${icons[type]} ${title}\n\n${message}`);
    }

    // ========================================
    // 17. SMOOTH SCROLL
    // ========================================

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

    // ========================================
    // 18. MENU MOBILE (si présent)
    // ========================================

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
    // 19. TRACKING CTA (header/hero/submit) — 1er clic
    // ========================================

    function snapshotLeadForAnalytics(){
        // snapshot minimal pour Ads/GA (pas de données sensibles)
        const pays = (document.getElementById('pays')?.value || '').trim();
        const montant = parseFloat(document.getElementById('montant')?.value || '0') || 0;
        const duree = parseInt(document.getElementById('duree')?.value || '0') || 0;
        return { pays, montant, duree };
    }

    function bindCtaTracking(){
        const headerCTA = document.querySelector('.cta-header');
        const heroCTA = document.querySelector('.cta-primary');
        const submitBtn = document.querySelector('.cta-submit');

        const sendOnce = () => {
            try {
                if (sessionStorage.getItem(GADS.ssKeys.CTA)) return false;
                sessionStorage.setItem(GADS.ssKeys.CTA,'1');
            } catch(_){}
            return true;
        };

        if (headerCTA) {
            headerCTA.addEventListener('click', () => {
                if (!sendOnce()) return;
                ctaClicked = true;
                fireEvent(GADS.events.cta_click, Object.assign({ which:'header', href: location.href }, snapshotLeadForAnalytics()));
            }, {capture:false});
        }
        if (heroCTA) {
            heroCTA.addEventListener('click', () => {
                if (!sendOnce()) return;
                ctaClicked = true;
                fireEvent(GADS.events.cta_click, Object.assign({ which:'hero', href: location.href }, snapshotLeadForAnalytics()));
            }, {capture:false});
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (!sendOnce()) return;
                ctaClicked = true;
                fireEvent(GADS.events.cta_click, Object.assign({ which:'submit', href: location.href }, snapshotLeadForAnalytics()));
            }, {capture:false});
        }
    }

    // ========================================
    // 20. PAGE LOADED — Tracking (une seule fois)
    // ========================================

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
            screen_w: screen.width,
            screen_h: screen.height,
            dpr: window.devicePixelRatio || 1
        });
    }

    // ========================================
    // 21. INITIALISATION
    // ========================================

    function init() {
        if (CONFIG.debugMode) console.log('🚀 Initialisation MSGROUP (version Ads, sans Apps Script)...');

        enableSmoothScroll();
        setupPromoBannerTextOnly();   // ← texte fixe FOMO
        loadFormData();
        setupDateFormatting();
        createNextButtons();
        setupVideoPlayers();
        injectSummaryHitboxStyles();

        setTimeout(() => {
            validateStep1();
            validateStep2();
            validateStep3();
            afficherResumePret();
        }, 200);

        preventStepOpening();
        setupRealTimeValidation();
        bindCtaTracking();
        trackPageLoadedOnce();

        if (CONFIG.debugMode) console.log('✅ MSGROUP - Prêt !');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
