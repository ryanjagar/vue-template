import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./routes";
import * as config from './config';
import { doHealthCheck } from "./utils/healthCheck";
import { configureAuthentication } from "./routes/auth"

const app = express();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(helmet());

// very basic CORS setup
app.use(cors({
  origin: config.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}));

configureAuthentication(app);

app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(res);
});

app.use("/api/user", userRouter);

let baseWebPath = "/web";

if (config.NODE_ENV !== "production")
  baseWebPath = "/dist/web";

// serves the static files generated by the front-end
app.use(express.static(__dirname + baseWebPath));

// if no other routes match, just send the front-end
app.use((req: Request, res: Response) => {
  res.sendFile(__dirname + baseWebPath + "/index.html")
})

app.listen(config.API_PORT, () => {
  console.log(`API listenting on port ${config.API_PORT}`);
});
