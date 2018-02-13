var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.convertCurrencies = function(from, to, amount, callback) {
	this._requireKey();
	this.post("ICrypto", "ConvertCurrencies", 1, {
		"convert_from": from,
		"convert_to": to,
		"convert_amount": amount
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

OPSkinsAPI.prototype.getCurrencyAddress = function(currency, callback) {
	this._requireKey();
	this.get("ICrypto", "GetAddress", 1, {"currency_id": currency}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.currency_id, res.currency_code, res.address);
	});
};

OPSkinsAPI.prototype.getCryptoConvertedAmount = function(from, amount, callback) {
	this._requireKey();
	this.get("ICrypto", "GetCryptoConvertedAmount", 1, {
		"convert_from": from,
		"convert_amount": amount
	}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.rates);
	});
};

OPSkinsAPI.prototype.getCryptoCurrencies = function(callback) {
	this._requireKey();
	this.get("ICrypto", "GetCurrencies", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.currencies);
	});
};

OPSkinsAPI.prototype.getCryptoWithdrawList = function(page, callback) {
	this._requireKey();
	if (typeof page === 'function') {
		callback = page;
		page = 1;
	}
	this.get("ICrypto", "GetWithdrawList", 1, {
		"page": page,
	}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.count, res.items, res.statuses);
	});
};

OPSkinsAPI.prototype.setCryptoCashoutAddress = function(currency, address, callback) {
	this._requireKey();
	this.post("ICrypto", "SetAddress", 1, {
		"currency_id": currency,
		"address": address
	}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res.currency_id, res.currency_code, res.address);
	});
};

OPSkinsAPI.prototype.cryptoWithdraw = function(currency, amount, callback) {
	this._requireKey();
	this.post("ICrypto", "Withdraw", 1, {
		"currency_id": currency,
		"amount": amount
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
