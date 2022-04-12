var NodeHelper = require('node_helper')
var fetch = require('node-fetch')

var getCountryStatsURL = 'https://corona.lmao.ninja/v2/countries/:query?yesterday='
var globalStatsURL = 'https://corona.lmao.ninja/v2/all?yesterday='

module.exports = NodeHelper.create({
    requiresVersion: '2.0.18',

    start: function () {
        console.log('Starting node helper for: ' + this.name)
    },

    async getCovidStatsByCountry(payload) {
        var countryList = payload.countries
        
        var period = ""

        if (payload.period === "current" ) {
            period = "false"
        } else { 
                if(payload.period === "yesterday") { 
                    period = "true" 
                } else { period = "false"}
            }
        
        const getCountryStatsURL = `https://corona.lmao.ninja/v2/countries/${countryList}?yesterday=${period}`

        var response = await fetch(getCountryStatsURL)

        if (!response.status == 200) {
            console.log(`Error fetching country stats: ${response.statusCode} ${response.statusText}`)
            return;
        }
        var parsedResponse = await response.json()
        
        this.sendSocketNotification('COVIDSTATS_COUNTRY_RESULTS', parsedResponse)

    },

    async getCovidStatsByGlobal(payload) {

        var period = ""

        if (payload.period === "current" ) {
            period = "false"
        } else { 
                if(payload.period === "yesterday") { 
                    period = "true" 
                } else { period = "false"}
            }
                
        const getGlobalStatsURL = `https://corona.lmao.ninja/v2/all?yesterday=${period}`

        var response = await fetch(getGlobalStatsURL)

        if (!response.status == 200) {
            console.log(`Error fetching global stats: ${response.statusCode} ${response.statusText}`)
            return;
        }
        var parsedResponse = await response.json()
        
        this.sendSocketNotification('COVIDSTATS_GLOBAL_RESULTS', parsedResponse)
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