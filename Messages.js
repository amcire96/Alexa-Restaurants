'use strict';

/**
 * This file contains a map of messages used by the skill.
 */

const WELCOME = "Welcome to Restaurant Picker!";

const WHAT_TYPE = "What type of food do you want?";

// const WHAT_LOCATION = "Where do you want to look for a restaurant?"

const NOTIFY_MISSING_PERMISSIONS = "Please enable Location permissions in the Amazon Alexa app.";

const NO_ADDRESS = "It looks like you don't have an address set. You can set your address from the companion app.";

const ERROR = "Uh Oh. Looks like something went wrong.";

const LOCATION_FAILURE = "There was an error with the Device Address API. Please try again.";

const GOODBYE = "Bye! Thanks for using Restaurant Picker!";

const UNHANDLED = "This skill doesn't support that. Please ask something else.";

const HELP = "You can use this skill by asking something like: where can I get Chinese food?";

const STOP = "There is nothing to stop. Did you mean to ask something else?";

// const RESULT = "The top restaurant returned is ";
const generateMessage = function(name, address) {
    return "The top restaurant returned is " + name + " at " + address;
}

const INVALID_LOCATION = "The location requested is invalid.";

const INVALID_CATEGORY = "There is no Yelp category called ";

const GOOGLE_API_ERROR = "Something went wrong with Google Places API.";

module.exports = {
    "WELCOME": WELCOME,
    "WHAT_TYPE": WHAT_TYPE,
    // "WHAT_LOCATION": WHAT_LOCATION,
    "NOTIFY_MISSING_PERMISSIONS": NOTIFY_MISSING_PERMISSIONS,
    "NO_ADDRESS": NO_ADDRESS,
    "ERROR": ERROR,
    "LOCATION_FAILURE": LOCATION_FAILURE,
    "GOODBYE": GOODBYE,
    "UNHANDLED": UNHANDLED,
    "HELP": HELP,
    "STOP": STOP,
    // "RESULT": RESULT,
    "generateMessage": generateMessage,
    "INVALID_LOCATION": INVALID_LOCATION,
    "GOOGLE_API_ERROR": GOOGLE_API_ERROR,
    "INVALID_CATEGORY": INVALID_CATEGORY,
};