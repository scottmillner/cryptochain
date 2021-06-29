const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {
	// Arrange
	let transactionPool, transaction, senderWallet;
	beforeEach(() => {
		transactionPool = new TransactionPool();
		senderWallet = new Wallet();
		transaction = new Transaction(senderWallet, 'fake-recipient', 50);
	});

	describe('setTransaction()', () => {
		it('adds a transaction', () => {
			// Act
			transactionPool.setTransaction(transaction);

			// Assert
			expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
		});
	});

	describe('existingTransaction()', () => {
		it('returns an existing transaction given an input address', () => {
			// Act
			transactionPool.setTransaction(transaction);

			// Assert
			expect(transactionPool.existingTransaction(senderWallet.publicKey)).toBe(transaction);
		});
	});
});
