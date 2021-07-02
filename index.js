// Node modules.
require("dotenv").config();
const app = require("express")();
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
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
    listing_status: req.query.listing_status,
    start: req.query.start,
    limit: req.query.limit,
    sort: req.query.sort,
    symbol: req.query.symbol,
    aux: req.query.aux,
  };

  // Make the request to CoinMarketCap to get top cryptocurrencies.
  const response = await coinMarketCapAPI.getCryptocurrencyMap(queryParams);
  const cryptos = response?.data;

  console.log("cryptos", cryptos);
  res.send(cryptos);
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
