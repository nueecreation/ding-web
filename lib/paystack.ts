const PAYSTACK_BASE = "https://api.paystack.co";

async function paystackRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Paystack request failed");
  return data;
}

export async function verifyBVN(bvn: string) {
  return paystackRequest(`/bank/resolve_bvn/${bvn}`);
}

export async function matchBVN(params: {
  bvn: string;
  accountNumber: string;
  bankCode: string;
}) {
  const query = new URLSearchParams({
    bvn: params.bvn,
    account_number: params.accountNumber,
    bank_code: params.bankCode,
  });
  return paystackRequest(`/bank/match_bvn?${query}`);
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

export async function verifyTransaction(reference: string) {
  return paystackRequest(`/transaction/verify/${reference}`);
}

export async function getBanks() {
  return paystackRequest("/bank?country=nigeria&perPage=100");
}
