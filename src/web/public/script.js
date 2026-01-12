const socket = io();

// On récupère l'élément une fois au début
const productInput = document.getElementById('product-input');

// --- GESTION DU CLAVIER ---
// Cet écouteur remplace le besoin de mettre un "onkeydown" dans le HTML
productInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addOrder();
    }
});

// --- RÉCEPTION DES DONNÉES ---
socket.on('update-data', (data) => {
    renderPending(data.orders, data.buzzers);
    renderKitchen(data.orders);
});

// --- ACTIONS ---

function addOrder() {
    const productName = productInput.value.trim();
    if (productName !== "") {
        socket.emit('create-order', productName);
        productInput.value = ''; // Vide le champ
        productInput.focus();    // Garde le focus pour la commande suivante
    }
}

function assign(orderId) {
    const bId = document.getElementById(`select-${orderId}`).value;
    if (bId) {
        socket.emit('assign-buzzer', { orderId, buzzerId: parseInt(bId) });
    }
}

// --- RENDU GRAPHIQUE ---

function renderPending(orders, buzzers) {
    const list = document.getElementById('pending-list');
    list.innerHTML = '';
    const pending = orders.filter(o => o.status === 'pending');
    const freeBuzzers = buzzers.filter(b => b.currentOrderId === null);

    if (pending.length === 0) {
        list.innerHTML = '<div style="color:#94a3b8; font-size:0.9rem;">Aucune commande.</div>';
        return;
    }

    pending.forEach(order => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="badge status-pending">Nouveau</div>
            <div style="font-weight:700">${order.product}</div>
            <select id="select-${order.id}">
                ${freeBuzzers.map(b => `<option value="${b.id}">Buzzer #${b.id}</option>`).join('')}
            </select>
            <button class="btn-main" onclick="assign(${order.id})">Envoyer</button>
        `;
        list.appendChild(div);
    });
}

function renderKitchen(orders) {
    const grid = document.getElementById('kitchen-grid');
    grid.innerHTML = '';
    const active = orders.filter(o => o.status !== 'pending');

    active.forEach(order => {
        const div = document.createElement('div');
        div.className = 'card';
        
        let actionBtn = '';
        if (order.status === 'placed') {
            actionBtn = `<button disabled class="btn-done">⏳ Attente client...</button>`;
        } else if (order.status === 'cooking') {
            actionBtn = `<button class="btn-done" onclick="socket.emit('set-done', ${order.id})">🔔 Marquer Prêt</button>`;
        } else if (order.status === 'done') {
            actionBtn = `<button class="btn-reset" onclick="socket.emit('reset-order', ${order.id})">📦 Remis (Reset)</button>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between">
                <div class="badge status-${order.status}">${order.status}</div>
                <div style="font-weight:800; color:var(--primary)">#${order.buzzer}</div>
            </div>
            <div style="font-weight:700; margin: 10px 0">${order.product}</div>
            ${actionBtn}
        `;
        grid.appendChild(div);
    });
}