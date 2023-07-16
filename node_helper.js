var NodeHelper = require("node_helper");

const rock = require('rock-req')

const currentRegex = /var webdata_now_p = "([.0-9]+)";/;
const dailyRegex = /var webdata_today_e = "([.0-9]+)";/;
const totalRegex = /var webdata_total_e = "([.0-9]+)";/;

module.exports = NodeHelper.create({
	config: null,
	debug: false,
	init() {
		console.log("init module helper " + this.name);
	},

	start() {
		console.log(`Starting module helper: ${this.name}`);
	},

	stop() {
		console.log(`Stopping module helper: ${this.name}`);
	},

	socketNotificationReceived(notification, payload) {
		if (notification === "CONFIG") {
			this.config = payload
		}
		else if (notification === "getcontent") {
			this.getcontent()
		}

	},
	getcontent() {
		const encodedAuth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')

		console.log("Getting data from Deye inverter at '" + this.config.address + "'");
		const self = this;
		rock({ method: 'GET', url: 'http://' + this.config.address + '/status.html', headers: {
				authorization: `Basic ${encodedAuth}`
			}},function (err, res, data) {
			if (res.statusCode === 200) {
				const currentProduction = currentRegex.exec(data)[1];
				const dailyProduction = dailyRegex.exec(data)[1];
				const totalProduction = totalRegex.exec(data)[1];
				self.sendSocketNotification("node_data", {current: currentProduction, daily: dailyProduction, total: totalProduction})
			} else {
				console.log("Statuscode for request " + res.statusCode) // 200
			}
		})
	},
});
