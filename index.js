const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

const app = express();
app.use(bodyParser.json());
const blockchain = new Blockchain();
const pubsub = new PubSub(blockchain);

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.get('/api/blocks', (req, res) => {
	res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
	const { data } = req.body;

	blockchain.addBlock(data);
	pubsub.broadcastChain();

	res.redirect('/api/blocks');
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
