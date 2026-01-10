-- Initiate Neopixel
neo = neopixel.attach(neopixel.WS2812B,pio.GPIO23,8)
-- Initiate buzzer
PIN_BUZZER = pio.GPIO2
pio.pin.setdir(pio.OUTPUT,PIN_BUZZER)

local anim_timer = nil
local frame = 0

function clearNeoPixel()
   for i=0,7 do
      neo:setPixel(i,0,0,0)
   end
   neo:update() 
end

function stopAnimation()
        if anim_time then
                anim_timer:stop()
                anim_timer = nil
        end
        clearNeoPixel()
        pio.pin.setlow(PIN_BUZZER)
        frame = 0
end

function placedAnimation()
    for i=0,7 do
        neo:setPixel(i,255,0,0)
    end
    neo:update()
end

function cookingAnimation()
        stopAnimation()
        anim_timer = tmr.attach(500, function()
                clearNeoPixel()
                neo:setPixel(frame,255,100,0)
                neo:update()

                frame = (frame+1)%8
        end)
        anim_timer:start()
end

function doneAnimation()
        stopAnimation()
        anim_timer = tmr.attach(200,function()
                if frame == 0 then
                        for j=0,7 do
                                neo:setPixel(j,0,255,0)
                        end
                        pio.pin.sethigh(PIN_BUZZER)
                        frame = 1
                else
                        clearNeoPixel()
                        pio.pin.setlow(PIN_BUZZER)
                        frame = 0
                end
                neo:update()
        end)
        anim_timer:start()
end
