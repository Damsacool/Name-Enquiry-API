# Name Enquiry API (Wave Transfer Simulation)

A mock **Name Enquiry** service - the kind of recipient verification Nigerian apps like OPay and PalmPay give you before a transfer goes through, but which Wave (and other apps in the UEMOA region) currently doesn't offer.

## Why I built this

I use Wave daily. Every time I send money to a number I haven't saved, the app just gives me two blank fields: "Full name" and "Mobile number." No lookup, no confirmation, nothing telling me whether the number I typed actually belongs to the person I think it does. I've caught myself typing a placeholder like "h h" in the name field just to get past it, still unsure if the account number itself was even correct.

That felt off, especially having used Nigerian apps where this is solved: type an account number into OPay or PalmPay, and it looks up and shows you the real account holder's name before you confirm anything. So I went looking for why that gap exists here.

The deeper I looked, the more I realized this wasn't simply a missing feature, but an infrastructural problem. Nigeria has had a shared, centralized instant-payment switch (NIBSS) since 2011, and any bank or fintech there can query its **Name Enquiry** service to resolve an account number to a name. In the UEMOA zone (Côte d'Ivoire, Senegal, and others), the equivalent regional rail - BCEAO's **PI-SPI** - only launched in September 2025, with financial institutions still being brought onto it through 2026. Wave's own terms of service put the burden of getting the account details right on the sender, which lines up with there being no shared name-lookup rail for it to plug into yet.

So this project is me building the piece that's currently missing - not to pitch it to Wave, but because once I understood *why* the gap existed, I wanted to actually build the thing that closes it and see what it takes.

## What this is (and isn't)

This is a self-contained simulation with fake seed data - it doesn't call Wave, any real bank, or PI-SPI (that access is restricted to licensed institutions). It's a working demonstration of the architecture a real Name Enquiry integration would need: a lookup endpoint, per-institution data isolation, input validation, and privacy-conscious responses.

## Tech stack

Node.js, Express, MongoDB (Mongoose), express-validator.

## Setup

```bash
git clone <your-repo-url>
cd name-enquiry-api
npm install
cp .env.example .env
# point MONGODB_URI at your own MongoDB (local or Atlas)
npm run seed   # populates the database with sample accounts
npm run dev    # starts the server with nodemon
```

Server runs at `http://localhost:3000`.

## API

### `GET /api/name-enquiry`

Looks up the account holder's name for a given account number + institution, before a transfer is confirmed - the exact step missing from Wave's current flow.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `accountNumber` | string | yes | Alphanumeric, 6–20 characters |
| `bankCode` | string | yes | One of `WAVE`, `ORANGE`, `MOOV`, `ECOBANK`, `BOA`, `UBA` |

**Example request**

```
GET /api/name-enquiry?accountNumber=0774881234&bankCode=WAVE
```

**Example success response**

```json
{
  "success": true,
  "data": {
    "accountNumber": "0774881234",
    "bankCode": "WAVE",
    "accountName": "Kouassi Motors",
    "accountType": "mobile_money"
  }
}
```

The name comes back **masked**, not in full - the same privacy trade-off real Name Enquiry systems make: enough for the sender to recognize the recipient, without exposing a stranger's full name to anyone who types in a number.

**Example error responses**

Account not found:
```json
{ "success": false, "message": "No account found for this number at the specified institution." }
```

Invalid input:
```json
{
  "success": false,
  "errors": [
    { "field": "bankCode", "message": "bankCode must be one of: WAVE, ORANGE, MOOV, ECOBANK, BOA, UBA" }
  ]
}
```

## Seed data

`npm run seed` inserts sample accounts across different institutions, including one `suspended` account, since a real lookup needs to handle "exists but can't receive funds," not just "found or not found."

## A detail worth knowing about: same number, different banks

The database enforces uniqueness on the *combination* of `accountNumber + bankCode`, not on `accountNumber` alone. That mirrors real life - in Nigeria, my own phone number is registered separately with OPay, PalmPay, and Nomba, and each is a completely distinct account. The same should hold here: `0774881234` on Wave and `0774881234` on Orange Money are two unrelated accounts, and a lookup always resolves against one specific institution, never guesses across all of them.

## Design decisions

- **Per-institution uniqueness**, not global - see above.
- **Masked names**, not full names - privacy-by-design.
- **Validation before any database query** - malformed input never reaches business logic.
- **Status field** - existing isn't the same as being able to receive funds.


## Beyond the Code

This project started with a simple question while using Wave:

> "Why can't I verify who I'm sending money to?"

Answering that question led me far beyond writing an API.

It pushed me to explore how payment systems establish trust, why recipient verification exists, how shared payment infrastructure differs across regions, and how seemingly small product decisions shape the confidence users have before they move money.

The code was the output, but curiosity was the real project.

## Future Improvements

If this were integrated into a real payment ecosystem, I'd explore:

- Rate limiting to prevent account enumeration.
- Authentication and authorization.
- Audit logging.
- Caching frequent lookups.
- Real-time integration with payment switches (e.g. PI-SPI/NIBSS).
- Fraud detection and anomaly monitoring.