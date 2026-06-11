require("dotenv").config();
require("./src/config/env");
const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.error(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });
