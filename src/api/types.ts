export type UtxoRequestParamWithAmount = {
  id: string;
  vout: number;
  amount: number;
};

export type Utxo = {
  amount: number;
  txid: string;
  vout: number;
};

export type CurrentFeesResponseType = {
  low: number;
  medium: number;
  high: number;
};

export type CreateTxFeeEstimationResponseType = {
  spendable: boolean;
  fee: number;
  psbt?: string; // base64 of psbt
};

export type GetBTCPriceResponseType = {
  time: number;
  USD: number;
  EUR: number;
  GBP: number;
  CAD: number;
  CHF: number;
  AUD: number;
  JPY: number;
};


