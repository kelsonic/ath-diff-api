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
const { getCryptos, notifySlack } = require("./utils/helpers");

// Derive the config.
// ================
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
    const message = `*Daily Digest: ATH vs Current Price USD*\n\n${cryptos?.map(
      (crypto) =>
        `*${crypto?.name}* (${
          crypto?.symbol
        }):\nCurrent Price: ${crypto?.quote?.USD?.price?.toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: "USD",
          }
        )}\nAll Time High: ${crypto?.athPriceUSD?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}\nDifference: ${crypto?.athPriceDiffUSD?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}\nDifference Percentage: *${crypto?.athPriceDiffPercent?.toFixed(
          2
        )}%*\n\n`
    )}`;
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

  // Start the cron job.
  new CronJob(
    // cronTime
    `0 */${RETRY_MINUTE_INTERVAL} * * * *`,
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
    `Starting cron job for crypto all-time-high vs. market price diffs...`
  );
});
