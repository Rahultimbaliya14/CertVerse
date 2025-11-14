
// Redirect to login if no session token is present and user lands on index.html
(function checkAuthOnLoad() {
    try {
        const isIndexPath = () => {
            let p = window.location.pathname || '/';
            // Normalize trailing slashes
            p = p.replace(/\/+$|^\s+|\s+$/g, '');
            // After trimming, if root become empty string
            if (!p) p = '/';

            // Get last path segment
            const file = p.split('/').pop().toLowerCase();

            // Consider root (/), 'index' without extension, and explicit index files
            return p === '/' || file === '' || file === 'index' || file === 'index.html' || file === 'index.htm';
        };

        const redirectIfNeeded = () => {
            try {
                const token = sessionStorage.getItem('token');
                if (isIndexPath() && !token) {
                    // Use replace to avoid creating history entries
                    console.debug('[auth] No token found on index — redirecting to login.html');
                    window.location.replace('login.html');
                } else {
                    console.debug('[auth] Token present or not on index — skipping redirect');
                }
            } catch (err) {
                console.warn('[auth] Error reading sessionStorage', err);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', redirectIfNeeded);
        } else {
            redirectIfNeeded();
        }
    } catch (e) {
        // ignore unexpected errors
        console.warn('Auth check initialization error', e);
    }
})();

let allProviders = [];

// Render auth actions (greeting + logout) in header
function renderAuthActions() {
    try {
        const container = document.getElementById('authActions');
        if (!container) return;
        const token = sessionStorage.getItem('token');
        const userJson = sessionStorage.getItem('user');
        let user = null;
        try { user = userJson ? JSON.parse(userJson) : null; } catch (e) { user = null; }

        if (token) {
            const name = (user && (user.fullName || user.name)) || 'User';
            container.innerHTML = `
                <div class="header-user">Hi, <strong>${escapeHtml(name)}</strong></div>
                <button class="action-btn logout-btn" id="logoutBtn">Logout</button>
            `;
            const btn = document.getElementById('logoutBtn');
            if (btn) btn.addEventListener('click', () => {
                try { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); } catch (e) {}
                window.location.href = 'login.html';
            });
        } else {
            container.innerHTML = `<a href="login.html" class="action-btn">Sign in</a>`;
        }
    } catch (e) { console.warn('renderAuthActions error', e); }
}

// Small helper to avoid injection in header
function escapeHtml(str) {
    return String(str).replace(/[&"'<>]/g, (s) => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[s]));
}

// Call immediately to render header
document.addEventListener('DOMContentLoaded', renderAuthActions);
// Also call immediately in case script runs after DOM is ready
try { renderAuthActions(); } catch (e) {}

function visitPortfolio() {
    window.open('https://rahultimbaliya14.github.io/Personal-Portfolio/', '_blank');
}


function filterExams() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        displayExams(allProviders);
        return;
    }

    const filteredProviders = allProviders.map(provider => {
        const filteredExams = provider.exams.filter(exam =>
            exam.exam_name.toLowerCase().includes(searchTerm)
        );
        return {
            ...provider,
            exams: filteredExams
        };
    }).filter(provider => provider.exams.length > 0);

    displayExams(filteredProviders);
}

function toggleProvider(index) {
    const section = document.querySelector(`[data-provider-index="${index}"]`);
    const container = section.querySelector('.exams-container');

    section.classList.toggle('expanded');
    container.classList.toggle('expanded');
}

async function loadExams() {
    try {
    const token = sessionStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch('https://node-rahul-timbaliya.vercel.app/api/exam/getAllExam', {
        method: 'GET',
        headers
    });
    const data = await response.json();

        if (data.status && data.data) {
            allProviders = data.data;
            displayExams(data.data);
        } else {
            showError('Failed to load exams. Please try again.');
        }
    } catch (error) {
        console.log('Error loading exams');
        showError('Unable to connect to the server');
    }
}

function displayExams(providers) {
    const emojis = ['📚', '🔴', '💻', '🌟', '⚡'];
    const html = `
                <div class="providers-list">
                    ${providers.map((provider, index) => `
                        <div class="provider-section" data-provider-index="${index}">
                            <div class="provider-header" onclick="toggleProvider(${index})">
                                <div class="provider-header-left">
                                    <div class="provider-icon">${emojis[index] || '📖'}</div>
                                    <div class="provider-info">
                                        <h2>${provider.exam_provider}</h2>
                                        <div class="exam-count">${provider.exams.length} certification exam${provider.exams.length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                                <div class="expand-icon">▼</div>
                            </div>
                            <div class="exams-container">
                                ${provider.exams.map((exam, examIndex) => `
                                    <div class="exam-item" onclick="event.stopPropagation(); openModal('${exam.exam_name.replace(/'/g, "\\'")}', '${exam.exam_provider}', '${exam._id}')">
                                        <div class="exam-name" data-number="${examIndex + 1}">${exam.exam_name}</div>
                                        <button class="view-details-btn">View Details</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
    document.getElementById('content').innerHTML = html;
}

function showError(message) {
    document.getElementById('content').innerHTML = `
                <div class="error">
                    <div class="error-icon">⚠️</div>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="loadExams()">🔄 Retry Connection</button>
                </div>
            `;
}

async function openModal(examName, provider, examId) {
    document.getElementById('modalExamName').textContent = examName;
    document.getElementById('modalExamProvider').textContent = provider + ' Certification';
    document.getElementById('modal').classList.add('active');

    const examDetails = document.getElementById('examDetails');
    examDetails.innerHTML = '<div class="loading-details">⏳ Loading exam details...</div>';

    try {
        const response = await fetch(`https://node-rahul-timbaliya.vercel.app/api/exam/getExamById/${examId}`);
        const data = await response.json();

        if (data.status && data.data) {
            displayExamDetails(data.data);
        } else {
            throw new Error('Failed to load exam details');
        }
    } catch (error) {
        console.error('Error loading exam details:', error);
        examDetails.innerHTML = `
                    <div class="error-details">
                        <p>Failed to load exam details. Please try again later.</p>
                        <button class="retry-btn" onclick="openModal('${examName.replace(/'/g, "\\'")}', '${provider}', '${examId}')">
                            🔄 Retry
                        </button>
                    </div>
                `;
    }
}

function displayExamDetails(exam) {
    const examDetails = document.getElementById('examDetails');

    const topicsList = exam.topics_covered
        ? `<ul>${exam.topics_covered.map(topic => `<li>🎯 ${topic}</li>`).join('')}</ul>`
        : '<p>No topics information available.</p>';

    examDetails.innerHTML = `
                <div class="exam-section">
                    <h3>📝 Description</h3>
                    <p>${exam.description || 'No description available.'}</p>
                </div>

                <div class="exam-section">
                    <h3>🎓 Topics Covered</h3>
                    ${topicsList}
                </div>

                <div class="exam-section">
                    <h3>📚 Resources</h3>
                    ${exam.learn_url ? `<a href="${exam.learn_url}" target="_blank">📖 Official Documentation</a>` : ''}
                    ${exam.schedule_url ? `<a href="${exam.schedule_url}" target="_blank">📅 Schedule Exam</a>` : ''}
                    ${exam.youtube_playlist ? `<a href="${exam.youtube_playlist}" target="_blank">🎥 Video Tutorials</a>` : ''}
                    ${exam.link ? `<a href="${exam.link}" target="_blank">🔗 Study Materials</a>` : ''}
                    ${!exam.learn_url && !exam.schedule_url && !exam.youtube_playlist && !exam.link ? '<p>No resources available.</p>' : ''}
                </div>
            `;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
});

// Form validation and submission
function validateField(field, errorId, errorMessage) {
    const value = field.value.trim();
    const errorElement = document.getElementById(errorId);
    
    // Clear previous error
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    field.classList.remove('shake');
    
    // Check if field is empty
    if (!value) {
        field.classList.add('shake');
        errorElement.textContent = errorMessage || 'This field is required';
        errorElement.style.display = 'block';
        
        // Remove shake class after animation completes
        setTimeout(() => {
            field.classList.remove('shake');
        }, 500);
        
        return false;
    }
    
    // Email validation for email fields
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        field.classList.add('shake');
        errorElement.textContent = 'Please enter a valid email address';
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            field.classList.remove('shake');
        }, 500);
        
        return false;
    }
    
    return true;
}

async function submitSuggestion(event) {
    event.preventDefault();
    
    const examName = document.getElementById('examName');
    const examProvider = document.getElementById('examProvider');
    const email = document.getElementById('email');
    const comment = document.getElementById('comment');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Reset previous messages and errors
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    
    // Validate required fields
    const isExamNameValid = validateField(examName, 'examNameError', 'Please enter an exam name');
    const isExamProviderValid = validateField(examProvider, 'examProviderError', 'Please enter the exam provider');
    const isEmailValid = validateField(email, 'emailError', 'Please enter a valid email');
    
    if (!isExamNameValid || !isExamProviderValid || !isEmailValid) {
        formMessage.textContent = 'Please fill in all required fields correctly.';
        formMessage.className = 'form-message error';
        formMessage.style.display = 'block';
        return;
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner">⏳</span> Submitting...';

    // Prepare the data to send
    const formData = {
        examName: examName.value.trim(),
        examProvider: examProvider.value.trim(),
        email: document.getElementById('email').value.trim(),
        comment: comment.value.trim()
    };
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('#suggestionForm button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Call your API endpoint here
        const response = await fetch('https://node-rahul-timbaliya.vercel.app/api/exam/suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            formMessage.textContent = 'Thank you for your suggestion! We\'ll review it soon.';
            formMessage.className = 'form-message success';
            formMessage.style.display = 'block';
            
            // Reset form
            event.target.reset();
        } else {
            throw new Error(data.message || 'Failed to submit suggestion');
        }
    } catch (error) {
        console.error('Error submitting suggestion:', error);
        formMessage.textContent = error.message || 'An error occurred while submitting your suggestion. Please try again.';
        formMessage.className = 'form-message error';
        formMessage.style.display = 'block';
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#suggestionForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Suggestion';
    }
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation
    const examNameInput = document.getElementById('examName');
    const examProviderInput = document.getElementById('examProvider');
    const emailInput = document.getElementById('email');
    const suggestionForm = document.getElementById('suggestionForm');
    
    if (examNameInput) {
        examNameInput.addEventListener('input', function() {
            validateField(this, 'examNameError', 'Please enter an exam name');
        });
    }
    
    if (examProviderInput) {
        examProviderInput.addEventListener('input', function() {
            validateField(this, 'examProviderError', 'Please enter the exam provider');
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateField(this, 'emailError', 'Please enter a valid email');
        });
    }
    
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', submitSuggestion);
    }
    // If user email is stored in sessionStorage, prefill the suggestion form email and make it readonly
    try {
        if (emailInput) {
            let sessionEmail = null;
            const userJson = sessionStorage.getItem('user');
            if (userJson) {
                try {
                    const userObj = JSON.parse(userJson);
                    sessionEmail = userObj && (userObj.email || userObj.emailAddress || userObj.username || userObj.userEmail) || null;
                } catch (e) {
                    // ignore JSON parse errors
                }
            }
            // fallback if email stored separately
            if (!sessionEmail) sessionEmail = sessionStorage.getItem('email') || null;

            if (sessionEmail) {
                emailInput.value = sessionEmail;
                emailInput.setAttribute('readonly', 'readonly');
                emailInput.setAttribute('aria-readonly', 'true');
                // optional visual hint - add class if you have styles for it
                try { emailInput.classList.add('readonly-filled'); } catch (e) {}
            }
        }
    } catch (e) {
        console.warn('Error pre-filling suggestion email from sessionStorage', e);
    }
    
    // Load exams
    loadExams();
});


