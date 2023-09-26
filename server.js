const app = require("./app");
const connectionDatabase = require("./config/database");
connectionDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(
    `server runing port:${process.env.PORT} in mode:${process.env.NODE_ENV}`
  );
});
//** HTTP GET Request  */
app.get("/", (req, res) => {
  res.status(200).json("Home GET Request");
});

process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log(`Shutting down the server due to unhandled rejection`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(`Error:${err.message}`);
  console.log(`Shutting down the server due to uncaught rejection`);
  server.close(() => {
    process.exit(1);
  });
});
