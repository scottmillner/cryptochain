const uuid = require('uuid');

class Transaction {
	constructor(senderWallet, recepient, amount) {
		this.id = new uuid.v1();
		this.outputMap = this.createOutputMap(senderWallet, recepient, amount);
	}

	createOutputMap(senderWallet, recepient, amount) {
		const outputMap = {};
		outputMap[recepient] = amount;
		outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

		return outputMap;
	}
}

module.exports = Transaction;
