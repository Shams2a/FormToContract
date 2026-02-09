// Configuration du formulaire - VERSION PRODUCTION
const CONFIG = {
  // Mode test : charge data-example.json au lieu d'appeler n8n
  testMode: false,

  // URL du webhook n8n pour récupérer les données du contrat (GET)
  webhookGetUrl: 'https://n8n-ou5ygldozq-od.a.run.app/webhook/form-data',

  // URL du webhook n8n pour soumettre le formulaire complété (POST)
  webhookPostUrl: 'https://n8n-ou5ygldozq-od.a.run.app/webhook/submit-contract',

  // Clé d'API (optionnel, si vous sécurisez vos webhooks)
  apiKey: '',

  // Textes personnalisables
  texts: {
    title: 'Contrat d\'Apprentissage',
    subtitle: 'Complétez les informations pour finaliser votre contrat',
    submitButton: 'Soumettre le contrat',
    nextButton: 'Suivant',
    previousButton: 'Précédent',
    loadingMessage: 'Chargement de votre contrat...',
    successMessage: 'Votre contrat a été soumis avec succès !',
    errorMessage: 'Une erreur est survenue. Veuillez réessayer.'
  }
};
