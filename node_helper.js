var NodeHelper = require('node_helper')
var fetch = require('node_fetch')
var luxon = require('luxon')
const DateTime = luxon.DateTime

var getCountryStatsURL = 'https://corona.lmao.ninja/v2/countries/:query?yesterday='
var globalStatsURL = 'https://corona.lmao.ninja/v2/all?yesterday='

module.exports = NodeHelper.create({
    requiresVersion: '2.0.18',

    start: function () {
        console.log('Starting node helper for: ' + this.name)
    },

    getCovidStatsByCountry: function (payload) {
        var countryList = payload.countries
        console.log(countryList)
        const getCountryStatsURL = `https://corona.lmao.ninja/v2/countries/${countryList}?yesterday`

        var response = await fetch(getCountryStatsURL)
        if (!response.status == 200) {
            console.log(`Error fetching country stats: ${response.statusCode} ${response.statusText}`)
            return;
        }

        var parsedResponse = await response.json();
        console.log(parsedResponse)
        this.sendSocketNotification('COVIDSTATS_COUNTRY_RESULTS', parsedResponse)

    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'GET_COVIDSTATS_COUNTRY') {
            this.getCovidStatsByCountry(payload)
        }

        if (notification === 'GET_COVIDSTATS_GLOBAL') {
            this.getCovidStatsByGlobal(payload)
        } 
    }

})