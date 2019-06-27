const Crypto = require('crypto-js');
const atob = require('atob');
const btoa = require('btoa');


var keySize = 256;
var ivSize = 128;
var saltSize = 256;
var iterations = 1000;

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}

function base64ToHex(str) {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join("");
}

var encrypt = function(pass, message) {
    var salt = Crypto.lib.WordArray.random(saltSize / 8);

    var key = Crypto.PBKDF2(pass, salt, {keySize: keySize / 32, iterations: iterations});
    var iv = Crypto.lib.WordArray.random(ivSize / 8);

    var encrypted = Crypto.AES.encrypt(message, key, {
        iv: iv,
        padding: Crypto.pad.Pkcs7,
        mode: Crypto.mode.CBC
    });

    var encryptedHex = base64ToHex(encrypted.toString());

    var base64result = hexToBase64(salt + iv + encryptedHex);

    return base64result;
};

var decrypt = function(pass, message) {
    var hexResult = base64ToHex(message)

    var salt = Crypto.enc.Hex.parse(hexResult.substr(0, 64));
    var iv = Crypto.enc.Hex.parse(hexResult.substr(64, 32));
    var encrypted = hexToBase64(hexResult.substring(96));

    var key = Crypto.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var decrypted = Crypto.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: Crypto.pad.Pkcs7,
        mode: Crypto.mode.CBC

    })

    return decrypted.toString(Crypto.enc.Utf8);
};


var Password = {

    _pattern : /[a-zA-Z0-9_\-\+\.]/,


    _getRandomByte : function()
    {
        if(Crypto && Crypto.getRandomValues)
        {
            var result = new Uint8Array(1);
            Crypto.getRandomValues(result);
            return result[0];
        }
        else
        {
            return Math.floor(Math.random() * 256);
        }
    },

    _length: function()
    {
        return Math.floor(Math.random() * 32) + 32;
    },

    generate : function(length)
    {
        return Array.apply(null, {'length': length ? length : this._length()})
            .map(function()
            {
                var result;
                while(true)
                {
                    result = String.fromCharCode(this._getRandomByte());
                    if(this._pattern.test(result))
                    {
                        return result;
                    }
                }
            }, this)
            .join('');
    }
};

var keygen = function() {
    return Password.generate();
};

module.exports = {
    encrypt,
    decrypt,
    keygen
};