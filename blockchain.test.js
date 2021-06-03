const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
	// Arrange
	let blockchain, newChain, originalChain;

	beforeEach(() => {
		blockchain = new Blockchain();
		newChain = new Blockchain();
		originalChain = blockchain.chain;
	});

	it('contains a `chain` Array instance', () => {
		// Assert
		expect(blockchain.chain instanceof Array).toBe(true);
	});

	it('starts with a genesis block', () => {
		// Assert
		expect(blockchain.chain[0]).toEqual(Block.genesis());
	});

	it('adds a new block to the chain', () => {
		// Arrange
		const newData = 'foo bar';
		blockchain.addBlock(newData);

		// Assert
		expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
	});

	describe('isValidChain()', () => {
		describe('when the chain does not start with the genesis block', () => {
			it('returns false', () => {
				// Arrange
				blockchain.chain[0] = { data: 'fake-genesis' };
				// Act/Assert
				expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
			});
		});

		describe('when the chain starts with the genesis block and has multiple blocks', () => {
			// Arrange
			beforeEach(() => {
				blockchain.addBlock('Bears');
				blockchain.addBlock('Beets');
				blockchain.addBlock('Battlestar Galactica');
			});

			describe('and a lastHash reference has changed', () => {
				it('returns false', () => {
					// Arrange
					blockchain.chain[2].lastHash = 'broken-lastHash';

					// Act/Assert
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe('and the chain contains a block with invalid field', () => {
				// Assert
				it('returns false', () => {
					// Arrange
					blockchain.chain[2].data = 'some-bad-and-evil-data';

					// Act/Assert
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
				});
			});

			describe('and the chain does not contain any invalid blocks', () => {
				// Assert
				it('returns true', () => {
					// Act/Assert
					expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
				});
			});
		});
	});

	describe('replaceChain()', () => {
		describe('when the new chain is not longer', () => {
			it('does not replace the chain', () => {
				// Arrange
				newChain.chain[0] = new Block(Date.now(), 'last-hash', 'hash', 'data');

				// Act
				blockchain.replaceChain(newChain.chain);

				// Assert
				expect(blockchain.chain).toEqual(originalChain);
			});
		});

		describe('when the chain is longer', () => {
			// Arrange
			beforeEach(() => {
				newChain.addBlock('Bears');
				newChain.addBlock('Beets');
				newChain.addBlock('Battlestar Galactica');
			});
			describe('and the chain is invalid', () => {
				it('does not replace the chain', () => {
					// Arrange
					newChain.chain[2].hash = 'some-fake-hash';

					// Act
					blockchain.replaceChain(newChain.chain);

					// Assert
					expect(blockchain.chain).toEqual(originalChain);
				});
			});
			describe('and the chain is valid', () => {
				it('replaces the chain', () => {
					// Act
					blockchain.replaceChain(newChain.chain);

					// Assert
					expect(blockchain.chain).toEqual(newChain.chain);
				});
			});
		});
	});
});
