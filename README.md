# LogonLabs Node.js

The official LogonLabs Node.js Server library.

## Download

Npm
```
npm install logonlabs-nodejs --save
```

## LogonLabs API


- Prior to coding, some configuration is required at https://app.logonlabs.com/app/#/app-settings.

- For the full Developer Documentation please visit: https://app,logonlabs.com/docs/api/

---
### Instantiating a new client

- Your `APP_ID` can be found in [App Settings](https://app.logonlabs.com/app/#/app-settings)
- `APP_SECRETS` are configured [here](https://app.logonlabs.com/app/#/app-secrets)
- The `LOGONLABS_API_ENDPOINT` should be set to `https://api.logonlabs.com`

Create a new instance from `LogonClient`.  

```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');
```

---
### SSO Login QuickStart

The StartLogin function in the JS library begins the LogonLabs managed SSO process.

>Further documentation on starting the login process via our JavaScript client can be found at our GitHub page [here](https://github.com/logonlabs/logonlabs-js)

The following example demonstrates what to do once the `callback_url` has been used by our system to redirect the user back to your page;
with the `token` as the query string parameter.

```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

const callback_url = 'http://your_callback_url/?token=some_validation_token';

let token = client.parseToken(callback_url);

let response = client.validateLogin(token);

let eventId = response.get('event_id'); //can be used to update the SSO event later via updateEvent

//can also call response.isCallSuccess to check if it is a valid response
if(response.isEventSuccess()) {
    //authentication and validation succeeded. proceed with post-auth workflows for your system
    
}

```
---
### Node.js Only Workflow
The following workflow is required if you're using a Node.js that handles both the front and back ends.  If this does not apply to you, please refer to the SSO Login QuickStart section.
#### Step 1 - startLogin
This call begins the LogonLabs managed SSO process.  The `client_data` property is optional and is used to pass any data that is required after validating the request.  The `client_encryption_key` property is optionally passed if the application requires encrypting any data that is passed between the front and back end infrastructure. The `tags`property is an ArrayList of type Tag which is a simple object representing a key/value pair.

```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

//optional parameters
let  client_data = "{\"ClientData\":\"Value\"}";
let client_encryption_key = "qbTRzCvUju";
//

client.startLogin({
    identity_provider: client.IdentityProviders.GOOGLE,
    email_address: 'your_email_address@domain.com',
    client_data: client_data,
    client_encryption_key: client_encryption_key
}).then((response) => {
    console.log(response.url);
});
```
The `response.url` property returned should be redirected to by the application.  Upon submitting their credentials, users will be redirected to the `callback_url` set within the application settings at https://app.logonlabs.com/app/#/app-settings.


#### Step 2 - validateLogin
This method is used to validate the results of the login attempt.  `token` corresponds to the query parameter with the name `token` appended to the callback url specified for your app.

The response contains all details of the login and the user has now completed the SSO workflow.  If there is any additional information to add, updateEvent can be called on the `event_id` returned.

```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

const callback_url = 'http://your_callback_url/?token=some_validation_token';

let token = client.parseToken(callback_url);

let response = client.validateLogin(token);

let eventId = response.get('event_id'); //can be used to update the SSO event later via updateEvent

//can also call response.isCallSuccess to check if it is a valid response
if(response.isEventSuccess()) {
    //authentication and validation succeeded. proceed with post-auth workflows for your system
} else {
    if (response.isFail('validation_details', 'auth_validation')) {
        //authentication with identity provider failed
    }
    if (response.isFail('validation_details', 'email_match_validation')) {
        //email didn't match the one provided to startLogin
    }
    if (response.isFail('validation_details', 'ip_validation') ||
    response.isFail('validation_details', 'geo_validation') ||
    response.isFail('validation_details', 'time_validation')) {
        //validation failed via restriction settings for the app
    }
}
```
---
### Events
The createEvent method allows one to create events that are outside of our SSO workflows.  updateEvent can be used to update any events made either by createEvent or by our SSO login.
```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

const sendEvent = async function() {
    let create_response = await client.createEvent({
        type: client.Event.Type.LOGIN,
        validate: true,
        local_validation: client.Event.Validation.PASS,
        email_address: 'your_email_address@domain.com',
        first_name: 'Firstname',
        last_name: 'Lastname',
        ip_address: '0.0.0.0',
        user_agent: 'Client/UserAgent'
    });
    let event_id = create_response.get('event_id');
    
    let update_response = await client.updateEvent({
        event_id: event_id,
        local_validation: client.Event.Validation.FAIL,
        tags: [
            {
                'key': 'failure-field',
                'value': 'detailed reason for failure'
            }
        ]
    });
};
```

---
### Helper Methods
#### GetProviders
This method is used to retrieve a list of all providers enabled for the application.
If an email address is passed to the method, it will return the list of providers available for that email domain.
```javascript
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

client.getProviders('your_email_address@domain.com').then((response) => {
    for(let i = 0; i < response.identity_providers.length; i++) {
        let provider = response.identity_providers[i];
        if (provider.type == client.IdentityProviders.GOOGLE) {
            //make google available in UI or handle other custom rules
        }
    }
});
```

#### Encrypt/Decrypt
The Java SDK has built in methods for encrypting/decrypting strings using AES encryption.  Use a value for your encryption key that only your client/server will know. 
```java
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');

let base_string = "string to be encrypted";
let encryption_key = "qbTRzCvUju";
//we also has encryption key phrase generator
//let encryption_key = client.keygen();

let encrypted_string = client.encrypt(encryption_key, base_string);

let decrypted_string = client.decrypt(encryption_key, encrypted_string);
```

#### ParseToken
This method parses out the value of the token query parameter returned with your callback url.
```java
const client = require('logonlabs-nodejs')('APP_ID', 'APP_SECRETS', 'LOGONLABS_API_ENDPOINT');
const callback_url = 'http://your_callback_url/?token=some_validation_token';

let token = client.parseToken(callback_url);
console.log(token);

//output
//some_validation_token
```
