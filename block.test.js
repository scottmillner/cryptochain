const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
	// Arrange
	const timestamp = 2000;
	const lastHash = 'foo-hash';
	const hash = 'bar-hash';
	const data = ['blockchain', 'data'];
	const nonce = 1;
	const difficulty = 1;

	// Act
	const block = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });

	it('has a timestamp, lastHash, hash, data, nonce, and difficulty property', () => {
		// Assert
		expect(block.timestamp).toEqual(timestamp);
		expect(block.lastHash).toEqual(lastHash);
		expect(block.hash).toEqual(hash);
		expect(block.data).toEqual(data);
		expect(block.nonce).toEqual(nonce);
		expect(block.difficulty).toEqual(difficulty);
	});

	describe('genesis()', () => {
		// Arrange/Act
		const genesisBlock = Block.genesis();

		it('returns a Block instance', () => {
			// Assert
			expect(genesisBlock instanceof Block).toBe(true);
		});

		it('returns the genesis data', () => {
			// Assert
			expect(genesisBlock).toEqual(GENESIS_DATA);
		});
	});

	describe('mineBlock()', () => {
		// Arrange
		const lastBlock = Block.genesis();
		const data = 'mined data';

		// Act
		const minedBlock = Block.mineBlock({ lastBlock, data });

		it('returns a Block instance', () => {
			// Assert
			expect(minedBlock instanceof Block).toBe(true);
		});

		it('sets `lastHash` to be the `hash` of the lastBlock', () => {
			// Assert
			expect(minedBlock.lastHash).toEqual(lastBlock.hash);
		});

		it('sets the `data`', () => {
			// Assert
			expect(minedBlock.data).toEqual(data);
		});

		it('sets a `timestamp`', () => {
			// Assert
			expect(minedBlock.timestamp).not.toEqual(undefined);
		});

		it('creates a SHA-256 `hash` based on the proper inputs', () => {
			// Assert
			expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data, minedBlock.nonce, minedBlock.difficulty));
		});

		it('sets a `hash` that matches the difficulty criteria', () => {
			// Assert
			expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
		});

		it('adjusts the difficulty', () => {
			// Arrange
			const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

			// Act/Assert
			expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
		});
	});

	describe('adjustDifficulty()', () => {
		it('raises the difficulty for a quickly mined block', () => {
			// Act/Assert
			expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE - 100)).toEqual(block.difficulty + 1);
		});

		it('lowers the difficulty for a slowly mined block', () => {
			// Act/Assert
			expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE + 100)).toEqual(block.difficulty - 1);
		});

		it('has a lower limit of 1', () => {
			// Arrange
			block.difficulty = -1;

			// Act/Assert
			expect(Block.adjustDifficulty(block)).toBe(1);
		});
	});
});
