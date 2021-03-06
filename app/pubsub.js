const redis = require('redis');

const CHANNELS = Object.freeze({
	TEST: 'TEST',
	BLOCKCHAIN: 'BLOCKCHAIN',
	TRANSACTION: 'TRANSACTION',
});

class PubSub {
	constructor(blockchain, transactionPool) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;

		this.publisher = redis.createClient();
		this.subscriber = redis.createClient();

		this.subscribeToChannels();
		this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
	}

	handleMessage(channel, message) {
		console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

		const parsedMessage = JSON.parse(message);
		switch (channel) {
			case CHANNELS.BLOCKCHAIN:
				this.blockchain.replaceChain(parsedMessage, () => {
					this.transactionPool.clearBlockchainTransactions(parsedMessage);
				});
				break;
			case CHANNELS.TRANSACTION:
				this.transactionPool.setTransaction(parsedMessage);
				break;
			default:
				return;
		}
	}

	subscribeToChannels() {
		Object.values(CHANNELS).forEach((channel) => {
			this.subscriber.subscribe(channel);
		});
	}

	publish(channel, message) {
		this.subscriber.unsubscribe(channel, () => {
			this.publisher.publish(channel, message, () => {
				this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
			});
		});
	}

	broadcastChain() {
		this.publish(CHANNELS.BLOCKCHAIN, JSON.stringify(this.blockchain.chain));
	}

	broadcastTransaction(transaction) {
		this.publish(CHANNELS.TRANSACTION, JSON.stringify(transaction));
	}
}

module.exports = PubSub;
