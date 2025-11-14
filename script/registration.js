// Registration script
(function () {
    const form = document.getElementById('registerForm');
    // If already authenticated, redirect to index
    try { if (sessionStorage.getItem('token')) { window.location.href = 'index.html'; } } catch (e) {}
    if (!form) return;

    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const formMessage = document.getElementById('formMessage');
    const btn = document.getElementById('registerBtn');

    // Shake helper for inputs when validation fails
    function shakeField(el) {   
        if (!el) return;
        const target = el.classList && el.tagName === 'INPUT' ? el : (el.querySelector && el.querySelector('input')) || el;
        target.classList.remove('shake');
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        target.offsetWidth;
        target.classList.add('shake');
        setTimeout(() => target.classList.remove('shake'), 600);
    }

    const getEndpoint = () => {
        return 'https://node-rahul-timbaliya.vercel.app/certverse/auth/register';
    };

    function validate() {
        let ok = true;
        fullNameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        formMessage.textContent = '';

        if (!fullName.value.trim()) { fullNameError.textContent = 'Full name is required'; ok = false; shakeField(fullName); }
        const e = email.value.trim();
        if (!e) { emailError.textContent = 'Email is required'; ok = false; shakeField(email); }
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { emailError.textContent = 'Enter a valid email'; ok = false; shakeField(email); }

        const p = password.value;
        if (!p) { passwordError.textContent = 'Password is required'; ok = false; shakeField(password); }
        else if (p.length < 6) { passwordError.textContent = 'Password must be at least 6 characters'; ok = false; shakeField(password); }
        if (confirmPassword.value !== p) { confirmPasswordError.textContent = 'Passwords do not match'; ok = false; shakeField(confirmPassword); }
        return ok;
    }

    async function submitHandler(e) {
        e.preventDefault();
        if (!validate()) return;
        btn.disabled = true;
        btn.textContent = 'Creating...';

        const payload = {
            fullName: fullName.value.trim(),
            email: email.value.trim(),
            password: password.value,
            isVerified: true
        };

        try {
            debugger;
            const res = await fetch(getEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Read raw response text so we can show useful diagnostics when server returns non-JSON or errors
            const raw = await res.text().catch(() => '');
            let data = {};
            try { data = raw ? JSON.parse(raw) : {}; } catch (e) { /* not JSON */ }

            console.log('Registration response', res.status, res.statusText, res.headers, data, raw);

            if (res.ok) {
                // On success show toast (use server message if present) and then move user to login page
                const successMsg = data.message || 'Account created — please sign in.';
                showToast(successMsg, 'success');
                const redirect = data.redirect || 'login.html';
                setTimeout(() => { window.location.href = redirect; }, 900);
                return;
            }

            // Special handling for 405 to help debugging
            if (res.status === 405) {
                const allow = res.headers && (res.headers.get('allow') || res.headers.get('Allow'));
                formMessage.textContent = data.message || data.error || `Method Not Allowed (405). The server may expect a different HTTP method or endpoint. Allowed: ${allow || 'unknown'}`;
            } else {
                const msg = data.message || data.error || raw || 'Registration failed. Please try again.';
                formMessage.textContent = msg;
                formMessage.style.display = 'block';

                // If message mentions email or already exists, show it near the email field and shake
                const lower = String(msg).toLowerCase();
                if (lower.includes('email') || lower.includes('already exists') || lower.includes('exists')) {
                    emailError.textContent = msg;
                    emailError.style.display = 'block';
                    shakeField(email);
                }
            }
        } catch (err) {
            console.error('Registration network error', err);
            formMessage.textContent = 'Network error. Please try again.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create account';
        }
    }

    form.addEventListener('submit', submitHandler);

    // Toast helper
    function showToast(message, type = 'info', duration = 3000) {
        try {
            let container = document.querySelector('.cv-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'cv-toast-container';
                document.body.appendChild(container);
            }

            const el = document.createElement('div');
            el.className = `cv-toast ${type}`;
            el.innerHTML = `<div class="cv-toast-msg">${message}</div><button class="cv-toast-close" aria-label="Close">×</button>`;
            container.appendChild(el);

            const closeBtn = el.querySelector('.cv-toast-close');
            closeBtn.addEventListener('click', () => el.remove());

            const timeout = setTimeout(() => {
                if (!el.parentNode) return;
                el.style.transition = 'opacity 0.24s ease, transform 0.24s ease';
                el.style.opacity = '0';
                el.style.transform = 'translateY(-8px) scale(.98)';
                setTimeout(() => el.remove(), 260);
            }, duration);

            el.addEventListener('click', () => { clearTimeout(timeout); el.remove(); });
        } catch (e) { console.warn('Toast error', e); }
    }
})();

