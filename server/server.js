import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import categoryRouter from "./routes/categoryRouter.js";

// app
const app = express();

// db
mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost/tree_data_structure",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());

// router
app.use("/api/category", categoryRouter);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

// port
const port = process.env.PORT || 8001;

app.listen(port, () => console.log(`Server is running on port ${port}`));
