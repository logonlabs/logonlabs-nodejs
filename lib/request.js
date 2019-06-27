const axios = require('axios');

var app_id = false;
var api_path = false;
var app_secret = false;

const generateRequests = function(url, method, data) {
    var headers = {
        'Accept': 'application/json'
    };
    if (app_secret) {
        headers['x-app-secret'] = app_secret;
    }
    var request = {
        url: api_path + url,
        headers: headers,
        method: method,
        maxRedirects: 0
    }
    if (data) {
        request['data'] = data;
    }
    return request;
};

const promisePost = function(url, data) {
    return new Promise(function(resolve, reject) {
        post(url, data).then(function(response) {
            resolve(response);
        }).catch(function(error) {
            resolve(error.response.data);
        })
    });
};

const promisePut = function(url, data) {
    return new Promise(function(resolve, reject) {
        post(url, data).then(function(response) {
            resolve(response);
        }).catch(function(error) {
            resolve(error.response.data);
        })
    });
};

const promiseGet = function(url, data) {
    return new Promise(function(resolve, reject) {
        get(url, data).then(function(response) {
            resolve(response);
        }).catch(function(error) {
            resolve(error.response.data);
        })
    });
};

const get = async function(url, data) {
    let res = await axios(generateRequests(url, 'get', data));
    let res_data = res.data;
    return res_data;
};

const post = async function(url, data) {
    let res = await axios(generateRequests(url, 'post', data));
    let res_data = res.data;
    return res_data;
};

const put = async function(url, data) {
    let res = await axios(generateRequests(url, 'put', data));
    let res_data = res.data;
    return res_data;
};

const redirect = function(url, data) {
    return new Promise(function(resolve, reject) {
        get(url, data).then(function(response) {
            console.log('no possible');
            reject(response);
        }).catch(function(error) {
            if (error.response.status == '302') {
                resolve({
                    url: error.response.headers.location
                });
            } else {
                reject(error);
            }
        })
    });
};

module.exports.setAppId = function(value) {
    if (value) {
        app_id = value;
    }
};

module.exports.setApiPath = function(value) {
    if (value) {
        api_path = value;
        if (api_path[api_path.length - 1] != '/') {
            api_path += '/';
        }
    }
};

module.exports.setAppSecret = function(value) {
    if (value) {
        app_secret = value;
    }
};

module.exports.ping = function() {
    var url = 'ping';
    var data = {
        app_id: app_id
    };
    return promiseGet(url, data);
};

module.exports.getProviders = function(email) {
    var url = 'providers';
    var data = {
        app_id: app_id
    };
    if (email) {
        data['email_address'] = email;
    }

    return promiseGet(url, data);
};

module.exports.startLogin = function(data) {
    var url = 'start';
    data['app_id'] = app_id;

    return promisePost(url, data);
};

module.exports.redirectLogin = function(token) {
    var url = 'redirect';
    var data = {
        token: token
    };
    return redirect(url, data);
};

module.exports.validateLogin = function(token) {
    var url = 'validate';
    var data = {
        app_id: app_id,
        token: token
    };
    return promisePost(url, data);
};

module.exports.createEvent = function(data) {
    var url = 'event';
    if (app_id) {
        data['app_id'] = app_id;
    }
    return promisePost(url, data);
};

module.exports.updateEvent = function(data) {
    var url = 'event';
    if (data['event_id']) {
        url += '/' + data['event_id'];
        delete data['event_id'];
    }
    if (app_id) {
        data['app_id'] = app_id;
    }
    return promisePut(url, data);
};

