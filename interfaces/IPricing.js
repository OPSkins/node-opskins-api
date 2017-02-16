var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getPriceList = function(appid, callback) {
	this.get("IPricing", "GetPriceList", 2, {"appid": appid}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			var item, date;
			for (item in res) {
				for (date in res[item]) {
					if (res[item][date].normalized_mean) {
						res[item][date].price = res[item][date].normalized_mean; // backwards-compatibility
					}
				}
			}

			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getLowestPrices = function(appid, callback) {
	this.get("IPricing", "GetAllLowestListPrices", 1, {"appid": appid}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSuggestedPrices = function(appid, names, callback) {
	this._requireKey();

	if (!(names instanceof Array)) {
		names = [names];
	}

	this.get("IPricing", "GetSuggestedPrices", 1, {"appid": appid, "items": names}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.prices instanceof Array ? {} : res.prices);
		}
	});
};
