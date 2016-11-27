var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getInventory = function(callback) {
	this._requireKey();
	this.get("IInventory", "GetInventory", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.withdrawInventoryItems = function(items, callback) {
	this._requireKey();

	if (!(items instanceof Array)) {
		items = [items];
	}

	this.post("IInventory", "Withdraw", 1, {"items": items.join(',')}, function(err, res) {
		if (err && !res) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};
