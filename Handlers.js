
const yelp = require("yelp-fusion");
const GoogleLocations = require("google-locations");
const locations = new GoogleLocations("AIzaSyDxwi3ljXRRCiEanvO4hFNfYYtiu_K00Bw");

const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
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

    const location = this.event.request.intent.slots.Location.value;
    const restaurant_type = this.event.request.intent.slots.Restaurant_Type.value.toLowerCase();

    locations.autocomplete({
    	input: location,
    	types: "(cities)"
    }, (err, response) => {
    	// console.log(response);
    	// console.log("autocomplete: ", response.predictions);
    	console.log("autocomplete err " + err);
    	console.log(response);

    	if (response.status == "OK") {
    		const top_pred = response.predictions[0];
    		const location_description = top_pred["description"];

    		yelp.accessToken(
			    "sHVABhRi8dMSdCM1BqxUNA", 
			    "4WlCGbo1cCwWKM0HiN22OuSgWrDdTxWdGa0Zo5htcigXT78OtqVGSgdsGR2ulPES")
			.then(response => {
			    console.log("Token is " + response.jsonBody.access_token);
			    const token = String(response.jsonBody.access_token);

				console.log("alexa rest type " + restaurant_type);
				console.log("yelp rest type " + category_name_to_alias[restaurant_type]);

				if (!(restaurant_type in category_name_to_alias)) {
					this.emit(":tell", Messages.INVALID_CATEGORY + restaurant_type)
					return;
				}

				const client = yelp.client(token);
				client.search({
					location: location_description,
					categories: [category_name_to_alias[restaurant_type]],
					open_now: true, // subject to change
					limit: 3,
				}).then(response => {
					console.log(response)
					console.log(response.jsonBody.businesses[0].name);
					var business = response.jsonBody.businesses[0];
					var address = business.location.address1 + ", " + business.location.city + ", " + business.location.state;
					this.emit(":tell", Messages.generateMessage(business.name, address));
				}).catch(e => {
					console.log(e);
				});    
			}).catch(e => {
			    console.log(e);
			});
    	}
    	else if (response.status == "ZERO_RESULTS") {
    		this.emit(":tell", Messages.INVALID_LOCATION);
    	}
    	else {
    		this.emit(":tell", Messages.GOOGLE_API_ERROR);
    	}
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