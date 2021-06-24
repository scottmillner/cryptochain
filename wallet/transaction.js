const uuid = require('uuid');
const { verifySignature } = require('../util');

class Transaction {
	constructor(senderWallet, recepient, amount) {
		this.id = new uuid.v1();
		this.outputMap = this.createOutputMap(senderWallet, recepient, amount);
		this.input = this.createInput(senderWallet, this.outputMap);
	}

	createOutputMap(senderWallet, recepient, amount) {
		const outputMap = {};
		outputMap[recepient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

		return outputMap;
	}

	createInput(senderWallet, outputMap) {
		return {
			timestamp: Date.now(),
			amount: senderWallet.balance,
			address: senderWallet.publicKey,
			signature: senderWallet.sign(outputMap),
		};
	}

	update(senderWallet, recipient, amount) {
		this.outputMap[recipient] = amount;
		this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
		this.input = this.createInput(senderWallet, this.outputMap);
	}

	static validTransaction(transaction) {
		const {
			input: { amount, address, signature },
			outputMap,
		} = transaction;

		const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);
		if (amount !== outputTotal) {
			console.error(`Invalid transaction from: ${address}`);
			return false;
		}

		if (!verifySignature(address, outputMap, signature)) {
			console.error(`Invalid signature from: ${address}`);
			return false;
		}

		return true;
	}
}

module.exports = Transaction;
