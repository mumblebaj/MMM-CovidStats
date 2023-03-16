Module.register("MMM-CovidStats", {
    // Declare default inputs
    defaults: {
        title: "MMM-CovidStats",
        countries: ["USA", "ZAF", "ESP", "GBR"],
        globlStats: false,
        sortBy: "cases", // Sort the list of country stats by this value
        period: "current", // options current or yesterday
        highlightCountry: "USA",
        updateInterval: 86400000, // Update once every 24 hours
        fadeSpeed: 1000
    },

    getStyles: function() {
        return ["MMM-CovidStats.css"]
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            fr: "translations/fr.json"
        }
    },

    getTemplate() {
        return `templates/${this.name}.njk`;
    },

    getCountryStats() {
        const countries = this.countryStats
        return countries;
    },

    getGlobalStats() {
        const globalstats = this.globalStats
        return globalstats;
    },

    getTemplateData() {
        return {
            config: this.config,
            countries: this.getCountryStats(),
            globalstats: this.getGlobalStats()
        }
    },

    start: function() {
        Log.info(`Starting module: ${this.name}`);
        suspended = true;
        this.getCovidStats()
        this.scheduleUpdate()
    },

    stop: function () {
        Log.info('Stopping module ' + this.name);
      },
    
      resume: function () {
        Log.info('Resuming module ' + this.name);
        Log.debug('with config: ' + JSON.stringify(this.config));
        this.suspended = false;
        this.updateDom()
      },
    
      suspend: function () {
        Log.info('Suspending module ' + this.name);
        this.suspended = true;
      },

    getCovidStats: function() {
        this.sendSocketNotification("GET_COVIDSTATS_COUNTRY", this.config)

        if (this.config.globalStats === true) {
            this.sendSocketNotification("GET_COVIDSTATS_GLOBAL", this.config)
        }
    },
    
    scheduleUpdate: function(delay) {
        var nextUpdate = this.config.updateInterval
        if (typeof delay != "undefined" && delay >= 0) {
            nextUpdate = delay
        }

        var self = this
        setInterval(function() {
            self.getCovidStats()
        }, nextUpdate)
    }, 

    socketNotificationReceived: function(notification, payload) {
        var self = this
        if (notification === "COVIDSTATS_COUNTRY_RESULTS") {
            this.countryStats = payload
            this.updateDom(self.config.fadeSpeed)
        }

        if (notification === "COVIDSTATS_GLOBAL_RESULTS") {
            this.globalStats = payload
            this.updateDom(self.config.fadeSpeed)
        }
    }
})