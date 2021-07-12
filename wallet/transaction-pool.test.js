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

	describe('validTransaction()', () => {
		// Arrange
		let validTransaction, errorMock;

		beforeEach(() => {
			validTransactions = [];
			errorMock = jest.fn();
			global.console.error = errorMock;

			for (let i = 0; i < 10; i++) {
				transaction = new Transaction(senderWallet, 'any-recipient', 30);

				if (i % 3 === 0) {
					transaction.input.amount = 999999;
				} else if (i % 3 === 1) {
					transaction.input.signature = new Wallet().sign('foo');
				} else {
					validTransactions.push(transaction);
				}

				// Act
				transactionPool.setTransaction(transaction);
			}
		});

		it('returns valid transaction', () => {
			// Act/Assert
			expect(transactionPool.validTransactions()).toEqual(validTransactions);
		});

		it('logs errors for the invalid transactions', () => {
			// Act
			transactionPool.validTransactions();

			// Assert
			expect(errorMock).toHaveBeenCalled();
		});
	});
});
