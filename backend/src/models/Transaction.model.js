const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    balanceBefore: { type: mongoose.Schema.Types.Decimal128, required: true },
    balanceAfter: { type: mongoose.Schema.Types.Decimal128, required: true },
    referenceId: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);

transactionSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.amount) {
      ret.amount = ret.amount.toString();
    }
    if (ret.balanceBefore) {
      ret.balanceBefore = ret.balanceBefore.toString();
    }
    if (ret.balanceAfter) {
      ret.balanceAfter = ret.balanceAfter.toString();
    }
    return ret;
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
