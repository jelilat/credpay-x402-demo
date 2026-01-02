import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { facilitator, settlePayment } from "thirdweb/x402";

export const runtime = "nodejs";

/**
 * GET /api/premium
 * Protected by x402.
 * If unpaid: returns 402 with payment instructions.
 * If paid: returns premium JSON.
 */
export async function GET(req: Request) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const payTo = process.env.API_PAYTO_WALLET;

  if (!secretKey) {
    return NextResponse.json({ error: "Missing THIRDWEB_SECRET_KEY" }, { status: 500 });
  }
  if (!payTo) {
    return NextResponse.json({ error: "Missing API_PAYTO_WALLET" }, { status: 500 });
  }

  const client = createThirdwebClient({ secretKey });

  // The facilitator is the server-side payment settlement helper.
  const x402Facilitator = facilitator({
    client,
    serverWalletAddress: payTo,
    waitUntil: "submitted",
  });

  const paymentData = req.headers.get("x-payment");

  const result = await settlePayment({
    resourceUrl: req.url,
    method: "GET",
    paymentData,
    payTo,
    network: baseSepolia,
    price: "$0.01",
    facilitator: x402Facilitator,
  });

  if (result.status === 200) {
    return NextResponse.json({
      ok: true,
      data: "Premium content unlocked ✅",
      ts: new Date().toISOString(),
    });
  }

  // Forward Thirdweb's 402 response and headers to the client
  const responseBody =
    typeof result.responseBody === "string"
      ? result.responseBody
      : JSON.stringify(result.responseBody ?? {});
  const res = new NextResponse(responseBody, { status: result.status });
  for (const [k, v] of Object.entries(result.responseHeaders ?? {})) {
    res.headers.set(k, String(v));
  }
  return res;

}
