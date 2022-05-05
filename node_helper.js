var NodeHelper = require('node_helper')
var fetch = require('node-fetch')
const { DateTime } = require('luxon')


var getCountryStatsURL = 'https://corona.lmao.ninja/v2/countries/:query?yesterday='
var globalStatsURL = 'https://corona.lmao.ninja/v2/all?yesterday='

module.exports = NodeHelper.create({
    requiresVersion: '2.0.18',

    start: function () {
        console.log('Starting node helper for: ' + this.name)
    },

    deconstructCountryData: function (payload) {
        covidData = [];
        payload.forEach(function (e) {
            let updateDate = DateTime.fromMillis(e.updated).toISO();
            let formatedDate = DateTime.fromISO(updateDate).toLocaleString(DateTime.DATETIME_MED);
            covidData.push({
                "updated": formatedDate,
                "country": e.country,
                "countryInfo": {
                    "iso3": e.countryInfo.iso3,
                    "flag": e.countryInfo.flag
                },
                "casesInfo": {
                    "cases": e.cases,
                    "todayCases": e.todayCases,
                    "deaths": e.deaths,
                    "todayDeaths": e.todayDeaths,
                    "recovered": e.recovered,
                    "todayRecovered": e.todayRecovered,
                    "active": e.active,
                    "critical": e.critical
                }
            })
        })
        return covidData;
    },

    deconstructWorldData: function (e) {
        worldData = [];
        let updateDate = DateTime.fromMillis(e.updated).toISO();
        let formatedDate = DateTime.fromISO(updateDate).toLocaleString(DateTime.DATETIME_MED);
        worldData.push({
            "updated": formatedDate,
            "casesInfo": {
                "cases": e.cases,
                "todayCases": e.todayCases,
                "deaths": e.deaths,
                "todayDeaths": e.todayDeaths,
                "recovered": e.recovered,
                "todayRecovered": e.todayRecovered,
                "active": e.active,
                "critical": e.critical
            }
        })

        return worldData;
    },

    async getCovidStatsByCountry(payload) {
        var countryList = payload.countries

        var period = ""

        if (payload.period === "current") {
            period = "false"
        } else {
            if (payload.period === "yesterday") {
                period = "true"
            } else { period = "false" }
        }

        const getCountryStatsURL = `https://corona.lmao.ninja/v2/countries/${countryList}?yesterday=${period}`

        var response = await fetch(getCountryStatsURL)

        if (!response.status == 200) {
            console.log(`Error fetching country stats: ${response.statusCode} ${response.statusText}`)
            return;
        }
        var countryData = await response.json();
        var parsedResponse = this.deconstructCountryData(countryData);

        var datatobefiltered = covidData;

        if (payload.doNotDisplay) {
            // Get list of data to remove
            const remove = payload.doNotDisplay
            // Iterate through covidData and remove the data to be excluded
            remove.forEach(function (e) {
                for (i = 0; i < datatobefiltered.length; i++) {
                    delete datatobefiltered[i].casesInfo[e]
                }
            })
            this.sendSocketNotification('COVIDSTATS_COUNTRY_RESULTS', datatobefiltered)
        } else {

            this.sendSocketNotification('COVIDSTATS_COUNTRY_RESULTS', parsedResponse)
        }
    },

    async getCovidStatsByGlobal(payload) {

        var period = ""

        if (payload.period === "current") {
            period = "false"
        } else {
            if (payload.period === "yesterday") {
                period = "true"
            } else { period = "false" }
        }

        const getGlobalStatsURL = `https://corona.lmao.ninja/v2/all?yesterday=${period}`

        var response = await fetch(getGlobalStatsURL)

        if (!response.status == 200) {
            console.log(`Error fetching global stats: ${response.statusCode} ${response.statusText}`)
            return;
        }
        var globalData = await response.json()
        var parsedResponse = this.deconstructWorldData(globalData)

        var datatobefiltered = worldData;

        if (payload.doNotDisplay) {
            const remove = payload.doNotDisplay

            remove.forEach(function (e) {
                delete datatobefiltered[0].casesInfo[e]
            })
            this.sendSocketNotification('COVIDSTATS_GLOBAL_RESULTS', datatobefiltered[0])
        } else {

            this.sendSocketNotification('COVIDSTATS_GLOBAL_RESULTS', parsedResponse[0])
        }
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