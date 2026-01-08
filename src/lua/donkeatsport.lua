dofile("neopixel_util.lua")

-- Initiate buzzer
pio.pin.setdir(pio.OUTPUT,pio.GPIO2)
-- Initiate potentiometer
-- Only GPIO22 used (button), GPIO21 and GPIO4 not used
enc = encoder.attach(pio.GPIO4,pio.GPIO21,pio.GPIO22)

-- DEFINING ID OF THE ESP32 FOR THE PROJECT
-- Need to be change on every device, so the number is unique
device_id = "1"

-- Initiate MQTT
id_mqtt = "donk_" .. device_id
topic = "/donkeatsport/"..device_id
client = mqtt.client(id_mqtt,"test.mosquitto.org",1883,false)

-- Connection to the MQTT broker
client:connect("","")
-- Example for subscribing to a topic
-- client:subscribe(topic,mqtt.QOS0,receivingMessage)

function receivingMessage(length,message)
        start,stop = message:find(":")
        state = message:sub(stop+1)
        
        -- Order placed but not trigerred yet
        if state == "placed" then
                -- FIXED RED LED
                
        -- Order trigerred
        elseif state == "cooking" then
                -- ORANGE LED DOING LOADING ANIMATION
                
        -- Order ready
        elseif state == "done" then
                -- GREEN LED FLASHING
        
        -- Reset of the buzzer
        elseif state == "reset" then
                -- LED OFF
                
        end
end

client:subscribe(topic,mqtt.QOS0,receivingMessage)
