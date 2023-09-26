const mongoose = require("mongoose");

const connectionDatabase = () => {
  mongoose
    .connect(process.env.DB_LOCAL_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(`database is connected to host:${con.connection.host}`);
    });
};

module.exports = connectionDatabase;
