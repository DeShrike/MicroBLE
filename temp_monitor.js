const noble = require("noble")
const fs = require("fs")

let activeReadWrites = 0;

const timeout = ms => new Promise(res => setTimeout(res, ms))

async function delay()
{
    await timeout(100);
}

async function delayseconds(seconds)
{
    await timeout(1000 * seconds);
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

function buildLogfileName()
{
    let d = new Date();
    let month = '' + (d.getMonth() + 1);
    let year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;

    return "temperature-" + year + month + ".txt";
}

function formatDate(date)
{
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    let hour = '' + d.getHours();
    let minute = '' + d.getMinutes();
    let second = '' + d.getSeconds();

    if (month.length < 2)
        month = '0' + month;

    if (day.length < 2)
        day = '0' + day;

    if (hour.length < 2)
        hour = '0' + hour;

    if (minute.length < 2)
        minute = '0' + minute;

    if (second.length < 2)
        second = '0' + second;

    return [year, month, day].join('-') + " "
            + [hour, minute, second].join(':');
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

function discovered(device)
{
    console.log("Discovered Device: ", device.address);
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

        // device.connect(function(error) { connected(error, device); });
        loop(device);
    }
}

async function loop(device)
{
    const interval = 1000 * 60 * 5; // 5 minutes
    let nextAction = Date.now() + interval;
    console.log("Waiting Until: " + formatDate(nextAction));
    while (true)
    {
        await delayseconds(2);
        if (Date.now() > nextAction)
        {
            console.log("->");
            device.connect(function(error) { connected(error, device); });

            nextAction = Date.now() + interval;
            console.log("Waiting Until: " + formatDate(nextAction));
            await delayseconds(10);
        }
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

    let temperature = data[0];
    console.log("");
    console.log("Temperature: ", temperature, "°C");
    activeReadWrites--;

    let r = {
        temp: temperature,
        deviceAddress: device.address,
        deviceName: device.advertisement.localName,
        time: Date.now()
    };

    writeRecord(r);
}

function disconnected(error)
{
    if (error)
    {
        console.log("disconnected: ", error);
        return;
    }

    console.log("Disconnected");
    // process.exit();
}

async function doTemperatureStuff(temperatureCharacteristic, device)
{
    activeReadWrites++;
    console.log("");
    console.log("Reading Temperature");
    temperatureCharacteristic.read(function(error, data) { readTemperature(error, data, device); });

    await waitForEvents();
}


function writeRecord(r)
{
    let path = buildLogfileName();

    let data = formatDate(r.time) + "\t" 
        + r.time + "\t"
        + r.temp + "\t"
        + r.deviceAddress + "\t"
        + r.deviceName + "\r\n";

    let buffer = new Buffer(data);

    fs.open(path, 'a', function(err, fd) {
        if (err) {
            throw 'could not open file: ' + err;
        }

        // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
        fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err)
            {
                throw 'error writing file: ' + err;
            }

            fs.close(fd, function() {
                console.log('Wrote the file successfully: ' + path);
            });
        });
    });
}

function main() 
{
    console.log("Temperature Monitoring");
    noble.on('discover', discovered);
}

main();
