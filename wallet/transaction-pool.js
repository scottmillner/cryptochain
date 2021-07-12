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
}

module.exports = TransactionPool;
