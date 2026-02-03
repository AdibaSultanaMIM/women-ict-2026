import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Replace with YOUR Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const registrationForm = document.getElementById('registrationForm')
const successMessage = document.getElementById('successMessage')
const submitButton = registrationForm.querySelector('button[type="submit"]')

registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    submitButton.disabled = true
    submitButton.textContent = 'Submitting...'

    const formData = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        institution: document.getElementById('institution').value,
        topic: document.getElementById('topic').value
    }

    try {
        // Insert into database
        const { data, error } = await supabase
            .from('workshop_registrations')
            .insert([formData])
            .select()

        if (error) {
            if (error.code === '23505') {
                throw new Error('This email is already registered!')
            }
            throw error
        }

        // Send confirmation email
        const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
            body: formData
        })

        if (emailResponse.error) {
            console.error('Email error:', emailResponse.error)
        }

        // Show success message
        registrationForm.style.display = 'none'
        successMessage.style.display = 'block'

    } catch (error) {
        console.error('Error:', error)
        alert(error.message || 'Registration failed. Please try again.')
        submitButton.disabled = false
        submitButton.textContent = 'Register Now'
    }
})

