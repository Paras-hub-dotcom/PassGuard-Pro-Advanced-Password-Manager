document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const passwordForm = document.getElementById('password-form');
    const websiteInput = document.getElementById('website');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordsList = document.getElementById('passwords-list');
    const noPasswordsMessage = document.getElementById('no-passwords-message');
    const searchBar = document.getElementById('search-bar');
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.getElementById('toast-body');
    const bsToast = new bootstrap.Toast(toastElement);
    const strengthText = document.getElementById('password-strength');

    // --- Core Functions ---
    const getPasswords = () => JSON.parse(localStorage.getItem('passwords')) || [];
    const savePasswords = (passwords) => localStorage.setItem('passwords', JSON.stringify(passwords));
    
    const showToast = (message, type = 'success') => {
        toastBody.textContent = message;
        toastElement.className = `toast bg-${type} text-white`;
        bsToast.show();
    };
    
    // --- Main Rendering Function ---
    const renderPasswords = () => {
        const passwords = getPasswords();
        passwordsList.innerHTML = ''; // Clear current list

        if (passwords.length > 0) {
            passwords.forEach(p => {
                const passwordCard = document.createElement('div');
                passwordCard.className = 'password-card card d-flex flex-row align-items-center';
                passwordCard.dataset.id = p.id;
                passwordCard.innerHTML = `
                    <img src="https://www.google.com/s2/favicons?domain=${p.website}&sz=64" alt="${p.website} logo" class="website-logo">
                    <div class="flex-grow-1">
                        <h5 class="mb-0 fw-semibold">${p.website}</h5>
                        <p class="mb-0 text-muted small user-select-all">${p.username}</p>
                        <span class="password-display d-none user-select-all">${p.password}</span>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="action-btn copy-user" title="Copy Username"><i class="bi bi-clipboard"></i></button>
                        <button class="action-btn copy-pass" title="Copy Password"><i class="bi bi-clipboard-check"></i></button>
                        <button class="action-btn show-hide" title="Show/Hide Password"><i class="bi bi-eye-fill"></i></button>
                        <button class="action-btn delete" title="Delete"><i class="bi bi-trash-fill"></i></button>
                    </div>
                `;
                passwordsList.appendChild(passwordCard);
            });
        }
        updateEmptyMessage();
    };

    // --- Helper Functions ---
    const updateEmptyMessage = () => {
        const passwords = getPasswords();
        const visibleCards = passwordsList.querySelectorAll('.password-card:not([style*="display: none"])').length;
        const isEmpty = passwords.length === 0 || visibleCards === 0;
        noPasswordsMessage.style.display = isEmpty ? 'block' : 'none';
        // Adjust message based on why it's empty (no data vs. no search results)
        if (isEmpty && passwords.length > 0) {
            noPasswordsMessage.querySelector('h5').textContent = "No credentials match your search.";
        } else if (isEmpty) {
             noPasswordsMessage.querySelector('h5').textContent = "No credentials found.";
        }
    };

    // --- Password Strength Checker ---
    const checkStrength = (password) => {
        let strength = 0;

        if (password.length >= 8) strength++;       // Minimum length
        if (/[A-Z]/.test(password)) strength++;     // Uppercase
        if (/[0-9]/.test(password)) strength++;     // Numbers
        if (/[^A-Za-z0-9]/.test(password)) strength++; // Special chars

        switch (strength) {
            case 0:
            case 1:
                strengthText.textContent = "Weak Password";
                strengthText.style.color = "red";
                break;
            case 2:
                strengthText.textContent = "Medium Password";
                strengthText.style.color = "orange";
                break;
            case 3:
            case 4:
                strengthText.textContent = "Strong Password";
                strengthText.style.color = "green";
                break;
        }
    };

    passwordInput.addEventListener('input', (e) => {
        checkStrength(e.target.value);
    });
    
    // --- Event Listeners ---
    
    // Add a new password
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Basic validation before saving
        if (!websiteInput.value || !usernameInput.value || !passwordInput.value) {
            showToast("Please fill all fields.", "danger");
            return;
        }
        const newPassword = { id: Date.now(), website: websiteInput.value, username: usernameInput.value, password: passwordInput.value };
        const passwords = getPasswords();
        passwords.push(newPassword);
        savePasswords(passwords);
        renderPasswords();
        passwordForm.reset();
        strengthText.textContent = ""; // reset strength message
        showToast('Credential saved successfully!', 'success');
    });
    
    // Handle actions on saved password cards (copy, delete, show/hide)
    passwordsList.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const card = e.target.closest('.password-card');
        const id = Number(card.dataset.id);
        const passwords = getPasswords();
        const entry = passwords.find(p => p.id === id);

        // Copy username or password
        if (button.classList.contains('copy-user') || button.classList.contains('copy-pass')) {
            const textToCopy = button.classList.contains('copy-user') ? entry.username : entry.password;
            const type = button.classList.contains('copy-user') ? 'Username' : 'Password';
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`${type} copied to clipboard!`, 'success');
            });
        }
        
        // Show/hide password
        if (button.classList.contains('show-hide')) {
            card.querySelector('.password-display').classList.toggle('d-none');
            const icon = button.querySelector('i');
            icon.classList.toggle('bi-eye-fill');
            icon.classList.toggle('bi-eye-slash-fill');
        }

        // Delete password
        if (button.classList.contains('delete')) {
            if (confirm(`Delete password for ${entry.website}?`)) {
                savePasswords(passwords.filter(p => p.id !== id));
                renderPasswords();
                showToast('Credential deleted.', 'danger');
            }
        }
    });

    // Filter passwords based on search input
    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.password-card').forEach(card => {
            const content = card.textContent.toLowerCase();
            card.style.display = content.includes(searchTerm) ? 'flex' : 'none';
        });
        updateEmptyMessage();
    });

    // --- Initial Page Load ---
    renderPasswords();
});
