dofile("neopixel_util.lua")

function runOrder(direction,counter,button)
        if button == 1 then
                if (produit ~= "") and (current_state == "placed") and (bool_run == false) then
                        -- Triggering the cooking of the order
                        current_state = "cooking"
                        client:publish(topic,"produit:"..produit.."-etat:"..current_state,mqtt.QOS0)
                        -- Blocking any other try of triggering the order
                        bool_run = true
                end
        end
end


-- Message sent "produit:<name>-etat:<state>"
function receivingMessage(length,message)
        start,stop = message:find("-")
        product_message = message:sub(0,start-1)
        state_message = message:sub(stop+1)
        
        start,stop = product_message:find(":")
        nameProduct = product_message:sub(stop+1)
        
        start,stop = state_message:find(":")
        state = state_message:sub(stop+1)
        
        produit = nameProduct
        current_state = state
        -- Order placed but not trigerred yet
        if current_state == "placed" then
                -- FIXED RED LED
                placedAnimation()
                console("Prt : "..produit)
        -- Order trigerred
        elseif current_state == "cooking" then
                -- ORANGE LED DOING LOADING ANIMATION
                cookingAnimation()
        -- Order ready
        elseif current_state == "done" then
                -- GREEN LED FLASHING
                doneAnimation()
        -- Reset of the buzzer
        elseif current_state == "reset" then
                -- LED OFF
                stopAnimation()
                cls()
                produit = ""
                current_state = ""
                bool_run = false
                console("ID :"..device_id)
        end
end

-- Initiate potentiometer
-- Only GPIO22 used (button), GPIO21 and GPIO4 not used
enc = encoder.attach(pio.GPIO4,pio.GPIO21,pio.GPIO22,runOrder)

-- DEFINING ID OF THE ESP32 FOR THE PROJECT
-- Need to be change on every device, so the number is unique
device_id = "1"
console("ID : "..device_id)

-- Initiate MQTT
id_mqtt = "donk_buzzer_" .. device_id
topic = "/donkeatsport/"..device_id
client = mqtt.client(id_mqtt,"test.mosquitto.org",1883,false)

-- Connection to the MQTT broker
client:connect("","")
-- Example for subscribing to a topic
-- client:subscribe(topic,mqtt.QOS0,receivingMessage)

client:subscribe(topic,mqtt.QOS0,receivingMessage)
