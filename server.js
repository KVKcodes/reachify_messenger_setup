import express from "express";
import mongoose from "mongoose";
import { readdirSync } from "fs";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import initWebRoutes from "./routes/message";
config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// middleware
app.use(express.urlencoded({ extended: true }));

// DATABASE Connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("database connected"))
  .catch((err) => console.log("DB connection error =>", err));

//autoload Routes
initWebRoutes(app);

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    console.log(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// listen app
const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`Server is running at port ${8000}`));
