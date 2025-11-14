// Login script
(() => {
    const form = document.getElementById('loginForm');
    // If already authenticated, redirect to index
    try { if (sessionStorage.getItem('token')) { window.location.href = 'index.html'; } } catch (e) {}
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const formMessage = document.getElementById('formMessage');
    const btn = document.getElementById('loginBtn');

    // Shake helper: adds .shake class to an element (input or group) briefly
    function shakeField(el) {
        if (!el) return;
        // if user passed the input element, use it; otherwise try to find the input inside a form-group
        const target = el.classList && el.tagName === 'INPUT' ? el : (el.querySelector && el.querySelector('input')) || el;
        // remove then re-add to restart animation
        target.classList.remove('shake');
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        target.offsetWidth;
        target.classList.add('shake');
        // remove after animation finishes
        setTimeout(() => target.classList.remove('shake'), 600);
    }

    const getEndpoint = () => {
        return  'https://node-rahul-timbaliya.vercel.app/certverse/auth/login';
    };

    function validate() {
        let ok = true;
        emailError.textContent = '';
        passwordError.textContent = '';
        formMessage.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email) { emailError.textContent = 'Email is required'; ok = false; shakeField(emailInput); }
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { emailError.textContent = 'Enter a valid email'; ok = false; shakeField(emailInput); }
        if (!password) { passwordError.textContent = 'Password is required'; ok = false; shakeField(passwordInput); }
        return ok;
    }

    async function submitHandler(e) {
        e.preventDefault();
        if (!validate()) return;

        btn.disabled = true;
        btn.textContent = 'Signing in...';

        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const res = await fetch(getEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            // Normalize response shape and store token/user in sessionStorage when available
            const token = data.token || data?.data?.token;
            const user = data.user || data?.data?.user;

            if (res.ok && (data.success || token || user)) {
                try {
                    if (token) {
                        sessionStorage.setItem('token', token);
                    }
                    if (user) {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                } catch (err) {
                    console.warn('Could not write to sessionStorage', err);
                }

                    // Successful authentication; show personalized toast then redirect to index or server-provided redirect
                    const displayName = user && (user.fullName || user.name) ? (user.fullName || user.name) : emailInput.value.trim();
                    showToast(`Welcome back, ${displayName}!`, 'success');
                    const redirectUrl = data.redirect || data?.data?.redirect || 'index.html';
                    setTimeout(() => { window.location.href = redirectUrl; }, 900);
                    return;
            }

            // Show server-provided message if available
            const msg = data.message || data.error || 'Invalid credentials. Please try again.';
            formMessage.textContent = msg;
            formMessage.style.display = 'block';

            // Provide field-level feedback when message is specific
            const lower = String(msg).toLowerCase();
            if (lower.includes('password') || lower.includes('invalid') || lower.includes('credentials')) {
                passwordError.textContent = msg;
                passwordError.style.display = 'block';
                shakeField(passwordInput);
            }
            if (lower.includes('email') || lower.includes('not found') || lower.includes('does not exist')) {
                emailError.textContent = msg;
                emailError.style.display = 'block';
                shakeField(emailInput);
            }
        } catch (err) {
            formMessage.textContent = 'Network error. Please try again.';
            console.error(err);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
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
            closeBtn.addEventListener('click', () => {
                el.remove();
            });

            // Auto dismiss
            const timeout = setTimeout(() => {
                if (!el.parentNode) return;
                el.style.transition = 'opacity 0.24s ease, transform 0.24s ease';
                el.style.opacity = '0';
                el.style.transform = 'translateY(-8px) scale(.98)';
                setTimeout(() => el.remove(), 260);
            }, duration);

            // remove on click anywhere in toast
            el.addEventListener('click', (ev) => {
                if (ev.target === closeBtn) return; // handled above
                clearTimeout(timeout);
                el.remove();
            });
        } catch (e) { console.warn('Toast error', e); }
    }
})();

