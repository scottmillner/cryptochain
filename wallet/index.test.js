const Wallet = require('./index');

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
});
