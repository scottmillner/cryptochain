const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
	constructor() {
		this.balance = STARTING_BALANCE;
		this.keyPair = ec.genKeyPair();
		this.publicKey = this.keyPair.getPublic().encode('hex');
	}

	sign(data) {
		return this.keyPair.sign(cryptoHash(data));
	}

	createTransaction(recipient, amount, chain) {
		if (chain) this.balance = Wallet.calculateBalance(chain, this.publicKey);
		if (amount > this.balance) throw new Error('Amount exceeds balance');

		return new Transaction(this, recipient, amount);
	}

	static calculateBalance(chain, address) {
		let outputsTotal = 0;

		chain.forEach((block, index) => {
			if (index > 0) {
				block.data.forEach((transaction) => {
					if (transaction.outputMap[address]) {
						outputsTotal += transaction.outputMap[address];
					}
				});
			}
		});

		return STARTING_BALANCE + outputsTotal;
	}
}

module.exports = Wallet;
