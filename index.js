const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub(blockchain);

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.get('/api/blocks', (req, res) => {
	res.json(blockchain.chain);
});

app.post('/api/block', (req, res) => {
	const { data } = req.body;

	blockchain.addBlock(data);
	pubsub.broadcastChain();

	res.redirect('/api/blocks');
});

app.post('/api/transaction', (req, res) => {
	const { amount, recipient } = req.body;
	let transaction = transactionPool.existingTransaction(wallet.publicKey);

	try {
		if (transaction) {
			transaction.update(wallet, recipient, amount);
		} else {
			transaction = wallet.createTransaction(recipient, amount);
		}
	} catch (error) {
		return res.status(400).json({ type: 'error', message: error.message });
	}

	transactionPool.setTransaction(transaction);
	res.json({ type: 'success', transaction });
});

const syncChains = () => {
	axios
		.get(`${ROOT_NODE_ADDRESS}/api/blocks`)
		.then((response) => {
			if (response.status === 200) {
				const rootChain = response.data;
				console.log('replace chain on a sync with: ', rootChain);
				blockchain.replaceChain(rootChain);
			}
		})
		.catch((error) => {
			console.error(error);
		});
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
	console.log(`listening at localhost:${PORT}`);
	if (PORT !== DEFAULT_PORT) syncChains();
});
