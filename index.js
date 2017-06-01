"use strict";

const Handlers = require("./Handlers")
const Alexa = require("alexa-sdk");

const APP_ID = "amzn1.ask.skill.1af24ffa-7039-47fb-b9ab-2a273d8e2b2d";

exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);

    alexa.appId = APP_ID;
    alexa.registerHandlers(Handlers);

    console.log(`Beginning execution for skill with APP_ID=${alexa.appId}`);
    alexa.execute();
    console.log(`Ending execution  for skill with APP_ID=${alexa.appId}`);
}