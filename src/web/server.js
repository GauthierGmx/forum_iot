const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const MQTT_BROKER = "mqtt://localhost:1808"; 
const BASE_TOPIC = "/donkeatsport/";

const client = mqtt.connect(MQTT_BROKER);
app.use(express.static('public'));

// État initial
let orders = [
    { id: 101, product: "Double Cheese", status: "pending", buzzer: null },
    { id: 102, product: "Tacos XL", status: "pending", buzzer: null },
    { id: 103, product: "Salade César", status: "pending", buzzer: null }
];

let buzzers = [1, 2, 3, 4, 5].map(id => ({ id, currentOrderId: null }));

client.on('connect', () => {
    client.subscribe(`${BASE_TOPIC}#`);
    console.log("MQTT Connecté");
});

client.on('message', (topic, message) => {
    const payload = message.toString();
    const buzzerNum = parseInt(topic.split('/').pop());
    
    // Si l'ESP envoie "cooking"
    if (payload.includes("etat:cooking")) {
        const order = orders.find(o => o.buzzer === buzzerNum && o.status === "placed");
        if (order) {
            order.status = "cooking";
            io.emit('update-data', { orders, buzzers });
        }
    }
});

io.on('connection', (socket) => {
    // Envoyer les données dès la connexion
    socket.emit('update-data', { orders, buzzers });

    socket.on('assign-buzzer', ({ orderId, buzzerId }) => {
        const order = orders.find(o => o.id === orderId);
        const buzzer = buzzers.find(b => b.id === buzzerId);

        if (order && buzzer && !buzzer.currentOrderId) {
            order.status = "placed";
            order.buzzer = buzzerId;
            buzzer.currentOrderId = orderId;
            client.publish(`${BASE_TOPIC}${buzzerId}`, `produit:${order.product}-etat:placed`);
            io.emit('update-data', { orders, buzzers });
        }
    });

    socket.on('set-done', (orderId) => {
        const order = orders.find(o => o.id === orderId);
        // SÉCURITÉ : Uniquement si l'état est 'cooking'
        if (order && order.status === "cooking") {
            order.status = "done";
            client.publish(`${BASE_TOPIC}${order.buzzer}`, `produit:${order.product}-etat:done`);
            io.emit('update-data', { orders, buzzers });
        }
    });

    socket.on('reset-order', (orderId) => {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            const order = orders[orderIndex];
            const buzzer = buzzers.find(b => b.id === order.buzzer);
            client.publish(`${BASE_TOPIC}${order.buzzer}`, `produit:-etat:reset`);
            if (buzzer) buzzer.currentOrderId = null;
            orders.splice(orderIndex, 1); 
            io.emit('update-data', { orders, buzzers });
        }
    });
});

server.listen(3000, () => console.log('Serveur : http://localhost:3000'));