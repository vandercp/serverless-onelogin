document.getElementById('login').addEventListener("click", redirectToLogin, false);

Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.INFO;

//
// OIDC Client Configuration
//
const ONELOGIN_SUBDOMAIN = 'test-persgroep';
const ONELOGIN_CLIENT_ID = '38b6ed20-5a75-0136-259c-0252db71d91637480';
const PROVIDER = 'openid-connect-eu.onelogin.com/oidc';
// const PROVIDER = 'test-persgroep.onelogin.com/oidc';
// const PROVIDER = 'eu-west-1:4706305a-8ab0-483b-a134-19378f627547';
// const PROVIDER = 'test-persgroep.onelogin.com';
// const PROVIDER = 'test-persgroep.onelogin.com/oidc/';
// const PROVIDER = 'openid-connect-eu.onelogin.com';
// const PROVIDER = 'test-persgroep.onelogin.com/oidc/token';
// const PROVIDER = 'test-persgroep.onelogin.com/oidc/me';

var settings = {
    authority: 'https://' + ONELOGIN_SUBDOMAIN + '.onelogin.com/oidc',
    client_id: ONELOGIN_CLIENT_ID,
    // redirect_uri: window.location.origin,
    redirect_uri: 'https://learnjs.eagle.persgroep.cloud/index.html',
    response_type: 'id_token token',
    scope: 'openid profile email',

    filterProtocolClaims: true,
    loadUserInfo: true
};
var mgr = new Oidc.UserManager(settings);

//
// Redirect to OneLogin to authenticate the user
//
function redirectToLogin(e) {
    e.preventDefault();
    redirectToOneLogin()
}

function redirectToOneLogin() {
    mgr.signinRedirect({state:'some data'}).then(function() {
        console.log("signinRedirect done");
    }).catch(function(err) {
        console.log(err);
    });
}

function signIn(provider, id_token, email) {
    var logins = {};
    logins[provider]= id_token;
    AWS.config.update({
        region: 'eu-west-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: learnjs.poolId,
            Logins: logins
        })
    });
    learnjs.awsRefresh().then(function (id) {
        learnjs.identity.resolve({
            id: id,
            email: email,
            refresh: learnjs.refresh
        });
    });
}

//
// Handle the authentication response returned
// by OneLogin after the user has attempted to authenticate
//
function processLoginResponse() {
  mgr.signinRedirectCallback().then(function(user) {
      console.log("signed in", user);
      signIn(PROVIDER, user.id_token, user.profile.preferred_username);
      document.getElementById("loginResult").innerHTML = '<h3>Success</h3><pre>' +
          // '<code>' + JSON.stringify(user, null, 2) + '</code>' +
          '</pre>'

  }).catch(function(err) {
      console.log(err);
  });
}

//
// Look out for a authentication response
// then log it and handle it
//
if (window.location.href.indexOf("#") >= 0) {
  processLoginResponse();
}
