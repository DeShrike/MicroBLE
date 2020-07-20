const noble = require("noble")

let activeReadWrites = 0;

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

function foundChars(error, services, characteristics)
{
    console.log("error", error);
    console.log(services);
    console.log(characteristics);
}

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

    for (let service of services)
    {
        service.characteristics.forEach(function(ch, chid) 
        {
            if (ch.uuid === "e95d9250251d470aa062fa1922dfa9a8") // Temperature
            {
                temperatureCharacteristic = ch;
            }
        } );
    }

    if (temperatureCharacteristic !== null)
    {
        await doTemperatureStuff(temperatureCharacteristic, device);
    }

    console.log("");
    console.log("Disconnecting");
    device.disconnect(disconnected);
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
