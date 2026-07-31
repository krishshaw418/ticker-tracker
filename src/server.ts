import express, { type Request, type Response } from "express";

export const createServer = async () => {
  const app = express();

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "ok" });
  });

  return app;
};
