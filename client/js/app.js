// 1. Initialize GUN
// It runs purely locally in the browser memory and local storage. 

const gun = Gun({
    peers: ['http://localhost:8765/gun']
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

//7. Decentralized global chat logic

// Create a reference to a specific node in the GUN graph
const chatNode = gun.get('Campus-net');

const chatMessagesList = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const btnSend = document.getElementById('btn-send');

// Writing Data: Broadcast a message to the network
btnSend.addEventListener('click', () => {
    console.log("[DEBUG] Broadcast button clicked.");

    if(!chatInput.value) {
        console.log("[DEBUG] Input was empty, stopping.");   
        return;
    }
    // create the message object
    const messageData = {
        text: chatInput.value,
        author: user.is ? user.is.alias : "Anonymous",
        timestamp: Date.now()
    };

    console.log("[DEBUG] Sending data to GUN network:", messageData);

    // add it to the decentralized graph
    chatNode.set(messageData, (ack) => {
        if(ack.err) console.error("[DEBUG] GUN Error saving message:", ack.err);
        else console.log("[DEBUG] Message successfully saved to local GUN graph.");
    });

    // clear the input field
    chatInput.value = '';
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnSend.click(); // This virtually "clicks" the send button for you
    }
});

// Allow pressing "Enter" to send the message
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSend.click(); 
});

//Listen for incoming messages
console.log("[DEBUG] Now listening for incoming chat messages...");

// Reading Data: Listen for updates in real time 
chatNode.map().once((data, id) => {
    console.log("[DEBUG] Data detected on network!", data);
    if (data && data.text) {
        console.log("[DEBUG] Valid text found. Appending to UI...");
        const li = document.createElement('li');
        li.style.marginBottom = '8px';
        li.innerHTML = `<strong style="color: #a98484ff;">${data.author}</strong> <span style="font-size: 0.8em; color: #555;">[${new Data(data.timestamp).toLocaleTimeString()}]</span><br> > ${data.text}`;

        chatMessagesList.appendChild(li);
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
    } else {
        console.warn("[DEBUG] Data received, but 'text' property was missing.");
    }
});