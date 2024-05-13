import express from "express";
import { readdirSync } from "fs";
require("dotenv").config();

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));

//autoload Routes
readdirSync("./routes").map((r) => app.use("/", require(`./routes/${r}`)));

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
