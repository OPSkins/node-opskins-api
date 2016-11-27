var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getSales = function(req, callback) {
	if (typeof req === 'function') {
		callback = req;
		req = {};
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
	if (!(items instanceof Array)) {
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
