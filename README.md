# forum_iot

Projet d'IoT pour la matière Introduction à l'IoT en 3ème année de ICE à l'ENSIBS

## Interface web

### Prérequis

L'applcation web nécessite une installation nodejs et npm pour pouvoir être lancé.

Avant de lancer l'interface web, il est nécessaire d'avoir installé les dépendances. Dans src/web exécutez :

```bash
npm install express mqtt socket.io
npm audit fix
```

Si vous voulez changer l'url du broker mosquitto, allez dans src/web/server.js et modifiez la ligne suivante au début du fichier :

```js
const MQTT_BROKER = "mqtt://localhost:1808";
```

### Lancement

Pour lancer l'application web, dans src/web il faut exécuter :

```bash
node server.js
```
