const socket = io();

socket.on('update-data', (data) => {
    console.log("Données reçues :", data); // Pour debug
    renderPending(data.orders, data.buzzers);
    renderKitchen(data.orders);
});

function renderPending(orders, buzzers) {
    const list = document.getElementById('pending-list');
    list.innerHTML = '';

    // On filtre uniquement les commandes qui n'ont pas encore de buzzer
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const availableBuzzers = buzzers.filter(b => b.currentOrderId === null);

    if (pendingOrders.length === 0) {
        list.innerHTML = '<div class="empty-state">Aucune nouvelle commande</div>';
        return;
    }

    pendingOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <span class="order-id">ORD-${order.id}</span>
            <span class="order-name">${order.product}</span>
            <select id="select-${order.id}">
                <option value="">Attribuer un Buzzer...</option>
                ${availableBuzzers.map(b => `<option value="${b.id}">Buzzer #${b.id}</option>`).join('')}
            </select>
            <button class="btn-assign" onclick="assign(${order.id})">Valider l'envoi</button>
        `;
        list.appendChild(div);
    });
}

function renderKitchen(orders) {
    const grid = document.getElementById('kitchen-grid');
    grid.innerHTML = '';

    // On affiche tout ce qui est déjà sur un buzzer
    const activeOrders = orders.filter(o => o.status !== 'pending');

    if (activeOrders.length === 0) {
        grid.innerHTML = '<div class="empty-state">Aucun buzzer actif pour le moment.</div>';
        return;
    }

    activeOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'card';
        
        let buttonHTML = '';
        if (order.status === 'placed') {
            buttonHTML = `<button disabled class="btn-done" title="Attente client">⌛ Attente Client (ESP)</button>`;
        } else if (order.status === 'cooking') {
            buttonHTML = `<button class="btn-done" onclick="socket.emit('set-done', ${order.id})">🔔 Marquer Prêt</button>`;
        } else if (order.status === 'done') {
            buttonHTML = `<button class="btn-reset" onclick="socket.emit('reset-order', ${order.id})">✅ Commande Remise</button>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start">
                <div>
                    <span class="order-id">BUZZER #${order.buzzer}</span>
                    <span class="order-name">${order.product}</span>
                </div>
                <span class="badge bg-${order.status}">${order.status}</span>
            </div>
            <div style="margin-top:15px">${buttonHTML}</div>
        `;
        grid.appendChild(div);
    });
}

function assign(orderId) {
    const buzzerId = document.getElementById(`select-${orderId}`).value;
    if (buzzerId) {
        socket.emit('assign-buzzer', { orderId, buzzerId: parseInt(buzzerId) });
    }
}