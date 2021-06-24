const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
	// Arrange
	const expectedHash = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b';

	it('generates a SHA-256 hashed output', () => {
		// Assert
		expect(cryptoHash('foo')).toEqual(expectedHash);
	});

	it('produces the same hash with the same input arguments in any order', () => {
		// Assert
		expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
	});

	it('produces a unique hash when the properties have changed on an input', () => {
		// Arrange
		const foo = {};
		const originalHash = cryptoHash(foo);
		foo['a'] = 'a';

		// Act/Assert
		expect(cryptoHash(foo)).not.toEqual(originalHash);
	});
});
