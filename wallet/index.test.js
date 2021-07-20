const Wallet = require('./index');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
	let wallet;

	beforeEach(() => {
		// Arrange
		wallet = new Wallet();
	});

	it('has a `balance`', () => {
		// Assert
		expect(wallet).toHaveProperty('balance');
	});

	it('has a `publickey`', () => {
		// Assert
		expect(wallet).toHaveProperty('publicKey');
	});

	describe('signing data', () => {
		// Arrange
		const data = 'foobar';

		it('verifies a signature', () => {
			// Act
			const isVerified = verifySignature(wallet.publicKey, data, wallet.sign(data));

			// Assert
			expect(isVerified).toBe(true);
		});

		it('does not verify an invalid signature', () => {
			// Act
			const isVerified = verifySignature(wallet.publicKey, data, new Wallet().sign(data));

			// Assert
			expect(isVerified).toBe(false);
		});
	});

	describe('createTransaction()', () => {
		describe('and the amount exceeds the balance', () => {
			it('throws an error', () => {
				// Act/Assert
				expect(() => wallet.createTransaction('foo-recipient', 999999)).toThrow('Amount exceeds balance');
			});
		});

		describe('and the amount is valid', () => {
			let transaction, amount, recipient;

			beforeEach(() => {
				// Arrange
				amount = 50;
				recipient = 'foo-recipient';

				// Act
				transaction = wallet.createTransaction(recipient, amount);
			});

			it('creates an instance of `Transaction`', () => {
				// Assert
				expect(transaction instanceof Transaction).toBe(true);
			});

			it('matches the transaction input with the wallet', () => {
				// Assert
				expect(transaction.input.address).toEqual(wallet.publicKey);
			});

			it('outputs the amount to the recipient', () => {
				// Assert
				expect(transaction.outputMap[recipient]).toEqual(amount);
			});
		});

		describe('and a chain is passed', () => {
			it('calls `Wallet.calculateBalance`', () => {
				// Arrange/Act
				const calculateBalanceMock = jest.fn();
				const originalCalculateBalance = Wallet.calculateBalance;
				Wallet.calculateBalance = calculateBalanceMock;
				wallet.createTransaction('foo', 10, new Blockchain().chain);

				// Assert
				expect(calculateBalanceMock).toHaveBeenCalled();

				// Cleanup
				Wallet.calculateBalance = originalCalculateBalance;
			});
		});
	});

	describe('calculateBalance()', () => {
		// Arrange
		let blockchain;

		beforeEach(() => {
			blockchain = new Blockchain();
		});

		describe('and there are no outputs for the wallet', () => {
			it('returns the `STARTING_BALANCE`', () => {
				// Act
				const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);

				// Assert
				expect(expectedBalance).toEqual(STARTING_BALANCE);
			});
		});

		describe('and there are outputs for the wallet', () => {
			// Arrange
			let transactionOne, transactionTwo;

			beforeEach(() => {
				transactionOne = new Wallet().createTransaction(wallet.publicKey, 50);
				transactionTwo = new Wallet().createTransaction(wallet.publicKey, 60);
				blockchain.addBlock([transactionOne, transactionTwo]);
			});

			it('adds the sum of all outputs to the wallet balance', () => {
				// Arrange/Act
				const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);
				const actualBalance = STARTING_BALANCE + transactionOne.outputMap[wallet.publicKey] + transactionTwo.outputMap[wallet.publicKey];

				// Assert
				expect(expectedBalance).toEqual(actualBalance);
			});

			describe('and the wallet has made a transaction', () => {
				// Arrange
				let recentTransaction;

				beforeEach(() => {
					recentTransaction = wallet.createTransaction('foo-address', 30);
					blockchain.addBlock([recentTransaction]);
				});

				it('returns the output amount of the recent transaction', () => {
					// Act
					const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);
					const actualBalance = recentTransaction.outputMap[wallet.publicKey];

					// Assert
					expect(expectedBalance).toEqual(actualBalance);
				});

				describe('and there are outputs next to and after the recent transaction', () => {
					// Arrange
					let sameBlockTransaction, nextBlockTransaction;

					beforeEach(() => {
						// Act
						recentTransaction = wallet.createTransaction('later-foo-address', 60);
						sameBlockTransaction = Transaction.rewardTransaction(wallet);
						blockchain.addBlock([recentTransaction, sameBlockTransaction]);

						nextBlockTransaction = new Wallet().createTransaction(wallet.publicKey, 75);
						blockchain.addBlock([nextBlockTransaction]);
					});

					it('includes the ouput amounts in the returned balance', () => {
						// Assert
						const expectedBalance = Wallet.calculateBalance(blockchain.chain, wallet.publicKey);
						const actualBalance =
							recentTransaction.outputMap[wallet.publicKey] +
							sameBlockTransaction.outputMap[wallet.publicKey] +
							nextBlockTransaction.outputMap[wallet.publicKey];

						expect(expectedBalance).toEqual(actualBalance);
					});
				});
			});
		});
	});
});
