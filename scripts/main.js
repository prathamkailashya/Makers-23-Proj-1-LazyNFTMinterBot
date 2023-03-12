const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const nftMinter = require('../contracts/NFTMinter.json');

const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_URL);
const web3 = new Web3(provider);

const bot = new Discord.Client(
    {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
}
);

const PREFIX = `!`;

const contractAddress = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'; //contract address of the deployed solidity contract
const contractAbi = nftMinter.abi;

bot.on('ready', () => {
    console.log('Bot is online!');
});
// bot.on('ready', () => {
//     bot.channels.fetch('channel token')
//     .then(channel => {
//         channel.send("Hello here!");
//     })
// });

bot.on('message', async (message) => {
    // console.log('Message received:', message.content);
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    // // console.log(`${command}`);
    // if (command === 'hi') {
    //     console.log("this dv");
    // }
    if (command === 'mintnft') {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            // console.log(attachment);
            if (attachment.url.endsWith('.jpg') || attachment.url.endsWith('.png') || attachment.url.endsWith('.jpeg') || attachment.url.endsWith('.gif')) {
                const nftName = args[0];
                const nftDescription = args[1];
                const nftSymbol = args[2];
                const nftTokenURI = attachment.url;
                const recipientAddress = message.author.id;

                const nftContract = new web3.eth.Contract(contractAbi, contractAddress);

                const gas = await nftContract.methods.createNFT(recipientAddress, nftTokenURI).estimateGas({ from: recipientAddress });
                const gasPrice = await web3.eth.getGasPrice();
                const data = await nftContract.methods.createNFT(recipientAddress, nftTokenURI).encodeABI();

                const signedTx = await web3.eth.accounts.signTransaction({
                    from: recipientAddress,
                    to: contractAddress,
                    gas: gas,
                    gasPrice: gasPrice,
                    data: data
                }, process.env.PRIVATE_KEY);

                web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                    .on('receipt', receipt => {
                        console.log(receipt);
                        message.reply(`NFT minted at https://opensea.io/assets/${contractAddress}/${receipt.events.Transfer.returnValues.tokenId}`);
                    })
                    .on('error', error => {
                        console.error(error);
                        message.reply('There was an error minting your NFT. Please try again!');
                    });
            } else {
                message.reply('Only images of .jpg, .jpeg, .gif, .png format are supported for NFT minting!');
            }
        } else {
            message.reply('You need to attach an image to mint as an NFT!');
        }
    }
});
bot.login(process.env.DISCORD_TOKEN);


