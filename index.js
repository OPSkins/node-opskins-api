var Https = require('https');
var QueryString = require('querystring');
var Zlib = require('zlib');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var ErrorCode = require('./resources/ErrorCode.json');

module.exports = OPSkinsAPI;
OPSkinsAPI.ErrorCode = ErrorCode;
OPSkinsAPI.SaleStatus = require('./resources/SaleStatus.json');
OPSkinsAPI.CashoutProcessor = require('./resources/CashoutProcessor.json');

util.inherits(OPSkinsAPI, EventEmitter);
function OPSkinsAPI(key) {
	this.key = key;
}

OPSkinsAPI.prototype.get = function(iface, method, version, input, callback) {
	this._req("GET", iface, method, version, input, callback);
};

OPSkinsAPI.prototype.post = function(iface, method, version, input, callback) {
	this._req("POST", iface, method, version, input, callback);
};

OPSkinsAPI.prototype.getAgent = function() {
	if (this._agent) {
		return this._agent;
	} else {
		this._agent = new Https.Agent({"keepAlive": true});
		return this._agent;
	}
};

OPSkinsAPI.prototype._req = function(httpMethod, iface, method, version, input, callback) {
	if (typeof input === 'function') {
		callback = input;
		input = null;
	}

	input = input || {};
	var rawInput = input;
	var errored = false;

	// preprocess arrays
	for (var i in input) {
		if (!input.hasOwnProperty(i)) {
			continue;
		}

		if (input[i] instanceof Array) {
			input[i].forEach(function(value, index) {
				input[i + '[' + index + ']'] = value;
			});

			delete input[i];
		}
	}

	var headers = {"Accept-Encoding": "gzip", "User-Agent": userAgent()};
	if (this.key && !(iface == 'IPricing' && ['GetPriceList', 'GetAllLowestListPrices'].indexOf(method) != -1)) {
		headers.Authorization = "Basic " + (new Buffer(this.key + ":", 'ascii')).toString('base64');
	}

	input = QueryString.stringify(input);

	if (!iface.match(/^I[A-Z]/)) {
		// prepend I if missing
		iface = 'I' + iface;
	}

	var path = "/" + iface + "/" + method + "/v" + version + "/";
	if (httpMethod == "GET" && input) {
		path += "?" + input;
	}

	if (httpMethod == "POST" && input) {
		headers['Content-Type'] = 'application/x-www-form-urlencoded';
		headers['Content-Length'] = input.length;
	}

	if (this._cfduid) {
		headers['Cookie'] = '__cfduid=' + this._cfduid;
	}

	const base = "api.opskins.com";
	this.emit('debug', httpMethod + ' request to https://' + base + path + ' with input: ' + JSON.stringify(rawInput));
	var self = this;

	var req = Https.request({
		"host": base,
		"method": httpMethod,
		"path": path,
		"headers": headers,
		"agent": this.getAgent()
	}, function(res) {
		if (errored) {
			return;
		}

		var err = new Error();
		err.httpCode = res.statusCode;

		self.emit('debug', "https://" + base + path + " headers: " + JSON.stringify(res.headers));

		// Extract __cfduid cookie if it's there
		(res.headers['set-cookie'] || []).forEach(function(cookie) {
			cookie = cookie.split(';')[0].trim().split('=').map(function(part) { return part.trim(); })
			if (cookie[0] == '__cfduid') {
				self._cfduid = cookie[1];
			}
		});

		if (res.headers['x-queries-remaining']) {
			self.emit('queryLimit', parseInt(res.headers['x-queries-remaining'], 10));
		}

		if (res.statusCode > 299) {
			err.message = (res.statusCode == 401 ? "Invalid or missing API key" : (res.statusMessage || "HTTP error " + res.statusCode));

			if (res.headers['cf-ray']) {
				err.ray = res.headers['cf-ray'];
			}

			// Discard the stream
			res.on('data', devNull);

			callback(err);
			return;
		}

		res.on('error', function(err) {
			if (errored) {
				return;
			}

			errored = true;
			callback(err);
		});

		var response = '';
		var stream = res;

		if (res.headers['content-encoding'] && res.headers['content-encoding'].toLowerCase() == 'gzip') {
			// this needs to be decompressed
			stream = Zlib.createGunzip();
			res.pipe(stream);
		}

		stream.on('data', function(chunk) {
			response += chunk;
		});

		stream.on('end', function() {
			if (errored) {
				return;
			}

			errored = true; // just in case

			try {
				response = JSON.parse(response);
			} catch (e) {
				err.message = "Malformed response";
				callback(err);
				return;
			}

			if (response.status != ErrorCode.OK) {
				err.code = response.status;

				if (response.message) {
					err.message = response.message;
				} else {
					// see if we can get the message from the code
					for (var i in ErrorCode) {
						if (ErrorCode.hasOwnProperty(i) && ErrorCode[i] == response.status) {
							err.message = i;
							break;
						}
					}

					if (!err.message) {
						err.message = "Error " + response.status;
					}
				}

				if (response.response) {
					err.data = response.response;
				}

				callback(err);
				return;
			}

			// Successful query
			var res = response.response;
			var metadata = response;
			delete metadata.response;

			if (metadata.time) {
				metadata.time = new Date(metadata.time * 1000);
			}

			callback(null, res, metadata);
		});
	});

	// send the actual request
	req.end(httpMethod == "POST" ? input : null);

	req.on('error', function(err) {
		if (errored) {
			return;
		}

		errored = true;
		callback(err);
	});
};

OPSkinsAPI.prototype._requireKey = function() {
	if (!this.key) {
		throw new Error("API key required for this method");
	}
};

function userAgent() {
	return "node/" + process.versions.node + " node-opskins/" + require('./package.json').version;
}

function devNull() { }

require('./interfaces/ICashout.js');
require('./interfaces/IInventory.js');
require('./interfaces/IPricing.js');
require('./interfaces/ISales.js');
require('./interfaces/ISupport.js');
require('./interfaces/ITest.js');
require('./interfaces/IUser.js');
require('./interfaces/IStatus.js');
