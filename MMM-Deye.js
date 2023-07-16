Module.register("MMM-Deye", {
	defaults: {
		address: "localhost",
		username: "admin",
		password: "admin",
		updateInterval: 1000 * 60
	},
	nodeList: {},
	message: "MMM-Deye starting up",
	getStyles: function() {
		return ["MMM-Deye.css"];
	},
	notificationReceived(notification, payload) {
		if (notification === 'ALL_MODULES_STARTED') {
			this.sendSocketNotification("CONFIG", this.config)
			// get the playing content
			this.message = "MMM-Deye waiting for content from inverter"
			const self = this;
			const timer = setInterval(function(){
				Log.log("Updating values from Deye");
				self.sendSocketNotification("getcontent", null);
			}, this.config.updateInterval * 1000);
			this.sendSocketNotification("getcontent", null);
		}
	},
	socketNotificationReceived: function (notification, payload) {
		if (notification === 'node_data') {
			Log.log("Received content back from helper")
			this.content = payload;
			this.updateDom(1)
		}
	},
	getDom: function () {
		let wrapper = document.createElement("table");
		wrapper.id = "deye"
		if (typeof this.content !== typeof undefined) {
			wrapper.appendChild(this.createTr("Current Production", this.content.current + " W"));
			wrapper.appendChild(this.createTr("Daily Production", this.content.daily + " kWh"));
			wrapper.appendChild(this.createTr("Total Production", this.content.total + " kWh"));
		} else {
			wrapper.innerText = this.message
		}
		return wrapper;
	},
	createTr: function (name, value) {
		let tr = document.createElement("tr");
		let key = document.createElement("td");
		key.innerText = name;
		key.className = "key";
		let val = document.createElement("td");
		val.innerText = value;
		val.className = "value";
		tr.appendChild(key);
		tr.appendChild(val);
		return tr;
	}
});
