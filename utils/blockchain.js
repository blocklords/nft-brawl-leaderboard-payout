let Web3 = require('web3');
let fs = require('fs');

if (process.env.BLOCKCHAIN_ENDPOINT == undefined) {
    throw "No BLOCKCHAIN_ENDPOINT environment variable found. Can not connect to blockchain";
    process.exit(1);
}
let web3 = new Web3(process.env.BLOCKCHAIN_ENDPOINT);

let addAccount = function(privateKey) {
    // add account from privatekey to web3 to sign contracts
    if (privateKey == undefined) {
        throw "No private key found. Can not connect to blockchain";
    }

    let nftRushOwner = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(nftRushOwner);
    return nftRushOwner;
};

let loadContract = async function(address, abi) {
    let contract = await new web3.eth.Contract(abi, address)

    return contract;
};

let call = async function(instance, method, address, args) {
    let raw = await instance.methods[method](...args).call();
    return raw;
};


let loadCrowns = async function() {
	// address and abi of the Crowns (CWS) erc-20 token
	var crownsArtifact = JSON.parse(fs.readFileSync('./abi/crowns.json', 'utf8'));
	var crownsAddress = process.env.CROWNS_ADDRESS;
	var crowns = await loadContract(crownsAddress, crownsArtifact);

	return crowns;
};

let loadNftBrawl = async function() {
	// address and abi of second game: nft rush
	var artifact = JSON.parse(fs.readFileSync('./abi/nft_brawl.json', 'utf8'));

	var nftRushAddress = process.env.NFT_BRAWL_ADDRESS;	
	var nftRush = await loadContract(nftRushAddress, artifact);	

	return nftRush;
};

module.exports.addAccount = addAccount;
module.exports.loadContract = loadContract;
module.exports.call = call;
module.exports.loadCrowns = loadCrowns;
module.exports.loadNftBrawl = loadNftBrawl;
module.exports.web3 = web3;