// Fichier de gestion des langues pour le site Magdeleine Solutions

// Fonction pour changer la langue de l'interface
function changeLanguage(lang) {
  // Vérifier si les traductions sont disponibles
  if (!window.translations) {
    console.error("L'objet de traductions n'est pas défini");
    return;
  }
  
  if (!window.translations[lang]) {
    console.error(`Traductions non disponibles pour la langue: ${lang}`);
    return;
  }

  // Mettre à jour tous les éléments avec l'attribut data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (window.translations[lang][key]) {
      element.innerHTML = window.translations[lang][key];
    } else {
      console.warn(`Clé de traduction non trouvée: ${key} pour la langue: ${lang}`);
      // Ne pas vider le contenu si la traduction n'est pas trouvée
    }
  });

  // Mettre à jour les attributs placeholder avec data-i18n-placeholder
  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (window.translations[lang][key]) {
      element.setAttribute('placeholder', window.translations[lang][key]);
    }
  });

  // Mettre à jour les liens avec la classe i18n-link
  updateLinks(lang);
  
  // Sauvegarder la préférence de langue
  localStorage.setItem('preferredLanguage', lang);
  
  // Mettre à jour le sélecteur de langue
  const langSelector = document.getElementById('language-selector');
  if (langSelector) {
    langSelector.value = lang;
  }
}

// Fonction pour mettre à jour les liens avec le paramètre de langue
function updateLinks(lang) {
  const links = document.querySelectorAll('.i18n-link');
  links.forEach(link => {
    let href = link.getAttribute('href');
    
    // Si le lien est vide ou #, ne rien faire
    if (!href || href === '#') return;
    
    // Supprimer les paramètres de langue existants
    href = href.replace(/(\?|&)lang=[^&]*(&|$)/, '$1');
    
    // Ajouter le nouveau paramètre de langue
    if (href.includes('?')) {
      href += '&lang=' + lang;
    } else {
      href += '?lang=' + lang;
    }
    
    link.setAttribute('href', href);
  });
}

// Fonction pour récupérer la langue préférée
function getPreferredLanguage() {
  // Vérifier d'abord le paramètre d'URL
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  // Ensuite vérifier le localStorage
  const savedLang = localStorage.getItem('preferredLanguage');
  
  // Enfin, utiliser la langue par défaut (français)
  return langParam || savedLang || 'nl';
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Récupérer la langue préférée
  const currentLang = getPreferredLanguage();
  
  // Mettre à jour le sélecteur de langue
  const langSelector = document.getElementById('language-selector');
  if (langSelector) {
    langSelector.value = currentLang;
    
    // Ajouter l'écouteur d'événement pour le changement de langue
    langSelector.addEventListener('change', function() {
      const newLang = this.value;
      changeLanguage(newLang);
    });
  }
  
  // Appliquer la traduction initiale
  changeLanguage(currentLang);
});
