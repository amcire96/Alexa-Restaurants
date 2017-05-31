'use strict';

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Yelp API Call
// var Yelp = require("yelp");
var yelp = require("yelp-fusion");
var AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
var Alexa = require("alexa-sdk");
// var http = require("http");
// var request = require("request");

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: "SessionSpeechlet - ${title}",
            content: "SessionSpeechlet - ${output}",
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to Restaurant Picker. ' +
        'You can ask for a local restaurant recommendation for a certain type of food.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'You can ask for a local restaurant recommendation for a certain type of food.';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying Restaurant Picker!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// function createFavoriteColorAttributes(favoriteColor) {
//     return {
//         favoriteColor,
//     };
// }

function getRestaurant(intent, session, callback) {
    const cardTitle = intent.name;
    const restaurantType = intent.slots.Restaurant_Type;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';


}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
// function setColorInSession(intent, session, callback) {
//     const cardTitle = intent.name;
//     const favoriteColorSlot = intent.slots.Color;
//     let repromptText = '';
//     let sessionAttributes = {};
//     const shouldEndSession = false;
//     let speechOutput = '';

//     if (favoriteColorSlot) {
//         const favoriteColor = favoriteColorSlot.value;
//         sessionAttributes = createFavoriteColorAttributes(favoriteColor);
//         speechOutput = "I now know your favorite color is ${favoriteColor}. You can ask me " +
//             "your favorite color by saying, what's my favorite color?";
//         repromptText = "You can ask me your favorite color by saying, what's my favorite color?";
//     } else {
//         speechOutput = "I'm not sure what your favorite color is. Please try again.";
//         repromptText = "I'm not sure what your favorite color is. You can tell me your " +
//             'favorite color by saying, my favorite color is red';
//     }

//     callback(sessionAttributes,
//          buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
// }

// function getColorFromSession(intent, session, callback) {
//     let favoriteColor;
//     const repromptText = null;
//     const sessionAttributes = {};
//     let shouldEndSession = false;
//     let speechOutput = '';

//     if (session.attributes) {
//         favoriteColor = session.attributes.favoriteColor;
//     }

//     if (favoriteColor) {
//         speechOutput = "Your favorite color is ${favoriteColor}. Goodbye.";
//         shouldEndSession = true;
//     } else {
//         speechOutput = "I'm not sure what your favorite color is, you can say, my favorite color " +
//             ' is red';
//     }

//     // Setting repromptText to null signifies that we do not want to reprompt the user.
//     // If the user does not respond or says something that is not understood, the session
//     // will end.
//     callback(sessionAttributes,
//          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
// }


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session, context) {
    console.log("onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}");

    const consentToken = this.event.context.System.user.permissions.consentToken;

    if (!consentToken) {
        this.emit(":tellWithPermissionCard", 
            "Please enable Location permissions in the Amazon Alexa app.", 
            ["read::alexa:device:all:address"]);
        console.log("User did not give permissions to access address");
        return;
    }

    const deviceId = context.System.device.deviceId;
    const apiEndpoint = this.event.context.System.apiEndpoint;

    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

    deviceAddressRequest.then((addressResponse) => {
        switch(addressResponse.statusCode) {
            case 200:
                console.log("Address successfully retrieved, now responding to user.");
                const address = addressResponse.address;

                // const ADDRESS_MESSAGE = "Full Address: " +
                //     "${address['addressLine1']}, ${address['stateOrRegion']}, ${address['postalCode']}";

                session.postalCode = address.postalCode;
                console.log(address.postalCode);

                this.emit(":tell", ADDRESS_MESSAGE);
                break;
            case 204:
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                this.emit(":tell", "Address is not set. Set in the companion app.");
                break;
            case 403:
                console.log("The consent token we had wasn't authorized to access the user's address.");
                this.emit(":tellWithPermissionCard", "Please enable Location permissions in the Amazon Alexa app.", PERMISSIONS);
                break;
            default:
                this.emit(":ask", 
                    "There was an error with the Device Address API. Please try again.", 
                    "There was an error with the Device Address API. Please try again.");
        }

        console.info("Ending getAddressHandler()");
    });

    deviceAddressRequest.catch((error) => {
        this.emit(":tell", "Something went wrong.");
        console.error(error);
        console.info("Ending getAddressHandler()");
    });

    yelp.accessToken(
        "sHVABhRi8dMSdCM1BqxUNA", 
        "4WlCGbo1cCwWKM0HiN22OuSgWrDdTxWdGa0Zo5htcigXT78OtqVGSgdsGR2ulPES")
    .then(response => {
        console.log(response.jsonBody);
        console.log("Token is " + response.jsonBody.access_token);
        session.access_token = response.jsonBody.access_token;
    }).catch(e => {
        console.log(e);
    });

}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}");

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}");

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'RestaurantIntent') {
        getRestaurant(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}");
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log("event.session.application.applicationId=${event.session.application.applicationId}");

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session, event.context);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
