const mongoose = require("mongoose");

// This model represents a bank or mobile money account in the system.
const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bankCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ["WAVE", "ORANGE", "MOOV", "ECOBANK", "BOA", "UBA"],
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["mobile_money", "bank"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// An account number is only unique within a given institution, following the same pattern as real banking data.
accountSchema.index({ accountNumber: 1, bankCode: 1 }, { unique: true });

module.exports = mongoose.model("Account", accountSchema);
