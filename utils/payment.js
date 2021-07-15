/**
 * @description Determines the reward pool and makes approvement in Crowns to transfer that amount to the Nft Brawl
 */

/**
 * @description Get prizes from the Blockchain
 * @param {web3.eth.Contract} leaderboardContract interface to interact with Smartcontract data
 * @param {integer} winnersAmount up to this amount of slots the script needs to fetch prizes
 * @param {BN.js} library to work with big numbers in Javascript
 * @returns amount in string data type and in WEI format
 */
module.exports.totalDailyPrize = async function(nftBrawl, winnersAmount, BN) {
	let totalPrize      = new BN(0);

	for (i = 0; i<winnersAmount; i++) {
		let prize 		= await nftBrawl.methods
			.spentDailyPrizes(i)
			.call()
			.catch(error => { 
				throw error; 
			});
		
		totalPrize = totalPrize.add(new BN(prize));
	}

    return totalPrize.toString();    
}

/**
 * 
 * @param {String} totalPrize in WEI 
 * @param {String} nftBrawlAddress for which allowance should be
 * @param {web3.Contract} crowns interface to interact with blockchain
 * @param {web3.Account} admin from which allowance should be
 * @param {web3.utils.BN} BN to work with large numbers
 * @returns boolean
 */
module.exports.isEnoughAllowance = async function(totalPrize, nftBrawlAddress, crowns, admin, BN) {
    let allowance = await crowns.methods.allowance(admin.address, nftBrawlAddress).call();

    let a = new BN(allowance);
    let prize = new BN(totalPrize);

    return a.gte(prize);
}

/**
 * Approve crowns to Leaderboard to pay rewards
 * @param {String} totalPrize in WEI format 
 * @param {String} nftBrawlAddress 
 * @param {web3.Cntract} crowns to interact with 
 * @param {String} gas prize in WEI
 * @param {web3.Account} admin
 */
module.exports.approveCrowns = async function (totalPrize, nftBrawlAddress, crowns, gasPrice, admin) {
	var approveGasEstimate = null;

	try {
		approveGasEstimate = await crowns.methods.approve(nftBrawlAddress, totalPrize).estimateGas({ from: admin.address });
	} catch (error) {
		console.error(e);
		throw "Unable to estimate crowns approvement gas cost!";
	}

	let params = {
		from: admin.address,
		gasPrice: gasPrice * 3,
		gas: approveGasEstimate * 3
	};


	try {
		await crowns.methods.approve(nftBrawlAddress, totalPrize)
		.send(params);
	} catch (error) {
		console.error(error)
        throw "Crowns approvement transaction reverted.";
	}
};

