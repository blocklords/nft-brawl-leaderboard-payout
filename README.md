# Nft Brawl leaderboard payout
A simple node.js script that updates https://seascape.network/ winners list on blockchain.

## Install
1. Create .env file with following Keys and valid values:
    * PRIVATE_KEY - a privatekey of the leaderboard announcer (Must be private key of Nft Brawl contract deployer).
    * BLOCKCHAIN_ENDPOINT - a Blockchain node endpoint. I.e. Free or paid ethereum node endpoint is available at https://infura.io/
    * NFT_BRAWL_ADDRESS - Nft Brawl address
    * CROWNS_ADDRESS - Crowns token address
    * SEASCAPE_API - Public Api endpoint
    * PLACEHOLDER - Any wallet address that is used as a placeholder for empty leaderboard slots

2. Install NPM packages by running following in the terminal

`npm install`

## Usage

To run the announcement for Daily Leaderboard run the following script:

`node daily_payout.js`


Tu run the announcement for All Time Leaderboard run the following script:

`node alltime_payout.js`