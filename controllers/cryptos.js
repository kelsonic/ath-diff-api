// Relative imports.
const { getCryptos } = require("../utils/helpers");

// Create a new instance of the CoinMarketCapAPI class.
const coinMarketCapAPI = new CoinMarketCapAPI(
  process.env.COIN_MARKET_CAP_API_KEY
);

const cryptosController = async (req, res) => {
  // Log the request.
  console.log("request to /api/cryptos");

  // Retrieve the cryptos.
  const cryptos = await getCryptos(res);

  // Send the cryptos.
  res.send(cryptos);
};

module.exports = {
  cryptosController,
};
