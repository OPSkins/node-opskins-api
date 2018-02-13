var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getFailedPurchases = function(params, callback) {
	this._requireKey();
	this.get("ITransactions", "GetFailedPurchases", 1, params, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getMonetaryTransactionHistory = function(callback) {
	this._requireKey();
	this.get("ITransactions", "GetMonetaryTransactionHistory", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getOperationPointsTransactionHistory = function(params, callback) {
	this._requireKey();
	this.get("ITransactions", "GetOperationPointsTransactionHistory", 1, params, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getPurchaseHistory = function(params, callback) {
	this._requireKey();
	this.get("ITransactions", "GetPurchaseHistory", 1, params, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getTransactionTypes = function(callback) {
	this._requireKey();
	this.get("ITransactions", "GetTransactionTypes", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getWalletTransactionHistory = function(params, callback) {
	this._requireKey();
	this.get("ITransactions", "GetWalletTransactionHistory", 1, params, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};
