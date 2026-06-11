const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/error.middleware");

const userRoutes = require("./routes/user.routes");
const walletRoutes = require("./routes/wallet.routes");
const reportRoutes = require("./routes/report.routes");
const swaggerSpec = require("./config/swagger");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", userRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;
