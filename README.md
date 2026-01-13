# DonkEats

Ce projet est un **Proof of Concept (PoC)** développé dans le cadre de notre formation à l'ENSIBS. Il bise à optimiser la gestion des files d'attente lors des événements organisés par l'association DonkEsport.

## Branchement physique

Pour notre programme, nous avons branché nos composants d'une certaine façon :

- **Ecran OLED :** SDA - 18 et SCK/SDL - 19
- **Neopixel :** 23
- **Potentiomètre (bouton) :** 22
- **Buzzer :** 2

Vous pouvez adapter les branchements comme bon vous semble.

> [!IMPORTANT]
> Si vous modifiez les ports pour l'écran, vous devrez les modifier aussi dans les fichiers suivants :
>
> - console.lua : Ecran OLED
> - neopixel_util.lua : Buzzer et Neopixel
> - donkeatsport.lua : Potentiomètre

## Configuration

### Identifiant du buzzer
Afin de rendre chaque ESP32 unique, il est nécessaire de configurer une ligne vers la fin du fichier "donkeatsport.lua"

```lua
device_id = "1"
```

Cette ligne est ensuite utilisé pour créer le topic qui sera utilisé pour communiquer.

### Serveur MQTT

Afin de simplifier l'utilisation de notre PoC, nous avons utilisé le broker public de Mosquitto.
Si vous souhaitez utilisé votre propre broker, il vous faudra modifier la ligne suivante vers la fin du fichier "donkeatsport.lua"

```lua
client = mqtt.client(id_mqtt,"test.mosquitto.org",1883,false)
```

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
