# Bluetooth LE with nodejs on Raspberry PI - Talking to a BBC micro:bit

Tested on a Raspberry PI 3B with Rasbian Stretch Lite and RaspiOS Lite

## Installing BLUEZ

Install Prerequisites:

```
sudo apt-get install libusb-dev libdbus-1-dev libglib2.0-dev libudev-dev
sudo apt-get install libical-dev
sudo apt-get install libreadline-dev
```

Download Bluez: http://www.bluez.org/download/

```
extract: tar -xvf bluez-5.54.tar.xz
cd bluez-5.54
```

```
sudo ./configure        (--disable-systemd) ???
sudo make
sudo make install
```

reboot the Pi

```
systemctl status bluetooth
```

edit: /lib/systemd/system/bluetooth.service
add "--experimental" to executing line

```
systemctl start bluetooth
```


## Nodejs app with NOBLE

Step 1
- First Install BLUEZ (see above)

Step 2
- Clone this repo - git clone <url>

Step 3
- Run: npm init

This will install noble and @abandonware/bluetooth-hci-socket
Ignore the errors during the building of bluetooth-hci-socket

Step 4
- Edit node_modules/noble/lib/hci-socket/hci.js

  line 6:
  ```
	var BluetoothHciSocket = require('@abandonware/bluetooth-hci-socket');
  ```


To make your own app:

```
npm init -y
npm install noble --save
npm install @abandonware/bluetooth-hci-socket --save
```

And the edit node_modules/noble/lib/hci-socket/hci.js


Step 5
- Install one of the .hex files on your micro:bit

More Info:

- https://www.bluetooth.com/blog/bluetooth-bbc-microbit/
- https://github.com/lancaster-university/microbit-samples/tree/master/source/examples/bluetooth-services
- https://lancaster-university.github.io/microbit-docs/ble/profile/


Step 6
```
sudo node micro.js
```

This script will connect to the first micro:bit it finds and send some commands to it:
- reading temperature
- reading the state of the 2 buttons
- show a few patterns on the LED matrix
- toggle PIN 0 low/high a few times
- Wait for a few button presses


## References

https://www.youtube.com/watch?v=AFjYKEf7j2M
https://www.youtube.com/watch?v=sP0MjQDv2N4
http://www.bluez.org/download/
https://github.com/noble/node-bluetooth-hci-socket/issues/107
https://github.com/noble/noble


## To run without sudo:

```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

## Using bluetoothctl

```
sudo bluetoothctl

power on
scan on
scan off
devices
connect DD:82:10:FF:52:5E
menu gatt
select-attribute /org/bluez/hci0/dev_DD_82_10_FF_52_5E/service0013
attribute-info
back
disconnect
power off
exit
```

## WIP

server.js is a WIP

