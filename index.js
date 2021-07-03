// Node modules.
require("dotenv").config();
const app = require("express")();
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const { CronJob } = require("cron");
// Relative imports.
const { cryptosController } = require("./controllers/cryptos");
const {
  clientErrorHandler,
  errorHandler,
  logErrors,
} = require("./utils/errorHandlers");
const {
  deriveDigestMessage,
  getCryptos,
  notifySlack,
} = require("./utils/helpers");

// Derive the config.
// ================
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const MAX_CRYPTOS_TO_NOTIFY = process.env.MAX_CRYPTOS_TO_NOTIFY || 10;
const PORT = process.env.PORT || 3001;
// ================

// Set up the CORS middleware.
app.use(cors());

// Set up the body parser middleware.
app.use(bodyParser.json());

// Define error handlers.
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Create endpoints.
app.get("/api/cryptos", cryptosController);

// Cron job helpers:
// ==============
const onExit = async (error) => {
  console.error(error);
  notifySlack("Exiting. Stopped cron job for ATH Diff.");
};

const onTick = async () => {
  const now = new Date();
  console.log("Fetching cryptos:", now);

  try {
    const cryptos = await getCryptos();
    const message = deriveDigestMessage(
      cryptos,
      MAX_CRYPTOS_TO_NOTIFY,
      BASE_URL
    );
    notifySlack(message);
  } catch (error) {
    console.error("Failed to get cryptos:", error);
    notifySlack(`Failed to get cryptos: ${error.message}`);
  }
};

const onComplete = async () => {
  const now = new Date();
  console.log("Completed cron job:", now);
  notifySlack("Completed cron job for ATH Diff.");
};
// ==============
// Cron job helpers END

// Start the server.
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  const EVERY_DAY_AT_9_AM = "0 9 * * *";
  const EVERY_2ND_MINUTE = "*/2 * * * *";

  // Start the cron job.
  new CronJob(
    // cronTime
    EVERY_2ND_MINUTE,
    // onTick
    onTick,
    // onComplete
    onComplete,
    // start
    true,
    // timezone
    "America/Denver",
    // context
    null,
    // runOnInit
    null
  );

  // Notify slack.
  notifySlack(
    `Starting cron job for crypto all-time-high vs. market price diffs! ⚙️\n\nThis will post a daily digest in this channel at 9am MST.`
  );
});
