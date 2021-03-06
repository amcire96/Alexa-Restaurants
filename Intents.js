'use strict';

/**
 * This file contains constant definitions of intents that we're
 * interested in for our skill.
 *
 * Refer to the following link for a list of built-in intents,
 * and what those intents do.
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents
 */

/**
 * This is a custom intent for our skill. It will indicate
 * When received, we should get the restaurant to recommend
 */
const GET_RESTAURANT = "RestaurantIntent";

/**
 * This is an Amazon built-in intent.
 */
const AMAZON_HELP = "AMAZON.HelpIntent";

/**
 * This is an Amazon built-in intent.
 */
const AMAZON_CANCEL = "AMAZON.CancelIntent";

/**
 * This is an Amazon built-in intent.
 */
const AMAZON_STOP = "AMAZON.StopIntent";

module.exports = {
    "GET_RESTAURANT": GET_RESTAURANT,
    "AMAZON_HELP": AMAZON_HELP,
    "AMAZON_CANCEL": AMAZON_CANCEL,
    "AMAZON_STOP": AMAZON_STOP
};