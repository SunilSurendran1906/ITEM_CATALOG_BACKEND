const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "config/.env") });

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

const products = require("./routes/products");
const auth = require("./routes/auth");
const order = require("./routes/order");
const payment = require("./routes/payment");
// routers
app.use("/api/items/", products);
app.use("/api/auth/", auth);
app.use("/api/v1/", order);
app.use("/api/method/", payment);

app.use(errorMiddleware);
module.exports = app;
