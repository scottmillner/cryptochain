const uuid = require('uuid');

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
}

module.exports = Transaction;
