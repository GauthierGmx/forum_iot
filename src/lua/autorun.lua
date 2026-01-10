-- Needed to print on the OLED screen
dofile("console.lua")

bool_run = false
produit = ""
current_state = ""

-- Example for setting up WiFi connection
-- Made with access point on a smartphone
net.wf.setup(net.wf.mode.STA,"SSID","password")
net.wf.start()
