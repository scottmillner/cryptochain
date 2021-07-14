const Transaction = require('../wallet/transaction');

class TransactionMiner {
	constructor(blockchain, transactionPool, wallet, pubsub) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubsub = pubsub;
	}

	mineTransactions() {
		// Get valid transactions and add reward transaction
		const validTransactions = this.transactionPool.validTransactions();
		const rewardTransaction = Transaction.rewardTransaction(this.wallet);
		validTransactions.push(rewardTransaction);

		// Add block with valid transactions
		this.blockchain.addBlock(validTransactions);

		// Broadcast the updated blockchain
		this.pubsub.broadcastChain();

		// Clear the transaction pool
		this.transactionPool.clear();
	}
}

module.exports = TransactionMiner;
