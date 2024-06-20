const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app.js");

dotenv.config({ path: `${__dirname}/config.env` });
const port = process.env.PORT ;
const DB = process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD);


mongoose
  .connect(`${DB}`)
  .then((con) => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Database connection failed");
  });

app.listen(port, "127.0.0.1", () => {
  console.log("Listening to port ");
});
