/*
  Program name: homework3.js
  Author: Antigravity (Assistant)
  Date created: April 18, 2026
  Description: Comprehensive validation and UI logic for Homework 3.
               Handles advanced field checking, dynamic error messages,
               and the conditional submission flow.
*/

// Initial State
let errorCount = 0;

/**
 * PAGE INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    updateSliderLabel(document.getElementById('salary').value);
    
    // Set field specific event listeners if needed (already handled via attributes in HTML)
});

/**
 * Display current date in the header
 */
function displayCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    
    // Add ordinal suffix (st, nd, rd, th)
    const day = now.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    
    // Simplistic formatting for the badge/header
    document.getElementById('date-display').textContent = dateStr.replace(day, day + suffix);
}

/**
 * Updates the salary range display
 */
function updateSliderLabel(val) {
    const formatted = new Number(val).toLocaleString('en-US');
    document.getElementById('salary-value').textContent = `$${formatted} / year`;
}

/**
 * UN-THE-FLY FIELD VALIDATION
 * Centralized function to validate individual fields.
 */
function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    
    let errorId = `${id}-error`;
    let errorMsg = "";
    let value = el.value.trim();
    
    switch(id) {
        case 'fname':
        case 'lname':
            if (value === "") {
                errorMsg = "Required field.";
            } else if (!/^[A-Za-z'-]+$/.test(value)) {
                errorMsg = "Letters, apostrophes ('), and dashes (-) only.";
            } else if (value.length > 30) {
                errorMsg = "Maximum 30 characters.";
            }
            break;
            
        case 'mi':
            if (value !== "" && !/^[A-Za-z]$/.test(value)) {
                errorMsg = "Single letter only (no numbers).";
            }
            break;
            
        case 'ssn':
            // SSN logic: validate 9 digits (ignoring dashes)
            const digits = value.replace(/\D/g, '');
            if (value === "") {
                errorMsg = "Required field.";
            } else if (digits.length !== 9) {
                errorMsg = "Must be 9 digits.";
            }
            break;
            
        case 'email':
            // Force lowercase
            el.value = el.value.toLowerCase();
            value = el.value.trim();
            if (value === "") {
                errorMsg = "Required field.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                errorMsg = "Format: name@domain.tld";
            }
            break;
            
        case 'addr1':
        case 'city':
            if (value === "") {
                errorMsg = "Required field.";
            } else if (value.length < 2 || value.length > 30) {
                errorMsg = "Must be 2 to 30 characters.";
            }
            break;
            
        case 'addr2':
            if (value !== "" && (value.length < 2 || value.length > 30)) {
                errorMsg = "Must be 2 to 30 characters.";
            }
            break;
            
        case 'state':
            if (value === "") {
                errorMsg = "Please select a state.";
            }
            break;
            
        case 'zip':
            if (value === "") {
                errorMsg = "Required field.";
            } else if (!/^\d{5}$/.test(value)) {
                errorMsg = "Must be exactly 5 digits.";
            }
            break;
            
        case 'userid':
            if (value === "") {
                errorMsg = "Required field.";
            } else if (/^\d/.test(value)) {
                errorMsg = "Cannot start with a number.";
            } else if (value.length < 5 || value.length > 20) {
                errorMsg = "Range: 5 to 20 characters.";
            } else if (/[^A-Za-z0-9_-]/.test(value)) {
                errorMsg = "Letters, numbers, '-' and '_' only.";
            }
            break;
            
        case 'password':
            if (value === "") {
                errorMsg = "Required field.";
            } else if (value.length < 8) {
                errorMsg = "Minimum 8 characters.";
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                errorMsg = "Need 1 upper, 1 lower, and 1 digit.";
            } else {
                const uid = document.getElementById('userid').value.trim();
                if (uid && value.toLowerCase() === uid.toLowerCase()) {
                    errorMsg = "Cannot be the same as User ID.";
                }
            }
            // If user corrected password, might need to re-check confirm match
            if (!errorMsg && document.getElementById('password_confirm').value) {
                validateField('password_confirm');
            }
            break;
            
        case 'password_confirm':
            const pw = document.getElementById('password').value;
            if (value === "") {
                errorMsg = "Please confirm password.";
            } else if (value !== pw) {
                errorMsg = "Passwords do not match.";
            }
            break;

        case 'comments':
            // Requirement mentions "best judgement" on weird characters
            // Let's avoid common injectable chars or excessive specials if needed, 
            // but normally textarea is free. Just check for weird ones if asked.
            if (/[<>"]/.test(value)) {
                errorMsg = "Avoid using special symbols like <, >, or double quotes.";
            }
            break;
    }
    
    // Display result
    showError(errorId, errorMsg);
    
    // Hide Submit button if any change occurs (must re-validate)
    hideSubmit();
}

/**
 * SSN AUTO-FORMATTING
 */
function formatSSN(input) {
    let val = input.value.replace(/\D/g, ''); // Digits only
    let formatted = "";
    
    if (val.length > 0) {
        formatted = val.substring(0, 3);
        if (val.length > 3) {
            formatted += "-" + val.substring(3, 5);
        }
        if (val.length > 5) {
            formatted += "-" + val.substring(5, 9);
        }
    }
    
    input.value = formatted;
}

/**
 * DOB VALIDATION (3 PIECES)
 */
function validateDOB() {
    const m = document.getElementById('dob-month').value;
    const d = document.getElementById('dob-day').value;
    const y = document.getElementById('dob-year').value;
    const errEl = document.getElementById('dob-error');
    
    if (!m || !d || !y) {
        errEl.textContent = "Please complete all 3 pieces.";
        return false;
    }
    
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    const year = parseInt(y, 10);
    
    const dob = new Date(year, month - 1, day);
    const now = new Date();
    
    // Check for valid date object
    if (isNaN(dob.getTime()) || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
        errEl.textContent = "Invalid date provided.";
        return false;
    }
    
    // Future check
    if (dob > now) {
        errEl.textContent = "Date cannot be in the future.";
        return false;
    }
    
    // 120 year check
    const age = now.getFullYear() - dob.getFullYear();
    if (age > 120) {
        errEl.textContent = "Date cannot be more than 120 years ago.";
        return false;
    }
    
    errEl.textContent = ""; // Clear
    hideSubmit();
    return true;
}

/**
 * FULL VALIDATION (When "Validate" button is clicked)
 */
function performFullValidation() {
    let valid = true;
    
    // Trigger on-the-fly logic for all inputs
    const ids = [
        'fname', 'mi', 'lname', 'ssn', 'email', 
        'addr1', 'addr2', 'city', 'state', 'zip',
        'userid', 'password', 'password_confirm', 'comments'
    ];
    
    ids.forEach(id => {
        validateField(id);
    });
    
    // Validate DOB specifically
    if (!validateDOB()) valid = false;
    
    // Validate Radios (Vaccinated)
    const vacc = document.querySelector('input[name="vaccinated"]:checked');
    if (!vacc) {
        showError('vaccinated-error', "Required selection.");
        valid = false;
    } else {
        showError('vaccinated-error', "");
    }

    // Validate Radios (Housing)
    const tenure = document.querySelector('input[name="tenure"]:checked');
    if (!tenure) {
        showError('tenure-error', "Required selection.");
        valid = false;
    } else {
        showError('tenure-error', "");
    }
    
    // Final check across all error divs
    const errors = document.querySelectorAll('.error-msg');
    errors.forEach(err => {
        if (err.textContent !== "") valid = false;
    });
    
    if (valid) {
        document.getElementById('submit-btn').style.display = 'inline-block';
        document.getElementById('validate-btn').style.display = 'none';
        alert("Validation Successful! You can now submit the form.");
    } else {
        alert("Please correct the errors in the form before proceeding.");
    }
}

/**
 * Handle final submit
 */
function handleFinalSubmit(e) {
    // Just a double check if somehow they clicked submit but errors still exist
    const errors = document.querySelectorAll('.error-msg');
    let hasError = false;
    errors.forEach(err => {
        if (err.textContent !== "") hasError = true;
    });
    
    if (hasError) {
        e.preventDefault();
        alert("Cannot submit: form still has errors.");
        return false;
    }
    
    // Redirect logic is handled by standard form action, but per reqs:
    // "Thank you for your submission. We will be contacting you shortly."
    // This is in thankyou.html
    return true; 
}

/**
 * RESET FORM
 */
function resetForm() {
    setTimeout(() => {
        const errors = document.querySelectorAll('.error-msg');
        errors.forEach(err => err.textContent = "");
        hideSubmit();
    }, 10);
}

/**
 * UI HELPERS
 */
function showError(id, msg) {
    const errEl = document.getElementById(id);
    if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = msg ? "block" : "none";
    }
}

function hideSubmit() {
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('validate-btn').style.display = 'inline-block';
}
