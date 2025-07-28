// translations.js - Fichier de traductions organisé par page

const translations = {
  // ======== FRANÇAIS ========
  "fr": {
    // === ÉLÉMENTS COMMUNS (HEADER, FOOTER, NAVIGATION) ===
    // Navigation
    "nav_home": "Accueil",
    "nav_about": "À propos",
    "nav_services": "Services",
    "nav_testimonials": "Témoignages",
    "nav_biography": "Biographie",
    "nav_simulation": "Simulation",
    "nav_loan_request": "Demande de prêt",
    
    // Sélecteur de langue
    "lang_fr": "Français",
    "lang_en": "Anglais",
    "lang_pl": "Polonais",
    "lang_de": "Allemand",
    "lang_it": "Italien",
    "lang_pt": "Portugais",
    
    // Footer
    "footer_about": "Services de prêts entre particuliers depuis 2009",
    "footer_quick_links": "Liens rapides",
    "footer_services": "Nos services",
    "footer_contact": "Contact",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Inscrivez-vous à notre newsletter pour recevoir nos actualités et conseils financiers.",
    "newsletter_placeholder": "Votre email",
    "footer_rights": "Tous droits réservés.",
    "footer_privacy": "Politique de confidentialité",
    "footer_terms": "Conditions d'utilisation",
    
    // === PAGE D'ACCUEIL (index_langue.html) ===
    // Preloader
    "preloader_loading": "Chargement...",
    
    // Hero Section
    "hero_title": "Bâtissons ensemble votre avenir financier",
    "hero_subtitle": "Magdeleine Solutions vous accompagne dans tous vos projets avec des solutions de financement sur-mesure, transparentes et adaptées à votre situation.",
    "hero_btn_services": "Découvrir nos services",
    "hero_btn_contact": "Nous contacter",
    "hero_scroll": "Découvrir",
    
    // About Section
    "about_title": "Qui sommes-nous ?",
    "about_subtitle": "Découvrez notre approche unique et notre engagement envers votre réussite financière",
    "about_heading": "Une expertise financière à votre service",
    "about_p1": "Magdeleine Solutions est une agence de financement innovante et humaine, implantée en France, qui accompagne les particuliers, indépendants et petites entreprises dans la réalisation de leurs projets financiers.",
    "about_p2": "Notre mission est de démocratiser l'accès aux solutions de financement en proposant un accompagnement personnalisé, transparent et adapté à chaque situation. Nous croyons que chacun mérite une chance de concrétiser ses projets, quels que soient son profil ou son historique bancaire.",
    "about_p3": "Grâce à notre réseau de partenaires bancaires et notre expertise du marché, nous trouvons les meilleures solutions pour vous, même dans les situations complexes.",
    "about_btn": "Nos services",
    
    // Features Section
    "features_title": "Nos 3 piliers",
    "features_subtitle": "Les valeurs fondamentales qui guident notre approche et garantissent votre satisfaction",
    "feature1_title": "Accompagnement personnalisé",
    "feature1_desc": "Chez Magdeleine Solutions, chaque client est unique. Nos conseillers financiers sont formés pour écouter, comprendre et orienter chacun vers la solution la plus adaptée à sa situation personnelle et professionnelle.",
    "feature2_title": "Transparence & pédagogie",
    "feature2_desc": "Nous vulgarisons les informations clés pour aider nos clients à prendre des décisions éclairées. Notre approche pédagogique vous permet de comprendre chaque étape du processus, sans jargon incompréhensible.",
    "feature3_title": "Solutions sur-mesure",
    "feature3_desc": "Grâce à notre réseau de partenaires bancaires, nous proposons des offres variées et flexibles, même en cas de refus bancaire initial. Notre expertise nous permet de trouver des solutions adaptées à votre situation.",
    
    // Services Section
    "services_title": "Nos services",
    "services_subtitle": "Des solutions financières adaptées à tous vos besoins",
    "services_tab_all": "Tous les services",
    "services_tab_personal": "Particuliers",
    "services_tab_professional": "Professionnels",
    "services_tab_advice": "Conseils",
    "service_simulate": "Simuler un prêt",
    "service_contact": "Nous contacter",
    
    // Services - Tous
    "service1_title": "Prêt personnel",
    "service1_desc": "Financez vos projets personnels avec un prêt adapté à votre situation. Taux compétitifs et conditions flexibles pour réaliser vos rêves.",
    "service2_title": "Prêt immobilier",
    "service2_desc": "Concrétisez votre projet immobilier avec notre accompagnement sur-mesure. Achat, construction ou rénovation, nous trouvons la solution idéale.",
    "service3_title": "Prêt professionnel",
    "service3_desc": "Développez votre activité avec nos solutions de financement pour professionnels. Création, reprise ou développement d'entreprise.",
    "service4_title": "Rachat de crédit",
    "service4_desc": "Simplifiez vos finances en regroupant vos crédits. Réduisez vos mensualités et retrouvez une situation financière saine.",
    
    // Services - Particuliers
    "service5_title": "Crédit auto",
    "service5_desc": "Financez l'achat de votre véhicule neuf ou d'occasion avec nos solutions adaptées. Conditions avantageuses et démarches simplifiées.",
    
    // Services - Professionnels
    "service6_title": "Crédit bail",
    "service6_desc": "Financez vos équipements professionnels sans impacter votre trésorerie. Solution flexible avec option d'achat en fin de contrat.",
    "service7_title": "Financement de trésorerie",
    "service7_desc": "Optimisez votre trésorerie avec nos solutions de financement court terme. Faites face aux imprévus et saisissez les opportunités.",
    "service8_title": "Crédit immobilier professionnel",
    "service8_desc": "Investissez dans vos locaux professionnels avec nos solutions de financement adaptées. Achat, construction ou rénovation de locaux commerciaux.",
    
    // Services - Conseils
    "service9_title": "Conseil financier",
    "service9_desc": "Bénéficiez de l'expertise de nos conseillers pour optimiser votre situation financière. Analyse personnalisée et recommandations sur-mesure.",
    "service10_title": "Accompagnement administratif",
    "service10_desc": "Simplifiez vos démarches administratives avec notre accompagnement personnalisé. Constitution de dossier, suivi et relation avec les organismes financiers.",
    "service11_title": "Assurance emprunteur",
    "service11_desc": "Protégez-vous et vos proches avec une assurance adaptée à votre prêt. Garanties personnalisées et tarifs compétitifs.",
    "service12_title": "Optimisation fiscale",
    "service12_desc": "Réduisez votre charge fiscale grâce à nos conseils d'experts. Stratégies légales pour optimiser votre imposition en fonction de votre situation.",
    
    // Stats Section
    "stat1_label": "Années d'expérience",
    "stat2_label": "Clients satisfaits",
    "stat3_label": "Partenaires bancaires",
    "stat4_label": "Taux de satisfaction (%)",
    
    // Testimonials Section
    "testimonials_title": "Témoignages",
    "testimonials_subtitle": "Découvrez ce que nos clients disent de nous",
    "testimonial1_text": "Magdeleine Solutions a transformé notre projet immobilier en réalité. Malgré plusieurs refus bancaires, leur équipe a trouvé une solution adaptée à notre situation. Leur professionnalisme et leur persévérance ont fait toute la différence.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Prêt immobilier, Milan",
    "testimonial2_text": "En tant qu'entrepreneur, j'avais besoin d'un financement rapide pour saisir une opportunité. L'équipe de Magdeleine Solutions a compris l'urgence et m'a accompagné avec efficacité. Grâce à eux, j'ai pu développer mon activité dans les délais.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Prêt professionnel, Lyon",
    "testimonial3_text": "Le rachat de crédit proposé par Magdeleine Solutions m'a permis de réduire considérablement mes mensualités. Leur approche pédagogique m'a aidé à comprendre chaque étape du processus. Je recommande vivement leurs services pour retrouver une situation financière saine.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Rachat de crédit, Warsaw",
    
    // CTA Section
    "cta_title": "Prêt à concrétiser votre projet ?",
    "cta_subtitle": "Faites le premier pas vers la réalisation de vos objectifs financiers. Notre équipe est prête à vous accompagner.",
    "cta_btn_request": "Faire une demande",
    "cta_btn_contact": "Nous contacter",
    
    // Contact Section
    "contact_title": "Contactez-nous",
    "contact_subtitle": "Notre équipe est à votre disposition pour répondre à toutes vos questions",
    "contact_address_title": "Adresse",
    "contact_address": "123 Avenue des Finances, 75008 Paris, France",
    "contact_phone_title": "Téléphone",
    "contact_whatsapp_title": "Whatsapp",
    "contact_email_title": "Email",
    "contact_hours_title": "Horaires d'ouverture",
    "contact_hours": "Lundi - Vendredi: 9h00 - 18h00",
    "contact_form_name": "Nom complet",
    "contact_form_name_placeholder": "Votre nom complet",
    "contact_form_email": "Email",
    "contact_form_email_placeholder": "Votre adresse email",
    "contact_form_phone": "Téléphone",
    "contact_form_phone_placeholder": "Votre numéro de téléphone",
    "contact_form_subject": "Sujet",
    "contact_form_subject_placeholder": "Sélectionnez un sujet",
    "contact_form_subject_loan": "Demande de prêt",
    "contact_form_subject_info": "Demande d'information",
    "contact_form_subject_appointment": "Prise de rendez-vous",
    "contact_form_subject_other": "Autre",
    "contact_form_message": "Message",
    "contact_form_message_placeholder": "Votre message",
    "contact_form_submit": "Envoyer le message",
    
    // === PAGE DE SIMULATION (simulation_langue.html) ===
    // Page Header
    "sim_title": "Simulation de prêt",
    "sim_subtitle": "Calculez vos mensualités et obtenez un aperçu détaillé de votre prêt",
    
    // Simulation Form
    "sim_form_title": "Paramètres du prêt",
    "sim_amount_borrowed": "Montant du Prêt",
    "sim_duration": "Durée du prêt",
    "sim_rate": "Taux d'intérêt",
    "sim_type": "Type de prêt",
    "sim_calculate": "Calculer",
    
    // Loan Types
    "loan_type_personal": "Prêt personnel",
    "loan_type_mortgage": "Prêt immobilier",
    "loan_type_business": "Prêt professionnel",
    "loan_type_debt_consolidation": "Rachat de crédit",
    
    // Duration Options (toutes les durées)
    "duration_12": "12 mois",
    "duration_24": "24 mois",
    "duration_36": "36 mois",
    "duration_48": "48 mois",
    "duration_60": "60 mois",
    "duration_72": "72 mois",
    "duration_84": "84 mois",
    "duration_96": "96 mois",
    "duration_108": "108 mois",
    "duration_120": "120 mois",
    "duration_132": "132 mois",
    "duration_144": "144 mois",
    "duration_156": "156 mois",
    "duration_168": "168 mois",
    "duration_180": "180 mois",
    "duration_192": "192 mois",
    "duration_204": "204 mois",
    "duration_216": "216 mois",
    "duration_228": "228 mois",
    "duration_240": "240 mois",
    "duration_252": "252 mois",
    "duration_264": "264 mois",
    "duration_276": "276 mois",
    "duration_288": "288 mois",
    "duration_300": "300 mois",
    "duration_312": "312 mois",
    "duration_324": "324 mois",
    "duration_336": "336 mois",
    "duration_348": "348 mois",
    "duration_360": "360 mois",
    
    // Simulation Results
    "sim_results_title": "Résultats de la simulation",
    "sim_monthly": "Mensualité",
    "sim_total_interest": "Coût total des intérêts",
    "sim_total_cost": "Coût total du crédit",
    "sim_table_year": "Année",
    "sim_table_principal": "Capital remboursé",
    "sim_table_interest": "Intérêts payés",
    "sim_table_remaining": "Capital restant",
    "sim_download": "Télécharger le récapitulatif en PDF",
    "sim_no_result": "Veuillez remplir les champs pour obtenir une simulation.",
    
    // PDF Preview
    "pdf_preview_title": "Aperçu du PDF",
    "pdf_subtitle": "Récapitulatif détaillé de votre simulation",
    "pdf_loan_details": "Détails du prêt",
    "pdf_amortization": "Tableau d'amortissement",
    "pdf_disclaimer_1": "Cette simulation est fournie à titre indicatif et ne constitue pas une offre contractuelle.",
    "pdf_disclaimer_2": "Les montants réels peuvent varier en fonction de votre situation personnelle et des conditions du marché.",
    "pdf_contact": "Pour plus d'informations, contactez-nous au +33 7 45 40 20 18 ou à contact@creditlyonnaislcl.fr",
    "pdf_download": "Télécharger le PDF",
    "pdf_close": "Fermer",
    
    // === PAGE DE FORMULAIRE (formulaire_langue.html) ===
    // Page Header
    "form_title": "Demande de prêt",
    "form_subtitle": "Complétez le formulaire ci-dessous pour soumettre votre demande de financement",
    "form_header": "Formulaire de demande de prêt",
    "form_required": "Tous les champs marqués d'un astérisque (*) sont obligatoires",
    
    // Form Sections
    "form_section1": "Informations personnelles",
    "form_firstname": "Prénom",
    "form_lastname": "Nom",
    "form_email": "Email",
    "form_phone": "Téléphone",
    "form_birthdate": "Date de naissance",
    "form_nationality": "Nationalité",
    "form_address": "Adresse complète",
    
    "form_section2": "Informations sur le prêt",
    "form_loan_type": "Type de prêt",
    "form_select_option": "Sélectionnez une option",
    "form_loan_amount": "Montant du prêt (€)",
    "form_amount_note": "Montant entre 2 000€ et 1 000 000€",
    "form_loan_duration": "Durée du prêt (mois)",
    "form_loan_purpose": "Objet du prêt",
    "form_loan_details": "Détails supplémentaires sur votre projet",
    
    // Durées pour le formulaire
    "form_duration_12": "12 mois (1 an)",
    "form_duration_24": "24 mois (2 ans)",
    "form_duration_36": "36 mois (3 ans)",
    "form_duration_48": "48 mois (4 ans)",
    "form_duration_60": "60 mois (5 ans)",
    "form_duration_72": "72 mois (6 ans)",
    "form_duration_84": "84 mois (7 ans)",
    "form_duration_96": "96 mois (8 ans)",
    "form_duration_108": "108 mois (9 ans)",
    "form_duration_120": "120 mois (10 ans)",
    "form_duration_180": "180 mois (15 ans)",
    "form_duration_240": "240 mois (20 ans)",
    "form_duration_300": "300 mois (25 ans)",
    
    "form_section3": "Informations financières",
    "form_monthly_income": "Revenu mensuel net (€)",
    "form_employment_status": "Statut professionnel",
    "form_status_employed": "Salarié(e) en CDI",
    "form_status_self_employed": "Travailleur indépendant",
    "form_status_business_owner": "Chef d'entreprise",
    "form_status_retired": "Retraité(e)",
    "form_status_unemployed": "Sans emploi",
    "form_status_other": "Autre",
    "form_existing_loans": "Avez-vous d'autres prêts en cours ?",
    "form_yes": "Oui",
    "form_no": "Non",
    "form_monthly_debt": "Mensualités totales de vos dettes actuelles (€)",
    "form_debt_note": "Laissez vide si vous n'avez pas de dettes",
    
    "form_section4": "Documents justificatifs",
    "form_documents_note": "Veuillez fournir les documents suivants pour accélérer le traitement de votre demande. Formats acceptés : PDF, JPG, PNG (max 5MB par fichier)",
    "form_id_document": "Pièce d'identité",
    "form_proof_address": "Justificatif de domicile",
    "form_proof_income": "Justificatif de revenus",
    "form_bank_statements": "Relevés bancaires (3 derniers mois)",
    "form_upload_file": "Télécharger un fichier",
    "form_additional_documents": "Documents supplémentaires (facultatif)",
    "form_additional_note": "Tout document supplémentaire pertinent pour votre demande",
    
    "form_submit": "Soumettre ma demande",
    "form_success_title": "Demande envoyée avec succès !",
    "form_success_text": "Nous avons bien reçu votre demande de prêt. Notre équipe va l'examiner dans les plus brefs délais et vous contactera sous 24 à 48 heures pour discuter des prochaines étapes.",
    "form_back_home": "Retour à l'accueil",
    
    // === PAGE DE BIOGRAPHIE (biographie_multilingue.html) ===
    // Page Header
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Fondateur et Directeur de Magdeleine Solutions groups",
    "bio_heading": "Parcours professionnel",
    
    // Biographie
    "bio_p1": "Âgé de 51 ans, Serge Magdeleine est diplômé de l'École des Ponts et titulaire d'un MBA du collège des Ingénieurs. Il a commencé sa carrière dans le conseil chez Mercer Oliver Wyman de 1996 à 1999, avant de devenir président fondateur de Serge Magdeleine Solutions groups en 2009.",
    "bio_p2": "En 2001, il intègre Crédit Agricole S.A. comme responsable de la banque en ligne, puis responsable du pôle Distribution et multicanal. En 2007, il rejoint la Caisse régionale Centre-est comme Directeur des entreprises et de l'international puis en 2010 la Caisse régionale Alpes Provence comme Directeur général adjoint. En 2015, il a en charge la direction des parcours digitaux Groupe et en 2016, il devient Directeur général de Crédit Agricole.",
    "bio_p3": "Actuellement, il occupe le poste de Directeur général délégué de Crédit Agricole S.A. et intègre le Comité exécutif de Crédit Agricole S.A., succédant à Michel Mathieu, Directeur général de LCL depuis le 4 avril 2016.",
    
    // Citation
    "bio_quote": "La finance doit être au service de l'humain. Notre mission est de démocratiser l'accès aux solutions de financement pour tous, en plaçant la transparence et la confiance au cœur de notre relation avec nos clients.",
    "bio_quote_author": "Serge Magdeleine",
    
    // Réalisations
    "bio_achievement1_title": "Excellence en leadership",
    "bio_achievement1_desc": "Reconnu pour sa vision stratégique et sa capacité à mener des équipes vers l'excellence, Serge Magdeleine a reçu plusieurs distinctions pour son leadership innovant dans le secteur financier.",
    "bio_achievement2_title": "Innovation financière",
    "bio_achievement2_desc": "Pionnier dans le développement de solutions financières accessibles et transparentes, il a contribué à la transformation digitale du secteur bancaire en France.",
    "bio_achievement3_title": "Engagement social",
    "bio_achievement3_desc": "Fortement engagé dans des initiatives d'inclusion financière, Serge Magdeleine œuvre pour rendre les services financiers accessibles à tous, notamment aux populations traditionnellement exclues du système bancaire.",
    
    // CTA
    "bio_contact_btn": "Contactez Serge Magdeleine"
  },

  // ======== ANGLAIS ========
  "en": {
    // === COMMON ELEMENTS (HEADER, FOOTER, NAVIGATION) ===
    // Navigation
    "nav_home": "Home",
    "nav_about": "About",
    "nav_services": "Services",
    "nav_testimonials": "Testimonials",
    "nav_biography": "Biography",
    "nav_simulation": "Simulation",
    "nav_loan_request": "Loan Request",
    
    // Language Selector
    "lang_fr": "French",
    "lang_en": "English",
    "lang_pl": "Polish",
    "lang_de": "German",
    "lang_it": "Italian",
    "lang_pt": "Portuguese",
    
    // Footer
    "footer_about": "Peer-to-peer lending services since 2009",
    "footer_quick_links": "Quick Links",
    "footer_services": "Our Services",
    "footer_contact": "Contact",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Subscribe to our newsletter to receive our news and financial advice.",
    "newsletter_placeholder": "Your email",
    "footer_rights": "All rights reserved.",
    "footer_privacy": "Privacy Policy",
    "footer_terms": "Terms of Use",
    
    // === HOME PAGE (index_langue.html) ===
    // Preloader
    "preloader_loading": "Loading...",
    
    // Hero Section
    "hero_title": "Let's build your financial future together",
    "hero_subtitle": "Magdeleine Solutions accompanies you in all your projects with tailor-made financing solutions, transparent and adapted to your situation.",
    "hero_btn_services": "Discover our services",
    "hero_btn_contact": "Contact us",
    "hero_scroll": "Discover",
    
    // About Section
    "about_title": "Who are we?",
    "about_subtitle": "Discover our unique approach and our commitment to your financial success",
    "about_heading": "Financial expertise at your service",
    "about_p1": "Magdeleine Solutions is an innovative and human financing agency, based in France, which accompanies individuals, independents and small businesses in the realization of their financial projects.",
    "about_p2": "Our mission is to democratize access to financing solutions by offering personalized, transparent and adapted support for each situation. We believe that everyone deserves a chance to realize their projects, regardless of their profile or banking history.",
    "about_p3": "Thanks to our network of banking partners and our market expertise, we find the best solutions for you, even in complex situations.",
    "about_btn": "Our services",
    
    // Features Section
    "features_title": "Our 3 pillars",
    "features_subtitle": "The core values that guide our approach and guarantee your satisfaction",
    "feature1_title": "Personalized support",
    "feature1_desc": "At Magdeleine Solutions, each client is unique. Our financial advisors are trained to listen, understand and guide each one towards the solution that best suits their personal and professional situation.",
    "feature2_title": "Transparency & pedagogy",
    "feature2_desc": "We simplify key information to help our clients make informed decisions. Our pedagogical approach allows you to understand each step of the process, without incomprehensible jargon.",
    "feature3_title": "Tailor-made solutions",
    "feature3_desc": "Thanks to our network of banking partners, we offer varied and flexible offers, even in case of initial bank refusal. Our expertise allows us to find solutions adapted to your situation.",
    
    // Services Section
    "services_title": "Our services",
    "services_subtitle": "Financial solutions adapted to all your needs",
    "services_tab_all": "All services",
    "services_tab_personal": "Individuals",
    "services_tab_professional": "Professionals",
    "services_tab_advice": "Advice",
    "service_simulate": "Simulate a loan",
    "service_contact": "Contact us",
    
    // Services - All
    "service1_title": "Personal Loan",
    "service1_desc": "Finance your personal projects with a loan adapted to your situation. Competitive rates and flexible conditions to realize your dreams.",
    "service2_title": "Mortgage Loan",
    "service2_desc": "Realize your real estate project with our tailor-made support. Purchase, construction or renovation, we find the ideal solution.",
    "service3_title": "Business Loan",
    "service3_desc": "Develop your activity with our financing solutions for professionals. Creation, takeover or development of a business.",
    "service4_title": "Debt Consolidation",
    "service4_desc": "Simplify your finances by consolidating your loans. Reduce your monthly payments and regain a healthy financial situation.",
    
    // Services - Individuals
    "service5_title": "Car Loan",
    "service5_desc": "Finance the purchase of your new or used vehicle with our adapted solutions. Advantageous conditions and simplified procedures.",
    
    // Services - Professionals
    "service6_title": "Leasing",
    "service6_desc": "Finance your professional equipment without impacting your cash flow. Flexible solution with purchase option at the end of the contract.",
    "service7_title": "Cash Flow Financing",
    "service7_desc": "Optimize your cash flow with our short-term financing solutions. Face the unexpected and seize opportunities.",
    "service8_title": "Commercial Real Estate Loan",
    "service8_desc": "Invest in your professional premises with our adapted financing solutions. Purchase, construction or renovation of commercial premises.",
    
    // Services - Advice
    "service9_title": "Financial Advice",
    "service9_desc": "Benefit from the expertise of our advisors to optimize your financial situation. Personalized analysis and tailor-made recommendations.",
    "service10_title": "Administrative Support",
    "service10_desc": "Simplify your administrative procedures with our personalized support. File constitution, follow-up and relationship with financial organizations.",
    "service11_title": "Loan Insurance",
    "service11_desc": "Protect yourself and your loved ones with insurance adapted to your loan. Personalized guarantees and competitive rates.",
    "service12_title": "Tax Optimization",
    "service12_desc": "Reduce your tax burden thanks to our expert advice. Legal strategies to optimize your taxation according to your situation.",
    
    // Stats Section
    "stat1_label": "Years of experience",
    "stat2_label": "Satisfied clients",
    "stat3_label": "Banking partners",
    "stat4_label": "Satisfaction rate (%)",
    
    // Testimonials Section
    "testimonials_title": "Testimonials",
    "testimonials_subtitle": "Discover what our clients say about us",
    "testimonial1_text": "Magdeleine Solutions transformed our real estate project into reality. Despite several bank refusals, their team found a solution adapted to our situation. Their professionalism and perseverance made all the difference.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Mortgage Loan, Milan",
    "testimonial2_text": "As an entrepreneur, I needed quick financing to seize an opportunity. The Magdeleine Solutions team understood the urgency and accompanied me efficiently. Thanks to them, I was able to develop my activity on time.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Business Loan, Lyon",
    "testimonial3_text": "The debt consolidation proposed by Magdeleine Solutions allowed me to significantly reduce my monthly payments. Their pedagogical approach helped me understand each step of the process. I highly recommend their services to regain a healthy financial situation.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Debt Consolidation, Warsaw",
    
    // CTA Section
    "cta_title": "Ready to realize your project?",
    "cta_subtitle": "Take the first step towards achieving your financial goals. Our team is ready to accompany you.",
    "cta_btn_request": "Make a request",
    "cta_btn_contact": "Contact us",
    
    // Contact Section
    "contact_title": "Contact us",
    "contact_subtitle": "Our team is at your disposal to answer all your questions",
    "contact_address_title": "Address",
    "contact_address": "123 Finance Avenue, 75008 Paris, France",
    "contact_phone_title": "Phone",
    "contact_email_title": "Email",
    "contact_hours_title": "Opening hours",
    "contact_hours": "Monday - Friday: 9:00 AM - 6:00 PM",
    "contact_form_name": "Full name",
    "contact_form_name_placeholder": "Your full name",
    "contact_form_email": "Email",
    "contact_form_email_placeholder": "Your email address",
    "contact_form_phone": "Phone",
    "contact_form_phone_placeholder": "Your phone number",
    "contact_form_subject": "Subject",
    "contact_form_subject_placeholder": "Select a subject",
    "contact_form_subject_loan": "Loan request",
    "contact_form_subject_info": "Information request",
    "contact_form_subject_appointment": "Appointment",
    "contact_form_subject_other": "Other",
    "contact_form_message": "Message",
    "contact_form_message_placeholder": "Your message",
    "contact_form_submit": "Send message",
    
    // === SIMULATION PAGE (simulation_langue.html) ===
    // Page Header
    "sim_title": "Loan Simulation",
    "sim_subtitle": "Calculate your monthly payments and get a detailed overview of your loan",
    
    // Simulation Form
    "sim_form_title": "Loan Parameters",
    "sim_amount_borrowed": "Amount borrowed",
    "sim_duration": "Loan duration",
    "sim_rate": "Interest rate",
    "sim_type": "Loan type",
    "sim_calculate": "Calculate",
    
    // Loan Types
    "loan_type_personal": "Personal Loan",
    "loan_type_mortgage": "Mortgage Loan",
    "loan_type_business": "Business Loan",
    "loan_type_debt_consolidation": "Debt Consolidation",
    
    // Duration Options (examples, to be completed for all durations)
    "duration_12": "12 months",
    "duration_24": "24 months",
    "duration_36": "36 months",
    "duration_48": "48 months",
    "duration_60": "60 months",
    "duration_120": "120 months",
    "duration_180": "180 months",
    "duration_240": "240 months",
    "duration_360": "360 months",
    
    // Simulation Results
    "sim_results_title": "Simulation Results",
    "sim_monthly": "Monthly payment",
    "sim_total_interest": "Total interest cost",
    "sim_total_cost": "Total loan cost",
    "sim_table_year": "Year",
    "sim_table_principal": "Principal repaid",
    "sim_table_interest": "Interest paid",
    "sim_table_remaining": "Remaining principal",
    "sim_download": "Download PDF summary",
    "sim_no_result": "Please fill in the fields to get a simulation.",
    
    // PDF Preview
    "pdf_preview_title": "PDF Preview",
    "pdf_subtitle": "Detailed summary of your simulation",
    "pdf_loan_details": "Loan Details",
    "pdf_amortization": "Amortization Schedule",
    "pdf_disclaimer_1": "This simulation is provided for informational purposes only and does not constitute a contractual offer.",
    "pdf_disclaimer_2": "Actual amounts may vary depending on your personal situation and market conditions.",
    "pdf_contact": "For more information, contact us at +33 7 45 40 20 18 or contact@creditlyonnaislcl.fr",
    "pdf_download": "Download PDF",
    "pdf_close": "Close",
    
    // === APPLICATION FORM PAGE (formulaire_langue.html) ===
    // Page Header
    "form_title": "Loan Application",
    "form_subtitle": "Fill out the form below to submit your loan application",
    "form_header": "Loan Application Form",
    "form_required": "All fields marked with an asterisk (*) are required",
    
    // Form Sections
    "form_section1": "Personal Information",
    "form_firstname": "First Name",
    "form_lastname": "Last Name",
    "form_email": "Email",
    "form_phone": "Phone",
    "form_birthdate": "Date of Birth",
    "form_nationality": "Nationality",
    "form_address": "Full Address",
    
    "form_section2": "Loan Information",
    "form_loan_type": "Loan Type",
    "form_select_option": "Select an option",
    "form_loan_amount": "Loan Amount (€)",
    "form_amount_note": "Amount between €2,000 and €1,000,000",
    "form_loan_duration": "Loan Duration (months)",
    "form_loan_purpose": "Loan Purpose",
    "form_loan_details": "Additional details about your project",
    
    // Durations for the form
    "form_duration_12": "12 months (1 year)",
    "form_duration_24": "24 months (2 years)",
    "form_duration_36": "36 months (3 years)",
    "form_duration_48": "48 months (4 years)",
    "form_duration_60": "60 months (5 years)",
    "form_duration_72": "72 months (6 years)",
    "form_duration_84": "84 months (7 years)",
    "form_duration_96": "96 months (8 years)",
    "form_duration_108": "108 months (9 years)",
    "form_duration_120": "120 months (10 years)",
    "form_duration_180": "180 months (15 years)",
    "form_duration_240": "240 months (20 years)",
    "form_duration_300": "300 months (25 years)",
    
    "form_section3": "Financial Information",
    "form_monthly_income": "Net Monthly Income (€)",
    "form_employment_status": "Employment Status",
    "form_status_employed": "Employed (Permanent Contract)",
    "form_status_self_employed": "Self-employed",
    "form_status_business_owner": "Business Owner",
    "form_status_retired": "Retired",
    "form_status_unemployed": "Unemployed",
    "form_status_other": "Other",
    "form_existing_loans": "Do you have other ongoing loans?",
    "form_yes": "Yes",
    "form_no": "No",
    "form_monthly_debt": "Total monthly payments of your current debts (€)",
    "form_debt_note": "Leave empty if you have no debts",
    
    "form_section4": "Supporting Documents",
    "form_documents_note": "Please provide the following documents to speed up the processing of your application. Accepted formats: PDF, JPG, PNG (max 5MB per file)",
    "form_id_document": "ID Document",
    "form_proof_address": "Proof of Address",
    "form_proof_income": "Proof of Income",
    "form_bank_statements": "Bank Statements (last 3 months)",
    "form_upload_file": "Upload a file",
    "form_additional_documents": "Additional Documents (optional)",
    "form_additional_note": "Any additional document relevant to your application",
    
    "form_submit": "Submit my application",
    "form_success_title": "Application successfully submitted!",
    "form_success_text": "We have received your loan application. Our team will review it as soon as possible and will contact you within 24 to 48 hours to discuss the next steps.",
    "form_back_home": "Back to home",
    
    // === BIOGRAPHY PAGE (biographie_multilingue.html) ===
    // Page Header
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Founder and Director of Magdeleine Solutions groups",
    "bio_heading": "Professional Career",
    
    // Biography
    "bio_p1": "Aged 51, Serge Magdeleine is a graduate of the École des Ponts and holds an MBA from the Collège des Ingénieurs. He began his career in consulting at Mercer Oliver Wyman from 1996 to 1999, before becoming founding president of Serge Magdeleine Solutions groups in 2009.",
    "bio_p2": "In 2001, he joined Crédit Agricole S.A. as head of online banking, then head of the Distribution and multichannel division. In 2007, he joined the Centre-est regional bank as Director of companies and international, then in 2010 the Alpes Provence regional bank as Deputy General Manager. In 2015, he was in charge of the Group's digital pathways and in 2016, he became General Manager of Crédit Agricole.",
    "bio_p3": "Currently, he holds the position of Deputy General Manager of Crédit Agricole S.A. and joins the Executive Committee of Crédit Agricole S.A., succeeding Michel Mathieu, General Manager of LCL since April 4, 2016.",
    
    // Quote
    "bio_quote": "Finance must be at the service of humans. Our mission is to democratize access to financing solutions for all, by placing transparency and trust at the heart of our relationship with our clients.",
    "bio_quote_author": "Serge Magdeleine",
    
    // Achievements
    "bio_achievement1_title": "Excellence in leadership",
    "bio_achievement1_desc": "Recognized for his strategic vision and ability to lead teams to excellence, Serge Magdeleine has received several distinctions for his innovative leadership in the financial sector.",
    "bio_achievement2_title": "Financial innovation",
    "bio_achievement2_desc": "A pioneer in the development of accessible and transparent financial solutions, he has contributed to the digital transformation of the banking sector in France.",
    "bio_achievement3_title": "Social commitment",
    "bio_achievement3_desc": "Strongly committed to financial inclusion initiatives, Serge Magdeleine works to make financial services accessible to all, especially to populations traditionally excluded from the banking system.",
    
    // CTA
    "bio_contact_btn": "Contact Serge Magdeleine"
  },

  // ======== POLONAIS ========
  "pl": {
    // === ELEMENTY WSPÓLNE (NAGŁÓWEK, STOPKA, NAWIGACJA) ===
    // Nawigacja
    "nav_home": "Strona główna",
    "nav_about": "O nas",
    "nav_services": "Usługi",
    "nav_testimonials": "Referencje",
    "nav_biography": "Biografia",
    "nav_simulation": "Symulacja",
    "nav_loan_request": "Wniosek o pożyczkę",
    
    // Selektor języka
    "lang_fr": "Francuski",
    "lang_en": "Angielski",
    "lang_pl": "Polski",
    "lang_de": "Niemiecki",
    "lang_it": "Włoski",
    "lang_pt": "Portugalski",
    
    // Stopka
    "footer_about": "Usługi pożyczek między osobami prywatnymi od 2009 roku",
    "footer_quick_links": "Szybkie linki",
    "footer_services": "Nasze usługi",
    "footer_contact": "Kontakt",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Zapisz się do naszego newslettera, aby otrzymywać nasze aktualności i porady finansowe.",
    "newsletter_placeholder": "Twój email",
    "footer_rights": "Wszelkie prawa zastrzeżone.",
    "footer_privacy": "Polityka prywatności",
    "footer_terms": "Warunki korzystania",

     // About Section
    "about_title": "Kim jesteśmy?",
    "about_subtitle": "Odkryj nasze wyjątkowe podejście i zaangażowanie w Twój sukces finansowy",
    "about_heading": "Ekspertyza finansowa do Państwa usług",
    "about_p1": "Magdeleine Solutions to innowacyjna i ludzka agencja finansowa z siedzibą we Francji, która towarzyszy osobom fizycznym, niezależnym i małym przedsiębiorstwom w realizacji ich projektów finansowych.",
    "about_p2": "Naszą misją jest demokratyzacja dostępu do rozwiązań finansowych poprzez oferowanie spersonalizowanego, przejrzystego i dostosowanego wsparcia dla każdej sytuacji. Wierzymy, że każdy zasługuje na szansę realizacji swoich projektów, niezależnie od swojego profilu lub historii bankowej.",
    "about_p3": "Dzięki naszej sieci partnerów bankowych i naszemu doświadczeniu rynkowemu znajdziemy dla Ciebie najlepsze rozwiązania, nawet w skomplikowanych sytuacjach.",
    "about_btn": "Nasze usługi",
    
    // Features Section
    "features_title": "Nasze 3 filary",
    "features_subtitle": "Podstawowe wartości, którymi kierujemy się w naszym podejściu i które gwarantują Państwa satysfakcję",
    "feature1_title": "Spersonalizowane wsparcie",
    "feature1_desc": "W Magdeleine Solutions każdy klient jest wyjątkowy. Nasi doradcy finansowi są przeszkoleni, aby słuchać, rozumieć i kierować każdego w stronę rozwiązania, które najlepiej odpowiada jego osobistej i zawodowej sytuacji",
    "feature2_title": "Przejrzystość i pedagogika",
    "feature2_desc": "Uproszczamy kluczowe informacje, aby pomóc naszym klientom podejmować świadome decyzje. Nasze podejście pedagogiczne pozwala zrozumieć każdy etap procesu, bez niezrozumiałego żargonu.",
    "feature3_title": "Rozwiązania szyte na miarę",
    "feature3_desc": "Dzięki naszej sieci partnerów bankowych oferujemy zróżnicowane i elastyczne oferty, nawet w przypadku początkowej odmowy ze strony banku. Nasze doświadczenie pozwala nam znaleźć rozwiązania dostosowane do Twojej sytuacji.",
    
    // Services Section
    "services_title": "Nasze usługi",
    "services_subtitle": "Rozwiązania finansowe dostosowane do wszystkich Twoich potrzeb",
    "services_tab_all": "Wszystkie usługi",
    "services_tab_personal": "Osoby fizyczne",
    "services_tab_professional": "Profesjonaliści",
    "services_tab_advice": "Porada",
    "service_simulate": "Symuluj pożyczkę",
    "service_contact": "Skontaktuj się z nami",
    
    // Services - All
    "service1_title": "Pożyczka osobista",
    "service1_desc": "Sfinansuj swoje osobiste projekty pożyczką dostosowaną do Twojej sytuacji. Konkurencyjne stawki i elastyczne warunki, aby zrealizować Twoje marzenia.",
    "service2_title": "Kredyt hipoteczny",
    "service2_desc": "Zrealizuj swój projekt nieruchomości dzięki naszemu szytemu na miarę wsparciu. Zakup, budowa lub remont, znajdziemy idealne rozwiązanie",
    "service3_title": "Pożyczka dla firm",
    "service3_desc": "Rozwijaj swoją działalność dzięki naszym rozwiązaniom finansowym dla profesjonalistów. Tworzenie, przejęcie lub rozwój biznesu.",
    "service4_title": "Konsolidacja zadłużenia",
    "service4_desc": "Uprość swoje finanse, konsolidując swoje pożyczki. Zmniejsz swoje miesięczne płatności i odzyskaj zdrową sytuację finansową.",
    
    // Services - Individuals
    "service5_title": "Kredyt samochodowy",
    "service5_desc": "Sfinansuj zakup nowego lub używanego pojazdu dzięki naszym dostosowanym rozwiązaniom. Korzystne warunki i uproszczone procedury.",
    
    // Services - Professionals
    "service6_title": "Leasing",
    "service6_desc": "Sfinansuj swój profesjonalny sprzęt bez wpływu na przepływy pieniężne. Elastyczne rozwiązanie z opcją zakupu na koniec umowy.",
    "service7_title": "Finansowanie przepływów pieniężnych",
    "service7_desc": "Zoptymalizuj przepływy pieniężne dzięki naszym rozwiązaniom finansowania krótkoterminowego. Staw czoła nieoczekiwanym i szesnastu możliwościom.",
    "service8_title": "Kredyt na nieruchomości komercyjne",
    "service8_desc": "nwestuj w swoje profesjonalne lokale z naszymi dostosowanymi rozwiązaniami finansowymi. Zakup, budowa lub renowacja lokali komercyjnych.",
    
    // Services - Advice
    "service9_title": "Porady finansowe",
    "service9_desc": "Skorzystaj z wiedzy naszych doradców, aby zoptymalizować swoją sytuację finansową. Spersonalizowana analiza i dostosowane rekomendacje.",
    "service10_title": "Wsparcie administracyjne",
    "service10_desc": "Uprość swoje procedury administracyjne dzięki naszemu spersonalizowanemu wsparciu. Złóż wniosek, śledź działania i nawiąż relacje z organizacjami finansowymi.",
    "service11_title": "Ubezpieczenie kredytu",
    "service11_desc": "Chroń siebie i swoich bliskich dzięki ubezpieczeniu dostosowanemu do Twojej pożyczki. Spersonalizowane gwarancje i konkurencyjne stawki.",
    "service12_title": "Optymalizacja podatkowa",
    "service12_desc": "Zmniejsz obciążenie podatkowe dzięki naszym fachowym poradom. Strategie prawne, które zoptymalizują Twoje opodatkowanie zgodnie z Twoją sytuacją.",
    
    // Stats Section
    "stat1_label": "Lata doświadczenia",
    "stat2_label": "Zadowoleni klienci",
    "stat3_label": "Partnerzy bankowi",
    "stat4_label": "Stopień zadowolenia (%)",
    
    // Testimonials Section
    "testimonials_title": "Referencje",
    "testimonials_subtitle": "Dowiedz się, co mówią o nas nasi klienci",
    "testimonial1_text": "Magdeleine Solutions przekształciło nasz projekt nieruchomości w rzeczywistość. Pomimo kilku odmów bankowych, ich zespół znalazł rozwiązanie dostosowane do naszej sytuacji. Ich profesjonalizm i wytrwałość zrobiły całą różnicę.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Kredyt hipoteczny, Milan",
    "testimonial2_text": "ako przedsiębiorca potrzebowałem szybkiego finansowania, aby wykorzystać okazję. Zespół Magdeleine Solutions zrozumiał pilność i sprawnie mi towarzyszył. Dzięki nim mogłem rozwinąć swoją działalność na czas.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Kredyt biznesowy, Lyon",
    "testimonial3_text": "Konsolidacja zadłużenia zaproponowana przez Magdeleine Solutions pozwoliła mi znacząco obniżyć miesięczne raty. Ich pedagogiczne podejście pomogło mi zrozumieć każdy etap procesu. Gorąco polecam ich usługi w celu odzyskania zdrowej sytuacji finansowej.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Konsolidacja zadłużenia, Warsaw",
    
    // CTA Section
    "cta_title": "Gotowy do realizacji swojego projektu?",
    "cta_subtitle": "Zrób pierwszy krok w kierunku osiągnięcia swoich celów finansowych. Nasz zespół jest gotowy Ci towarzyszyć.",
    "cta_btn_request": "Złóż wniosek",
    "cta_btn_contact": "Skontaktuj się z nami",
    
    // Contact Section
    "contact_title": "Skontaktuj się z nami",
    "contact_subtitle": "Nasz zespół jest do Twojej dyspozycji, aby odpowiedzieć na wszystkie Twoje pytania",
    "contact_address_title": "Adres",
    "contact_address": "123 Finance Avenue, 75008 Paris, France",
    "contact_phone_title": "Telefon",
    "contact_email_title": "Email",
    "contact_hours_title": "Godziny otwarcia",
    "contact_hours": "Poniedziałek - piątek: 9:00 - 18:00",
    "contact_form_name": "Imię i nazwisko",
    "contact_form_name_placeholder": "Twoje imię i nazwisko",
    "contact_form_email": "Email",
    "contact_form_email_placeholder": "Twój adres e-mail",
    "contact_form_phone": "Telefone",
    "contact_form_phone_placeholder": "Twój numer telefonu",
    "contact_form_subject": "Temat",
    "contact_form_subject_placeholder": "Wybierz temat",
    "contact_form_subject_loan": "Wniosek o pożyczkę",
    "contact_form_subject_info": "Wniosek o informacje",
    "contact_form_subject_appointment": "Spotkanie",
    "contact_form_subject_other": "Inne",
    "contact_form_message": "Wiadomość",
    "contact_form_message_placeholder": "Twoja wiadomość",
    "contact_form_submit": "Wyślij wiadomość",
    
    // === STRONA GŁÓWNA (index_langue.html) ===
    // Preloader
    "preloader_loading": "Ładowanie...",
    
    // Hero Section
    "hero_title": "Budujmy razem Twoją przyszłość finansową",
    "hero_subtitle": "Magdeleine Solutions towarzyszy Ci we wszystkich Twoich projektach z rozwiązaniami finansowymi szytymi na miarę, przejrzystymi i dostosowanymi do Twojej sytuacji.",
    "hero_btn_services": "Odkryj nasze usługi",
    "hero_btn_contact": "Skontaktuj się z nami",
    "hero_scroll": "Odkryj",
    
    // === STRONA SYMULACJI (simulation_langue.html) ===
    // Nagłówek strony
    "sim_title": "Symulacja pożyczki",
    "sim_subtitle": "Oblicz swoje miesięczne raty i uzyskaj szczegółowy przegląd swojej pożyczki",
    
    // Formularz symulacji
    "sim_form_title": "Parametry pożyczki",
    "sim_amount_borrowed": "Kwota pożyczki",
    "sim_duration": "Czas trwania pożyczki",
    "sim_rate": "Stopa procentowa",
    "sim_type": "Rodzaj pożyczki",
    "sim_calculate": "Oblicz",
    
    // Rodzaje pożyczek
    "loan_type_personal": "Pożyczka osobista",
    "loan_type_mortgage": "Kredyt hipoteczny",
    "loan_type_business": "Pożyczka biznesowa",
    "loan_type_debt_consolidation": "Konsolidacja zadłużenia",
    
    // Opcje czasu trwania (przykłady, do uzupełnienia dla wszystkich czasów trwania)
    "duration_12": "12 miesięcy",
    "duration_24": "24 miesiące",
    "duration_36": "36 miesięcy",
    "duration_48": "48 miesięcy",
    "duration_60": "60 miesięcy",
    "duration_120": "120 miesięcy",
    "duration_180": "180 miesięcy",
    "duration_240": "240 miesięcy",
    "duration_360": "360 miesięcy",
    
    // Wyniki symulacji
    "sim_results_title": "Wyniki symulacji",
    "sim_monthly": "Miesięczna rata",
    "sim_total_interest": "Całkowity koszt odsetek",
    "sim_total_cost": "Całkowity koszt pożyczki",
    "sim_table_year": "Rok",
    "sim_table_principal": "Spłacony kapitał",
    "sim_table_interest": "Zapłacone odsetki",
    "sim_table_remaining": "Pozostały kapitał",
    "sim_download": "Pobierz podsumowanie PDF",
    "sim_no_result": "Wypełnij pola, aby uzyskać symulację.",
    
    // Podgląd PDF
    "pdf_preview_title": "Podgląd PDF",
    "pdf_subtitle": "Szczegółowe podsumowanie Twojej symulacji",
    "pdf_loan_details": "Szczegóły pożyczki",
    "pdf_amortization": "Harmonogram amortyzacji",
    "pdf_disclaimer_1": "Ta symulacja jest dostarczana wyłącznie w celach informacyjnych i nie stanowi oferty umownej.",
    "pdf_disclaimer_2": "Rzeczywiste kwoty mogą się różnić w zależności od Twojej sytuacji osobistej i warunków rynkowych.",
    "pdf_contact": "Aby uzyskać więcej informacji, skontaktuj się z nami pod numerem +33 7 45 40 20 18 lub contact@creditlyonnaislcl.fr",
    "pdf_download": "Pobierz PDF",
    "pdf_close": "Zamknij",
    
    // Pozostałe tłumaczenia dla języka polskiego...
       // === PAGE DE BIOGRAPHIE (biographie_multilingue.html) ===
    // Page Header
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Założyciel i dyrektor grupy Magdeleine Solutions",
    "bio_heading": "Doświadczenie zawodowe",
    
    // Biographie
    "bio_p1": "51-letni Serge Magdeleine jest absolwentem École des Ponts i posiada tytuł MBA z Collège des Ingénieurs. Swoją karierę rozpoczął w konsultingu w Mercer Oliver Wyman w latach 1996–1999, zanim został prezesem założycielem Serge Magdeleine Solutions Group w 2009 r.",
    "bio_p2": "W 2001 roku dołączył do Crédit Agricole S.A. jako szef bankowości internetowej, a następnie szef działu dystrybucji i wielokanałowości. W 2007 roku dołączył do Caisse régionale Centre-est jako dyrektor ds. biznesu i międzynarodowych, a następnie w 2010 roku do Caisse régionale Alpes Provence jako zastępca dyrektora zarządzającego. W 2015 roku odpowiadał za zarządzanie kanałami cyfrowymi Grupy, a w 2016 roku został dyrektorem zarządzającym Crédit Agricole.”,",
    "bio_p3": "Obecnie zajmuje stanowisko zastępcy dyrektora generalnego Crédit Agricole S.A. i dołącza do Komitetu Wykonawczego Crédit Agricole S.A., zastępując Michela Mathieu, dyrektora generalnego LCL od 4 kwietnia 2016 r",
    
    // Citation
    "bio_quote": "Finanse muszą służyć ludzkości. Naszą misją jest demokratyzacja dostępu do rozwiązań finansowych dla wszystkich, poprzez umieszczenie przejrzystości i zaufania w centrum naszych relacji z klientami",
    "bio_quote_author": "Serge Magdeleine",
    
    // Réalisations
    "bio_achievement1_title": "Doskonałość w przywództwie",
    "bio_achievement1_desc": "Doceniony za swoją strategiczną wizję i zdolność do prowadzenia zespołów do doskonałości, Serge Magdeleine otrzymał wiele wyróżnień za innowacyjne przywództwo w sektorze finansowym.",
    "bio_achievement2_title": "Innowacje finansowe",
    "bio_achievement2_desc": "Był pionierem w rozwoju dostępnych i przejrzystych rozwiązań finansowych, przyczynił się do cyfrowej transformacji sektora bankowego we Francji.",
    "bio_achievement3_title": "Zaangażowanie społeczne",
    "bio_achievement3_desc": "Silnie zaangażowany w inicjatywy na rzecz włączenia finansowego, Serge Magdeleine pracuje nad tym, aby usługi finansowe były dostępne dla wszystkich, szczególnie dla populacji tradycyjnie wykluczonych z systemu bankowego",
    
    // CTA
    "bio_contact_btn": "Skontaktuj się z Serge'em Magdeleine'em",

    // === STRONA FORMULARZA (formularz_jezyk.html) ===
    // Nagłówek strony
    "form_title": "Wniosek o pożyczkę",
    "form_subtitle": "Wypełnij poniższy formularz, aby przesłać swój wniosek o finansowanie",
    "form_header": "Formularz wniosku o pożyczkę",
    "form_required": "Wszystkie pola oznaczone gwiazdką (*) są obowiązkowe",

    // Sekcje formularza
    "form_section1": "Informacje osobiste",
    "form_firstname": "Imię",
    "form_lastname": "Nazwisko",
    "form_email": "Email",
    "form_phone": "Telefon",
    "form_birthdate": "Data urodzenia",
    "form_nationality": "Narodowość",
    "form_address": "Pełny adres",

    "form_section2": "Informacje o pożyczce",
    "form_loan_type": "Rodzaj pożyczki",
    "form_select_option": "Wybierz opcję",
    "form_loan_amount": "Kwota pożyczki (€)",
    "form_amount_note": "Kwota między 2 000€ a 1 000 000€",
    "form_loan_duration": "Okres pożyczki (miesiące)",
    "form_loan_purpose": "Cel pożyczki",
    "form_loan_details": "Dodatkowe informacje o projekcie",

    // Czas trwania
    "form_duration_12": "12 miesięcy (1 rok)",
    "form_duration_24": "24 miesiące (2 lata)",
    "form_duration_36": "36 miesięcy (3 lata)",
    "form_duration_48": "48 miesięcy (4 lata)",
    "form_duration_60": "60 miesięcy (5 lat)",
    "form_duration_72": "72 miesiące (6 lat)",
    "form_duration_84": "84 miesiące (7 lat)",
    "form_duration_96": "96 miesięcy (8 lat)",
    "form_duration_108": "108 miesięcy (9 lat)",
    "form_duration_120": "120 miesięcy (10 lat)",
    "form_duration_180": "180 miesięcy (15 lat)",
    "form_duration_240": "240 miesięcy (20 lat)",
    "form_duration_300": "300 miesięcy (25 lat)",

    "form_section3": "Informacje finansowe",
    "form_monthly_income": "Miesięczny dochód netto (€)",
    "form_employment_status": "Status zatrudnienia",
    "form_status_employed": "Zatrudniony(a) na czas nieokreślony",
    "form_status_self_employed": "Samozatrudniony(a)",
    "form_status_business_owner": "Właściciel firmy",
    "form_status_retired": "Emeryt",
    "form_status_unemployed": "Bezrobotny(a)",
    "form_status_other": "Inne",
    "form_existing_loans": "Czy masz inne aktywne pożyczki?",
    "form_yes": "Tak",
    "form_no": "Nie",
    "form_monthly_debt": "Łączne miesięczne raty obecnych zobowiązań (€)",
    "form_debt_note": "Pozostaw puste, jeśli nie masz zadłużenia",

    "form_section4": "Dokumenty potwierdzające",
    "form_documents_note": "Prosimy o dostarczenie poniższych dokumentów w celu przyspieszenia przetwarzania wniosku. Dozwolone formaty: PDF, JPG, PNG (maks. 5 MB na plik)",
    "form_id_document": "Dowód tożsamości",
    "form_proof_address": "Potwierdzenie adresu",
    "form_proof_income": "Potwierdzenie dochodu",
    "form_bank_statements": "Wyciągi bankowe (ostatnie 3 miesiące)",
    "form_upload_file": "Prześlij plik",
    "form_additional_documents": "Dodatkowe dokumenty (opcjonalnie)",
    "form_additional_note": "Każdy dodatkowy dokument istotny dla twojego wniosku",

    "form_submit": "Wyślij mój wniosek",
    "form_success_title": "Wniosek został pomyślnie wysłany!",
    "form_success_text": "Otrzymaliśmy Twój wniosek o pożyczkę. Nasz zespół niezwłocznie go rozpatrzy i skontaktuje się z Tobą w ciągu 24–48 godzin, aby omówić kolejne kroki.",
"form_back_home": "Powrót na stronę główną",

  },

  // ======== NIEMIECKI ========
  "de": {
    // === GEMEINSAME ELEMENTE (HEADER, FOOTER, NAVIGATION) ===
    // Navigation
    "nav_home": "Startseite",
    "nav_about": "Über uns",
    "nav_services": "Dienstleistungen",
    "nav_testimonials": "Referenzen",
    "nav_biography": "Biografie",
    "nav_simulation": "Simulation",
    "nav_loan_request": "Kreditantrag",
    
    // Sprachauswahl
    "lang_fr": "Französisch",
    "lang_en": "Englisch",
    "lang_pl": "Polnisch",
    "lang_de": "Deutsch",
    "lang_it": "Italienisch",
    "lang_pt": "Portugiesisch",
    
    // Footer
    "footer_about": "Peer-to-Peer-Kreditdienste seit 2009",
    "footer_quick_links": "Schnelllinks",
    "footer_services": "Unsere Dienstleistungen",
    "footer_contact": "Kontakt",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Abonnieren Sie unseren Newsletter, um unsere Neuigkeiten und Finanzberatung zu erhalten.",
    "newsletter_placeholder": "Ihre E-Mail",
    "footer_rights": "Alle Rechte vorbehalten.",
    "footer_privacy": "Datenschutzrichtlinie",
    "footer_terms": "Nutzungsbedingungen",
    // === STARTSEITE (index_langue.html) ===
    // Preloader
    "preloader_loading": "Lädt...",
    
    // Hero Section
    "hero_title": "Gemeinsam bauen wir Ihre finanzielle Zukunft",
    "hero_subtitle": "Magdeleine Solutions begleitet Sie bei all Ihren Projekten mit maßgeschneiderten, transparenten Finanzierungslösungen, die auf Ihre Situation zugeschnitten sind.",
    "hero_btn_services": "Unsere Dienstleistungen entdecken",
    "hero_btn_contact": "Kontakt aufnehmen",
    "hero_scroll": "Entdecken",
    
    // About Section
    "about_title": "Wer sind wir?",
    "about_subtitle": "Entdecken Sie unseren einzigartigen Ansatz und unser Engagement für Ihren finanziellen Erfolg",
    "about_heading": "Finanzexpertise zu Ihren Diensten",
    "about_p1": "Magdeleine Solutions ist eine innovative und menschliche Finanzierungsagentur in Frankreich, die Privatpersonen, Selbstständige und kleine Unternehmen bei der Verwirklichung ihrer Finanzprojekte unterstützt.",
    "about_p2": "Unsere Mission ist es, den Zugang zu Finanzierungslösungen zu demokratisieren, indem wir eine persönliche, transparente und auf jede Situation zugeschnittene Betreuung anbieten. Wir glauben, dass jeder die Chance verdient, seine Projekte zu verwirklichen, unabhängig von seinem Profil oder seiner Bankhistorie.",
    "about_p3": "Dank unseres Netzwerks von Bankpartnern und unserer Marktexpertise finden wir die besten Lösungen für Sie, auch in komplexen Situationen.",
    "about_btn": "Unsere Dienstleistungen",
    
    // Features Section
    "features_title": "Unsere 3 Säulen",
    "features_subtitle": "Die Grundwerte, die unseren Ansatz leiten und Ihre Zufriedenheit garantieren",
    "feature1_title": "Persönliche Betreuung",
    "feature1_desc": "Bei Magdeleine Solutions ist jeder Kunde einzigartig. Unsere Finanzberater sind darauf geschult, zuzuhören, zu verstehen und jeden zur passendsten Lösung für seine persönliche und berufliche Situation zu führen.",
    "feature2_title": "Transparenz & Pädagogik",
    "feature2_desc": "Wir vereinfachen die wichtigsten Informationen, um unseren Kunden zu helfen, fundierte Entscheidungen zu treffen. Unser pädagogischer Ansatz ermöglicht es Ihnen, jeden Schritt des Prozesses zu verstehen, ohne unverständlichen Fachjargon.",
    "feature3_title": "Maßgeschneiderte Lösungen",
    "feature3_desc": "Dank unseres Netzwerks von Bankpartnern bieten wir vielfältige und flexible Angebote, auch bei anfänglicher Bankablehnung. Unsere Expertise ermöglicht es uns, Lösungen zu finden, die zu Ihrer Situation passen.",
    
    // Services Section
    "services_title": "Unsere Dienstleistungen",
    "services_subtitle": "Finanzielle Lösungen für all Ihre Bedürfnisse",
    "services_tab_all": "Alle Dienstleistungen",
    "services_tab_personal": "Privatpersonen",
    "services_tab_professional": "Unternehmen",
    "services_tab_advice": "Beratung",
    "service_simulate": "Kredit simulieren",
    "service_contact": "Kontakt aufnehmen",
    
    // Services - Alle
    "service1_title": "Privatkredit",
    "service1_desc": "Finanzieren Sie Ihre persönlichen Projekte mit einem Kredit, der auf Ihre Situation zugeschnitten ist. Wettbewerbsfähige Zinsen und flexible Bedingungen, um Ihre Träume zu verwirklichen.",
    "service2_title": "Immobilienkredit",
    "service2_desc": "Verwirklichen Sie Ihr Immobilienprojekt mit unserer maßgeschneiderten Betreuung. Kauf, Bau oder Renovierung – wir finden die ideale Lösung.",
    "service3_title": "Geschäftskredit",
    "service3_desc": "Entwickeln Sie Ihre Geschäftstätigkeit mit unseren Finanzierungslösungen für Unternehmen. Gründung, Übernahme oder Unternehmenswachstum.",
    "service4_title": "Kreditumschuldung",
    "service4_desc": "Vereinfachen Sie Ihre Finanzen durch die Zusammenfassung Ihrer Kredite. Reduzieren Sie Ihre monatlichen Raten und erreichen Sie eine gesunde finanzielle Situation.",
    
    // Services - Privatpersonen
    "service5_title": "Autokredit",
    "service5_desc": "Finanzieren Sie den Kauf Ihres neuen oder gebrauchten Fahrzeugs mit unseren passenden Lösungen. Vorteilhafte Bedingungen und vereinfachte Verfahren.",
    
    // Services - Unternehmen
    "service6_title": "Leasing",
    "service6_desc": "Finanzieren Sie Ihre Geschäftsausstattung, ohne Ihre Liquidität zu beeinträchtigen. Flexible Lösung mit Kaufoption am Ende des Vertrags.",
    "service7_title": "Liquiditätsfinanzierung",
    "service7_desc": "Optimieren Sie Ihre Liquidität mit unseren kurzfristigen Finanzierungslösungen. Bewältigen Sie unerwartete Situationen und nutzen Sie Chancen.",
    "service8_title": "Geschäftsimmobilienkredit",
    "service8_desc": "Investieren Sie in Ihre Geschäftsräume mit unseren passenden Finanzierungslösungen. Kauf, Bau oder Renovierung von Gewerbeimmobilien.",
    
    // Services - Beratung
    "service9_title": "Finanzberatung",
    "service9_desc": "Profitieren Sie von der Expertise unserer Berater, um Ihre finanzielle Situation zu optimieren. Persönliche Analyse und maßgeschneiderte Empfehlungen.",
    "service10_title": "Administrative Begleitung",
    "service10_desc": "Vereinfachen Sie Ihre Verwaltungsverfahren mit unserer persönlichen Betreuung. Dossierzusammenstellung, Nachverfolgung und Kommunikation mit Finanzinstituten.",
    "service11_title": "Kreditversicherung",
    "service11_desc": "Schützen Sie sich und Ihre Angehörigen mit einer Versicherung, die zu Ihrem Kredit passt. Personalisierte Garantien und wettbewerbsfähige Tarife.",
    "service12_title": "Steueroptimierung",
    "service12_desc": "Reduzieren Sie Ihre Steuerlast dank der Beratung unserer Experten. Legale Strategien zur Optimierung Ihrer Besteuerung entsprechend Ihrer Situation.",
    
    // Stats Section
    "stat1_label": "Jahre Erfahrung",
    "stat2_label": "Zufriedene Kunden",
    "stat3_label": "Bankpartner",
    "stat4_label": "Zufriedenheitsrate (%)",
    
    // Testimonials Section
    "testimonials_title": "Kundenstimmen",
    "testimonials_subtitle": "Lesen Sie, was unsere Kunden über uns sagen",
    "testimonial1_text": "Magdeleine Solutions hat unser Immobilienprojekt Wirklichkeit werden lassen. Trotz mehrerer Bankablehnungen hat ihr Team eine Lösung gefunden, die zu unserer Situation passt. Ihr Professionalismus und ihre Beharrlichkeit haben den Unterschied gemacht.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Immobilienkredit, Milan",
    "testimonial2_text": "Als Unternehmer brauchte ich eine schnelle Finanzierung, um eine Chance zu nutzen. Das Team von Magdeleine Solutions hat die Dringlichkeit verstanden und mich effizient begleitet. Dank ihnen konnte ich mein Geschäft rechtzeitig entwickeln.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Geschäftskredit, Lyon",
    "testimonial3_text": "Die Kreditumschuldung von Magdeleine Solutions hat meine monatlichen Raten erheblich reduziert. Ihr pädagogischer Ansatz hat mir geholfen, jeden Schritt des Prozesses zu verstehen. Ich empfehle ihre Dienstleistungen wärmstens, um eine gesunde finanzielle Situation wiederzuerlangen.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Kreditumschuldung, Warsaw",
    
    // CTA Section
    "cta_title": "Bereit, Ihr Projekt zu verwirklichen?",
    "cta_subtitle": "Machen Sie den ersten Schritt zur Verwirklichung Ihrer finanziellen Ziele. Unser Team steht bereit, Sie zu begleiten.",
    "cta_btn_request": "Anfrage stellen",
    "cta_btn_contact": "Kontakt aufnehmen",
    
    // Contact Section
    "contact_title": "Kontaktieren Sie uns",
    "contact_subtitle": "Unser Team steht Ihnen für alle Fragen zur Verfügung",
    "contact_address_title": "Adresse",
    "contact_address": "123 Avenue des Finances, 75008 Paris, Frankreich",
    "contact_phone_title": "Telefon",
    "contact_email_title": "E-Mail",
    "contact_hours_title": "Öffnungszeiten",
    "contact_hours": "Montag - Freitag: 9:00 - 18:00 Uhr",
    "contact_form_name": "Vollständiger Name",
    "contact_form_name_placeholder": "Ihr vollständiger Name",
    "contact_form_email": "E-Mail",
    "contact_form_email_placeholder": "Ihre E-Mail-Adresse",
    "contact_form_phone": "Telefon",
    "contact_form_phone_placeholder": "Ihre Telefonnummer",
    "contact_form_subject": "Betreff",
    "contact_form_subject_placeholder": "Wählen Sie ein Thema",
    "contact_form_subject_loan": "Kreditanfrage",
    "contact_form_subject_info": "Informationsanfrage",
    "contact_form_subject_appointment": "Terminvereinbarung",
    "contact_form_subject_other": "Anderes",
    "contact_form_message": "Nachricht",
    "contact_form_message_placeholder": "Ihre Nachricht",
    "contact_form_submit": "Nachricht senden",
    // === SIMULATION PAGE (simulation_langue.html) ===
    // Page Header
    "sim_title": "Kreditsimulation",
    "sim_subtitle": "Berechnen Sie Ihre monatlichen Zahlungen und erhalten Sie einen detaillierten Überblick über Ihren Kredit",
    
    // Simulation Form
    "sim_form_title": "Kreditparameter",
    "sim_amount_borrowed": "Kreditbetrag",
    "sim_duration": "Kreditlaufzeit",
    "sim_rate": "Zinssatz",
    "sim_type": "Kreditart",
    "sim_calculate": "Berechnen",
    
    // Loan Types
    "loan_type_personal": "Privatkredit",
    "loan_type_mortgage": "Hypothekenkredit",
    "loan_type_business": "Geschäftskredit",
    "loan_type_debt_consolidation": "Schuldenkonsolidierung",
    
    // Duration Options (examples, to be completed for all durations)
    "duration_12": "12 Monate",
    "duration_24": "24 Monate",
    "duration_36": "36 Monate",
    "duration_48": "48 Monate",
    "duration_60": "60 Monate",
    "duration_120": "120 Monate",
    "duration_180": "180 Monate",
    "duration_240": "240 Monate",
    "duration_360": "360 Monate",
    
    // Simulation Results
    "sim_results_title": "Simulationsergebnisse",
    "sim_monthly": "Monatliche Rate",
    "sim_total_interest": "Gesamtzinskosten",
    "sim_total_cost": "Gesamtkreditkosten",
    "sim_table_year": "Jahr",
    "sim_table_principal": "Zurückgezahltes Kapital",
    "sim_table_interest": "Gezahlte Zinsen",
    "sim_table_remaining": "Verbleibendes Kapital",
    "sim_download": "PDF-Zusammenfassung herunterladen",
    "sim_no_result": "Bitte füllen Sie die Felder aus, um eine Simulation zu erhalten.",
    
    // Weitere Übersetzungen für Deutsch...
    // === FORMULARSEITE (formular_sprache.html) ===
    // Seitenkopf
    "form_title": "Darlehensantrag",
    "form_subtitle": "Füllen Sie das untenstehende Formular aus, um Ihren Finanzierungsantrag zu stellen",
    "form_header": "Darlehensantragsformular",
    "form_required": "Alle mit einem Sternchen (*) gekennzeichneten Felder sind Pflichtfelder",

    // Formularabschnitte
    "form_section1": "Persönliche Informationen",
    "form_firstname": "Vorname",
    "form_lastname": "Nachname",
    "form_email": "E-Mail",
    "form_phone": "Telefon",
    "form_birthdate": "Geburtsdatum",
    "form_nationality": "Nationalität",
    "form_address": "Vollständige Adresse",

    "form_section2": "Darlehensinformationen",
    "form_loan_type": "Art des Darlehens",
    "form_select_option": "Wählen Sie eine Option",
    "form_loan_amount": "Darlehensbetrag (€)",
    "form_amount_note": "Betrag zwischen 2.000 € und 1.000.000 €",
    "form_loan_duration": "Dauer des Darlehens (Monate)",
    "form_loan_purpose": "Zweck des Darlehens",
    "form_loan_details": "Weitere Details zu Ihrem Projekt",

    // Laufzeiten
    "form_duration_12": "12 Monate (1 Jahr)",
    "form_duration_24": "24 Monate (2 Jahre)",
    "form_duration_36": "36 Monate (3 Jahre)",
    "form_duration_48": "48 Monate (4 Jahre)",
    "form_duration_60": "60 Monate (5 Jahre)",
    "form_duration_72": "72 Monate (6 Jahre)",
    "form_duration_84": "84 Monate (7 Jahre)",
    "form_duration_96": "96 Monate (8 Jahre)",
    "form_duration_108": "108 Monate (9 Jahre)",
    "form_duration_120": "120 Monate (10 Jahre)",
    "form_duration_180": "180 Monate (15 Jahre)",
    "form_duration_240": "240 Monate (20 Jahre)",
    "form_duration_300": "300 Monate (25 Jahre)",

    "form_section3": "Finanzielle Informationen",
    "form_monthly_income": "Monatliches Nettoeinkommen (€)",
    "form_employment_status": "Beschäftigungsstatus",
    "form_status_employed": "Festangestellte(r)",
    "form_status_self_employed": "Selbstständig",
    "form_status_business_owner": "Unternehmer(in)",
    "form_status_retired": "Rentner(in)",
    "form_status_unemployed": "Arbeitslos",
    "form_status_other": "Sonstige",
    "form_existing_loans": "Haben Sie weitere laufende Kredite?",
    "form_yes": "Ja",
    "form_no": "Nein",
    "form_monthly_debt": "Gesamte monatliche Schuldenzahlungen (€)",
    "form_debt_note": "Leer lassen, wenn keine Schulden vorhanden sind",

    "form_section4": "Nachweisdokumente",
    "form_documents_note": "Bitte reichen Sie die folgenden Dokumente ein, um die Bearbeitung Ihres Antrags zu beschleunigen. Erlaubte Formate: PDF, JPG, PNG (max. 5 MB pro Datei)",
    "form_id_document": "Ausweisdokument",
    "form_proof_address": "Wohnsitznachweis",
    "form_proof_income": "Einkommensnachweis",
    "form_bank_statements": "Kontoauszüge (letzte 3 Monate)",
    "form_upload_file": "Datei hochladen",
    "form_additional_documents": "Zusätzliche Dokumente (optional)",
    "form_additional_note": "Alle weiteren relevanten Dokumente für Ihren Antrag",

    "form_submit": "Meinen Antrag absenden",
    "form_success_title": "Antrag erfolgreich gesendet!",
    "form_success_text": "Wir haben Ihren Darlehensantrag erhalten. Unser Team wird ihn so schnell wie möglich prüfen und sich innerhalb von 24–48 Stunden bei Ihnen melden, um die nächsten Schritte zu besprechen.",
    "form_back_home": "Zurück zur Startseite",

    // === BIOGRAFIESEITE (biographie_mehrsprachig.html) ===
    // Seitenkopf
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Gründer und Direktor der Magdeleine Solutions Gruppen",
    "bio_heading": "Beruflicher Werdegang",

    // Biografie
    "bio_p1": "Serge Magdeleine, 51 Jahre alt, ist Absolvent der École des Ponts und besitzt einen MBA des Collège des Ingénieurs. Seine Karriere begann er in der Beratung bei Mercer Oliver Wyman von 1996 bis 1999, bevor er 2009 Präsident und Gründer der Magdeleine Solutions Gruppen wurde.",
    "bio_p2": "Im Jahr 2001 trat er bei Crédit Agricole S.A. als Leiter des Online-Bankings ein und wurde anschließend Leiter der Abteilung für Vertrieb und Multikanal. 2007 wechselte er zur Regionalbank Centre-Est als Direktor für Unternehmen und Internationales, dann 2010 zur Regionalbank Alpes Provence als stellvertretender Generaldirektor. 2015 übernahm er die Verantwortung für die digitalen Prozesse der Gruppe und wurde 2016 Generaldirektor von Crédit Agricole.",
    "bio_p3": "Derzeit ist er stellvertretender Generaldirektor von Crédit Agricole S.A. und Mitglied des Exekutivausschusses von Crédit Agricole S.A., als Nachfolger von Michel Mathieu, Generaldirektor von LCL seit dem 4. April 2016.",

    // Zitat
    "bio_quote": "Finanzen müssen dem Menschen dienen. Unsere Mission ist es, allen den Zugang zu Finanzierungslösungen zu ermöglichen, wobei Transparenz und Vertrauen im Zentrum der Kundenbeziehung stehen.",
    "bio_quote_author": "Serge Magdeleine",

    // Erfolge
    "bio_achievement1_title": "Exzellenz in der Führung",
    "bio_achievement1_desc": "Serge Magdeleine ist bekannt für seine strategische Vision und seine Fähigkeit, Teams zu Höchstleistungen zu führen. Er wurde mehrfach für seine innovative Führung im Finanzsektor ausgezeichnet.",
    "bio_achievement2_title": "Finanzielle Innovation",
    "bio_achievement2_desc": "Als Pionier bei der Entwicklung zugänglicher und transparenter Finanzlösungen hat er maßgeblich zur digitalen Transformation des Bankensektors in Frankreich beigetragen.",
    "bio_achievement3_title": "Soziales Engagement",
    "bio_achievement3_desc": "Stark engagiert in Initiativen zur finanziellen Inklusion setzt sich Serge Magdeleine dafür ein, Finanzdienstleistungen für alle zugänglich zu machen, insbesondere für traditionell ausgeschlossene Bevölkerungsgruppen.",

    // CTA
    "bio_contact_btn": "Kontaktieren Sie Serge Magdeleine",




  },

  // ======== WŁOSKI ========
  "it": {
    // === ELEMENTI COMUNI (INTESTAZIONE, PIÈ DI PAGINA, NAVIGAZIONE) ===
    // Navigazione
    "nav_home": "Home",
    "nav_about": "Chi siamo",
    "nav_services": "Servizi",
    "nav_testimonials": "Testimonianze",
    "nav_biography": "Biografia",
    "nav_simulation": "Simulazione",
    "nav_loan_request": "Richiesta di prestito",
    
    // Selettore di lingua
    "lang_fr": "Francese",
    "lang_en": "Inglese",
    "lang_pl": "Polacco",
    "lang_de": "Tedesco",
    "lang_it": "Italiano",
    "lang_pt": "Portoghese",
    
    // Piè di pagina
    "footer_about": "Servizi di prestito tra privati dal 2009",
    "footer_quick_links": "Link rapidi",
    "footer_services": "I nostri servizi",
    "footer_contact": "Contatto",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Iscriviti alla nostra newsletter per ricevere le nostre novità e consigli finanziari.",
    "newsletter_placeholder": "La tua email",
    "footer_rights": "Tutti i diritti riservati.",
    "footer_privacy": "Politica sulla privacy",
    "footer_terms": "Termini di utilizzo",
    
    // === PAGINA PRINCIPALE (index_langue.html) ===
    // Preloader
    "preloader_loading": "Caricamento...",
    
    // Hero Section
    "hero_title": "Costruiamo insieme il tuo futuro finanziario",
    "hero_subtitle": "Magdeleine Solutions ti accompagna in tutti i tuoi progetti con soluzioni di finanziamento su misura, trasparenti e adatte alla tua situazione.",
    "hero_btn_services": "Scopri i nostri servizi",
    "hero_btn_contact": "Contattaci",
    "hero_scroll": "Scopri",
    
    // About Section
    "about_title": "Chi siamo?",
    "about_subtitle": "Scopri il nostro approccio unico e il nostro impegno per il tuo successo finanziario",
    "about_heading": "Un’esperienza finanziaria al tuo servizio",
    "about_p1": "Magdeleine Solutions è un’agenzia di finanziamento innovativa e umana, con sede in Francia, che accompagna privati, liberi professionisti e piccole imprese nella realizzazione dei loro progetti finanziari.",
    "about_p2": "La nostra missione è democratizzare l’accesso alle soluzioni di finanziamento offrendo un accompagnamento personalizzato, trasparente e adatto a ogni situazione. Crediamo che tutti meritino l’opportunità di realizzare i propri progetti, indipendentemente dal profilo o dalla storia bancaria.",
    "about_p3": "Grazie alla nostra rete di partner bancari e alla nostra esperienza sul mercato, troviamo le soluzioni migliori per te, anche in situazioni complesse.",
    "about_btn": "I nostri servizi",
    
    // Features Section
    "features_title": "I nostri 3 pilastri",
    "features_subtitle": "I valori fondamentali che guidano il nostro approccio e garantiscono la tua soddisfazione",
    "feature1_title": "Accompagnamento personalizzato",
    "feature1_desc": "In Magdeleine Solutions, ogni cliente è unico. I nostri consulenti finanziari sono formati per ascoltare, comprendere e orientare ognuno verso la soluzione più adatta alla sua situazione personale e professionale.",
    "feature2_title": "Trasparenza & pedagogia",
    "feature2_desc": "Semplifichiamo le informazioni chiave per aiutare i nostri clienti a prendere decisioni informate. Il nostro approccio pedagogico ti permette di capire ogni fase del processo, senza gergo incomprensibile.",
    "feature3_title": "Soluzioni su misura",
    "feature3_desc": "Grazie alla nostra rete di partner bancari, proponiamo offerte varie e flessibili, anche in caso di rifiuto bancario iniziale. La nostra esperienza ci permette di trovare soluzioni adatte alla tua situazione.",
    
    // Services Section
    "services_title": "I nostri servizi",
    "services_subtitle": "Soluzioni finanziarie adatte a tutte le tue esigenze",
    "services_tab_all": "Tutti i servizi",
    "services_tab_personal": "Privati",
    "services_tab_professional": "Professionisti",
    "services_tab_advice": "Consulenza",
    "service_simulate": "Simula un prestito",
    "service_contact": "Contattaci",
    
    // Services - Tutti
    "service1_title": "Prestito personale",
    "service1_desc": "Finanzia i tuoi progetti personali con un prestito adatto alla tua situazione. Tassi competitivi e condizioni flessibili per realizzare i tuoi sogni.",
    "service2_title": "Mutuo",
    "service2_desc": "Concretizza il tuo progetto immobiliare con il nostro accompagnamento su misura. Acquisto, costruzione o ristrutturazione, troviamo la soluzione ideale.",
    "service3_title": "Prestito professionale",
    "service3_desc": "Sviluppa la tua attività con le nostre soluzioni di finanziamento per professionisti. Creazione, rilevamento o sviluppo d’impresa.",
    "service4_title": "Ristrutturazione del debito",
    "service4_desc": "Semplifica le tue finanze raggruppando i tuoi prestiti. Riduci le tue rate e ritrova una situazione finanziaria sana.",
    
    // Services - Privati
    "service5_title": "Prestito auto",
    "service5_desc": "Finanzia l’acquisto del tuo veicolo nuovo o usato con le nostre soluzioni adatte. Condizioni vantaggiose e procedure semplificate.",
    
    // Services - Professionisti
    "service6_title": "Leasing",
    "service6_desc": "Finanzia le tue attrezzature professionali senza impattare sulla tua liquidità. Soluzione flessibile con opzione di acquisto a fine contratto.",
    "service7_title": "Finanziamento della liquidità",
    "service7_desc": "Ottimizza la tua liquidità con le nostre soluzioni di finanziamento a breve termine. Affronta gli imprevisti e cogli le opportunità.",
    "service8_title": "Mutuo professionale",
    "service8_desc": "Investi nei tuoi locali professionali con le nostre soluzioni di finanziamento adatte. Acquisto, costruzione o ristrutturazione di locali commerciali.",
    
    // Services - Consulenza
    "service9_title": "Consulenza finanziaria",
    "service9_desc": "Approfitta dell’esperienza dei nostri consulenti per ottimizzare la tua situazione finanziaria. Analisi personalizzata e raccomandazioni su misura.",
    "service10_title": "Accompagnamento amministrativo",
    "service10_desc": "Semplifica le tue procedure amministrative con il nostro accompagnamento personalizzato. Costituzione del dossier, monitoraggio e relazione con gli istituti finanziari.",
    "service11_title": "Assicurazione del mutuo",
    "service11_desc": "Proteggi te stesso e i tuoi cari con un’assicurazione adatta al tuo prestito. Garanzie personalizzate e tariffe competitive.",
    "service12_title": "Ottimizzazione fiscale",
    "service12_desc": "Riduci il tuo carico fiscale grazie ai consigli dei nostri esperti. Strategie legali per ottimizzare la tua imposizione in base alla tua situazione.",
    
    // Stats Section
    "stat1_label": "Anni di esperienza",
    "stat2_label": "Clienti soddisfatti",
    "stat3_label": "Partner bancari",
    "stat4_label": "Tasso di soddisfazione (%)",
    
    // Testimonials Section
    "testimonials_title": "Testimonianze",
    "testimonials_subtitle": "Scopri cosa dicono di noi i nostri clienti",
    "testimonial1_text": "Magdeleine Solutions ha trasformato il nostro progetto immobiliare in realtà. Nonostante diversi rifiuti bancari, il loro team ha trovato una soluzione adatta alla nostra situazione. Il loro professionalismo e perseveranza hanno fatto la differenza.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Mutuo, Milan",
    "testimonial2_text": "Come imprenditore, avevo bisogno di un finanziamento rapido per cogliere un’opportunità. Il team di Magdeleine Solutions ha capito l’urgenza e mi ha accompagnato con efficienza. Grazie a loro, ho potuto sviluppare la mia attività nei tempi previsti.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Prestito professionale, Lione",
    "testimonial3_text": "La ristrutturazione del debito proposta da Magdeleine Solutions mi ha permesso di ridurre notevolmente le mie rate. Il loro approccio pedagogico mi ha aiutato a capire ogni fase del processo. Raccomando vivamente i loro servizi per ritrovare una situazione finanziaria sana.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Ristrutturazione del debito, Warsaw",
    
    // CTA Section
    "cta_title": "Pronto a concretizzare il tuo progetto?",
    "cta_subtitle": "Fai il primo passo verso la realizzazione dei tuoi obiettivi finanziari. Il nostro team è pronto ad accompagnarti.",
    "cta_btn_request": "Fare una richiesta",
    "cta_btn_contact": "Contattaci",
    
    // Contact Section
    "contact_title": "Contattaci",
    "contact_subtitle": "Il nostro team è a tua disposizione per rispondere a tutte le tue domande",
    "contact_address_title": "Indirizzo",
    "contact_address": "123 Avenue des Finances, 75008 Parigi, Francia",
    "contact_phone_title": "Telefono",
    "contact_email_title": "Email",
    "contact_hours_title": "Orari di apertura",
    "contact_hours": "Lunedì - Venerdì: 9:00 - 18:00",
    "contact_form_name": "Nome completo",
    "contact_form_name_placeholder": "Il tuo nome completo",
    "contact_form_email": "Email",
    "contact_form_email_placeholder": "La tua email",
    "contact_form_phone": "Telefono",
    "contact_form_phone_placeholder": "Il tuo numero di telefono",
    "contact_form_subject": "Oggetto",
    "contact_form_subject_placeholder": "Seleziona un argomento",
    "contact_form_subject_loan": "Richiesta di prestito",
    "contact_form_subject_info": "Richiesta di informazioni",
    "contact_form_subject_appointment": "Prenotazione appuntamento",
    "contact_form_subject_other": "Altro",
    "contact_form_message": "Messaggio",
    "contact_form_message_placeholder": "Il tuo messaggio",
    "contact_form_submit": "Invia il messaggio",

    // === PAGINA DI SIMULAZIONE (simulation_langue.html) ===
    // Intestazione della pagina
    "sim_title": "Simulazione del prestito",
    "sim_subtitle": "Calcola le tue rate mensili e ottieni una panoramica dettagliata del tuo prestito",
    
    // Modulo di simulazione
    "sim_form_title": "Parametri del prestito",
    "sim_amount_borrowed": "Importo preso in prestito",
    "sim_duration": "Durata del prestito",
    "sim_rate": "Tasso di interesse",
    "sim_type": "Tipo di prestito",
    "sim_calculate": "Calcola",
    
    // Tipi di prestito
    "loan_type_personal": "Prestito personale",
    "loan_type_mortgage": "Mutuo ipotecario",
    "loan_type_business": "Prestito aziendale",
    "loan_type_debt_consolidation": "Consolidamento del debito",
    
    // Opzioni di durata (esempi, da completare per tutte le durate)
    "duration_12": "12 mesi",
    "duration_24": "24 mesi",
    "duration_36": "36 mesi",
    "duration_48": "48 mesi",
    "duration_60": "60 mesi",
    "duration_120": "120 mesi",
    "duration_180": "180 mesi",
    "duration_240": "240 mesi",
    "duration_360": "360 mesi",
    
    // Risultati della simulazione
    "sim_results_title": "Risultati della simulazione",
    "sim_monthly": "Rata mensile",
    "sim_total_interest": "Costo totale degli interessi",
    "sim_total_cost": "Costo totale del prestito",
    "sim_table_year": "Anno",
    "sim_table_principal": "Capitale rimborsato",
    "sim_table_interest": "Interessi pagati",
    "sim_table_remaining": "Capitale rimanente",
    "sim_download": "Scarica il riepilogo PDF",
    "sim_no_result": "Compila i campi per ottenere una simulazione.",
    
    // Altre traduzioni per l'italiano...
    // === PAGINA DEL MODULO (formulario_lingua.html) ===
    // Intestazione della pagina
    "form_title": "Richiesta di Prestito",
    "form_subtitle": "Compila il modulo sottostante per inviare la tua richiesta di finanziamento",
    "form_header": "Modulo di Richiesta di Prestito",
    "form_required": "Tutti i campi contrassegnati con un asterisco (*) sono obbligatori",

    // Sezioni del modulo
    "form_section1": "Informazioni personali",
    "form_firstname": "Nome",
    "form_lastname": "Cognome",
    "form_email": "Email",
    "form_phone": "Telefono",
    "form_birthdate": "Data di nascita",
    "form_nationality": "Nazionalità",
    "form_address": "Indirizzo completo",

    "form_section2": "Informazioni sul prestito",
    "form_loan_type": "Tipo di prestito",
    "form_select_option": "Seleziona un'opzione",
    "form_loan_amount": "Importo del prestito (€)",
    "form_amount_note": "Importo compreso tra 2.000€ e 1.000.000€",
    "form_loan_duration": "Durata del prestito (mesi)",
    "form_loan_purpose": "Finalità del prestito",
    "form_loan_details": "Dettagli aggiuntivi sul tuo progetto",

    // Durate per il modulo
    "form_duration_12": "12 mesi (1 anno)",
    "form_duration_24": "24 mesi (2 anni)",
    "form_duration_36": "36 mesi (3 anni)",
    "form_duration_48": "48 mesi (4 anni)",
    "form_duration_60": "60 mesi (5 anni)",
    "form_duration_72": "72 mesi (6 anni)",
    "form_duration_84": "84 mesi (7 anni)",
    "form_duration_96": "96 mesi (8 anni)",
    "form_duration_108": "108 mesi (9 anni)",
    "form_duration_120": "120 mesi (10 anni)",
    "form_duration_180": "180 mesi (15 anni)",
    "form_duration_240": "240 mesi (20 anni)",
    "form_duration_300": "300 mesi (25 anni)",

    "form_section3": "Informazioni finanziarie",
    "form_monthly_income": "Reddito mensile netto (€)",
    "form_employment_status": "Situazione lavorativa",
    "form_status_employed": "Dipendente a tempo indeterminato",
    "form_status_self_employed": "Lavoratore autonomo",
    "form_status_business_owner": "Imprenditore",
    "form_status_retired": "Pensionato/a",
    "form_status_unemployed": "Disoccupato/a",
    "form_status_other": "Altro",
    "form_existing_loans": "Hai altri prestiti in corso?",
    "form_yes": "Sì",
    "form_no": "No",
    "form_monthly_debt": "Rate mensili totali dei tuoi debiti attuali (€)",
    "form_debt_note": "Lascia vuoto se non hai debiti",

    "form_section4": "Documenti giustificativi",
    "form_documents_note": "Fornisci i seguenti documenti per accelerare l'elaborazione della tua richiesta. Formati accettati: PDF, JPG, PNG (max 5MB per file)",
    "form_id_document": "Documento d'identità",
    "form_proof_address": "Prova di residenza",
    "form_proof_income": "Prova del reddito",
    "form_bank_statements": "Estratti conto bancari (ultimi 3 mesi)",
    "form_upload_file": "Carica un file",
    "form_additional_documents": "Documenti aggiuntivi (facoltativo)",
    "form_additional_note": "Qualsiasi documento aggiuntivo rilevante per la tua richiesta",

    "form_submit": "Invia la mia richiesta",
    "form_success_title": "Richiesta inviata con successo!",
    "form_success_text": "Abbiamo ricevuto la tua richiesta di prestito. Il nostro team la esaminerà il prima possibile e ti contatterà entro 24-48 ore per discutere i prossimi passi.",
    "form_back_home": "Torna alla home page",

    // === PAGINA BIOGRAFICA (biografia_multilingue.html) ===
    // Intestazione della pagina
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Fondatore e Direttore dei gruppi Magdeleine Solutions",
    "bio_heading": "Carriera professionale",

    // Biografia
    "bio_p1": "Serge Magdeleine, 51 anni, è laureato all'École des Ponts e ha conseguito un MBA presso il Collège des Ingénieurs. Ha iniziato la sua carriera nella consulenza presso Mercer Oliver Wyman dal 1996 al 1999, prima di diventare presidente fondatore dei gruppi Magdeleine Solutions nel 2009.",
    "bio_p2": "Nel 2001 è entrato in Crédit Agricole S.A. come responsabile del banking online, poi della divisione Distribuzione e multicanale. Nel 2007 si è unito alla banca regionale del Centre-est come Direttore delle imprese e dell'internazionale, poi nel 2010 alla banca regionale Alpes Provence come Vice Direttore Generale. Nel 2015 ha assunto la responsabilità dei percorsi digitali del Gruppo e nel 2016 è diventato Direttore Generale di Crédit Agricole.",
    "bio_p3": "Attualmente ricopre il ruolo di Vice Direttore Generale di Crédit Agricole S.A. ed è entrato a far parte del Comitato Esecutivo di Crédit Agricole S.A., succedendo a Michel Mathieu, Direttore Generale di LCL dal 4 aprile 2016.",

    // Citazione
    "bio_quote": "La finanza deve essere al servizio dell’uomo. La nostra missione è democratizzare l’accesso alle soluzioni di finanziamento per tutti, ponendo trasparenza e fiducia al centro del rapporto con i clienti.",
    "bio_quote_author": "Serge Magdeleine",

    // Risultati
    "bio_achievement1_title": "Eccellenza nella leadership",
    "bio_achievement1_desc": "Riconosciuto per la sua visione strategica e la capacità di guidare i team verso l’eccellenza, Serge Magdeleine ha ricevuto diversi riconoscimenti per la sua leadership innovativa nel settore finanziario.",
    "bio_achievement2_title": "Innovazione finanziaria",
    "bio_achievement2_desc": "Pioniere nello sviluppo di soluzioni finanziarie accessibili e trasparenti, ha contribuito alla trasformazione digitale del settore bancario in Francia.",
    "bio_achievement3_title": "Impegno sociale",
    "bio_achievement3_desc": "Fortemente impegnato nelle iniziative di inclusione finanziaria, Serge Magdeleine lavora per rendere i servizi finanziari accessibili a tutti, in particolare alle popolazioni tradizionalmente escluse dal sistema bancario.",

    // CTA
    "bio_contact_btn": "Contatta Serge Magdeleine",


  },

  // ======== PORTUGALSKI ========
  "pt": {
    // === ELEMENTOS COMUNS (CABEÇALHO, RODAPÉ, NAVEGAÇÃO) ===
    // Navegação
    "nav_home": "Início",
    "nav_about": "Sobre nós",
    "nav_services": "Serviços",
    "nav_testimonials": "Depoimentos",
    "nav_biography": "Biografia",
    "nav_simulation": "Simulação",
    "nav_loan_request": "Pedido de empréstimo",
    
    // Seletor de idioma
    "lang_fr": "Francês",
    "lang_en": "Inglês",
    "lang_pl": "Polonês",
    "lang_de": "Alemão",
    "lang_it": "Italiano",
    "lang_pt": "Português",
    
    // Rodapé
    "footer_about": "Serviços de empréstimos entre particulares desde 2009",
    "footer_quick_links": "Links rápidos",
    "footer_services": "Nossos serviços",
    "footer_contact": "Contato",
    "footer_newsletter": "Newsletter",
    "footer_newsletter_desc": "Inscreva-se em nossa newsletter para receber nossas novidades e conselhos financeiros.",
    "newsletter_placeholder": "Seu email",
    "footer_rights": "Todos os direitos reservados.",
    "footer_privacy": "Política de privacidade",
    "footer_terms": "Termos de uso",
    
    // === PÁGINA INICIAL (index_langue.html) ===
    // Preloader
    "preloader_loading": "Carregando...",
    
    // Hero Section
    "hero_title": "Vamos construir juntos o seu futuro financeiro",
    "hero_subtitle": "A Magdeleine Solutions acompanha-o em todos os seus projetos com soluções de financiamento personalizadas, transparentes e adaptadas à sua situação.",
    "hero_btn_services": "Descubra os nossos serviços",
    "hero_btn_contact": "Contacte-nos",
    "hero_scroll": "Descobrir",
    
    // About Section
    "about_title": "Quem somos?",
    "about_subtitle": "Descubra a nossa abordagem única e o nosso compromisso com o seu sucesso financeiro",
    "about_heading": "Uma expertise financeira ao seu serviço",
    "about_p1": "A Magdeleine Solutions é uma agência de financiamento inovadora e humana, sediada em França, que acompanha particulares, independentes e pequenas empresas na realização dos seus projetos financeiros.",
    "about_p2": "A nossa missão é democratizar o acesso a soluções de financiamento, oferecendo um acompanhamento personalizado, transparente e adaptado a cada situação. Acreditamos que todos merecem uma oportunidade para concretizar os seus projetos, independentemente do seu perfil ou histórico bancário.",
    "about_p3": "Graças à nossa rede de parceiros bancários e à nossa experiência no mercado, encontramos as melhores soluções para si, mesmo em situações complexas.",
    "about_btn": "Os nossos serviços",
    
    // Features Section
    "features_title": "Os nossos 3 pilares",
    "features_subtitle": "Os valores fundamentais que guiam a nossa abordagem e garantem a sua satisfação",
    "feature1_title": "Acompanhamento personalizado",
    "feature1_desc": "Na Magdeleine Solutions, cada cliente é único. Os nossos consultores financeiros são formados para ouvir, compreender e orientar cada um para a solução mais adequada à sua situação pessoal e profissional.",
    "feature2_title": "Transparência & pedagogia",
    "feature2_desc": "Simplificamos as informações-chave para ajudar os nossos clientes a tomar decisões informadas. A nossa abordagem pedagógica permite-lhe compreender cada etapa do processo, sem jargão incompreensível.",
    "feature3_title": "Soluções personalizadas",
    "feature3_desc": "Graças à nossa rede de parceiros bancários, oferecemos propostas variadas e flexíveis, mesmo em caso de recusa bancária inicial. A nossa expertise permite-nos encontrar soluções adaptadas à sua situação.",
    
    // Services Section
    "services_title": "Os nossos serviços",
    "services_subtitle": "Soluções financeiras adaptadas a todas as suas necessidades",
    "services_tab_all": "Todos os serviços",
    "services_tab_personal": "Particulares",
    "services_tab_professional": "Profissionais",
    "services_tab_advice": "Consultoria",
    "service_simulate": "Simular um empréstimo",
    "service_contact": "Contacte-nos",
    
    // Services - Todos
    "service1_title": "Empréstimo pessoal",
    "service1_desc": "Financie os seus projetos pessoais com um empréstimo adaptado à sua situação. Taxas competitivas e condições flexíveis para realizar os seus sonhos.",
    "service2_title": "Crédito habitação",
    "service2_desc": "Concretize o seu projeto imobiliário com o nosso acompanhamento personalizado. Compra, construção ou renovação, encontramos a solução ideal.",
    "service3_title": "Empréstimo profissional",
    "service3_desc": "Desenvolva a sua atividade com as nossas soluções de financiamento para profissionais. Criação, aquisição ou desenvolvimento de empresa.",
    "service4_title": "Reembolso de crédito",
    "service4_desc": "Simplifique as suas finanças ao agrupar os seus créditos. Reduza as suas prestações e recupere uma situação financeira saudável.",
    
    // Services - Particulares
    "service5_title": "Crédito automóvel",
    "service5_desc": "Financie a compra do seu veículo novo ou usado com as nossas soluções adaptadas. Condições vantajosas e processos simplificados.",
    
    // Services - Profissionais
    "service6_title": "Leasing",
    "service6_desc": "Financie os seus equipamentos profissionais sem afetar a sua tesouraria. Solução flexível com opção de compra no final do contrato.",
    "service7_title": "Financiamento de tesouraria",
    "service7_desc": "Otimize a sua tesouraria com as nossas soluções de financiamento a curto prazo. Enfrente imprevistos e aproveite oportunidades.",
    "service8_title": "Crédito imobiliário profissional",
    "service8_desc": "Invista nos seus espaços profissionais com as nossas soluções de financiamento adaptadas. Compra, construção ou renovação de espaços comerciais.",
    
    // Services - Consultoria
    "service9_title": "Consultoria financeira",
    "service9_desc": "Beneficie da expertise dos nossos consultores para otimizar a sua situação financeira. Análise personalizada e recomendações sob medida.",
    "service10_title": "Acompanhamento administrativo",
    "service10_desc": "Simplifique os seus processos administrativos com o nosso acompanhamento personalizado. Constituição de dossiê, acompanhamento e relação com as instituições financeiras.",
    "service11_title": "Seguro de crédito",
    "service11_desc": "Proteja-se a si e aos seus com um seguro adaptado ao seu empréstimo. Garantias personalizadas e tarifas competitivas.",
    "service12_title": "Otimização fiscal",
    "service12_desc": "Reduza a sua carga fiscal graças aos conselhos dos nossos especialistas. Estratégias legais para otimizar a sua tributação de acordo com a sua situação.",
    
    // Stats Section
    "stat1_label": "Anos de experiência",
    "stat2_label": "Clientes satisfeitos",
    "stat3_label": "Parceiros bancários",
    "stat4_label": "Taxa de satisfação (%)",
    
    // Testimonials Section
    "testimonials_title": "Depoimentos",
    "testimonials_subtitle": "Descubra o que os nossos clientes dizem sobre nós",
    "testimonial1_text": "A Magdeleine Solutions transformou o nosso projeto imobiliário em realidade. Apesar de várias recusas bancárias, a equipa encontrou uma solução adaptada à nossa situação. O profissionalismo e a perseverança fizeram toda a diferença.",
    "testimonial1_name": "Sofia Mancini",
    "testimonial1_role": "Crédito habitação, Milan",
    "testimonial2_text": "Como empresário, precisei de um financiamento rápido para aproveitar uma oportunidade. A equipa da Magdeleine Solutions compreendeu a urgência e acompanhou-me com eficiência. Graças a eles, pude desenvolver a minha atividade dentro do prazo.",
    "testimonial2_name": "Thomas Dubois",
    "testimonial2_role": "Empréstimo profissional, Lyon",
    "testimonial3_text": "O reembolso de crédito proposto pela Magdeleine Solutions permitiu-me reduzir significativamente as minhas prestações. A abordagem pedagógica ajudou-me a compreender cada etapa do processo. Recomendo vivamente os seus serviços para recuperar uma situação financeira saudável.",
    "testimonial3_name": "Anastazy Buczek",
    "testimonial3_role": "Reembolso de crédito, Warsaw",
    
    // CTA Section
    "cta_title": "Pronto para concretizar o seu projeto?",
    "cta_subtitle": "Dê o primeiro passo para alcançar os seus objetivos financeiros. A nossa equipa está pronta para o acompanhar.",
    "cta_btn_request": "Fazer um pedido",
    "cta_btn_contact": "Contacte-nos",
    
    // Contact Section
    "contact_title": "Contacte-nos",
    "contact_subtitle": "A nossa equipa está à sua disposição para responder a todas as suas questões",
    "contact_address_title": "Morada",
    "contact_address": "123 Avenue des Finances, 75008 Paris, França",
    "contact_phone_title": "Telefone",
    "contact_email_title": "Email",
    "contact_hours_title": "Horário de funcionamento",
    "contact_hours": "Segunda - Sexta: 9:00 - 18:00",
    "contact_form_name": "Nome completo",
    "contact_form_name_placeholder": "O seu nome completo",
    "contact_form_email": "Email",
    "contact_form_email_placeholder": "O seu email",
    "contact_form_phone": "Telefone",
    "contact_form_phone_placeholder": "O seu número de telefone",
    "contact_form_subject": "Assunto",
    "contact_form_subject_placeholder": "Selecione um assunto",
    "contact_form_subject_loan": "Pedido de empréstimo",
    "contact_form_subject_info": "Pedido de informação",
    "contact_form_subject_appointment": "Marcação de consulta",
    "contact_form_subject_other": "Outro",
    "contact_form_message": "Mensagem",
    "contact_form_message_placeholder": "A sua mensagem",
    "contact_form_submit": "Enviar mensagem",

    // === PÁGINA DE SIMULAÇÃO (simulation_langue.html) ===
    // Cabeçalho da página
    "sim_title": "Simulação de empréstimo",
    "sim_subtitle": "Calcule suas parcelas mensais e obtenha uma visão detalhada do seu empréstimo",
    
    // Formulário de simulação
    "sim_form_title": "Parâmetros do empréstimo",
    "sim_amount_borrowed": "Valor emprestado",
    "sim_duration": "Duração do empréstimo",
    "sim_rate": "Taxa de juros",
    "sim_type": "Tipo de empréstimo",
    "sim_calculate": "Calcular",
    
    // Tipos de empréstimo
    "loan_type_personal": "Empréstimo pessoal",
    "loan_type_mortgage": "Empréstimo imobiliário",
    "loan_type_business": "Empréstimo empresarial",
    "loan_type_debt_consolidation": "Consolidação de dívidas",
    
    // Opções de duração (exemplos, a serem completados para todas as durações)
    "duration_12": "12 meses",
    "duration_24": "24 meses",
    "duration_36": "36 meses",
    "duration_48": "48 meses",
    "duration_60": "60 meses",
    "duration_120": "120 meses",
    "duration_180": "180 meses",
    "duration_240": "240 meses",
    "duration_360": "360 meses",
    
    // Resultados da simulação
    "sim_results_title": "Resultados da simulação",
    "sim_monthly": "Parcela mensal",
    "sim_total_interest": "Custo total dos juros",
    "sim_total_cost": "Custo total do empréstimo",
    "sim_table_year": "Ano",
    "sim_table_principal": "Capital reembolsado",
    "sim_table_interest": "Juros pagos",
    "sim_table_remaining": "Capital restante",
    "sim_download": "Baixar resumo em PDF",
    "sim_no_result": "Preencha os campos para obter uma simulação.",
    
    // Outras traduções para português...
    // === PÁGINA DE FORMULÁRIO (formulario_idioma.html) ===
    // Cabeçalho da página
    "form_title": "Pedido de Empréstimo",
    "form_subtitle": "Preencha o formulário abaixo para enviar seu pedido de financiamento",
    "form_header": "Formulário de Pedido de Empréstimo",
    "form_required": "Todos os campos marcados com um asterisco (*) são obrigatórios",

    // Seções do formulário
    "form_section1": "Informações pessoais",
    "form_firstname": "Nome",
    "form_lastname": "Sobrenome",
    "form_email": "Email",
    "form_phone": "Telefone",
    "form_birthdate": "Data de nascimento",
    "form_nationality": "Nacionalidade",
    "form_address": "Endereço completo",

    "form_section2": "Informações sobre o empréstimo",
    "form_loan_type": "Tipo de empréstimo",
    "form_select_option": "Selecione uma opção",
    "form_loan_amount": "Valor do empréstimo (€)",
    "form_amount_note": "Valor entre 2.000€ e 1.000.000€",
    "form_loan_duration": "Duração do empréstimo (meses)",
    "form_loan_purpose": "Finalidade do empréstimo",
    "form_loan_details": "Detalhes adicionais sobre seu projeto",

    // Durações para o formulário
    "form_duration_12": "12 meses (1 ano)",
    "form_duration_24": "24 meses (2 anos)",
    "form_duration_36": "36 meses (3 anos)",
    "form_duration_48": "48 meses (4 anos)",
    "form_duration_60": "60 meses (5 anos)",
    "form_duration_72": "72 meses (6 anos)",
    "form_duration_84": "84 meses (7 anos)",
    "form_duration_96": "96 meses (8 anos)",
    "form_duration_108": "108 meses (9 anos)",
    "form_duration_120": "120 meses (10 anos)",
    "form_duration_180": "180 meses (15 anos)",
    "form_duration_240": "240 meses (20 anos)",
    "form_duration_300": "300 meses (25 anos)",

    "form_section3": "Informações financeiras",
    "form_monthly_income": "Renda mensal líquida (€)",
    "form_employment_status": "Situação profissional",
    "form_status_employed": "Empregado(a) com contrato fixo",
    "form_status_self_employed": "Trabalhador(a) autônomo(a)",
    "form_status_business_owner": "Empresário(a)",
    "form_status_retired": "Aposentado(a)",
    "form_status_unemployed": "Desempregado(a)",
    "form_status_other": "Outro",
    "form_existing_loans": "Você possui outros empréstimos em andamento?",
    "form_yes": "Sim",
    "form_no": "Não",
    "form_monthly_debt": "Total das parcelas mensais das suas dívidas atuais (€)",
    "form_debt_note": "Deixe em branco se não tiver dívidas",

    "form_section4": "Documentos comprobatórios",
    "form_documents_note": "Por favor, forneça os seguintes documentos para acelerar o processamento do seu pedido. Formatos aceitos: PDF, JPG, PNG (máx. 5MB por arquivo)",
    "form_id_document": "Documento de identidade",
    "form_proof_address": "Comprovante de residência",
    "form_proof_income": "Comprovante de renda",
    "form_bank_statements": "Extratos bancários (últimos 3 meses)",
    "form_upload_file": "Enviar um arquivo",
    "form_additional_documents": "Documentos adicionais (opcional)",
    "form_additional_note": "Qualquer outro documento relevante para seu pedido",

    "form_submit": "Enviar meu pedido",
    "form_success_title": "Pedido enviado com sucesso!",
    "form_success_text": "Recebemos seu pedido de empréstimo. Nossa equipe irá analisá-lo o mais rápido possível e entrará em contato em 24 a 48 horas para discutir os próximos passos.",
    "form_back_home": "Voltar para a página inicial",
    // === PÁGINA DE BIOGRAFIA (biografia_multilingue.html) ===
    // Cabeçalho da página
    "bio_title": "Serge Magdeleine",
    "bio_subtitle": "Fundador e Diretor dos grupos Magdeleine Solutions",
    "bio_heading": "Carreira Profissional",

    // Biografia
    "bio_p1": "Com 51 anos, Serge Magdeleine é formado pela École des Ponts e possui um MBA do Collège des Ingénieurs. Iniciou sua carreira em consultoria na Mercer Oliver Wyman de 1996 a 1999, antes de se tornar presidente fundador dos grupos Magdeleine Solutions em 2009.",
    "bio_p2": "Em 2001, ingressou no Crédit Agricole S.A. como chefe do banco online e depois chefe da divisão de Distribuição e Multicanais. Em 2007, juntou-se ao banco regional Centre-est como Diretor de Empresas e Internacional e, em 2010, ao banco regional Alpes Provence como Vice-Diretor Geral. Em 2015, assumiu a responsabilidade pelos percursos digitais do Grupo e, em 2016, tornou-se Diretor Geral do Crédit Agricole.",
    "bio_p3": "Atualmente, ocupa o cargo de Vice-Diretor Geral do Crédit Agricole S.A. e integra o Comitê Executivo do Crédit Agricole S.A., sucedendo Michel Mathieu, Diretor Geral do LCL desde 4 de abril de 2016.",

    // Citação
    "bio_quote": "As finanças devem estar a serviço das pessoas. Nossa missão é democratizar o acesso a soluções de financiamento para todos, colocando a transparência e a confiança no centro da nossa relação com os clientes.",
    "bio_quote_author": "Serge Magdeleine",

    // Conquistas
    "bio_achievement1_title": "Excelência em liderança",
    "bio_achievement1_desc": "Reconhecido por sua visão estratégica e capacidade de liderar equipes com excelência, Serge Magdeleine recebeu diversas distinções por sua liderança inovadora no setor financeiro.",
    "bio_achievement2_title": "Inovação financeira",
    "bio_achievement2_desc": "Pioneiro no desenvolvimento de soluções financeiras acessíveis e transparentes, contribuiu para a transformação digital do setor bancário na França.",
    "bio_achievement3_title": "Compromisso social",
    "bio_achievement3_desc": "Fortemente comprometido com iniciativas de inclusão financeira, Serge Magdeleine trabalha para tornar os serviços financeiros acessíveis a todos, especialmente às populações tradicionalmente excluídas do sistema bancário.",

    // CTA
    "bio_contact_btn": "Contactar Serge Magdeleine",


  }
};

// Exporter les traductions pour qu'elles soient accessibles globalement
window.translations = translations;