// Node modules.
const axios = require("axios");
const { orderBy, isEmpty, take, shuffle } = require("lodash");
// Relative imports.
const athPrices = require("../raw-data/athPrices.json");
const CoinMarketCapAPI = require("../services/coinMarketCapAPI");

const coinMarketCapAPI = new CoinMarketCapAPI(
  process.env.COIN_MARKET_CAP_API_KEY
);

const deriveDigestMessage = (cryptos, MAX_CRYPTOS_TO_NOTIFY, BASE_URL) => {
  return `*Daily Crypto Digest: ATH vs Current Price* (${new Date().toLocaleDateString()})\n\n${take(
    orderBy(shuffle(cryptos), "athPriceDiffPercent", "desc"),
    MAX_CRYPTOS_TO_NOTIFY
  )
    ?.map(
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
        })}\nDifference Percentage: *${crypto?.athPriceDiffPercent
          ?.toFixed(2)
          ?.toLocaleString("en-US")}%*`
    )
    ?.join(
      "\n\n"
    )}\n\n\nWant to see more than ${MAX_CRYPTOS_TO_NOTIFY}? <${BASE_URL}/api/cryptos|View the full list of cryptos and their diffs here! 🚀💸🚀>`;
};

const notifySlack = async (message) => {
  // Log the message.
  console.log(message);

  // Escape early if we shouldn't explicitly notify slack or there is no slack webhook.
  if (process.env.NOTIFY_SLACK !== "true" || !process.env.SLACK_HOOK_URL) {
    return;
  }

  // Notify slack.
  await axios.post(process.env.SLACK_HOOK_URL, {
    text: message,
  });
};

const getCryptos = async (res) => {
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
      return res ? res.status(200).send([]) : [];
    }
  } catch (error) {
    console.log("Error in request to getCryptocurrencyMap");
    throw new Error(error);
    return res ? res.status(500).send(error) : [];
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
    return res ? res.status(500).send(error) : [];
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

  return formattedCryptos;
};

module.exports = { deriveDigestMessage, getCryptos, notifySlack };
