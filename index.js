var Https = require('https');
var QueryString = require('querystring');
var Zlib = require('zlib');

var ErrorCode = require('./resources/ErrorCode.json');

module.exports = OPSkinsAPI;
OPSkinsAPI.ErrorCode = ErrorCode;
OPSkinsAPI.SaleStatus = require('./resources/SaleStatus.json');

function OPSkinsAPI(key) {
	this.key = key;
}

OPSkinsAPI.prototype.get = function(iface, method, version, input, callback) {
	this._req("GET", iface, method, version, input, callback);
};

OPSkinsAPI.prototype.post = function(iface, method, version, input, callback) {
	this._req("POST", iface, method, version, input, callback);
};

OPSkinsAPI.prototype._req = function(httpMethod, iface, method, version, input, callback) {
	if (typeof input === 'function') {
		callback = input;
		input = null;
	}

	input = input || {};

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
	if (this.key) {
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

	var req = Https.request({
		"host": "api.opskins.com",
		"method": httpMethod,
		"path": path,
		"headers": headers
	}, function(res) {
		var err = new Error();
		err.httpCode = res.statusCode;

		if (res.statusCode != 200) {
			err.message = (res.statusCode == 401 ? "Invalid or missing API key" : (res.statusMessage || "HTTP error " + res.statusCode));
			callback(err);
			return;
		}

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
};

OPSkinsAPI.prototype._requireKey = function() {
	if (!this.key) {
		throw new Error("API key required for this method");
	}
};

function userAgent() {
	return "node/" + process.versions.node + " node-opskins/" + require('./package.json').version;
}

require('./interfaces/IInventory.js');
require('./interfaces/IPricing.js');
require('./interfaces/ISales.js');
require('./interfaces/ISupport.js');
require('./interfaces/ITest.js');
require('./interfaces/IUser.js');
