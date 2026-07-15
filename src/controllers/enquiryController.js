const Account = require("../models/account");

// To mask the account name for privacy, it'll only show the first 3 letters of each word and replace the rest with asterisks.
function maskName(fullName) {
  return fullName
    .split(" ")
    .map((word) => {
      if (word.length <= 3) return word[0] + "*".repeat(word.length - 1);
      return word.slice(0, 3) + "*".repeat(word.length - 3);
    })
    .join(" ");
}

// GET /api/name-enquiry?accountNumber=xxxx&bankCode=WAVE
async function nameEnquiry(req, res) {
  try {
    const { accountNumber, bankCode } = req.query;

    const account = await Account.findOne({
      accountNumber,
      bankCode: bankCode.toUpperCase(),
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "No account found for this number at the specified institution.",
      });
    }

    if (account.status !== "active") {
      return res.status(422).json({
        success: false,
        message: `This account is currently ${account.status} and cannot receive transfers.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        accountName: account.accountName,
        accountType: account.accountType,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while looking up this account.",
    });
  }
}

module.exports = { nameEnquiry, maskName };
