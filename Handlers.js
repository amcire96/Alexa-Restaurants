
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const yelp = require("yelp-fusion");

const Events = require("./Events")
const Intents = require("./Intents")
const Messages = require("./Messages")

const category_name_to_alias = require("./category_name_to_alias");

// Possible change this to read::alexa:device:all:address:country_and_postal_code
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";
const PERMISSIONS = [ALL_ADDRESS_PERMISSION];


// Event/Intent Handlers
const newSessionRequestHandler = function() {
    console.info("Starting newSessionRequestHandler()");

    if(this.event.request.type === Events.LAUNCH_REQUEST) {
        this.emit(Events.LAUNCH_REQUEST);
    } else if (this.event.request.type === "IntentRequest") {
        this.emit(this.event.request.intent.name);
    }

    console.info("Ending newSessionRequestHandler()");
};

const launchRequestHandler = function() {
    console.info("Starting launchRequestHandler()");
    this.emit(":ask", Messages.WELCOME + Messages.WHAT_TYPE, Messages.WHAT_TYPE);
    console.info("Ending launchRequestHandler()");
};

const sessionEndedRequestHandler = function() {
    console.info("Starting sessionEndedRequestHandler()");
    this.emit(":tell", Messages.GOODBYE);
    console.info("Ending sessionEndedRequestHandler()");
};

const unhandledRequestHandler = function() {
    console.info("Starting unhandledRequestHandler()");
    this.emit(":ask", Messages.UNHANDLED, Messages.UNHANDLED);
    console.info("Ending unhandledRequestHandler()");
};

const amazonHelpHandler = function() {
    console.info("Starting amazonHelpHandler()");
    this.emit(":ask", Messages.HELP, Messages.HELP);
    console.info("Ending amazonHelpHandler()");
};

const amazonCancelHandler = function() {
    console.info("Starting amazonCancelHandler()");
    this.emit(":tell", Messages.GOODBYE);
    console.info("Ending amazonCancelHandler()");
};

const amazonStopHandler = function() {
    console.info("Starting amazonStopHandler()");
    this.emit(":ask", Messages.STOP, Messages.STOP);
    console.info("Ending amazonStopHandler()");
};

// Custom Intent Handlers
const getRestaurantHandler = function() {
	console.log("Starting getRestaurantHandler()");
	console.log(this);
	console.log(this.event);
	console.log(this.event.context);
    // const consentToken = this.event.context.System.user.permissions.consentToken;

    // if (!consentToken) {
    //     this.emit(":tellWithPermissionCard", 
    //         Messages.NOTIFY_MISSING_PERMISSIONS, 
    //         PERMISSIONS);
    //     console.log("User did not give permissions to access address");
    //     return;
    // }

    // const deviceId = context.System.device.deviceId;
    // const apiEndpoint = this.event.context.System.apiEndpoint;

    // const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    // let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();


    // deviceAddressRequest.then((addressResponse) => {
    //     switch(addressResponse.statusCode) {
    //         case 200:
    //             console.log("Address successfully retrieved, now responding to user.");
    //             const address = addressResponse.address;

    //             // const ADDRESS_MESSAGE = "Full Address: " +
    //             //     "${address['addressLine1']}, ${address['stateOrRegion']}, ${address['postalCode']}";

    //             const postalCode = address.postalCode;

    //             console.log(postalCode);

    //                 yelp.accessToken(
				//         "sHVABhRi8dMSdCM1BqxUNA", 
				//         "4WlCGbo1cCwWKM0HiN22OuSgWrDdTxWdGa0Zo5htcigXT78OtqVGSgdsGR2ulPES")
				//     .then(response => {
				//         console.log(response.jsonBody);
				//         console.log("Token is " + response.jsonBody.access_token);
				//         const access_token = response.jsonBody.access_token;


				//     }).catch(e => {
				//         console.log(e);
				//     });

    //             // this.emit(":tell", ADDRESS_MESSAGE);
    //             break;
    //         case 204:
    //             // This likely means that the user didn't have their address set via the companion app.
    //             console.log("Successfully requested from the device address API, but no address was returned.");
    //             this.emit(":tell", Messages.NO_ADDRESS);
    //             break;
    //         case 403:
    //             console.log("The consent token we had wasn't authorized to access the user's address.");
    //             this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
    //             break;
    //         default:
    //             this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
    //     }

    //     console.info("Ending getAddressHandler()");
    // });

    // deviceAddressRequest.catch((error) => {
    //     this.emit(":tell", Message.ERROR);
    //     console.error(error);
    //     console.info("Ending getAddressHandler()");
    // });
	yelp.accessToken(
	    "sHVABhRi8dMSdCM1BqxUNA", 
	    "4WlCGbo1cCwWKM0HiN22OuSgWrDdTxWdGa0Zo5htcigXT78OtqVGSgdsGR2ulPES")
	.then(response => {
	    console.log(response.jsonBody);
	    console.log("Token is " + response.jsonBody.access_token);
	    const token = String(response.jsonBody.access_token);

		const postalCode = "01720"; //obviously going to change
		const restaurant_type = this.event.request.intent.slots.Restaurant_Type.value;

		console.log(postalCode);
		console.log(restaurant_type);
		console.log(category_name_to_alias[restaurant_type]);
		const client = yelp.client(token);
		client.search({
			location: String(postalCode),
			categories: [category_name_to_alias[restaurant_type]],
			open_now: true, // subject to change
			limit: 3,
		}).then(response => {
			console.log(response)
			console.log(response.jsonBody.businesses[0].name);
			var business = response.jsonBody.businesses[0];
			this.emit(":tell", Messages.RESULT + business.name);
		}).catch(e => {
			console.log(e);
		});    

	}).catch(e => {
	    console.log(e);
	});

	


}


const handlers = {};
handlers[Events.NEW_SESSION] = newSessionRequestHandler;
handlers[Events.LAUNCH_REQUEST] = launchRequestHandler;
handlers[Events.SESSION_ENDED] = sessionEndedRequestHandler;
handlers[Events.UNHANDLED] = unhandledRequestHandler;

handlers[Intents.GET_RESTAURANT] = getRestaurantHandler;
handlers[Intents.AMAZON_CANCEL] = amazonCancelHandler;
handlers[Intents.AMAZON_STOP] = amazonStopHandler;
handlers[Intents.AMAZON_HELP] = amazonHelpHandler;

module.exports = handlers;