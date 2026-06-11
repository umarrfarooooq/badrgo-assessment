const {
  createWallet,
  credit,
  debit,
} = require("../src/services/wallet.service");
const User = require("../src/models/User.model");
const Transaction = require("../src/models/Transaction.model");

describe("Wallet Service", () => {
  let user;
  let wallet;

  beforeEach(async () => {
    user = await User.create({ name: "Test User", email: "test@example.com" });
    wallet = await createWallet({ userId: user._id });
  });

  it("credits the wallet and creates a transaction", async () => {
    const result = await credit(wallet._id, {
      amount: 100,
      referenceId: "ref-1",
    });

    expect(result.wallet.balance.toString()).toBe("100");

    const tx = await Transaction.findOne({ referenceId: "ref-1" });
    expect(tx.type).toBe("credit");
    expect(tx.amount.toString()).toBe("100");
    expect(tx.balanceBefore.toString()).toBe("0");
    expect(tx.balanceAfter.toString()).toBe("100");
  });

  it("throws insufficientFundsError when balance is too low", async () => {
    await expect(
      debit(wallet._id, { amount: 50, referenceId: "ref-2" }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws conflictError on duplicate referenceId", async () => {
    await credit(wallet._id, { amount: 50, referenceId: "ref-dup" });
    await expect(
      credit(wallet._id, { amount: 50, referenceId: "ref-dup" }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("rejects duplicate concurrent debits — only one succeeds", async () => {
    await credit(wallet._id, { amount: 200, referenceId: "ref-fund" });

    const results = await Promise.allSettled([
      debit(wallet._id, { amount: 100, referenceId: "ref-concurrent" }),
      debit(wallet._id, { amount: 100, referenceId: "ref-concurrent" }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toMatchObject({ statusCode: 409 });

    const updatedWallet = await wallet.constructor.findById(wallet._id);
    expect(parseFloat(updatedWallet.balance.toString())).toBe(100);
  });
});
