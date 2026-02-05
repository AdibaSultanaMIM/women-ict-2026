import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Supabase configuration
const SUPABASE_URL = 'https://dtcwvzjicjdywqkghaip.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Y3d2emppY2pkeXdxa2doYWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODczODgsImV4cCI6MjA4NTY2MzM4OH0.S_kJESfs6OplIQD25BtZ2AFSlUqc6w-32_FfpZT-X3A'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// DOM elements
const registrationForm = document.getElementById('registrationForm')
const successMessage = document.getElementById('regSuccessMsg')
const errorMessage = document.getElementById('regErrorMsg')
const submitButton = document.getElementById('submitRegBtn')
const formContainer = document.querySelector('.registration-glass-container')
const successContainer = document.getElementById('successContainer')
const sectionHeader = document.querySelector('#registration .section-header')

// Get form fields
const emailField = document.getElementById('reg_email')
const phoneField = document.getElementById('reg_phone')

// Create error display elements for real-time validation
const emailErrorDiv = createErrorElement('emailValidationError')
const phoneErrorDiv = createErrorElement('phoneValidationError')

// Insert error divs after input fields
emailField.parentNode.appendChild(emailErrorDiv)
phoneField.parentNode.appendChild(phoneErrorDiv)

/**
 * Create error message element
 */
function createErrorElement(id) {
    const div = document.createElement('div')
    div.id = id
    div.style.cssText = 'display:none; color:#ef4444; font-size:0.875rem; margin-top:0.5rem; font-weight:500;'
    return div
}

/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message
    element.style.display = 'block'
}

/**
 * Hide error message
 */
function hideError(element) {
    element.style.display = 'none'
}

/**
 * Debounce function for real-time validation
 */
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Real-time email validation
 */
const validateEmailRealtime = debounce((email) => {
    if (!email || email.trim() === '') {
        hideError(emailErrorDiv)
        return
    }
    
    const errors = getEmailErrors(email)
    if (errors.length > 0) {
        showError(emailErrorDiv, errors[0])
    } else {
        hideError(emailErrorDiv)
    }
}, 500)

/**
 * Real-time phone validation
 */
const validatePhoneRealtime = debounce((phone) => {
    if (!phone || phone.trim() === '') {
        hideError(phoneErrorDiv)
        return
    }
    
    const errors = getPhoneErrors(phone)
    if (errors.length > 0) {
        showError(phoneErrorDiv, errors[0])
    } else {
        hideError(phoneErrorDiv)
    }
}, 500)

// Attach real-time validation to input fields
emailField.addEventListener('input', (e) => {
    validateEmailRealtime(e.target.value)
})

phoneField.addEventListener('input', (e) => {
    // Allow only digits
    e.target.value = e.target.value.replace(/[^\d]/g, '')
    validatePhoneRealtime(e.target.value)
})

/**
 * Show main error message
 */
function showMainError(message) {
    const errorText = document.getElementById('errorText')
    errorText.textContent = message
    errorMessage.style.display = 'flex'
    successMessage.style.display = 'none'
    
    // Scroll to error
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none'
    }, 5000)
}

/**
 * Show main success message
 */
function showMainSuccess(message) {
    const successText = document.getElementById('successText')
    successText.textContent = message
    successMessage.style.display = 'flex'
    errorMessage.style.display = 'none'
}

/**
 * Handle form submission
 */
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Disable submit button to prevent double submission
    submitButton.disabled = true
    const btnText = submitButton.querySelector('.btn-text')
    const btnLoader = submitButton.querySelector('.btn-loader')
    btnText.style.display = 'none'
    btnLoader.style.display = 'inline'
    
    // Hide previous messages
    errorMessage.style.display = 'none'
    successMessage.style.display = 'none'
    hideError(emailErrorDiv)
    hideError(phoneErrorDiv)
    
    // Collect form data
    const formData = {
        full_name: document.getElementById('reg_full_name').value.trim(),
        email: document.getElementById('reg_email').value.trim(),
        phone: document.getElementById('reg_phone').value.trim(),
        institution: document.getElementById('reg_institution').value.trim(),
        topic: document.getElementById('reg_topic').value
    }
    
    try {
        // ============================================
        // STEP 1: Client-side validation
        // ============================================
        const validation = validateRegistrationForm(formData)
        
        if (!validation.valid) {
            // Show validation errors
            if (validation.errors.email) {
                showError(emailErrorDiv, validation.er
