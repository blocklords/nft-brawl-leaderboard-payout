/**
 * @description DailyPayout.js sets the Prizes for daily leaderboard winners on smartcontract.
 * So that Nft Brawl (https://seascape.zendesk.com/hc/en-us/articles/900006319723-Guide-to-NFT-Brawl)
 * users can claim their rewards in CWS token.
 * 
 * 
 * The algorithm of this script:
 * 
 * 
 * ---------------------------------------------------------------------------------
 * Initiation
 * ---------------------------------------------------------------------------------
 * 1. Connect to Blockchain.
 * 2. Add Privatekey to the web3.js to sign the payout transaction.
 * 3. Set Nft Brawl and Crowns contract interfaces.
 * 
 * ---------------------------------------------------------------------------------
 * validate the payout.
 * ---------------------------------------------------------------------------------
 * 4. Get the latest Session ID from the blockchain.
 * 5. Get the session data from the blockchain
 * 6. Detect whether the session data is payable or not.
 * 6.a if not payable then quit the bot.
 * 
 * 
 * ---------------------------------------------------------------------------------
 * Gather payout information
 * ---------------------------------------------------------------------------------
 * 7. Detect the last day when leaderboard data was paid out, and define a date for next day.
 * 8. Connect to API and fetch the leaderboard data for the day after since last paid out day.
 * 
 * 
 *---------------------------------------------------------------------------------
 * Payout exec.
 * ---------------------------------------------------------------------------------
 * 9. Payout transaction.
 * 
 * @author Medet Ahmetson <admin@blocklords.io>
 * 
 * Following environment variables are required for any *-sync script:
 * @requires PRIVATE_KEY            - environment variable of the privatekey to interact with the blockchain.
 * @requires BLOCKCHAIN_ENDPOINT    - the URL endpoint of the blockchain node. i.e. For ethereum use the https://infura.io
 * @requires NFT_BRAWL_ADDRESS      - the NFT Brawl smartcontract address.
 * @requires CROWNS_ADDRESS        	- the NFT Brawl smartcontract address.
 * @requires SEASCAPE_API           - the public URL endpoint of the Seascape API
 * 
 * Following additional json files are required:
 * @requires nft_brawl.json     	- the ABI of the NFT Brawl smartcontract
 * @requires crowns.json     		- the ABI of the Crowns (CWS) smartcontract
*/
let blockchain = require('./utils/blockchain');	 // to setup connection to a RPC Node
let leaderboard = require('./utils/announcement');
let date = require('./utils/date');
let seascapeApi = require('./utils/seascape_api');
let payment = require('./utils/payment');

/// The account that signs transactions of Leaderboard payouts.
let admin = blockchain.addAccount(process.env.PRIVATE_KEY);

/// Global functions:
///		crowns - Crowns smartcontract interface
///		nftBrawl - Nft Brawl interface
let crowns;
let nftBrawl;

let loadCrowns = async function () {
	crowns = await blockchain.loadCrowns();
};

let loadNftBrawl = async function () {
	nftBrawl = await blockchain.loadNftBrawl();
};


/**
 * We suppose that all GET parameters are valid and always passed.
 * 
 * GET parameters:
 * 	quality 		(integer)
 * 	owner 			(address)
 * 	amountWei		(integer in wei)
 * 	mintedTime		(integer)
 * 
 * @requires loadCrowns to be executed before
 * @requires loadNftBrawl to be executed before
 */
let payout = async function () {
	let sessionId 		= await nftBrawl.methods.lastSessionId().call().catch(error => { throw error; })

	// Season information to get session end time. Payout can't be done after session end
	let session 		= await nftBrawl.methods.sessions(sessionId).call().catch(error => { throw error; })

	// Leaderboard information to get last winner announced day. used to determine next announcement day.
	let announcement 	= await nftBrawl.methods.announcement(sessionId).call().catch(error => { throw error; })

	let {dayAfterSession} = date.sessionDates(session);
	
	let payDay = date.payDay(announcement); 
	if (payDay.getTime() == dayAfterSession.getTime()) {
		throw `All session day leaderboard winners were announced`;
	}

	let currentTime 	= new Date();
	// Current time in blockchain should be greater than pay time
	if (currentTime.getTime() < payDay.getTime()) {
		throw `Since the last payment time it needs to pass 24 hours. Current Time:  ${currentTime.toUTCString()}, need to invoke tx at: ${payDay.toUTCString()}`;
	}

	let payUrl = seascapeApi.dailyUrl(sessionId, payDay);

	let data = await seascapeApi.dailyWinners(payUrl); 
	data.sessionId = sessionId;

	if (currentTime.getTime() > dayAfterSession.getTime()) {
		throw `We can't set the daily leaderboard prizes 24 hours later after season end. 24 hours after season end: ${dayAfterSession.toUTCString()}, Current time: ${currentTime.toUTCString()}`;
	}

	const gasPrice = await blockchain.web3.eth.getGasPrice();

	// Approve CWS
	if (data.winnersAmount) {
		let BN = blockchain.web3.utils.BN;

		let totalPrize = await payment.totalDailyPrize(nftBrawl, data.winnersAmount, BN);
	
		if (payment.isEnoughAllowance(totalPrize, nftBrawl._address, crowns, admin, BN)) {
			await payment.approveCrowns(totalPrize, nftBrawl._address, crowns, gasPrice, admin);
		}
	}

	let txid = await leaderboard.announceDailyWinners(nftBrawl, data, gasPrice, admin);
	return {txid: txid, date: payDay};
};

loadCrowns().then(() => {
	loadNftBrawl().then(() => {
		payout().then(paidOut => {
			console.log(`Daily leaderboard was paid out for ${paidOut.date.toUTCString()}. Txid: ${paidOut.txid}`);

			process.exit(0);
		})
		.catch(error => {
			console.log("ERROR: " + error);
			process.exit(3);
		})
	})
	.catch(error => {
		console.log("ERROR: " + error);
		process.exit(2);
	})
})
.catch(error => {
	console.log("ERROR: " + error);
	process.exit(1);
});


