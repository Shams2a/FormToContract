# Formulaire Dynamique de Contrat

Un formulaire multi-étapes élégant pour collecter les informations manquantes de vos contrats, avec intégration n8n.

## Fonctionnalités

- **Multi-étapes avec barre de progression** : Navigation fluide entre les étapes
- **Design moderne et responsive** : Fonctionne parfaitement sur mobile et desktop
- **Validation en temps réel** : Validation des champs (email, numéros, dates)
- **Intégration n8n complète** : Récupération et soumission via webhooks
- **Chargement dynamique** : Les champs sont générés automatiquement depuis n8n
- **Sécurisé** : Support de l'authentification par token et clé API

## Installation

### 1. Cloner ou télécharger le projet

```bash
cd /chemin/vers/votre/dossier
```

### 2. Configuration

Créez un fichier `config.js` à partir du template :

```bash
cp config.example.js config.js
```

Éditez `config.js` avec vos vraies valeurs :

```javascript
const CONFIG = {
  webhookGetUrl: 'https://votre-instance-n8n.com/webhook/get-contract',
  webhookPostUrl: 'https://votre-instance-n8n.com/webhook/submit-contract',
  apiKey: 'votre_cle_api_secrete', // Optionnel
  maxFieldsPerStep: 3,
  texts: {
    title: 'Complétez votre contrat',
    subtitle: 'Veuillez renseigner les informations manquantes',
    // ... personnalisez les textes
  }
};
```

### 3. Hébergement

Hébergez les fichiers sur un serveur web. Options recommandées :

**Option A : Serveur local (pour test)**
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server -p 8000
```

Puis accédez à : `http://localhost:8000?token=votre_token_test`

**Option B : Hébergement gratuit**
- [Netlify](https://www.netlify.com/) (recommandé)
- [Vercel](https://vercel.com/)
- [GitHub Pages](https://pages.github.com/)

**Important** : Assurez-vous que `config.js` contient vos vraies valeurs et n'est pas committé dans Git.

## Configuration n8n

### Workflow n8n recommandé

```
[Trigger CRM] → [Générer Token] → [Créer URL] → [Envoyer Email]
                                                      ↓
                                              [GET Webhook] ← Formulaire
                                                      ↓
                                              [POST Webhook] → [MAJ CRM]
```

### Webhook GET (Récupération des données)

**URL** : `https://votre-instance-n8n.com/webhook/get-contract`

**Méthode** : GET

**Paramètre** : `token` (query parameter)

**Réponse attendue (JSON)** :

```json
{
  "contractId": "CONT-2024-001",
  "clientName": "Jean Dupont",
  "clientEmail": "jean.dupont@example.com",
  "fields": [
    {
      "name": "email",
      "label": "Adresse email",
      "type": "email",
      "required": true,
      "value": "",
      "placeholder": "exemple@email.com"
    },
    {
      "name": "telephone",
      "label": "Numéro de téléphone",
      "type": "tel",
      "required": true,
      "value": "",
      "placeholder": "+33 6 12 34 56 78"
    },
    {
      "name": "dateDebut",
      "label": "Date de début souhaitée",
      "type": "date",
      "required": true,
      "value": ""
    },
    {
      "name": "budget",
      "label": "Budget mensuel (€)",
      "type": "number",
      "required": false,
      "value": "",
      "min": 100,
      "max": 10000,
      "placeholder": "1000"
    },
    {
      "name": "commentaires",
      "label": "Commentaires additionnels",
      "type": "textarea",
      "required": false,
      "value": "",
      "placeholder": "Vos remarques..."
    }
  ]
}
```

### Webhook POST (Soumission du formulaire)

**URL** : `https://votre-instance-n8n.com/webhook/submit-contract`

**Méthode** : POST

**Headers** :
```
Content-Type: application/json
Authorization: Bearer votre_cle_api_secrete (si configuré)
```

**Body (JSON)** :

```json
{
  "token": "abc123xyz",
  "contractId": "CONT-2024-001",
  "formData": {
    "email": "jean.dupont@example.com",
    "telephone": "+33 6 12 34 56 78",
    "dateDebut": "2024-03-15",
    "budget": "2500",
    "commentaires": "Je souhaite commencer rapidement"
  }
}
```

### Exemple de configuration n8n (GET Webhook)

1. **Webhook Node** : Configurez le webhook GET
   - Path : `/webhook/get-contract`
   - Method : GET

2. **Function Node** : Valider le token et récupérer les données CRM
   ```javascript
   const token = $input.params.token;

   // Validez le token (vérifiez dans votre base/CRM)
   // Récupérez les données du contrat

   return {
     contractId: "CONT-2024-001",
     clientName: "Jean Dupont",
     clientEmail: "jean.dupont@example.com",
     fields: [
       // Vos champs dynamiques
     ]
   };
   ```

3. **Respond to Webhook** : Retournez les données

### Exemple de configuration n8n (POST Webhook)

1. **Webhook Node** : Configurez le webhook POST
   - Path : `/webhook/submit-contract`
   - Method : POST

2. **Function Node** : Traitez les données
   ```javascript
   const { token, contractId, formData } = $input.body;

   // Validez le token
   // Mettez à jour votre CRM avec formData

   return {
     success: true,
     message: "Contrat mis à jour avec succès"
   };
   ```

3. **CRM Update Node** : Mettez à jour votre CRM

4. **Respond to Webhook** : Confirmez le succès

## Types de champs supportés

| Type | Description | Propriétés optionnelles |
|------|-------------|------------------------|
| `text` | Texte simple | `placeholder` |
| `email` | Email avec validation | `placeholder` |
| `tel` | Téléphone avec validation | `placeholder` |
| `number` | Nombre | `min`, `max`, `placeholder` |
| `date` | Sélecteur de date | - |
| `textarea` | Zone de texte multi-lignes | `placeholder` |

## Utilisation

### 1. Génération du lien avec token

Dans votre workflow n8n, générez un token unique pour chaque contrat :

```
https://votre-domaine.com/index.html?token=abc123xyz456
```

### 2. Envoi au client

Envoyez ce lien par email à votre client avec n8n.

### 3. Remplissage du formulaire

Le client clique sur le lien, remplit le formulaire en plusieurs étapes, et soumet.

### 4. Réception des données

Les données sont envoyées à votre webhook n8n POST, puis mises à jour dans votre CRM.

## Personnalisation

### Modifier le nombre de champs par étape

Dans `config.js` :
```javascript
maxFieldsPerStep: 5, // Changez ce nombre
```

### Personnaliser les textes

Dans `config.js`, section `texts` :
```javascript
texts: {
  title: 'Mon titre personnalisé',
  subtitle: 'Ma description',
  submitButton: 'Valider',
  // ...
}
```

### Personnaliser les couleurs

Dans `styles.css`, modifiez les variables CSS :
```css
:root {
  --primary-color: #4f46e5; /* Votre couleur principale */
  --success-color: #10b981;
  /* ... */
}
```

## Sécurité

- **Token unique** : Chaque lien contient un token unique à usage unique
- **Validation côté serveur** : Validez toujours les données dans n8n
- **HTTPS** : Utilisez toujours HTTPS en production
- **Clé API** : Ajoutez une clé API pour sécuriser vos webhooks
- **Expiration** : Implémentez une expiration de token dans n8n

## Dépannage

### Le formulaire ne charge pas

1. Vérifiez que l'URL contient bien `?token=...`
2. Vérifiez que le webhook GET n8n est actif
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Vérifiez que `config.js` existe et contient les bonnes URLs

### Erreur CORS

Si vous avez une erreur CORS, configurez les headers dans n8n :

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### La soumission échoue

1. Vérifiez que le webhook POST n8n est actif
2. Vérifiez les logs n8n pour voir l'erreur
3. Vérifiez que le format des données correspond

## Support

Pour toute question, vérifiez :
1. La console du navigateur (F12 → Console)
2. Les logs n8n
3. Les paramètres dans `config.js`

## Structure du projet

```
/
├── index.html              # Structure HTML du formulaire
├── styles.css              # Styles et animations
├── script.js               # Logique JavaScript
├── config.example.js       # Template de configuration
├── config.js               # Votre configuration (ignoré par Git)
├── .env.example            # Template des variables d'environnement
├── .gitignore              # Fichiers à ignorer
└── README.md               # Cette documentation
```

## Prochaines étapes

- [ ] Intégration de la signature électronique
- [ ] Support multi-langues
- [ ] Mode hors-ligne avec sauvegarde locale
- [ ] Export PDF du contrat complété

## Licence

Projet personnel - Utilisation libre
