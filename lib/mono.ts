const MONO_BASE = "https://api.withmono.com";

async function monoRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MONO_BASE}${path}`, {
    ...options,
    headers: {
      "mono-sec-key": process.env.MONO_SECRET_KEY!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Mono request failed");
  return data;
}

export async function exchangeToken(code: string) {
  return monoRequest("/account/auth", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function getAccountInfo(accountId: string) {
  return monoRequest(`/accounts/${accountId}`);
}

export async function getAccountBalance(accountId: string) {
  return monoRequest(`/accounts/${accountId}/balance`);
}
