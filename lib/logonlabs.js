const ValidateLoginResponse = require('./ValidateLoginResponse');
const _util = require('./util');
const _request = require('./request');
const _url = require('url');
const _querystring = require('querystring');

var LogonClient = function(app_id, app_secret, api_path) {
    if (!(this instanceof LogonClient)) {
        return new LogonClient(app_id, app_secret, api_path);
    }


    this._api = {
        app_id: null,
        app_secret: null,
        api_path: LogonClient.DEFAULT_API_PATH
    };

    this.IdentityProviders = require('./IdentityProviders');
    this.Event = require('./Event');


    this.setAppId(app_id);
    this.setAppSecret(app_secret);
    this.setApiPath(api_path);

};

LogonClient.DEFAULT_API_PATH = 'https://api.logonlabs.com/';

LogonClient.prototype = {
    _setApiField(key, value) {
        this._api[key] = value;
    },
    setAppId(value) {
        this._setApiField('app_id', value);
        _request.setAppId(value);
    },
    setAppSecret(value) {
        this._setApiField('app_secret', value);
        _request.setAppSecret(value);
    },
    setApiPath(value) {
        this._setApiField('api_path', value);
        _request.setApiPath(value);
    },
    ping() {
        return _request.ping.apply(this, arguments);
    },
    async startLogin() {
        let r = await _request.startLogin.apply(this, arguments);
        let r2 = await _request.redirectLogin.call(this, r.token);
        return r2;
    },
    async validateLogin() {
        let r = await _request.validateLogin.apply(this, arguments);
        return new ValidateLoginResponse(r);
    },
    createEvent() {
        return _request.createEvent.apply(this, arguments);
    },
    updateEvent() {
        return _request.updateEvent.apply(this, arguments);
    },
    getProviders() {
        return _request.getProviders.apply(this, arguments);
    },
    validateResponse(response) {
        return new ValidateLoginResponse(response);
    },
    encrypt(pass, message) {
        return _util.encrypt(pass, message);
    },
    decrypt(pass, message) {
        return _util.decrypt(pass, message);
    },
    keygen() {
        return _util.keygen();
    },
    parseToken(url) {
        let url_parts = _url.parse(url);
        let token = false;
        if (url_parts.query) {
            let qs = _querystring.parse(url_parts.query);
            if (qs.token) {
                token = qs.token;
            }
        }
        return token;
    }

};


module.exports = LogonClient;
module.exports.LogonClient = LogonClient;