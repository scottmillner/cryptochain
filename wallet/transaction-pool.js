const Transaction = require('./transaction');

class TransactionPool {
	constructor() {
		this.transactionMap = {};
	}

	setTransaction(transaction) {
		this.transactionMap[transaction.id] = transaction;
	}

	setMap(tranasactionMap) {
		this.transactionMap = tranasactionMap;
	}

	existingTransaction(inputAddress) {
		return Object.values(this.transactionMap).find((transaction) => transaction.input.address === inputAddress);
	}

	validTransactions() {
		return Object.values(this.transactionMap).filter((transaction) => Transaction.validTransaction(transaction));
	}

	clear() {
		this.transactionMap = {};
	}

	clearBlockchainTransactions(chain) {
		chain.forEach((block, index) => {
			if (index > 0) {
				for (let transaction of block.data) {
					if (this.transactionMap[transaction.id]) delete this.transactionMap[transaction.id];
				}
			}
		});
	}
}

module.exports = TransactionPool;
