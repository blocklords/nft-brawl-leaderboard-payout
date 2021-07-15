/**
 * @description Works with the Leaderboard API
*/
let got = require('got');

let dateUtils = require('./date');
let constant = require('./constant');

let dailyUrl = process.env.SEASCAPE_API + "nftrush/leaderboard/spent/day/";
let allTimeUrl = process.env.SEASCAPE_API + "nftrush/leaderboard/minted/alltime/";

/**
 * Returns Leaderboard winners list URL endpoint.
 * @param {Integer} sessionId for which leaderboard is announced 
 * @param {Date} payDay for which leaderboard data is fetched
 * @returns Ready to call URL
 */
module.exports.dailyUrl = function(sessionId, payDay) {
    return dailyUrl + `${sessionId}/${dateUtils.toString(payDay)}`
}


/**
 * Returns list of winners from API by filling with placeholders for empty slots
 * @param {String} url 
 * @returns {winnersAmount, winners} amount of winners and list of wallet addresses
 */
module.exports.dailyWinners = async function(url) {
    let response;

    try {
		response = await got(url, { json: true });
        if (!Array.isArray(response.body)) {
            throw "Expected array of winner's information";
        }
	} catch (error) {
        if (error.response) {
		    throw error.response.body;
        } else {
            throw error;
        }
	}

	let winnersAmount = response.body.length;
    let winners = [];

    // set winners list from returned result
    for (var i = 0; i < winnersAmount; i++) {
        let row = response.body[i];
        winners.push(row[0]);
    }

    // Set placeholders for remaining winners
    for (var i = winnersAmount; i < constant.WINNERS_AMOUNT; i++) {
        winners.push(process.env.PLACEHOLDER);
    }

    return {winnersAmount: winnersAmount, winners: winners};
}

/**
 * Returns Leaderboard winners list URL endpoint
 * @param {Integer} sessionId for which we fetch all time leaderboard winners list 
 * @returns Ready to call URL
 */
module.exports.allTimeUrl = function(sessionId) {
    return allTimeUrl + sessionId;
}

/**
 * Returns list of winners from API by filling with placeholders for empty slots
 * @param {String} url 
 * @returns {winnersAmount, winners} amount of winners and list of wallet addresses
 */
 module.exports.allTimeWinners = async function(url) {
    let response;

    try {
		response = await got(url, { json: true });
        if (!Array.isArray(response.body)) {
            throw "Expected array of winner's information";
        }
	} catch (error) {
        if (error.response) {
		    throw error.response.body;
        } else {
            throw error;
        }
	}

	let winnersAmount = response.body.length;
    let winners = [];

    // set winners list from returned result
    for (var i = 0; i < winnersAmount; i++) {
        let row = response.body[i];
        winners.push(row[0]);
    }

    // Set placeholders for remaining winners
    for (var i = winnersAmount; i < constant.WINNERS_AMOUNT; i++) {
        winners.push(process.env.PLACEHOLDER);
    }

    return {winnersAmount: winnersAmount, winners: winners};
}