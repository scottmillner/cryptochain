const Block = require('./block');
const { cryptoHash } = require('../util');

class Blockchain {
	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock(data) {
		const newBlock = Block.mineBlock({ lastBlock: this.chain[this.chain.length - 1], data });
		this.chain.push(newBlock);
	}

	replaceChain(chain, onSuccess) {
		if (chain.length <= this.chain.length) {
			console.error('The incoming chain must be longer');
			return;
		}
		if (!Blockchain.isValidChain(chain)) {
			console.error('The incoming chain must be valid');
			return;
		}
		if (onSuccess) onSuccess();
		console.log('replacing chain with: ', chain);
		this.chain = chain;
	}

	static isValidChain(chain) {
		// validate genesis block
		if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

		for (let i = 1; i < chain.length; i++) {
			// validate lastHash
			const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
			const actualLastHash = chain[i - 1].hash;
			if (lastHash !== actualLastHash) return false;

			// validate no difficulty jump
			const lastDifficulty = chain[i - 1].difficulty;
			if (Math.abs(lastDifficulty - difficulty) > 1) return false;

			// validate hash
			const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
			if (hash !== validatedHash) return false;
		}

		return true;
	}
}

module.exports = Blockchain;
