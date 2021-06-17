const Wallet = require('./index');
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
});
