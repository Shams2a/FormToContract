# Formulaire de Contrat d'Apprentissage (CERFA)

Guide complet pour la configuration du formulaire d'apprentissage avec les 5 sections obligatoires.

## Structure du formulaire

Le formulaire est divisé en **5 sections** correspondant aux exigences du contrat d'apprentissage (CERFA) :

1. **L'Employeur** - Informations sur l'entreprise
2. **L'Apprenti(e)** - Informations personnelles de l'apprenti
3. **Le Maître d'Apprentissage** - Personne encadrante
4. **Le Contrat** - Détails logistiques et légaux
5. **La Formation** - Informations sur le CFA et le diplôme

## Format JSON pour n8n

Votre webhook GET doit retourner un JSON avec cette structure :

```json
{
  "contractId": "CERFA-2024-001",
  "clientName": "Jean Dupont",
  "clientEmail": "jean.dupont@example.com",
  "sections": [
    {
      "id": "employeur",
      "title": "L'Employeur",
      "description": "Informations sur l'entreprise qui accueille l'apprenti",
      "fields": [...]
    },
    ...
  ]
}
```

Voir le fichier `data-example.json` pour un exemple complet avec tous les champs.

## 1. Section Employeur

**Champs obligatoires** :
- `employeur_type` (select) : Privé ou Public
- `employeur_raison_sociale` (text) : Nom de l'entreprise
- `employeur_siret` (text, pattern: 14 chiffres) : Numéro SIRET
- `employeur_adresse` (text) : Adresse
- `employeur_code_postal` (text) : Code postal
- `employeur_ville` (text) : Ville
- `employeur_effectif` (number) : Nombre de salariés
- `employeur_convention_collective` (text) : Intitulé de la convention
- `employeur_idcc` (text, pattern: 4 chiffres) : Code IDCC
- `employeur_naf` (text) : Code NAF/APE

**Exemple de champ** :
```json
{
  "name": "employeur_siret",
  "label": "Numéro SIRET (14 chiffres)",
  "type": "text",
  "required": true,
  "placeholder": "12345678901234",
  "pattern": "\\d{14}"
}
```

## 2. Section Apprenti(e)

**Champs obligatoires** :
- `apprenti_nom` (text) : Nom
- `apprenti_prenom` (text) : Prénom
- `apprenti_nir` (text) : Numéro de sécurité sociale
- `apprenti_date_naissance` (date) : Date de naissance
- `apprenti_lieu_naissance` (text) : Lieu de naissance
- `apprenti_adresse` (text) : Adresse
- `apprenti_code_postal` (text) : Code postal
- `apprenti_ville` (text) : Ville
- `apprenti_email` (email) : Email
- `apprenti_telephone` (tel) : Téléphone
- `apprenti_dernier_diplome` (text) : Dernier diplôme préparé
- `apprenti_derniere_classe` (text) : Dernière classe fréquentée
- `apprenti_situation` (select) : Situation avant le contrat
- `apprenti_mineur` (select) : Oui/Non

**Champs conditionnels** (si mineur) :
- `representant_nom` (text) : Nom du représentant légal
- `representant_telephone` (tel) : Téléphone du représentant

**Exemple de champ conditionnel** :
```json
{
  "name": "representant_nom",
  "label": "Représentant légal - Nom et Prénom",
  "type": "text",
  "required": false,
  "placeholder": "À remplir si l'apprenti est mineur",
  "showIf": {
    "field": "apprenti_mineur",
    "value": "oui"
  }
}
```

## 3. Section Maître d'Apprentissage

**Champs obligatoires** :
- `maitre_nom` (text) : Nom
- `maitre_prenom` (text) : Prénom
- `maitre_date_naissance` (date) : Date de naissance
- `maitre_nir` (text) : Numéro de sécurité sociale
- `maitre_diplome` (text) : Diplôme le plus élevé
- `maitre_experience` (number) : Années d'expérience

## 4. Section Contrat

**Champs obligatoires** :
- `contrat_date_conclusion` (date) : Date de conclusion
- `contrat_date_debut` (date) : Date de début
- `contrat_date_fin` (date) : Date de fin
- `contrat_type` (select) : Initial, Renouvellement ou Aménagement
- `contrat_duree_hebdo` (number) : Heures hebdomadaires (généralement 35h)
- `contrat_remuneration_annee1` (number) : Salaire brut mensuel année 1

**Champs optionnels** :
- `contrat_remuneration_annee2` (number) : Année 2
- `contrat_remuneration_annee3` (number) : Année 3

## 5. Section Formation

**Champs obligatoires** :
- `cfa_nom` (text) : Nom du CFA
- `cfa_siret` (text, pattern: 14 chiffres) : SIRET du CFA
- `cfa_adresse` (text) : Adresse
- `cfa_code_postal` (text) : Code postal
- `cfa_ville` (text) : Ville
- `diplome_intitule` (text) : Intitulé du diplôme
- `diplome_code` (text) : Code diplôme
- `formation_heures_totales` (number) : Volume d'heures total

## Types de champs supportés

| Type | Description | Propriétés |
|------|-------------|------------|
| `text` | Texte simple | `placeholder`, `pattern` |
| `email` | Email avec validation | `placeholder` |
| `tel` | Téléphone | `placeholder`, `pattern` |
| `number` | Nombre | `min`, `max`, `placeholder` |
| `date` | Date | - |
| `select` | Menu déroulant | `options: [{value, label}]` |
| `textarea` | Zone de texte | `placeholder` |

## Validation automatique

Le formulaire valide automatiquement :

- **SIRET** : 14 chiffres exactement
- **IDCC** : 4 chiffres exactement
- **NIR** : Format avec espaces accepté
- **Email** : Format valide
- **Téléphone** : Minimum 10 chiffres
- **Pattern personnalisé** : Via l'attribut `pattern`

## Configuration n8n

### Webhook GET

Retournez le JSON avec les 5 sections. Exemple :

```javascript
// Dans votre Function node n8n
const token = $input.params.token;

// Validez le token et récupérez les données du CRM
// ...

return {
  contractId: "CERFA-2024-001",
  clientName: "Jean Dupont",
  clientEmail: "jean.dupont@example.com",
  sections: [
    // Voir data-example.json pour la structure complète
  ]
};
```

### Webhook POST

Vous recevrez toutes les données dans `formData` :

```json
{
  "token": "abc123",
  "contractId": "CERFA-2024-001",
  "formData": {
    "employeur_raison_sociale": "SARL Dupont",
    "employeur_siret": "12345678901234",
    "apprenti_nom": "Dupont",
    "apprenti_prenom": "Jean",
    // ... tous les autres champs
  }
}
```

## Champs pré-remplis

Pour pré-remplir des champs depuis votre CRM, utilisez l'attribut `value` :

```json
{
  "name": "apprenti_email",
  "label": "Email",
  "type": "email",
  "required": true,
  "value": "jean.dupont@email.com"  // Pré-rempli depuis le CRM
}
```

## Personnalisation

### Modifier les textes

Dans `config.js` :

```javascript
texts: {
  title: 'Contrat d\'Apprentissage',
  subtitle: 'Complétez les informations pour finaliser votre contrat CERFA',
  submitButton: 'Soumettre mon contrat',
  successMessage: 'Votre contrat a été transmis avec succès !'
}
```

### Ajouter des champs

1. Ajoutez le champ dans la section appropriée de votre JSON
2. Le formulaire le génèrera automatiquement
3. Pas besoin de modifier le code HTML/JS !

### Ordre des sections

Les sections sont affichées dans l'ordre du tableau `sections`. Pour changer l'ordre, réorganisez simplement les objets dans le JSON.

## Exemple d'intégration complète

Voir le fichier `data-example.json` qui contient :
- Les 5 sections complètes
- Tous les champs obligatoires et optionnels
- Les validations (patterns, min/max)
- Les champs conditionnels
- Les champs select avec options

## Test local

1. Copiez `data-example.json` quelque part accessible
2. Configurez un serveur local pour servir le JSON
3. Pointez `webhookGetUrl` vers ce serveur
4. Testez avec : `http://localhost:8000?token=test123`

## Support

Le formulaire supporte :
- ✅ Sections nommées avec descriptions
- ✅ Champs conditionnels (showIf)
- ✅ Validation de patterns (SIRET, IDCC, etc.)
- ✅ Champs select avec options
- ✅ Pré-remplissage depuis le CRM
- ✅ Responsive mobile/desktop
- ✅ Barre de progression par section
- ✅ Validation en temps réel
