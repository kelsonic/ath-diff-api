// Relative imports.
const { getCryptos } = require("../utils/helpers");

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
