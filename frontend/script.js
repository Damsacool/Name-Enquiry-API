// ---- Config ----
const API_BASE = "http://localhost:3000/api";
const BANK_CODE = "WAVE";

// Fallback datasets for demo purposes.
const FALLBACK_ACCOUNTS = [
  { accountNumber: "0774881234", accountName: "Kouassi Motors" },
  { accountNumber: "0565238568", accountName: "Jean Jacques Ouattara" },
  { accountNumber: "0102030405", accountName: "Aya Bamba" },
];

function formatNumberDisplay(digits) {
  // "0565238568" -> "05 65 23 85 68"
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

async function lookupAccount(digits) {
  try {
    const res = await fetch(
      `${API_BASE}/name-enquiry?accountNumber=${digits}&bankCode=${BANK_CODE}`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return { matched: true, accountName: json.data.accountName };
      }
    }
    return { matched: false };
  } catch (err) {
    // if the API fails, fallback to the demo dataset
    const found = FALLBACK_ACCOUNTS.find((a) => a.accountNumber === digits);
    if (found) {
      return { matched: true, accountName: found.accountName };
    }
    return { matched: false };
  }
}

// Screen 1 logic 
const fullNameInput = document.getElementById("fullName");
const mobileInput = document.getElementById("mobileNumber");
const lookupStatus = document.getElementById("lookupStatus");
const nextBtn = document.getElementById("nextBtn");

let currentLookup = { matched: false, accountName: null, rawDigits: "" };
let debounceTimer = null;

mobileInput.addEventListener("input", () => {
  const digits = mobileInput.value.replace(/\D/g, "");

  clearTimeout(debounceTimer);
  lookupStatus.className = "lookup-status";
  lookupStatus.innerHTML = "";
  nextBtn.disabled = true;
  fullNameInput.disabled = false;
  currentLookup = { matched: false, accountName: null, rawDigits: digits };

  if (digits.length < 10) return;

  debounceTimer = setTimeout(async () => {
    lookupStatus.innerHTML = `<span class="dot"></span> Checking number...`;
    const result = await lookupAccount(digits);
    currentLookup = { ...result, rawDigits: digits };

    if (result.matched) {
      lookupStatus.className = "lookup-status matched";
      lookupStatus.innerHTML = `<span class="dot"></span> Confirmed: ${result.accountName}`;
      fullNameInput.value = result.accountName;
      fullNameInput.disabled = true;
    } else {
      lookupStatus.className = "lookup-status unmatched";
      lookupStatus.innerHTML = `<span class="dot"></span> No name on file, double check the number before sending`;
      fullNameInput.disabled = false;
    }
    nextBtn.disabled = false;
  }, 500);
});

fullNameInput.addEventListener("input", () => {
  if (mobileInput.value.replace(/\D/g, "").length >= 10) {
    nextBtn.disabled = false;
  }
});

// Screen transition 
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const toName = document.getElementById("toName");
const toNumber = document.getElementById("toNumber");
const verifyBadge = document.getElementById("verifyBadge");

nextBtn.addEventListener("click", () => {
  const displayName = currentLookup.matched
    ? currentLookup.accountName
    : fullNameInput.value || "(no name entered)";

  toName.textContent = displayName;
  toNumber.textContent = `+225 ${formatNumberDisplay(currentLookup.rawDigits)}`;

  if (currentLookup.matched) {
    verifyBadge.className = "verify-badge show matched";
    verifyBadge.textContent = "✓ Verified match, safe to send";
  } else {
    verifyBadge.className = "verify-badge show unmatched";
    verifyBadge.textContent = "⚠ Unverified, not confirmed by any institution";
  }

  screen1.classList.add("hidden");
  screen2.classList.remove("hidden");
});

document.getElementById("backToScreen1").addEventListener("click", () => {
  screen2.classList.add("hidden");
  screen1.classList.remove("hidden");
});

// ---- Send amount / receive amount (1% fee, same as Wave) ----
const sendAmount = document.getElementById("sendAmount");
const receiveAmount = document.getElementById("receiveAmount");
const sendBtn = document.getElementById("sendBtn");
let amountSyncing = false;

function updateSendButtonState() {
  const sendVal = parseFloat(sendAmount.value);
  const receiveVal = parseFloat(receiveAmount.value);
  const hasAmount =
    (Number.isFinite(sendVal) && sendVal > 0) ||
    (Number.isFinite(receiveVal) && receiveVal > 0);
  sendBtn.disabled = !hasAmount;
}

function formatAmount(value) {
  return Number.isFinite(value)
    ? Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2)
    : "";
}

function updateReceiveFromSend() {
  const val = parseFloat(sendAmount.value);
  if (!Number.isFinite(val) || val === 0) {
    receiveAmount.value = "";
    return;
  }

  const receive = val / 1.01;
  receiveAmount.value = formatAmount(receive);
}

function updateSendFromReceive() {
  const val = parseFloat(receiveAmount.value);
  if (!Number.isFinite(val) || val === 0) {
    sendAmount.value = "";
    return;
  }

  const send = val * 1.01;
  sendAmount.value = formatAmount(send);
}

sendAmount.addEventListener("input", () => {
  if (amountSyncing) return;
  amountSyncing = true;
  updateReceiveFromSend();
  amountSyncing = false;
  updateSendButtonState();
});

receiveAmount.addEventListener("input", () => {
  if (amountSyncing) return;
  amountSyncing = true;
  updateSendFromReceive();
  amountSyncing = false;
  updateSendButtonState();
});

updateSendButtonState();

document.getElementById("sendBtn").addEventListener("click", () => {
  alert(
    `Simulated send of ${sendAmount.value || 0} to ${toName.textContent}.\n\nThis is a demo, no real money was sent.`
  );
});
