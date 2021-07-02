// Node modules.
require("dotenv").config();
const app = require("express")();
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const { isEmpty } = require("lodash");
// Relative imports.
const athPrices = require("./raw-data/athPrices.json");
const {
  logErrors,
  clientErrorHandler,
  errorHandler,
} = require("./utils/errorHandlers");
const CoinMarketCapAPI = require("./services/coinMarketCapAPI");

// Create a new instance of the CoinMarketCapAPI class.
const coinMarketCapAPI = new CoinMarketCapAPI(
  process.env.COIN_MARKET_CAP_API_KEY
);
const PORT = process.env.PORT || 3001;

// Set up the CORS middleware.
app.use(cors());

// Set up the body parser middleware.
app.use(bodyParser.json());

// Define error handlers.
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Create endpoints.
app.get("/api", (req, res) => {
  res.send("Welcome to ATH Diff's API!");
});

app.get("/api/cryptos", async (req, res) => {
  console.log("request to /api/cryptos");
  // Derive symbols.
  const symbols = athPrices?.map(({ symbol }) => symbol);

  let cryptocurrencyMapResponse = undefined;
  let cryptocurrencyInfoResponse = undefined;
  let getQuotesLatestResponse = undefined;
  let cryptos = athPrices;

  // Make the request to CoinMarketCap to get top cryptocurrencies.
  try {
    cryptocurrencyMapResponse = await coinMarketCapAPI.getCryptocurrencyMap({
      symbol: symbols,
    });
    cryptos = cryptos?.map((crypto) => {
      const cryptoInfo = cryptocurrencyMapResponse?.data?.find(
        (info) => info.symbol === crypto.symbol
      );
      return Object.assign(crypto, cryptoInfo);
    });

    // Escape early if there are no cryptos.
    if (isEmpty(cryptos)) {
      return res.status(200).send([]);
    }
  } catch (error) {
    console.log("Error in request to getCryptocurrencyMap");
    throw new Error(error);
    return res.status(500).send(error);
  }

  try {
    // Make the request to CoinMarketCap to get the crypto price performance stats for each symbol.
    getQuotesLatestResponse =
      await coinMarketCapAPI.getCryptocurrencyQuotesLatest({ symbol: symbols });
    cryptos = cryptos?.map((crypto) => {
      const getQuotesLatest = getQuotesLatestResponse?.data?.[crypto.symbol];
      return Object.assign(crypto, getQuotesLatest);
    });
  } catch (error) {
    console.log("Error in request to getCryptocurrencyQuotesLatest");
    throw new Error(error);
    return res.status(500).send(error);
  }

  // Format each crypto to include the ath price diff + % diff.
  const formattedCryptos = cryptos?.map((crypto) => {
    const athPriceDiffUSD = crypto?.athPriceUSD - crypto?.quote?.USD?.price;
    const athPriceDiffPercent =
      (crypto?.athPriceUSD / crypto?.quote?.USD?.price) * 100;

    const formattedCrypto = {
      ...crypto,
      athPriceDiffUSD,
      athPriceDiffPercent,
    };

    return formattedCrypto;
  });

  res.send(formattedCryptos);
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
