import express, { type Request, type Response, type Express } from "express";

export const createServer = async (): Promise<Express> => {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "ok" });
  });

  return app;
};
