# Credpay x402 Demo

[Credpay](https://www.credpay.xyz) is a zero-interest crypto credit layer that lets you access real-world spending without liquidating your assets.

This repository illustrates how an app or agent can continue execution when it hits a 402 Payment Required, without holding funds upfront, by getting on-demand credit from Credpay.

## What This Demo Shows

- A paywalled API protected using x402

- A Credpay backend that:

    - intercepts 402 Payment Required

    - pays on-demand using a server wallet

    - retries the request automatically

- A frontend that demonstrates:

    - hitting a paywall

    - continuing execution via Credpay

    - successful access to premium content

## Architecture Overview
```
Client / Agent
     |
     | hits x402 API
     v
Paywalled API (/api/premium)
     |
     | 402 Payment Required
     v
Credpay Gateway (/api/credpay/fetch)
     |
     | calls Thirdweb hosted x402 fetch
     | (pays from Credpay server wallet)
     v
Thirdweb x402 Facilitator
     |
     | settles payment onchain
     v
Paywalled API (retried)
     |
     | 200 OK
     v
Client continues execution
```

## Tech Stack

- Next.js (App Router)

- Thirdweb x402

- Base Sepolia

- ngrok (for local development)

## Setup

1. Install dependencies
```
npm install
```

2. Environment variables

Create a `.env.local` file:

```
CREDPAY_PAYER_WALLET=YOUR_CREDPAY_PAYER_WALLET
API_PAYTO_WALLET=YOUR_API_PAYTO_WALLET
WEBSITE_URL=YOUR_NGROK_URL
THIRDWEB_SECRET_KEY=YOUR_THIRDWEB_SECRET_KEY
```

Notes:

`CREDPAY_PAYER_WALLET` must be a wallet registered in your Thirdweb project

The wallet must have funds on Base Sepolia

3. Run the app
```
npm run dev
```

4. Expose the app publicly

Thirdweb must be able to reach your API.
```
npx ngrok http 3000
```

Use the generated HTTPS URL when calling Credpay.

## API Endpoints

`GET /api/premium`

- A paywalled API endpoint.

- Returns 402 Payment Required if unpaid

- Uses x402 settlement via Thirdweb

- Returns 200 OK once payment is verified

`POST /api/credpay`

- Credpay gateway that sponsors x402 payments.

Body:

```json
{
  "url": "https://your-public-url/api/premium",
  "method": "GET"
}
```

- Detects 402 responses

- Pays using Credpay’s server wallet

- Retries the request

- Returns the final response

## Disclaimer

This repository is a demo. It does not represent production credit logic, scoring, or repayment enforcement.