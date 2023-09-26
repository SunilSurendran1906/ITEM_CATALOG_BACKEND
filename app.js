const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config({ path: "config/.env" });

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const products = require("./routes/products");
const auth = require("./routes/auth");
const order = require("./routes/order");
const payment = require("./routes/payment");
// routers
app.use("/api/items/", products);
app.use("/api/auth/", auth);
app.use("/api/v1/", order);
app.use("/api/method/", payment);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
  });
}

app.use(errorMiddleware);
module.exports = app;
