/**
 * @description Works with the Date format accepted by Leaderboard API
 */

/**
 * Returns a zero padded string
 * @param {Integer} number that should be padded by zero.
 */
let toTwoDigit = function(num) {
    let numStr = num.toString();

    return numStr.length == 2 ? numStr : `0${numStr}`;
}

/**
 * 
 * @param {Date} date that needs to be converted to Leaderboard date format (ISO) 
 */
module.exports.toString = function(date) {
    let payDate = toTwoDigit(date.getUTCDate());
	let payMonth = toTwoDigit(date.getUTCMonth() + 1);
	let payYear = date.getUTCFullYear();
	
	return `${payYear}-${payMonth}-${payDate}`;
}

module.exports.dayMs = 86400000;

/**
 * Returns Start time and 24 hours after end time of session in Date object
 * @param {Object} session as in Session struct in Nft Brawl smartcontract 
 */
module.exports.sessionDates = function(session) {
    let startTime 		= new Date(parseInt(session.startTime) * 1000)      // Start time of game season
	let period 			= parseInt(session.period);							// Game season period in seconds.
	let endTime 		= new Date(period*1000 + startTime.getTime()); 		// season end = start time + period
	let dayAfterSession = new Date(endTime.getTime() + this.dayMs);

    return {startTime, endTime, dayAfterSession}
}

/**
 * Returns 24 hours after last announcement day in Date object. For this day we need to announce the winners on blockchain.
 * @param {Object} announcement as in Daily Spent Announcement struct in Nft Brawl smartcontract 
 */
 module.exports.payDay = function(announcement) {
    let dayAfterLastPayDay     = new Date(parseInt(announcement.dailySpentTime) * 1000 + this.dayMs);

    return dayAfterLastPayDay;
}