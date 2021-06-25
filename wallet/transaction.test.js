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

	describe('validTransaction()', () => {
		// Arrange
		let errorMock;

		beforeEach(() => {
			errorMock = jest.fn();
			global.console.error = errorMock;
		});

		describe('when the transaction is valid', () => {
			it('returns true', () => {
				// Act/Assert
				expect(Transaction.validTransaction(transaction)).toBe(true);
			});
		});

		describe('when the transaction in invalid', () => {
			describe('and a transaction outputMap value is invalid', () => {
				it('returns false and logs an error', () => {
					// Arrange
					transaction.outputMap[senderWallet.publicKey] = 999999;

					// Act/Assert
					expect(Transaction.validTransaction(transaction)).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe('and the transaction input signature is invalid', () => {
				it('returns false and logs an error', () => {
					// Arrange
					transaction.input.signature = new Wallet().sign('data');

					// Act/Assert
					expect(Transaction.validTransaction(transaction)).toBe(false);
					expect(errorMock).toHaveBeenCalled();
				});
			});
		});
	});

	describe('update()', () => {
		// Arrange
		let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

		describe('and the amount is invalid', () => {
			it('throws an error', () => {
				// Act/Assert
				expect(() => transaction.update(senderWallet, 'foo', 999999)).toThrow('Amount exceeds balance');
			});
		});

		describe('and the amount is valid', () => {
			beforeEach(() => {
				originalSignature = transaction.input.signature;
				originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
				nextRecipient = 'next-recipient';
				nextAmount = 50;

				// Act
				transaction.update(senderWallet, nextRecipient, nextAmount);
			});

			it('outputs the amount to the next recipient', () => {
				// Assert
				expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
			});

			it('subtracts the amount from the original sender output amount', () => {
				// Assert
				expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
			});

			it('maintains a total output that matches the input amount', () => {
				// Arrange
				const totalOutputAmount = Object.values(transaction.outputMap).reduce((total, outputAmount) => total + outputAmount);

				// Assert
				expect(totalOutputAmount).toEqual(transaction.input.amount);
			});

			it('re-signs the transaction', () => {
				// Assert
				expect(transaction.input.signature).not.toEqual(originalSignature);
			});

			describe('and another update for the same recipient', () => {
				// Arrange
				let addedAmount;

				beforeEach(() => {
					addedAmount = 80;
					// Act
					transaction.update(senderWallet, nextRecipient, addedAmount);
				});

				it('adds to the recipient amount', () => {
					// Assert
					expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
				});

				it('subtracts the new amount from the original sender output amount', () => {
					// Assert
					expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
				});
			});
		});
	});
});
