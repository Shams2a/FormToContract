// Configuration du formulaire
// IMPORTANT: Copiez ce fichier vers config.js et remplissez vos vraies valeurs

const CONFIG = {
  // URL du webhook n8n pour récupérer les données du contrat (GET)
  webhookGetUrl: 'https://votre-instance-n8n.com/webhook/get-contract',

  // URL du webhook n8n pour soumettre le formulaire complété (POST)
  webhookPostUrl: 'https://votre-instance-n8n.com/webhook/submit-contract',

  // Clé d'API (optionnel, si vous sécurisez vos webhooks)
  apiKey: 'votre_cle_api_secrete',

  // Textes personnalisables
  texts: {
    title: 'Complétez votre contrat',
    subtitle: 'Veuillez renseigner les informations manquantes',
    submitButton: 'Soumettre le contrat',
    nextButton: 'Suivant',
    previousButton: 'Précédent',
    loadingMessage: 'Chargement de votre contrat...',
    successMessage: 'Votre contrat a été soumis avec succès !',
    errorMessage: 'Une erreur est survenue. Veuillez réessayer.'
  }
};
