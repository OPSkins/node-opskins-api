var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getSales = function(req, callback) {
	if (typeof req === 'function') {
		callback = req;
		req = {};
	}

	if (!req.type) {
		throw new Error("The \"type\" filter is required");
	}

	this._requireKey();
	this.get("ISales", "GetSales", 1, req, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, meta.total_pages, res);
		}
	});
};

OPSkinsAPI.prototype.editPrice = function(saleID, price, callback) {
	this._requireKey();
	this.post("ISales", "EditPrice", 1, {"saleid": saleID, "price": price}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, !!res.relisted);
		}
	});
};

OPSkinsAPI.prototype.editPrices = function(sales, callback) {
	this._requireKey();

	if (typeof sales !== 'object') {
		throw new Error("The sales parameter must be an object whose keys are OPSkins sale IDs and values are new prices in USD cents");
	}

	var query = {};

	for (var saleid in sales) {
		if (!sales.hasOwnProperty(saleid)) {
			continue;
		}

		if (isNaN(saleid) || isNaN(sales[saleid]) || sales[saleid] % 1 != 0) {
			throw new Error("The sales parameter must be an object whose keys are OPSkins sale IDs and values are new prices in USD cents");
		}

		query['items[' + saleid + ']'] = sales[saleid];
	}

	this.post("ISales", "EditPriceMulti", 1, query, function(err) {
		callback(err || null);
	});
};

OPSkinsAPI.prototype.getListingLimit = function(callback) {
	this._requireKey();
	this.get("ISales", "GetListingLimit", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.listing_limit);
		}
	});
};

OPSkinsAPI.prototype.listItems = function(items, callback) {
	if (!Array.isArray(items)) {
		items = [items];
	}

	this._requireKey();
	this.post("ISales", "ListItems", 1, {"items": JSON.stringify(items)}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.bumpItems = function(saleids, callback) {
	if (!Array.isArray(saleids)) {
		saleids = [saleids];
	}

	this._requireKey();
	this.post("ISales", "BumpItems", 1, {"items": saleids.join(',')}, function(err, res, meta) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, meta.balance, res.sales);
	});
};

OPSkinsAPI.prototype.returnItems = function(saleids, callback) {
	if (!Array.isArray(saleids)) {
		saleids = [saleids];
	}

	this._requireKey();
	this.post("ISales", "ReturnItems", 1, {"items": saleids.join(',')}, function(err, res, meta) {
		if (err && !res) {
			callback(err);
		} else if (!res.offers) {
			callback(new Error("Malformed response"));
		} else {
			callback(null, res.offers);
		}
	});
};

OPSkinsAPI.prototype.getActiveTradeOffers = function(callback) {
	this._requireKey();
	this.get("ISales", "GetActiveTradeOffers", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.offers);
		}
	});
};

OPSkinsAPI.prototype.search = function(params, callback) {
	this._requireKey();
	this.get("ISales", "Search", 1, params, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.sales);
		}
	});
};

OPSkinsAPI.prototype.buyItems = function(saleids, total, callback) {
	this._requireKey();
	this.post("ISales", "BuyItems", 1, {"saleids": saleids.join(','), "total": total}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.items, meta.balance);
		}
	});
};

OPSkinsAPI.prototype.getLastSales = function(appid, contextid, market_name, callback) {
	this._requireKey();
	this.get("ISales", "GetLastSales", 1, {
		"appid": appid,
		"contextid": contextid,
		"market_name": market_name
	}, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSaleDetails = function(saleid, callback) {
	this._requireKey();
	this.get("ISales", "GetSaleDetails", 1, {"saleid": saleid}, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSaleStatuses = function(callback) {
	this._requireKey();
	this.get("ISales", "GetSaleStatuses", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSearchSchema = function(callback) {
	this._requireKey();
	this.get("ISales", "GetSearchSchema", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSupportedSteamApps = function(callback) {
	this._requireKey();
	this.get("ISales", "GetSupportedSteamApps", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.returnItemsToInventory = function(items, callback) {
	this._requireKey();
	if (!Array.isArray(items)) {
		items = [items];
	}

	this.post("ISales", "ReturnItemsToInventory", 1, {"items": items.join(',')}, function(err, res) {
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
