const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {
	// Arrange
	let transactionPool, transaction;
	beforeEach(() => {
		transactionPool = new TransactionPool();
		transaction = new Transaction(new Wallet(), 'fake-recipient', 50);
	});

	describe('setTransaction()', () => {
		it('adds a transaction', () => {
			// Act
			transactionPool.setTransaction(transaction);

			// Assert
			expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
		});
	});
});
