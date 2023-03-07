# ot2-shell-app

## purpose
This application is a basic start application that will handle authorization and authentication using PKCE flow within OT2 Developer Services.
It has just a simple call to get the list of available services.
It includes code for automatically refreshing the token from a refresh token.

## installation
In the application folder run `npm install` then `npm start`

## configuration
In the `.env` file you can set the required strings (tenant id, public client id, url and application url - used to redirect once the authorization is complete).
