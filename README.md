# HackathonPoker

Live link: https://pokerhackathon.herokuapp.com/#/

To run this locally:

1. Clone
2. Create Auth0 account
3. Create MongoDB account
4. Create .env file in root folder:
4a. CONNECTION_STRING=addYourDataHere
4b. AUTH_DOMAIN=addYourDataHere
4c. AUTH_AUDIENCE=addYourDataHere
4d. AUTH_CLIENT_ID=addYourDataHere

You will need to configure your Auth0 account to whitelist local addresses

5. Create authConfig.js file in /clientsrc:
5a. export const domain: "addYourDataHere"
5b. export const audience: "addYourDataHere"
5c. export const clientid: "addYourDataHere"

npm i in both root and clientsrc folder
npm audit fix in both root and clientsrc folder

npm run start in clientsrc folder

run debugger node.js to start server
