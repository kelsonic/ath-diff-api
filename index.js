// Node modules.
require("dotenv").config();
const app = require("express")();
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const { isEmpty } = require("lodash");
// Relative imports.
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

// Create endpoints.
app.get("/api", (req, res) => {
  res.send("Welcome to ATH Diff's API!");
});

app.get("/api/cryptos", async (req, res) => {
  // Derive query params.
  const queryParams = {
    limit: req.query.limit,
    start: req.query.start,
    symbol: req.query.symbol,
  };

  let cryptocurrencyMapResponse = undefined;
  let cryptocurrencyInfoResponse = undefined;
  let pricePerformanceStatsResponse = undefined;
  let cryptos = [];

  // Make the request to CoinMarketCap to get top cryptocurrencies.
  try {
    cryptocurrencyMapResponse = await coinMarketCapAPI.getCryptocurrencyMap(
      queryParams
    );
    cryptos = [...cryptocurrencyMapResponse?.data];

    // Escape early if there are no cryptos.
    if (isEmpty(cryptos)) {
      return res.status(200).send([]);
    }

    // Derive a list of the crypto symbols.
    const symbols = cryptos.map((crypto) => crypto.symbol);

    // Make the request to CoinMarketCap to get the crypto info for each symbol.
    cryptocurrencyInfoResponse = await coinMarketCapAPI.getCryptocurrencyInfo({
      symbol: symbols,
    });
    cryptos = cryptos?.map((crypto) => {
      const cryptoInfo = cryptocurrencyInfoResponse?.data?.find(
        (info) => info.symbol === crypto.symbol
      );
      return Object.assign(crypto, cryptoInfo);
    });

    // Make the request to CoinMarketCap to get the crypto price performance stats for each symbol.
    pricePerformanceStatsResponse =
      await coinMarketCapAPI.getPricePerformanceStats({ symbol: symbols });
    cryptos = cryptos?.map((crypto) => {
      const pricePerformanceStats = pricePerformanceStatsResponse?.data?.find(
        (stats) => stats.symbol === crypto.symbol
      );
      return Object.assign(crypto, pricePerformanceStats);
    });
  } catch (error) {
    return res.status(500).send(error);
  }

  console.log("cryptos", cryptos);
  res.send(cryptos);
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
