const Block = require('./block');
const { GENESIS_DATA } = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
	// Arrange
	const timestamp = 'a-date';
	const lastHash = 'foo-hash';
	const hash = 'bar-hash';
	const data = ['blockchain', 'data'];

	// Act
	const block = new Block({ timestamp, lastHash, hash, data });

	it('has a timestamp, lastHash, hash, and data property', () => {
		// Assert
		expect(block.timestamp).toEqual(timestamp);
		expect(block.lastHash).toEqual(lastHash);
		expect(block.hash).toEqual(hash);
		expect(block.data).toEqual(data);
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
			expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
		});
	});
});
