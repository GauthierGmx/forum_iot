-- Initiate Neopixel
neo = neopixel.attach(neopixel.WS2812B,pio.GPIO23,8)
-- Initiate buzzer
pio.pin.setdir(pio.OUTPUT,pio.GPIO22)
-- Initiate potentiometer
-- Only GPIO22 used (button), GPIO21 and GPIO4 not used
enc = encoder.attach(pio.GPIO4,pio.GPIO21,pio.GPIO22)

-- DEFINING ID OF THE ESP32 FOR THE PROJECT
-- Need to be change on every device, so the number is unique
device_id = "1"

-- Initiate MQTT
id_mqtt = "donk_" .. device_id
client = mqtt.client(id_mqtt,"test.mosquitto.org",1883,false)

-- Connection to the MQTT broker
client:connect("","")
-- Example for subscribing to a topic
-- client:subscribe("/donkeatsport/<device_id>")