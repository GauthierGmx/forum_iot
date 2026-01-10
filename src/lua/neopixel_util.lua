-- Initiate Neopixel
neo = neopixel.attach(neopixel.WS2812B,pio.GPIO23,8)

function clearNeoPixel()
   for i=0,7 do
      neo:setPixel(i,0,0,0)
   end
   neo:update() 
end

function placedAnimation()
    for i=0,7 do
        neo:setPixel(i,255,0,0)
    end
    neo:update()
end

function cookingAnimation()
        for i=0,7 do
                neo:setPixel(i,255,100,0)
        end
        neo:update()
end

function doneAnimation()
        for i=0,7 do
                neo:setPixel(i,0,255,0)
        end
        neo:update()
end
