const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- CONFIGURATION ---
const MQTT_BROKER = "mqtt://localhost:1808"; 
const BASE_TOPIC = "/donkeatsport/";

const client = mqtt.connect(MQTT_BROKER);
app.use(express.static('public'));

// État du système
let orders = [];
let orderCounter = 101;
let buzzers = [1, 2, 3].map(id => ({ id, currentOrderId: null }));

// --- LOGIQUE MQTT ---
client.on('connect', () => {
    console.log(`✅ Connecté au Broker MQTT sur ${MQTT_BROKER}`);
    client.subscribe(`${BASE_TOPIC}#`);
});

client.on('message', (topic, message) => {
    const payload = message.toString();
    const buzzerNum = parseInt(topic.split('/').pop());
    
    // Si l'ESP envoie l'état "cooking" (déclenché par l'utilisateur)
    if (payload.includes("etat:cooking")) {
        const order = orders.find(o => o.buzzer === buzzerNum && o.status === "placed");
        if (order) {
            order.status = "cooking";
            io.emit('update-data', { orders, buzzers });
            console.log(`Buzzer ${buzzerNum} est passé en mode CUISINE`);
        }
    }
});

// --- LOGIQUE TEMPS RÉEL (SOCKET.IO) ---
io.on('connection', (socket) => {
    socket.emit('update-data', { orders, buzzers });

    // Créer une nouvelle commande
    socket.on('create-order', (productName) => {
        const newOrder = { id: orderCounter++, product: productName, status: "pending", buzzer: null };
        orders.push(newOrder);
        io.emit('update-data', { orders, buzzers });
    });

    // Associer commande à un buzzer
    socket.on('assign-buzzer', ({ orderId, buzzerId }) => {
        const order = orders.find(o => o.id === orderId);
        const buzzer = buzzers.find(b => b.id === buzzerId);

        if (order && buzzer && !buzzer.currentOrderId) {
            order.status = "placed";
            order.buzzer = buzzerId;
            buzzer.currentOrderId = orderId;
            // MQTT: produit:<nom>-etat:placed
            client.publish(`${BASE_TOPIC}${buzzerId}`, `produit:${order.product}-etat:placed`);
            io.emit('update-data', { orders, buzzers });
        }
    });

    // Marquer comme prêt (seulement si "cooking")
    socket.on('set-done', (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === "cooking") {
            order.status = "done";
            client.publish(`${BASE_TOPIC}${order.buzzer}`, `produit:${order.product}-etat:done`);
            io.emit('update-data', { orders, buzzers });
        }
    });

    // Remise de la commande et reset
    socket.on('reset-order', (orderId) => {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            const order = orders[orderIndex];
            const buzzer = buzzers.find(b => b.id === order.buzzer);
            
            client.publish(`${BASE_TOPIC}${order.buzzer}`, `produit:-etat:`);
            if (buzzer) buzzer.currentOrderId = null;
            orders.splice(orderIndex, 1);
            io.emit('update-data', { orders, buzzers });
        }
    });
});

server.listen(3000, () => console.log('🚀 Dashboard accessible sur http://localhost:3000'));