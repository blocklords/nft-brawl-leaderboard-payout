/**
 * @description Interaction with Blockchain
 */

/**
 * Announce daily leaderboard winners on blockchain
 * 
 * @param {web3.Contract} nftBrawl interface to announce leaderboard winners 
 * @param {Object} data containing parameters of announcement 
 * @param {String} gasPrice in WEI format 
 * @param {web3.Account} account to sign winners 
 * @returns 
 */
module.exports.announceDailyWinners = async function(nftBrawl, data, gasPrice, admin) {
	//sessionId, spentWallets, spentAmount, mintedWallets, mintedAmount)
	var gasEstimate = await nftBrawl.methods.announceDailySpentWinners(data.sessionId, data.winners, data.winnersAmount)
		.estimateGas({ from: admin.address })
		.catch(error => { throw error; });

	let params = {
		from: admin.address,
		gasPrice: gasPrice * 3,
		gas: gasEstimate * 3
	};
	var result = await nftBrawl.methods.announceDailySpentWinners(data.sessionId, data.winners, data.winnersAmount)
		.send(params)
		.catch(error => { throw error; });
	
	return 	result.transactionHash;
};


/**
 * Announce daily leaderboard winners on blockchain
 * 
 * @param {web3.Contract} nftBrawl interface to announce leaderboard winners 
 * @param {Object} data containing parameters of announcement 
 * @param {String} gasPrice in WEI format 
 * @param {web3.Account} account to sign winners 
 * @returns 
 */
module.exports.announceAllTimeWinners = async function(nftBrawl, data, gasPrice, admin) {
	//sessionId, spentWallets, spentAmount, mintedWallets, mintedAmount)
	var gasEstimate = await nftBrawl.methods.announceAllTimeMintedWinners(data.sessionId, data.winners, data.winnersAmount)
		.estimateGas({ from: admin.address })
		.catch(error => { throw error; });

	let params = {
		from: admin.address,
		gasPrice: gasPrice * 3,
		gas: gasEstimate * 3
	};
	var result = await nftBrawl.methods.announceAllTimeMintedWinners(data.sessionId, data.winners, data.winnersAmount)
		.send(params)
		.catch(error => { throw error; });
	
	return 	result.transactionHash;
};

