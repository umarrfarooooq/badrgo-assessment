const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: { type: mongoose.Schema.Types.Decimal128, default: "0" },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    status: { type: String, enum: ["active", "frozen"], default: "active" },
  },
  {
    timestamps: true,
  },
);

walletSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.balance) {
      ret.balance = ret.balance.toString();
    }
    return ret;
  },
});

module.exports = mongoose.model("Wallet", walletSchema);
