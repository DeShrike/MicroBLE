const noble = require("noble")

let activeReadWrites = 0;

const timeout = ms => new Promise(res => setTimeout(res, ms))

async function delay()
{
    await timeout(100);
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
        process.exit();
    }
}
