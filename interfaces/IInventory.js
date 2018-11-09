var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.depositInventory = function(items, callback) {
	this._requireKey();

	if (!(items instanceof Array)) {
		items = [items];
	}

	this.post("IInventory", "Deposit", 1, {"items": JSON.stringify(items)}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getInstantSaleInventory = function(callback) {
	this._requireKey();
	this.get("IInventory", "GetInstantSaleInventory", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res.items, res.commodities);
	});
};

// @deprecated
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

OPSkinsAPI.prototype.getInventoryPage = function(page, per_page, callback) {
	this._requireKey();
	this.get("IInventory", "GetInventory", 2, {
		"page": page,
		"per_page": per_page,
	}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res.limits, res.items);
	});
};

OPSkinsAPI.prototype.getSteamInstantSellItems = function(appid, contextid, callback) {
	this._requireKey();
	this.get("IInventory", "GetSteamInstantSellItems", 1, {
		"appid": appid,
		"contextid": contextid,
	}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res.items, res.descriptions, res.commodities);
	});
};

OPSkinsAPI.prototype.transferInventoryItemsToTradeSite = function(items, callback) {
	this._requireKey();

	if (!(items instanceof Array)) {
		items = [items];
	}

	this.post("IInventory", "TransferToTradeSite", 1, {"items": items.toString()}, function(err, res) {
		if (err && !res) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.withdrawInventoryItems = function(items, delivery, callback) {
	if (typeof delivery === 'function') {
		callback = delivery;
		delivery = null;
	}
	
	this._requireKey();

	if (!(items instanceof Array)) {
		items = [items];
	}

	this.post("IInventory", "Withdraw", 1, {"items": items.join(','), "delivery_id64": delivery ? delivery.id64 : undefined, "delivery_token": delivery ? delivery.token : undefined, "delivery_message": delivery ? delivery.message : undefined}, function(err, res) {
		if (err && !res) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.withdrawCryptoAsset = function(saleid, address, callback) {
	this._requireKey();
	this.post("IInventory", "WithdrawCryptoAsset", 1, {
		"saleid": saleid,
		"address": address
	}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};
