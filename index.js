const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub(blockchain, transactionPool);
const transactionMiner = new TransactionMiner(blockchain, transactionPool, wallet, pubsub);

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
	pubsub.broadcastTransaction(transaction);
	res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
	res.json(transactionPool.transactionMap);
});

// making POST to represent transactions will be created from this endpoint
app.post('/api/transactions', (req, res) => {
	transactionMiner.mineTransactions();

	res.redirect('/api/blocks');
});

const syncWithRootState = () => {
	// sync with root blockchain
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

	// sync with root transaction pool map
	axios
		.get(`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`)
		.then((response) => {
			if (response.status === 200) {
				const rootTransactionPoolMap = response.data;
				console.log('replace transaction pool map on a sync with: ', rootTransactionPoolMap);
				transactionPool.setMap(rootTransactionPoolMap);
			}
		})
		.catch((error) => {
			console.log(error);
		});
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
	console.log(`listening at localhost:${PORT}`);
	if (PORT !== DEFAULT_PORT) syncWithRootState();
});
