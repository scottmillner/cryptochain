const Wallet = require('./index');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
	let wallet;

	beforeEach(() => {
		// Arrange
		wallet = new Wallet();
	});

	it('has a `balance`', () => {
		// Assert
		expect(wallet).toHaveProperty('balance');
	});

	it('has a `publickey`', () => {
		// Assert
		expect(wallet).toHaveProperty('publicKey');
	});

	describe('signing data', () => {
		// Arrange
		const data = 'foobar';

		it('verifies a signature', () => {
			// Act
			const isVerified = verifySignature(wallet.publicKey, data, wallet.sign(data));

			// Assert
			expect(isVerified).toBe(true);
		});

		it('does not verify an invalid signature', () => {
			// Act
			const isVerified = verifySignature(wallet.publicKey, data, new Wallet().sign(data));

			// Assert
			expect(isVerified).toBe(false);
		});
	});

	describe('createTransaction()', () => {
		describe('and the amount exceeds the balance', () => {
			it('throws an error', () => {
				// Act/Assert
				expect(() => wallet.createTransaction('foo-recipient', 999999)).toThrow('Amount exceeds balance');
			});
		});

		describe('and the amount is valid', () => {
			let transaction, amount, recipient;

			beforeEach(() => {
				// Arrange
				amount = 50;
				recipient = 'foo-recipient';

				// Act
				transaction = wallet.createTransaction(recipient, amount);
			});

			it('creates an instance of `Transaction`', () => {
				// Assert
				expect(transaction instanceof Transaction).toBe(true);
			});

			it('matches the transaction input with the wallet', () => {
				// Assert
				expect(transaction.input.address).toEqual(wallet.publicKey);
			});

			it('outputs the amount to the recipient', () => {
				// Assert
				expect(transaction.outputMap[recipient]).toEqual(amount);
			});
		});
	});

	describe('calculateBalance()', () => {
		// Arrange
		let blockchain;

		beforeEach(() => {
			blockchain = new Blockchain();
		});

		describe('and there are no outputs for the wallet', () => {
			it('returns the `STARTING_BALANCE`', () => {
				// Act
				const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);

				// Assert
				expect(expectedBalance).toEqual(STARTING_BALANCE);
			});
		});

		describe('and there are outputs for the wallet', () => {
			// Arrange
			let transactionOne, transactionTwo;

			beforeEach(() => {
				transactionOne = new Wallet().createTransaction(wallet.publicKey, 50);
				transactionTwo = new Wallet().createTransaction(wallet.publicKey, 60);
				blockchain.addBlock([transactionOne, transactionTwo]);
			});

			it('adds the sum of all outputs to the wallet balance', () => {
				// Arrange/Act
				const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);
				const actualBalance = STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey];

				// Assert
				expect(expectedBalance).toEqual(actualBalance);
			});
		});
	});
});
