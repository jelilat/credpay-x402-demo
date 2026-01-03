"use client";

import { useEffect, useState } from "react";

type Step = "idle" | "calling" | "blocked" | "paying" | "success" | "error";

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [credpaySucceeded, setCredpaySucceeded] = useState(false);
  const [payerAddress, setPayerAddress] = useState<string | null>(null);
  const [payerExplorerUrl, setPayerExplorerUrl] = useState<string | null>(null);

  const premiumUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/premium`;

  function log(msg: string) {
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  useEffect(() => {
    // Fetch public payer metadata for the "View transaction" link.
    (async () => {
      const res = await fetch("/api/credpay", { method: "GET" }).catch(() => null);
      if (!res || !res.ok) return;
      const data = (await res.json().catch(() => null)) as any;
      if (!data) return;
      if (typeof data.payerAddress === "string") setPayerAddress(data.payerAddress);
      if (typeof data.explorerUrl === "string") setPayerExplorerUrl(data.explorerUrl);
    })();
  }, []);

  async function callPremium() {
    setStep("calling");
    setResult(null);
    setChallenge(null);
    setCredpaySucceeded(false);
    log("Calling x402 protected API...");

    const res = await fetch("/api/premium");

    if (res.status === 402) {
      const text = await res.text();
      log("Got 402 Payment Required.");
      setChallenge(text);
      setStep("blocked");
      return;
    }

    if (!res.ok) {
      log(`Error calling API: ${res.status}`);
      setStep("error");
      return;
    }

    const data = await res.json();
    log("Got 200 OK.");
    setResult(data);
    setStep("success");
  }

  async function continueWithCredpay() {
    setStep("paying");
    setCredpaySucceeded(false);
    log("Requesting Credpay credit, paying x402, and retrying...");

    const res = await fetch("/api/credpay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: premiumUrl, method: "GET" }),
    });

    if (!res.ok) {
      const text = await res.text();
      log(`Credpay flow failed: ${res.status}`);
      setResult(text);
      setStep("error");
      return;
    }

    const data = await res.json();
    log("Success. Premium response returned.");
    setResult(data);
    setCredpaySucceeded(true);
    setStep("success");
  }

  return (
    <main style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas", padding: 32, maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Credpay x402 Demo</h1>
      <p style={{ marginTop: 8 }}>
        Hit a paywalled API, get a 402, then continue instantly using Credpay credit.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button
          onClick={callPremium}
          disabled={step === "calling" || step === "paying"}
          style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 10 }}
        >
          Call Premium API
        </button>

        <button
          onClick={continueWithCredpay}
          disabled={step !== "blocked"}
          style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 10 }}
        >
          Continue with Credpay
        </button>
      </div>

      {step === "blocked" && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f5c2c7", borderRadius: 12 }}>
          <div style={{ fontWeight: 700 }}>402 Payment Required</div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            This is the x402 challenge returned by the API:
          </div>
          <pre
            style={{
              marginTop: 10,
              whiteSpace: "pre-wrap",
              fontSize: 12,
              maxWidth: "100%",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {challenge}
          </pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontWeight: 700 }}>Result</div>
          {credpaySucceeded && payerExplorerUrl && (
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <a href={payerExplorerUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                View transaction
              </a>
              {payerAddress ? <span style={{ opacity: 0.75 }}> (payer: {payerAddress})</span> : null}
            </div>
          )}
          <pre
            style={{
              marginTop: 10,
              whiteSpace: "pre-wrap",
              fontSize: 12,
              maxWidth: "100%",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700 }}>Logs</div>
        <pre
          style={{
            marginTop: 10,
            whiteSpace: "pre-wrap",
            fontSize: 12,
            maxWidth: "100%",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {logs.join("\n")}
        </pre>
      </div>
    </main>
  );
}
