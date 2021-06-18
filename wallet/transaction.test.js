const Transaction = require('./transaction');
const Wallet = require('.');

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
});
