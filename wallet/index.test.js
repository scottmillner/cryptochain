const Wallet = require('./index');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');

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
});
