import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/credpay
 * Body: { url: string, method?: "GET" | "POST" ... }
 *
 * Credpay pays an x402 endpoint on behalf of the requester using thirdweb's x402 fetch API.
 * This is the "instant credit" behaviour for the demo.
 */
export async function POST(req: Request) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const fromWallet = process.env.CREDPAY_PAYER_WALLET;
  const websiteUrl = process.env.WEBSITE_URL;

  if (!secretKey) {
    return NextResponse.json({ error: "Missing THIRDWEB_SECRET_KEY" }, { status: 500 });
  }
  if (!fromWallet) {
    return NextResponse.json({ error: "Missing CREDPAY_PAYER_WALLET" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const url = body?.url as string | undefined;
  const method = (body?.method as string | undefined)?.toUpperCase() || "GET";

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // TODO: Check if user is eligible for credit

  // Thirdweb Hosted x402 fetch:
  // It handles: detect 402 → pay → retry → return final response
  const thirdwebUrl = new URL("https://api.thirdweb.com/v1/payments/x402/fetch");
  thirdwebUrl.searchParams.set("from", fromWallet);
  thirdwebUrl.searchParams.set("url", `${websiteUrl}/api/premium`);
  thirdwebUrl.searchParams.set("method", method);

  const upstream = await fetch(thirdwebUrl.toString(), {
    method: "POST",
    headers: {
      "x-secret-key": secretKey,
    },
  });

  const contentType = upstream.headers.get("content-type") || "";
  const status = upstream.status;

  if (contentType.includes("application/json")) {
    const json = await upstream.json();
    return NextResponse.json(json, { status });
  }

  const text = await upstream.text();
  return new NextResponse(text, { status });
}
