// Node modules.
const axios = require("axios");

class CoinMarketCapAPI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("CoinMarketCap API key is required.");
    }

    this.apiKey = apiKey;
    this.baseURL = "https://pro-api.coinmarketcap.com/v1";
  }

  deriveDefaultHeaders() {
    return {
      "Accept-Encoding": "gzip, deflate",
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CMC_PRO_API_KEY": this.apiKey,
    };
  }

  // Get all the currencies metainfo.
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyInfo
  // @param {Object} options
  // @param {String} options.id
  // @param {String} options.slug
  // @param {Array}[String] options.symbol
  // @param {Array}[String] options.aux
  getCryptocurrencyInfo = async (options = {}) => {
    const response = await axios.get(`${this.baseURL}/cryptocurrency/info`, {
      headers: this.deriveDefaultHeaders(),
      params: {
        id: options?.id,
        slug: options?.slug,
        symbol: options?.symbol?.join(","),
        aux: options?.aux?.join(","),
      },
    });

    return response?.data;
  };

  // Get a list of all the cryptocurrencies.
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyMap
  // @param {Object} options
  // @param {String} options.listingStatus
  // @param {Number} options.start
  // @param {Number} options.limit
  // @param {String} options.sort
  // @param {Array}[String] options.symbol
  // @param {Array}[String] options.aux
  getCryptocurrencyMap = async (options = {}) => {
    const response = await axios.get(`${this.baseURL}/cryptocurrency/map`, {
      headers: this.deriveDefaultHeaders(),
      params: {
        listing_status: options?.listingStatus,
        start: options?.start,
        limit: options?.limit,
        sort: options?.sort,
        symbol: options?.symbol?.join(","),
        aux: options?.aux?.join(","),
      },
    });

    return response?.data;
  };

  // Get a list of price performance stats for a list of cryptocurrencies.
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyPriceperformancestatsLatest
  // @param {Object} options
  // @param {String} options.id
  // @param {String} options.slug
  // @param {Array}[String] options.symbol
  // @param {String} options.timePeriod
  // @param {String} options.convert
  // @param {String} options.convertID
  // @param {Boolean} options.skipInvalid
  getPricePerformanceStats = async (options = {}) => {
    const response = await axios.get(
      `${this.baseURL}/cryptocurrency/price-performance-stats/latest`,
      {
        headers: this.deriveDefaultHeaders(),
        params: {
          id: options?.id,
          slug: options?.slug,
          symbol: options?.symbol?.join(","),
          time_period: options?.timePeriod,
          convert: options?.convert,
          convert_id: options?.convertID,
          skip_invalid: options?.skipInvalid,
        },
      }
    );

    return response?.data;
  };
}

module.exports = CoinMarketCapAPI;
