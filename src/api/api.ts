import { CurrentFeesResponseType, GetBTCPriceResponseType } from "./types";

async function fetchHandler(
  url: string,
  method = "GET",
  body?: Record<string, any>
) {
  const response = await fetch(url, {
    method: method,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response;
}

export class ApiClient {
  static async getCurrentBtcPrice() {
    const response = await fetchHandler(
      "https://mempool.space/api/v1/prices",
      "GET"
    );

    const data = (await response.json()) as GetBTCPriceResponseType;
    return data;
  }
  static async getCurrentFees() {
    const response = await fetchHandler(
      "https://mempool.space/api/v1/fees/recommended",
      "GET"
    );

    const data = await response.json();
    const high = data.fastestFee || 1;
    const medium = data.halfHourFee || 1;
    const low = data.hourFee || 1;
    return { high, medium, low } as CurrentFeesResponseType;
  }
}
