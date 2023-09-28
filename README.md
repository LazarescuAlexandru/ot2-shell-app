# ot2-shell-app

## purpose
This application is a basic start application that will handle authorization and authentication using PKCE flow within OT2 Developer Services.
It has just a simple call to get the list of available services.
It includes code for automatically refreshing the token from a refresh token.

## installation
In the application folder run `npm install` 
    1. modify node_modules/react-oauth2-code-pkce/dist/authentication.js, line 99, to: if (receivedState && loadedState && (receivedState !== loadedState)) {
    2. modify node_modules/react-oauth2-code-pkce/dist/timeUtils.js, line 6, to: const epochAtSecondsFromNow = (secondsFromNow) => Math.round(Date.now() / 1000 + Number(secondsFromNow));
    
To start the application you will need to run `npm start`

## configuration
In the `.env` file you can set the required strings (tenant id, public client id, url and application url - used to redirect once the authorization is complete).
In the OpenText Admin Console, go to Organization -> Apps -> Your application, select Service Clients, go to the Public client, use the CLient id in the .env file and edit the Redirect URL's for the Public Client to include your application URL
