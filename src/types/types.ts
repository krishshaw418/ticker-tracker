export interface Request {
  userid: number;
  tickermint: string;
  threshold: number;
}

export interface JupResponse {
  inAmount: number;
  outAmount: number;
}
