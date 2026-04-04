// 1. Initialize GUN
// It runs purely locally in the browser memory and local storage. 

const gun = Gun({
    peers: ['https://localhost:8765/gun']
});

// 2. Initialize the SEA User module
const user = gun.user().recall({sessionStorage: true});

// UI elements
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');
const aliasInput = document.getElementById('alias');
const passInput = document.getElementById('passphrase');
const currentUserSpan = document.getElementById('current-user');

// 3. Handle Identity genration (signup)
document.getElementById('btn-signup').addEventListener('click', () => {
    const alias = aliasInput.value;
    const pass = passInput.value;

    if (!alias || !pass) return alert('Alias and Passphrase requirede to generate keys.');

    // This should generate the cryptgraphic key pair securely in the browser
    user.create(alias, pass, (ack) => {
        if (ack.err) {
            alert('Error creating identity:' + ack.err); 
        } else {
            alert('Identity created successfully! You can now unlock your Node.');
        }
    });
});

// 4. Handle unlocking the Node (login)
document.getElementById('btn-login').addEventListener('click', () => {
    const alias = aliasInput.value;
    const pass = passInput.value;

    // This decrypts the local key pair using the passphrase
    user.auth(alias, pass, (ack) => {
        if (ack.err) {
            alert('Failed to unlock: ' + ack.err);
        } else {
            //authentication successful, Update UI
            updateUI();
        }
    });
});

// 5. Handle clearing keys (log out)
document.getElementById('btn-logout').addEventListener('click', () => {
    user.leave();
    aliasInput.value = '';
    passInput.value = '';
    updateUI();
});

// 6. Monitor auth state
// This fires automatically when or if the user refreshes and the session is recalled
gun.on('auth', () => {
    updateUI();
});

// Helper to toggle UI based on auth state
function updateUI() {
    if (user.is) {
        authSection.classList.add('hidden');
        dashboard.classList.remove('hidden');
        currentUserSpan.innerText = user.is.alias;
        console.log('Public key (pub):', user.is.pub);
    } else {
        authSection.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }
}
