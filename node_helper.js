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
                "cases": e.cases,
                "todatyCases": e.todayCases,
                "deaths": e.deaths,
                "todayDeaths": e.todayDeaths,
                "recovered": e.recovered,
                "todayRecovered": e.todayRecovered,
                "active": e.active,
                "critical": e.critical
            })
        })
        return covidData;
    },

    deconstructWorldData: function (woldpayload) {
        worldData = [];
        let updateDate = DateTime.fromMillis(e.updated).toISO();
        let formatedDate = DateTime.fromISO(updateDate).toLocaleString(DateTime.DATETIME_MED);
        worldData.push({
            "updated": formatedDate,
            "cases": e.cases,
            "todatyCases": e.todayCases,
            "deaths": e.deaths,
            "todayDeaths": e.todayDeaths,
            "recovered": e.recovered,
            "todayRecovered": e.todayRecovered,
            "active": e.active,
            "critical": e.critical
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
        var parsedResponse = deconstructCountryData(countryData);

        this.sendSocketNotification('COVIDSTATS_COUNTRY_RESULTS', parsedResponse)

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