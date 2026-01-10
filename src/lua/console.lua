
-- introduction IOT / UBS
-- (c) Gildas Menier
-- gildas.menier@univ-ubs.fr

-- contient les définitions de
-- ledon()
-- ledoff()
-- cls()
-- console()
-- wheelRGB

-- changer les valeurs qui suivent en fonction de 
-- vos branchements

local sda = 18         -- GPIO pour I2C
local scl = 19

i2cadd = 0x3C   -- adresse ecran I2C

local ledpin = 2      -- GPIO pour la led interne


-- configuration

local reset16 = false -- reset ecran

i2c.setpins(0,sda,scl) -- config i2C

-- support led Interne

pio.pin.setdir(pio.OUTPUT, ledpin);

function ledon()
    pio.pin.sethigh(ledpin)
end

function ledoff()
    pio.pin.setlow(ledpin)
end

-- ecran

if reset16 then -- reset pour l'ecran si necessaire
  pio.pin.setdir(pio.OUTPUT, pio.GPIO16);
  pio.pin.setlow(pio.GPIO16)
  tmr.delayms(50);
  pio.pin.sethigh(pio.GPIO16)
  tmr.delayms(50);
end

pcall( function() -- pas d'erreur
    gdisplay.attach(gdisplay.SSD1306_128_64, gdisplay.LANDSCAPE, false, i2cadd)
    gdisplay.clear()
    gdisplay.setfont(gdisplay.FONT_LCD)
    gdisplay.setwrap(false)
end)

local consolepos = 0
local consoletab = {}
local consolemax = 6

local oledflip = 1

function flip()
  oledflip = oledflip+1; if oledflip > 3 then oledflip = 0 end
  if oledflip==0 then
     consolemax = 6
     gdisplay.attach(gdisplay.SSD1306_128_64, gdisplay.LANDSCAPE_FLIP, false, i2cadd)
  elseif oledflip==1 then
     consolemax = 6
     gdisplay.attach(gdisplay.SSD1306_128_64, gdisplay.LANDSCAPE, false, i2cadd)
  elseif oledflip==2 then
     consolemax = 13
     gdisplay.attach(gdisplay.SSD1306_128_64, gdisplay.PORTRAIT, false, i2cadd)
  else
     consolemax = 13
     gdisplay.attach(gdisplay.SSD1306_128_64, gdisplay.PORTRAIT_FLIP, false, i2cadd)
  end    
  cls()
end



function cls() 
    if (consolemax==6) then gdisplay.clear()
    else 
        gdisplay.rect( {0,0}, 128, 9*consolemax, {0,0,0}, {0,0,0} )
    end
    if oledflip ~= 1 then gdisplay.clear() end
    consolepos = 0
    consoletab={}
    for i=0, consolemax do
         consoletab[i] = ""
    end
end


function console(msg) 
    if (consolepos <= consolemax) then
        consoletab[consolepos] = msg
        gdisplay.write({0, consolepos*9},msg)
        consolepos = consolepos+1
    else
        for i = 1, consolemax do
            consoletab[i-1] = consoletab[i]
        end
        consoletab[consolemax] = msg
        if (consolemax==6) then gdisplay.clear()
        else 
            gdisplay.rect( {0,0}, 128, 9*consolemax+9, {0,0,0}, {0,0,0} )
        end
        for i=0, consolemax do
            gdisplay.write({0, i*9},consoletab[i])
        end
    end
end

function top() 
    local l = thread.list(true)
    cls()
    for k,v in pairs(l) do
        console(l[k]["thid"].."  "..l[k]["name"].."  "..l[k]["used_stack"])
    end
end

function fonts()
  cls()
  gdisplay.setfont(gdisplay.FONT_DEFAULT)
  console("DEFAULT")
  tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_DEJAVU18)
  console("DEJAVU18")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_DEJAVU24)
  console("DEJAVU24")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_UBUNTU16)
  console("UBUNTU16")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_COMIC24)
  console("COMIC24")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_TOONEY32)
  console("TOONEY32")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_MINYA24)
  console("MINYA24")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_7SEG)
  console("7SEG")
    tmr.delay(5); cls()
  gdisplay.setfont(gdisplay.FONT_LCD)
  console("LCD")
end

function wheelRGB(pos) -- pos 0 -> 255 couleur
    pos = 255 - pos
    if (pos < 85) then
         return 255 - pos * 3, 0, pos * 3
    elseif (pos < 170) then 
         pos = pos - 85
         return 0, pos * 3, 255 - pos * 3
    else 
         pos = pos - 170 
         return pos * 3, 255 - pos * 3, 0 
    end
end
                                                            

pcall( function()
   cls()
   console(">")
end)

