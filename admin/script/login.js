
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'Shift' && e.key === 'C')) {
        e.preventDefault();
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Get form and elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loginButton = loginForm.querySelector('button[type="submit"]');
const buttonText = loginButton.querySelector('.button-text');
const buttonIcon = loginButton.querySelector('.button-icon');

// Add loading state to button
function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        buttonText.textContent = 'Signing in...';
        buttonIcon.innerHTML = '⏳';
    } else {
        loginButton.disabled = false;
        buttonText.textContent = 'Sign In to Dashboard';
        buttonIcon.innerHTML = '→';
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.opacity = '1';

    // Clear error after 5 seconds
    setTimeout(() => {
        errorMessage.style.opacity = '0';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 300);
    }, 5000);
}

// Handle form submission
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Basic validation
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    setLoading(true);
    errorMessage.style.display = 'none';

    try {
        const response = await fetch('https://node-rahul-timbaliya.vercel.app/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.success && data.data?.token) {
            // Save token to localStorage
            localStorage.setItem('adminToken', data.data.token);

            // Add a small delay to show success state
            buttonText.textContent = 'Success!';
            buttonIcon.innerHTML = '✓';
            loginButton.style.background = '#4CAF50';

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Invalid response from server');
        }
    } catch (error) {
        console.error('Login error:', error);

        // Specific error messages for different scenarios
        let errorMsg = 'An error occurred. Please try again.';

        if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('401')) {
            errorMsg = 'Invalid email or password. Please try again.';
        } else if (error.message) {
            errorMsg = error.message;
        }

        showError(errorMsg);

        // Shake animation for error
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    } finally {
        setLoading(false);
    }
});
