// @ts-check

var Microbit = (function () {
    "use strict";

    var leds = [
    	true,  false, false, false, false,
    	false, true,  false, false, false,
    	false, false, false, false, false,
    	false, false, false, true,  false,
    	false, false, false, false, true,
    ];
    var pins = [ false, false, false, false, false, false,false, false, true, true ];

    function init() {
        initVue();
    }

    function initVue() {
        var app = new Vue({
            el: "#app",
            data: {
                leds: leds,
                pins: pins,
                buttonA: false,
                buttonB: true,
                temperatureC: 0,
                temperatureF: 0,
                address: "A",
                localName: "B"
            },
            methods: {
                getTemperature: getTemperature,
                getLeds: getLeds,
                setLeds: setLeds,
                getLedStateClass: getLedStateClass,
                getPinStateClass: getPinStateClass,
            },
        });
    }

    function getTemperature() {
    	this.temperatureC = 10;
    	this.temperatureF = (this.temperatureC * 9.0 / 5.0) + 32.0;
    }

    function getLeds() {
    }

    function setLeds() {
    }

    function getLedStateClass(ledIndex)
    {
    	if (ledIndex < 0 || ledIndex >= 25)
    		return "";

    	return "led " + (this.leds[ledIndex] ? "stateOn" : "stateOff");
    }

    function getPinStateClass(pinIndex)
    {
    	if (pinIndex < 0 || pinIndex >= 10)
    		return "";

    	return "pin " + (this.pins[pinIndex] ? "stateHigh" : "stateLow");
    }

    /*function saveSettings() {
        var settings = sites.map(function (i) {
            return { customerCode: i.customerCode, expanded: i.expanded };
        });
        console.log(JSON.stringify(settings));
        localStorage.setItem("expandedSites", JSON.stringify(settings));
    }

    function getSettings() {
        var settings = localStorage.getItem("expandedSites");
        if (settings === null) {
            return null;
        }

        console.log(settings);

        return JSON.parse(settings);
    }*/

    return {
        init: init,
    };
})();

Microbit.init();
