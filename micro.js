const noble = require("noble")

// https://www.bluetooth.com/blog/bluetooth-bbc-microbit/
// https://github.com/lancaster-university/microbit-samples/tree/master/source/examples/bluetooth-services
// https://lancaster-university.github.io/microbit-docs/ble/profile/

let activeReadWrites = 0;
let mustQuit = 0;

const timeout = ms => new Promise(res => setTimeout(res, ms))

async function delay()
{
    await timeout(100);
}

async function halfDelay()
{
    await timeout(50);
}

async function waitForEvents()
{
    while (activeReadWrites > 0)
    {
        await delay();
    }
}

noble.on('stateChange', state => {
    if (state === 'poweredOn')
    {
        console.log('Scanning');
        noble.startScanning();
    }
    else
    {
        console.log("State: " + state);
        noble.stopScanning();
        process.exit();
    }
});

// noble.startScanning();
/*
noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    noble.stopScanning();
    const name = peripheral.advertisement.localName;
    console.log(`Connecting to '${name}' ${peripheral.id}`);
    console.log(peripheral);
    //peripheral.connect();
    //peripheral.discoverAllServicesAndCharacteristics(foundChars);
    // connectAndSetUp(peripheral);
});
*/

function foundChars(error, services, characteristics)
{
    console.log("error", error);
    console.log(services);
    console.log(characteristics);
}

/*
noble.on('discover', function(peripheral) {
    noble.stopScanning();
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  console.log();
});
*/

noble.on('discover', discovered);

function discovered(device)
{
    console.log("Discovered Device: ", device.address);
    // if (device.address === "dd:82:10:ff:52:5e")
    if (typeof device.advertisement.localName === "undefined")
    {
        return;
    }

    if (device.advertisement.localName.indexOf("micro:bit") < 0)
    {
        console.log(device.advertisement.localName);
        return;
    }

    if (device.advertisement.localName.indexOf("micro:bit") >= 0)
    {
        console.log(device.advertisement.localName);
        console.log("RSSI: ", device.rssi);
        noble.stopScanning();
        device.connect(function(error) { connected(error, device); });
    }
}

function connected(error, device)
{
    if (error)
    {
        console.log("connected: ", error);
        return;
    }

    device.discoverAllServicesAndCharacteristics(function(error, services, characteristics) { deviceready(error, services, characteristics, device); } );
}

async function deviceready(error, services, characteristics, device)
{
    if (error)
    {
        console.log("deviceready: ", error);
        return;
    }

    let temperatureCharacteristic = null;

    let ledCharacteristic = null;

    let pinDataCharacteristic = null;
    let pinPWMControlCharacteristic = null;
    let pinIOConfigCharacteristic = null;
    let pinADConfigCharacteristic = null;

    let button1Characteristic = null;
    let button2Characteristic = null;

    for (let service of services)
    {
        service.characteristics.forEach(function(ch, chid) 
        {
            if (ch.uuid === "e95d9250251d470aa062fa1922dfa9a8") // Temperature
            {
                temperatureCharacteristic = ch;
            }
            else if (ch.uuid === "e95d7b77251d470aa062fa1922dfa9a8")    // LED Matrix State
            {
                ledCharacteristic = ch;
            }
            else if (ch.uuid === "e95d8d00251d470aa062fa1922dfa9a8")    // IO PIN Data
            {
                pinDataCharacteristic = ch;
            }
            else if (ch.uuid === "e95dd822251d470aa062fa1922dfa9a8")    // PIN PWM Control
            {
                pinPWMControlCharacteristic = ch;
            }
            else if (ch.uuid === "e95db9fe251d470aa062fa1922dfa9a8")    // PIN IO Configuration
            {
                pinIOConfigCharacteristic = ch;
            }
            else if (ch.uuid === "e95d5899251d470aa062fa1922dfa9a8")    // PIN AD Configuration
            {
                pinADConfigCharacteristic = ch;
            }
            else if (ch.uuid === "e95dda90251d470aa062fa1922dfa9a8")    // Button A State
            {
                button1Characteristic = ch;
            }
            else if (ch.uuid === "e95dda91251d470aa062fa1922dfa9a8")    // Button B State
            {
                button2Characteristic = ch;
            }
        } );
    }


    if (button1Characteristic !== null)
    {
    	button1Characteristic.on("data", onButton1Pressed);
        button1Characteristic.subscribe(onButtonSubscribed);
        await doButtonStuff(button1Characteristic, device);
    }

    if (button2Characteristic !== null)
    {
    	button2Characteristic.on("data", onButton2Pressed);
        button2Characteristic.subscribe(onButtonSubscribed);
        await doButtonStuff(button2Characteristic, device);
    }

    if (temperatureCharacteristic !== null)
    {
        await doTemperatureStuff(temperatureCharacteristic, device);
    }

    if (ledCharacteristic !== null)
    {
        await doLedStuff(ledCharacteristic, device);
    }

    if (pinDataCharacteristic !== null && pinIOConfigCharacteristic != null && 
        pinPWMControlCharacteristic != null && pinADConfigCharacteristic != null)
    {
        await doPinStuff(pinIOConfigCharacteristic, pinADConfigCharacteristic, pinPWMControlCharacteristic, pinDataCharacteristic, device);
    }

    if (temperatureCharacteristic !== null)
    {
        await doTemperatureStuff(temperatureCharacteristic, device);
    }

    mustQuit = 0;
    while (mustQuit < 10)
    {
        await delay();
    }

    if (button1Characteristic !== null)
    {
        button1Characteristic.unsubscribe(onButtonUnsubscribed);
    }

    if (button2Characteristic !== null)
    {
        button2Characteristic.unsubscribe(onButtonUnsubscribed);
    }

    console.log("");
    console.log("Disconnecting");
    device.disconnect(disconnected);
}

function maxtrixToBuffer(matrix)
{
    var values = [ 0, 0, 0, 0, 0 ];
    for (let y = 0; y < 5; y++ )
    {
        for (let x = 0; x < 5; x++ )
        {
            if (matrix[y][x])
            {
                values[y] = values[y] | (2 ** (-x + 4));
            }
        }
    }

    console.log(values);
    const bufLed = Buffer.from(values);
    return bufLed;
}

function readTemperature(error, data, device)
{
    if (error)
    {
        console.log("readTemperature: ", error);
        return;
    }

    // console.log(data);
    let temperature = data[0];
    console.log("");
    console.log("Temperature: ", temperature, "°C");
    activeReadWrites--;
}

function toLedLine(value)
{
    let result = "";
    result += (value & 16) === 16 ? "O" : ".";
    result += (value & 8) === 8 ? "O" : ".";
    result += (value & 4) === 4 ? "O" : ".";
    result += (value & 2) === 2 ? "O" : ".";
    result += (value & 1) === 1 ? "O" : ".";
    return result;
}

function onButton1Pressed(data, isNotification)
{
	mustQuit++;
	console.log("Button A Event", mustQuit);
}

function onButton2Pressed(data, isNotification)
{
	mustQuit++;
	console.log("Button B Event", mustQuit);
}

function onButtonUnsubscribed(error)
{
    if (error)
    {
        console.log("onButtonUnsubscribed: ", error);
    }
}

function onButtonSubscribed(error)
{
    if (error)
    {
        console.log("onButtonSubscribed: ", error);
    }
}

function readPinData(error, data, device)
{
    if (error)
    {
        console.log("readPinData: ", error);
        return;
    }

    console.log("");
    console.log("LED PIN Data:");
    console.log(data);
    for (let d of data)
    {
        console.log(d);
    }

    activeReadWrites--;
}

function readButtonState(error, data, device)
{
    if (error)
    {
        console.log("readButtonState: ", error);
        return;
    }

    console.log("");
    console.log("Button State:");
    console.log(data);
    for (let d of data)
    {
        console.log(d);
    }

    activeReadWrites--;
}

function readLedMatrixState(error, data, device)
{
    if (error)
    {
        console.log("readLedMatrixState: ", error);
        return;
    }

    // console.log(data);
    console.log("");
    console.log("LED Matrix State:");
    for (let d of data)
    {
        console.log(toLedLine(d), d);
    }

    activeReadWrites--;
}

function writeLedMatrixState(error)
{
    if (error)
    {
        console.log("writeLedMatrixState: ", error);
        return;
    }

    activeReadWrites--;
}

function writePinData(error)
{
    if (error)
    {
        console.log("writePinData: ", error);
        return;
    }

    activeReadWrites--;
}

function disconnected(error)
{
    if (error)
    {
        console.log("disconnected: ", error);
        return;
    }

    console.log("Disconnected");
    process.exit();
}

async function doTemperatureStuff(temperatureCharacteristic, device)
{
    activeReadWrites++;
    console.log("");
    console.log("Reading Temperature");
    temperatureCharacteristic.read(function(error, data) { readTemperature(error, data, device); });

    await waitForEvents();
}

async function doPinStuff(pinIOConfigCharacteristic, pinADConfigCharacteristic, 
                          pinPWMControlCharacteristic, pinDataCharacteristic, 
                          device)
{
    console.log("");
    console.log("Writing PIN Data");

    const buffers = []
    let bufIndex = 0;
    let bufPin;
    bufPin = Buffer.from([2, 0, 1, 0, 0, 0]);
    buffers.push(bufPin);
    bufPin = Buffer.from([2, 0, 1, 0, 0, 1]);
    buffers.push(bufPin);
    bufPin = Buffer.from([2, 0, 1, 1, 0, 0]);
    buffers.push(bufPin);
    bufPin = Buffer.from([2, 1, 1, 0, 0, 0]);
    buffers.push(bufPin);
    bufPin = Buffer.from([2, 0, 1, 1, 0, 0]);
    buffers.push(bufPin);

    for (let i = 0; i < 102; i++)
    {
        activeReadWrites++;
        pinDataCharacteristic.write(buffers[bufIndex], true, writePinData);
        bufIndex = (bufIndex +1 ) % buffers.length;
        await waitForEvents();

        await delay();
    }

    /*
    pins = [0, 0];
    const bufLed = Buffer.from(pins);
    activeReadWrites++;
    pinDataCharacteristic.write(bufLed, true, writePinData);
    await waitForEvents();
    */
}

async function doButtonStuff(buttonCharacteristic, device)
{
    activeReadWrites++;
    console.log("");
    console.log("Reading Button State");
    buttonCharacteristic.read(function(error, data) { readButtonState(error, data, device); });

    await waitForEvents();
}

async function doLedStuff(ledCharacteristic, device)
{
    activeReadWrites++;
    console.log("Reading LED Matrix State");
    ledCharacteristic.read(function(error, data) { readLedMatrixState(error, data, device); });

    await waitForEvents();

    var leds = [ 0, 0, 0, 0, 0 ];

    var matrix1 = [
        [ true,  false, false, false, false ],
        [ false, true,  false, false, false ],
        [ false, false, false, false, false ],
        [ false, false, false, true,  false ],
        [ false, false, false, false, true  ],
    ];

    var matrix2 = [
        [ false, false, false, false, false ],
        [ false, false, false, false, false ],
        [ true,  true,  false, true,  true ],
        [ false, false, false, false, false ],
        [ false, false, false, false, false ],
    ];

    var matrix3 = [
        [ false, false, false, false, true  ],
        [ false, false, false, true,  false ],
        [ false, false, false, false, false ],
        [ false, true,  false, false, false ],
        [ true,  false, false, false, false ],
    ];

    var matrix4 = [
        [ false, false, true,  false, false  ],
        [ false, false, true, false, false ],
        [ false, false, false, false, false ],
        [ false, false, true, false, false ],
        [ false, false, true, false, false ],
    ];

    for (var i = 0; i < 32; i++)
    {
        // console.log("Writing", i);
        leds[0] = i;
        leds[1] = -i + 31;
        leds[3] = -i + 31;
        leds[4] = i;
        activeReadWrites++;
        const bufLed = Buffer.from(leds);
        ledCharacteristic.write(bufLed, true, writeLedMatrixState);

        await waitForEvents();

        await delay();
    }

    var patternBuffers = [];
    patternBuffers.push( maxtrixToBuffer(matrix1) );
    patternBuffers.push( maxtrixToBuffer(matrix2) );
    patternBuffers.push( maxtrixToBuffer(matrix3) );
    patternBuffers.push( maxtrixToBuffer(matrix4) );

    let patternIndex = 0;
    for (let i = 0; i < 100; i++)
    {
        activeReadWrites++;
        ledCharacteristic.write(patternBuffers[patternIndex], true, writeLedMatrixState);

        patternIndex++;
        patternIndex = patternIndex % patternBuffers.length;

        await waitForEvents();

        await delay();
    }

    if (ledCharacteristic !== null)
    {
        activeReadWrites++;
        console.log("Reading LED Matrix State");
        ledCharacteristic.read(function(error, data) { readLedMatrixState(error, data, device); });
    }

    await waitForEvents();
}
