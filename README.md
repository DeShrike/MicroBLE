# Bluetooth LE with nodejs on Raspberry PI

## Installing BLUEZ

Install Prerequisites:

sudo apt-get install libusb-dev libdbus-1-dev libglib2.0-dev libudev-dev
sudo apt-get install libical-dev
sudo apt-get install libreadline-dev

Download Bluez: http://www.bluez.org/download/

extract: tar -xvf bluez-5.54.tar.xz
cd bluez-5.54

sudo ./configure        (--disable-systemd) ???
sudo make
sudo make install

reboot the Pi

systemctl status bluetooth

edit: /lib/systemd/system/bluetooth.service
add "--experimental" to executing line

systemctl start bluetooth


## Nodejs app with NOBLE

mkdir ble
cd ble

npm init -y
npm install noble --save
npm install @abandonware/bluetooth-hci-socket --save

edit node_modules/noble/lib/hci-socket/hci.js
line 6:
	var BluetoothHciSocket = require('@abandonware/bluetooth-hci-socket');


## References

https://www.youtube.com/watch?v=AFjYKEf7j2M
https://www.youtube.com/watch?v=sP0MjQDv2N4
http://www.bluez.org/download/
https://github.com/noble/node-bluetooth-hci-socket/issues/107
https://github.com/noble/noble


## To run without sudo:

sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)


## Using bluetoothctl

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


