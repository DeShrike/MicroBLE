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
wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.54.tar.xz
extract: tar -xvf bluez-5.54.tar.xz
cd bluez-5.54
```

```
sudo ./configure        (--disable-systemd) ???
sudo make
sudo make install
```

You may now remove the folder bluez-5.54 and the .xz file

Reboot the Pi

```
systemctl status bluetooth
```

edit: /lib/systemd/system/bluetooth.service

add "--experimental" to executing line

```
systemctl start bluetooth
```

## Nodejs app with NOBLE

### Step 1

- First Install BLUEZ (see above)

### Step 2

- Clone this repo - git clone https://github.com/DeShrike/MicroBLE.git

### Step 3

- Run: npm init

	This will install noble and @abandonware/bluetooth-hci-socket

	Ignore the errors during the building of bluetooth-hci-socket

### Step 4

- Edit node_modules/noble/lib/hci-socket/hci.js

Line 6:
```
var BluetoothHciSocket = require('@abandonware/bluetooth-hci-socket');
```


To make your own app:

	```
	npm init -y
	npm install noble --save
	npm install @abandonware/bluetooth-hci-socket --save
	```

And then edit node_modules/noble/lib/hci-socket/hci.js


### Step 5 - Preparing your Micro:bit

#### Option 1

Install MicroBLE.hex on your micro:bit

You can also try the other .hex file. More info about those here:

- https://www.bluetooth.com/blog/bluetooth-bbc-microbit/
- https://github.com/lancaster-university/microbit-samples/tree/master/source/examples/bluetooth-services
- https://lancaster-university.github.io/microbit-docs/ble/profile/

After the micro:bit reboots, you should see this pattern:

![micro:bit](resources/MicroBLE1.png)

#### Option 2 - Create your own .hex file

Go to https://makecode.microbit.org

Install the bluetooth services

![micro:bit](resources/MicroBLE0.png)

Create the app. Mine looks like this:

![micro:bit](resources/MicroBLE2.png)

Upload it to the micro:bit


### Step 6

```
sudo node scan.js
```

This will scan for Bluetooth LE devices and exit if it finds a micro:bit.

```
sudo node scan.js
```

This will scan for Bluetooth LE devices and connect to the first micro:bit it finds and read the temperature.

![micro:bit](resources/MicroBLE_temperature.png)

```
sudo node micro.js
```

This script will connect to the first micro:bit it finds and send some commands to it:
- reading temperature
- reading the state of the 2 buttons
- show a few patterns on the LED matrix
- toggle PIN 0 low/high a few times
- Wait for a few button presses

![micro:bit](resources/MicroBLE_photo.jpg)

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

