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
}

module.exports = TransactionPool;
