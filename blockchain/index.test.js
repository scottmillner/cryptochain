const Blockchain = require('.');
const Block = require('./block');
const { cryptoHash } = require('../util');

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

			describe('and the chain contains a block with a jumped difficulty', () => {
				it('returns false', () => {
					// Arrange
					const lastBlock = blockchain.chain[blockchain.chain.length - 1];
					const lastHash = lastBlock.hash;
					const timestamp = Date.now();
					const nonce = 0;
					const data = [];
					const difficulty = lastBlock.difficulty - 3;
					const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
					const badBlock = new Block({ timestamp, lastHash, hash, difficulty, nonce, data });

					// Act
					blockchain.chain.push(badBlock);

					// Assert
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
		let errorMock, logMock;

		beforeEach(() => {
			errorMock = jest.fn();
			logMock = jest.fn();

			global.console.error = errorMock;
			global.console.log = logMock;
		});

		describe('when the new chain is not longer', () => {
			beforeEach(() => {
				// Arrange
				newChain.chain[0] = new Block(Date.now(), 'last-hash', 'hash', 'data');

				// Act
				blockchain.replaceChain(newChain.chain);
			});

			it('does not replace the chain', () => {
				// Assert
				expect(blockchain.chain).toEqual(originalChain);
			});

			it('logs an error', () => {
				// Assert
				expect(errorMock).toHaveBeenCalled();
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
				beforeEach(() => {
					// Arrange
					newChain.chain[2].hash = 'some-fake-hash';

					// Act
					blockchain.replaceChain(newChain.chain);
				});

				it('does not replace the chain', () => {
					// Assert
					expect(blockchain.chain).toEqual(originalChain);
				});

				it('logs an error', () => {
					// Assert
					expect(errorMock).toHaveBeenCalled();
				});
			});

			describe('and the chain is valid', () => {
				beforeEach(() => {
					// Act
					blockchain.replaceChain(newChain.chain);
				});

				it('replaces the chain', () => {
					// Assert
					expect(blockchain.chain).toEqual(newChain.chain);
				});

				it('logs about the chain replacement', () => {
					expect(logMock).toHaveBeenCalled();
				});
			});
		});
	});
});
