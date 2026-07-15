require("dotenv").config();
const mongoose = require("mongoose");
const Account = require("../models/account");

const seedAccounts = [
  {
    accountNumber: "0774881234",
    bankCode: "WAVE",
    accountName: "Kouassi Motors",
    accountType: "mobile_money",
  },
  {
    accountNumber: "0565238568",
    bankCode: "WAVE",
    accountName: "Jean Jacques Ouattara",
    accountType: "mobile_money",
  },
  {
    accountNumber: "0102030405",
    bankCode: "WAVE",
    accountName: "Aya Bamba",
    accountType: "mobile_money",
  },
  {
    accountNumber: "0501122334",
    bankCode: "ORANGE",
    accountName: "Aisha Traore",
    accountType: "mobile_money",
  },
  {
    accountNumber: "0656677889",
    bankCode: "MOOV",
    accountName: "Jean Baptiste Kone",
    accountType: "mobile_money",
  },
  {
    accountNumber: "CI001234567890",
    bankCode: "ECOBANK",
    accountName: "Abidjan Auto Parts Ltd",
    accountType: "bank",
  },
  {
    accountNumber: "CI009988776655",
    bankCode: "BOA",
    accountName: "Fatou Diabate",
    accountType: "bank",
    status: "suspended",
  },
  {
    accountNumber: "CI005544332211",
    bankCode: "UBA",
    accountName: "Damsa Tech Services",
    accountType: "bank",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    await Account.deleteMany({});
    console.log("Cleared existing accounts.");

    await Account.insertMany(seedAccounts);
    console.log(`Seeded ${seedAccounts.length} accounts.`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
