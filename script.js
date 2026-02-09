// ========================================
// Application State
// ========================================
const state = {
  token: null,
  contractData: null,
  fields: [],
  steps: [],
  currentStep: 0,
  formData: {}
};

// ========================================
// DOM Elements
// ========================================
const elements = {
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  successState: document.getElementById('success-state'),
  formContainer: document.getElementById('form-container'),
  formSteps: document.getElementById('form-steps'),
  clientInfo: document.getElementById('client-info'),
  clientDetails: document.getElementById('client-details'),
  progressFill: document.getElementById('progress-fill'),
  currentStepDisplay: document.getElementById('current-step'),
  totalStepsDisplay: document.getElementById('total-steps'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  submitBtn: document.getElementById('submit-btn'),
  form: document.getElementById('contract-form'),
  errorMessage: document.getElementById('error-message')
};

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Extract token from URL
  state.token = getTokenFromURL();

  if (!state.token) {
    showError('Token manquant dans l\'URL. Veuillez utiliser le lien fourni dans votre email.');
    return;
  }

  // Fetch contract data
  await fetchContractData();
});

// ========================================
// URL & Token Management
// ========================================
function getTokenFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

// ========================================
// API Calls
// ========================================
async function fetchContractData() {
  try {
    let data;

    // Mode test : charge data-example.json
    if (CONFIG.testMode) {
      console.log('MODE TEST: Chargement de data-example.json');
      const response = await fetch('data-example.json');
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement du fichier exemple: ${response.status}`);
      }
      data = await response.json();
    } else {
      // Mode production : appelle le webhook n8n
      const url = `${CONFIG.webhookGetUrl}?token=${state.token}`;
      console.log('MODE PRODUCTION: Appel à', url);

      const headers = CONFIG.apiKey ? {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      console.log('Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('Réponse HTTP:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const rawText = await response.text();
      console.log('Réponse brute (100 premiers caractères):', rawText.substring(0, 100));

      try {
        data = JSON.parse(rawText);
        console.log('JSON parsé avec succès:', data);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        console.error('Réponse complète:', rawText);
        throw new Error('La réponse n\'est pas un JSON valide');
      }
    }

    console.log('Données du contrat:', data);
    state.contractData = data;

    // Support both old format (fields array) and new format (sections array)
    if (data.sections) {
      console.log('Format sections détecté, nombre de sections:', data.sections.length);
      state.sections = data.sections;
    } else if (data.fields) {
      console.log('Format fields détecté, conversion en section unique');
      // Old format: convert to single section
      state.sections = [{
        id: 'default',
        title: 'Informations',
        description: '',
        fields: data.fields || []
      }];
    } else {
      console.error('Format de données non reconnu:', data);
      throw new Error('Format de données invalide : ni sections ni fields trouvés');
    }

    console.log('Sections chargées:', state.sections);

    // Initialize form
    initializeForm();
  } catch (error) {
    console.error('=== ERREUR DÉTAILLÉE ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================');
    showError(`Impossible de charger le contrat. Erreur: ${error.message}`);
  }
}

async function submitFormData() {
  try {
    // Show loading on submit button
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = 'Envoi en cours...';

    const payload = {
      token: state.token,
      contractId: state.contractData.contractId,
      formData: state.formData
    };

    // Mode test : simule l'envoi et affiche les données dans la console
    if (CONFIG.testMode) {
      console.log('=== MODE TEST - Données du formulaire ===');
      console.log(JSON.stringify(payload, null, 2));
      console.log('=========================================');

      // Simule un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success!
      showSuccess();
    } else {
      // Mode production : envoie vraiment vers n8n
      const headers = CONFIG.apiKey ? {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const response = await fetch(CONFIG.webhookPostUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Success!
      showSuccess();
    }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = CONFIG.texts.submitButton;
    alert('Erreur lors de la soumission. Veuillez réessayer.');
  }
}

// ========================================
// Form Initialization
// ========================================
function initializeForm() {
  // Display client info if available
  if (state.contractData.clientName || state.contractData.clientEmail) {
    displayClientInfo();
  }

  // Create form steps
  createFormSteps();

  // Hide loading, show form
  elements.loadingState.classList.add('hidden');
  elements.formContainer.classList.remove('hidden');

  // Show first step
  showStep(0);

  // Attach event listeners
  attachEventListeners();
}

function displayClientInfo() {
  const { clientName, clientEmail, contractId } = state.contractData;
  let html = '';

  if (contractId) {
    html += `<div class="client-detail"><strong>Contrat N°:</strong> ${contractId}</div>`;
  }
  if (clientName) {
    html += `<div class="client-detail"><strong>Nom:</strong> ${clientName}</div>`;
  }
  if (clientEmail) {
    html += `<div class="client-detail"><strong>Email:</strong> ${clientEmail}</div>`;
  }

  elements.clientDetails.innerHTML = html;
  elements.clientInfo.classList.remove('hidden');
}

function createFormSteps() {
  // Use sections as steps
  state.steps = state.sections;

  // Update total steps display
  elements.totalStepsDisplay.textContent = state.steps.length;

  // Generate HTML for each section/step
  state.steps.forEach((section, stepIndex) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'form-step';
    stepDiv.dataset.step = stepIndex;
    stepDiv.dataset.sectionId = section.id;

    let stepHTML = `
      <div class="section-header">
        <h2 class="step-title">${section.title}</h2>
        ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
        <div class="step-indicator">Étape ${stepIndex + 1} sur ${state.steps.length}</div>
      </div>
    `;

    section.fields.forEach(field => {
      stepHTML += generateFieldHTML(field);
    });

    stepDiv.innerHTML = stepHTML;
    elements.formSteps.appendChild(stepDiv);
  });

  // Setup conditional fields listeners
  setupConditionalFields();
}

function generateFieldHTML(field) {
  const required = field.required ? '<span class="required">*</span>' : '';
  const value = field.value || '';
  const conditionalClass = field.showIf ? 'conditional-field' : '';
  const conditionalData = field.showIf ?
    `data-show-if-field="${field.showIf.field}" data-show-if-value="${field.showIf.value}"` : '';

  let inputHTML = '';

  switch (field.type) {
    case 'select':
      inputHTML = `<select
        id="${field.name}"
        name="${field.name}"
        ${field.required ? 'required' : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
      >
        <option value="">-- Sélectionnez --</option>
        ${field.options.map(opt =>
          `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
        ).join('')}
      </select>`;
      break;

    case 'email':
      inputHTML = `<input
        type="email"
        id="${field.name}"
        name="${field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
        placeholder="${field.placeholder || ''}"
      />`;
      break;

    case 'number':
      inputHTML = `<input
        type="number"
        id="${field.name}"
        name="${field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
        ${field.min !== undefined ? `min="${field.min}"` : ''}
        ${field.max !== undefined ? `max="${field.max}"` : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
        placeholder="${field.placeholder || ''}"
      />`;
      break;

    case 'date':
      inputHTML = `<input
        type="date"
        id="${field.name}"
        name="${field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
      />`;
      break;

    case 'tel':
      inputHTML = `<input
        type="tel"
        id="${field.name}"
        name="${field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
        placeholder="${field.placeholder || ''}"
      />`;
      break;

    case 'textarea':
      inputHTML = `<textarea
        id="${field.name}"
        name="${field.name}"
        ${field.required ? 'required' : ''}
        placeholder="${field.placeholder || ''}"
      >${value}</textarea>`;
      break;

    default: // text
      inputHTML = `<input
        type="text"
        id="${field.name}"
        name="${field.name}"
        value="${value}"
        ${field.required ? 'required' : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
        placeholder="${field.placeholder || ''}"
      />`;
  }

  return `
    <div class="form-field ${conditionalClass}" id="field-${field.name}" ${conditionalData} style="${field.showIf ? 'display: none;' : ''}">
      <label for="${field.name}">
        ${field.label}${required}
      </label>
      ${inputHTML}
      <div class="field-error" id="error-${field.name}"></div>
    </div>
  `;
}

// ========================================
// Conditional Fields
// ========================================
function setupConditionalFields() {
  // Find all conditional fields
  const conditionalFields = document.querySelectorAll('.conditional-field');

  conditionalFields.forEach(fieldDiv => {
    const triggerFieldName = fieldDiv.dataset.showIfField;
    const triggerValue = fieldDiv.dataset.showIfValue;
    const triggerField = document.getElementById(triggerFieldName);

    if (triggerField) {
      // Initial check
      toggleConditionalField(fieldDiv, triggerField, triggerValue);

      // Listen for changes
      triggerField.addEventListener('change', () => {
        toggleConditionalField(fieldDiv, triggerField, triggerValue);
      });
    }
  });
}

function toggleConditionalField(fieldDiv, triggerField, requiredValue) {
  const fieldInput = fieldDiv.querySelector('input, select, textarea');

  if (triggerField.value === requiredValue) {
    fieldDiv.style.display = 'block';
    // Make field required if it was originally required
    if (fieldInput && fieldInput.hasAttribute('data-originally-required')) {
      fieldInput.required = true;
    }
  } else {
    fieldDiv.style.display = 'none';
    // Remove validation for hidden fields
    if (fieldInput) {
      fieldInput.classList.remove('error');
      const errorDiv = fieldDiv.querySelector('.field-error');
      if (errorDiv) {
        errorDiv.classList.remove('visible');
        errorDiv.textContent = '';
      }
      // Store original required state
      if (fieldInput.required) {
        fieldInput.setAttribute('data-originally-required', 'true');
        fieldInput.required = false;
      }
    }
  }
}

// ========================================
// Step Navigation
// ========================================
function showStep(stepIndex) {
  state.currentStep = stepIndex;

  // Hide all steps
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });

  // Show current step
  const currentStepElement = document.querySelector(`.form-step[data-step="${stepIndex}"]`);
  if (currentStepElement) {
    currentStepElement.classList.add('active');
  }

  // Update progress bar
  const progress = ((stepIndex + 1) / state.steps.length) * 100;
  elements.progressFill.style.width = `${progress}%`;
  elements.currentStepDisplay.textContent = stepIndex + 1;

  // Update navigation buttons
  updateNavigationButtons();
}

function updateNavigationButtons() {
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.steps.length - 1;

  // Previous button
  if (isFirstStep) {
    elements.prevBtn.classList.add('hidden');
  } else {
    elements.prevBtn.classList.remove('hidden');
  }

  // Next vs Submit button
  if (isLastStep) {
    elements.nextBtn.classList.add('hidden');
    elements.submitBtn.classList.remove('hidden');
  } else {
    elements.nextBtn.classList.remove('hidden');
    elements.submitBtn.classList.add('hidden');
  }
}

function goToNextStep() {
  // Validate current step
  if (!validateCurrentStep()) {
    return;
  }

  // Save current step data
  saveCurrentStepData();

  // Move to next step
  if (state.currentStep < state.steps.length - 1) {
    showStep(state.currentStep + 1);
  }
}

function goToPreviousStep() {
  // Save current step data (no validation needed)
  saveCurrentStepData();

  // Move to previous step
  if (state.currentStep > 0) {
    showStep(state.currentStep - 1);
  }
}

function saveCurrentStepData() {
  const currentSection = state.steps[state.currentStep];

  currentSection.fields.forEach(field => {
    const input = document.getElementById(field.name);
    if (input) {
      state.formData[field.name] = input.value;
    }
  });
}

// ========================================
// Validation
// ========================================
function validateCurrentStep() {
  const currentSection = state.steps[state.currentStep];
  let isValid = true;

  currentSection.fields.forEach(field => {
    const fieldDiv = document.getElementById(`field-${field.name}`);
    const input = document.getElementById(field.name);
    const errorDiv = document.getElementById(`error-${field.name}`);

    // Skip validation for hidden fields
    if (fieldDiv && fieldDiv.style.display === 'none') {
      return;
    }

    if (!input) return;

    // Clear previous errors
    input.classList.remove('error');
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';

    // Required field validation
    if (field.required && input.required && !input.value.trim()) {
      showFieldError(input, errorDiv, 'Ce champ est requis');
      isValid = false;
      return;
    }

    // Pattern validation
    if (input.value.trim() && field.pattern) {
      const pattern = new RegExp(field.pattern);
      if (!pattern.test(input.value)) {
        showFieldError(input, errorDiv, 'Format invalide');
        isValid = false;
        return;
      }
    }

    // Type-specific validation
    if (input.value.trim()) {
      switch (field.type) {
        case 'email':
          if (!isValidEmail(input.value)) {
            showFieldError(input, errorDiv, 'Email invalide');
            isValid = false;
          }
          break;

        case 'number':
          const num = parseFloat(input.value);
          if (isNaN(num)) {
            showFieldError(input, errorDiv, 'Nombre invalide');
            isValid = false;
          } else if (field.min !== undefined && num < field.min) {
            showFieldError(input, errorDiv, `Minimum: ${field.min}`);
            isValid = false;
          } else if (field.max !== undefined && num > field.max) {
            showFieldError(input, errorDiv, `Maximum: ${field.max}`);
            isValid = false;
          }
          break;

        case 'tel':
          if (!isValidPhone(input.value)) {
            showFieldError(input, errorDiv, 'Numéro de téléphone invalide');
            isValid = false;
          }
          break;
      }
    }
  });

  return isValid;
}

function showFieldError(input, errorDiv, message) {
  input.classList.add('error');
  errorDiv.textContent = message;
  errorDiv.classList.add('visible');
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ========================================
// Form Submission
// ========================================
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate last step
  if (!validateCurrentStep()) {
    return;
  }

  // Save last step data
  saveCurrentStepData();

  // Submit
  submitFormData();
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
  elements.prevBtn.addEventListener('click', goToPreviousStep);
  elements.nextBtn.addEventListener('click', goToNextStep);
  elements.form.addEventListener('submit', handleFormSubmit);
}

// ========================================
// UI State Management
// ========================================
function showError(message) {
  elements.loadingState.classList.add('hidden');
  elements.formContainer.classList.add('hidden');
  elements.successState.classList.add('hidden');
  elements.errorState.classList.remove('hidden');
  elements.errorMessage.textContent = message;
}

function showSuccess() {
  elements.loadingState.classList.add('hidden');
  elements.formContainer.classList.add('hidden');
  elements.errorState.classList.add('hidden');
  elements.successState.classList.remove('hidden');
}
