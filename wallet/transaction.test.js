const Transaction = require('./transaction');
const Wallet = require('.');
const { verifySignature } = require('../util');

describe('Transaction', () => {
	// Arrange
	let transaction, senderWallet, recepient, amount;

	beforeEach(() => {
		senderWallet = new Wallet();
		recepient = 'recepient-public-key';
		amount = 50;
		transaction = new Transaction(senderWallet, recepient, amount);
	});

	it('has an `id`', () => {
		// Assert
		expect(transaction).toHaveProperty('id');
	});

	describe('outputMap', () => {
		it('has an `outputMap`', () => {
			// Assert
			expect(transaction).toHaveProperty('outputMap');
		});

		it('outputs the amount to the recepient', () => {
			// Assert
			expect(transaction.outputMap[recepient]).toEqual(amount);
		});

		it('outputs the remainding balance for the `senderWallet`', () => {
			// Assert
			expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
		});

		describe('input', () => {
			it('has an `input`', () => {
				// Assert
				expect(transaction).toHaveProperty('input');
			});

			it('has a `timestamp` in the input', () => {
				// Assert
				expect(transaction.input).toHaveProperty('timestamp');
			});

			it('sets the `amount` to the `senderWallet` balance', () => {
				// Assert
				expect(transaction.input.amount).toEqual(senderWallet.balance);
			});

			it('sets the `address` to the `senderWallet` publicKey', () => {
				// Assert
				expect(transaction.input.address).toEqual(senderWallet.publicKey);
			});

			it('signs the input', () => {
				// Act/Assert
				expect(verifySignature(senderWallet.publicKey, transaction.outputMap, transaction.input.signature)).toBe(true);
			});
		});
	});
});
