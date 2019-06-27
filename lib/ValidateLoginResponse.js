const validation_fields = ['app_id', 'email_address',
    'ip_address', 'location', 'event_success', 'validation_details',
    'identity_provider_data', 'event_id', 'error'];

const Event = require('./Event');

var _fields = {};

var ValidateLoginResponse = function(response) {
    Object.keys(response).forEach((key) => {
        if (validation_fields.indexOf(key) > -1) {
            _fields[key] = response[key];
        }
    });
};

ValidateLoginResponse.prototype = {
    isCallSuccess() {
        return _fields.error ? false : true;
    },
    isEventSuccess() {
        return _fields.event_success ? _fields.event_success : false;
    },
    get(fields) {
        let target = false;
        let failed = false;
        for(let i = 0; i < arguments.length && !failed; i++) {
            let field = arguments[i];
            if (i == 0) {
                if (typeof _fields[field] != 'undefined') {
                    target = _fields[field];
                } else {
                    failed = true;
                }
            } else {
                if (typeof target[field] != 'undefined') {
                    target = target[field];
                } else {
                    failed = true;
                }
            }

        }
        if (failed) {
            return null;
        } else {
            return target;
        }

    },

    isFail() {
        let field = this.get.apply(this, arguments);
        return (field != null) ? field == Event.Validation.FAIL : null;
    },

    isPass() {
        let field = this.get.apply(this, arguments);
        return (field != null) ? field == Event.Validation.PASS : null;
    },

    isNotApplicable() {
        let field = this.get.apply(this, arguments);
        return (field != null) ? field == Event.Validation.NA : null;
    }
};

module.exports = ValidateLoginResponse;