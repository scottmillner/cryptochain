const MINE_RATE = 1000; // ms
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
	timestamp: 1,
	lastHash: '_____',
	hash: 'hash-one',
	data: [],
	difficulty: INITIAL_DIFFICULTY,
	nonce: 0,
};

module.exports = { GENESIS_DATA, MINE_RATE };
