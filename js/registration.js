try {
    // ============================================
    // STEP 1: Client-side validation
    // ============================================
    console.log('Starting client-side validation...');
    
    const validation = validateRegistrationForm(formData);
    
    if (!validation.valid) {
        console.log('Validation failed:', validation.errors);
        
        // Show validation errors
        if (validation.errors.email) {
            showError(emailErrorDiv, validation.errors.email);
        }
        if (validation.errors.phone) {
            showError(phoneErrorDiv, validation.errors.phone);
        }
        
        // Show first error in main error box
        const firstError = Object.values(validation.errors)[0];
        showMainError(firstError);
        
        throw new Error('VALIDATION_ERROR');
    }
    
    console.log('Client-side validation passed ✓');
    
    // ============================================
    // STEP 2: Call Edge Function
    // ============================================
    console.log('Calling Edge Function...');
    
    const response = await supabase.functions.invoke('send-confirmation-email', {
        body: formData
    });
    
    console.log('Edge Function raw response:', response);
    
    // ============================================
    // STEP 3: Handle Edge Function Response (IMPROVED)
    // ============================================
    
    // Handle Edge Function errors
    if (response.error) {
        console.error('Edge Function error object:', response.error);
        
        let errorMsg = 'Registration failed. Please try again.';
        
        // Try to extract error from context.body (where actual server response lives)
        if (response.error.context && response.error.context.body) {
            try {
                const errorBody = typeof response.error.context.body === 'string' 
                    ? JSON.parse(response.error.context.body) 
                    : response.error.context.body;
                
                console.log('Parsed error body:', errorBody);
                
                // Extract specific error messages
                if (errorBody.errors && Array.isArray(errorBody.errors) && errorBody.errors.length > 0) {
                    errorMsg = errorBody.errors.join('\n• ');
                    if (errorBody.errors.length > 1) {
                        errorMsg = '• ' + errorMsg;
                    }
                } else if (errorBody.error && typeof errorBody.error === 'string') {
                    errorMsg = errorBody.error;
                } else if (errorBody.message && typeof errorBody.message === 'string') {
                    errorMsg = errorBody.message;
                }
            } catch (parseError) {
                console.error('Failed to parse error body:', parseError);
            }
        }
        // Fallback to direct error message
        else if (response.error.message && !response.error.message.includes('non-2xx')) {
            errorMsg = response.error.message;
        }
        
        showMainError(errorMsg);
        throw new Error(errorMsg);
    }
    
    // Handle successful response
    const result = response.data;
    
    if (!result) {
        showMainError('No response from server. Please try again.');
        throw new Error('Empty response from server');
    }
    
    if (!result.success) {
        console.log('Server validation failed:', result);
        
        let userErrorMessage = 'Registration failed. Please check your information.';
        
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
            userErrorMessage = result.errors.join('\n• ');
            if (result.errors.length > 1) {
                userErrorMessage = '• ' + userErrorMessage;
            }
        } else if (result.error && typeof result.error === 'string') {
            userErrorMessage = result.error;
        } else if (result.message && typeof result.message === 'string') {
            userErrorMessage = result.message;
        }
        
        showMainError(userErrorMessage);
        throw new Error(userErrorMessage);
    }
    
    console.log('Registration successful! ✓');
    
    // ============================================
    // SUCCESS! Show success state
    // ============================================
    
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    
    if (sectionHeader) {
        sectionHeader.style.display = 'none';
    }
    
    if (successContainer) {
        successContainer.style.display = 'block';
        setTimeout(() => {
            successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
} catch (error) {
    console.error('Registration error:', error);
    
    if (errorMessage.style.display === 'none' && error.message !== 'VALIDATION_ERROR') {
        let displayError = 'Something went wrong. Please try again.';
        
        if (error.message && error.message !== 'VALIDATION_ERROR') {
            displayError = error.message;
        }
        
        showMainError(displayError);
    }
    
    // Re-enable submit button
    submitButton.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}
