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

  handleRequestError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }

    console.log(error.config);
  }

  // Get all the currencies metainfo.
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyInfo
  // @param {Object} options
  // @param {String} options.id
  // @param {String} options.slug
  // @param {Array}[String] options.symbol
  // @param {Array}[String] options.aux
  getCryptocurrencyInfo = async (options = {}) => {
    let response;

    try {
      const response = await axios.get(`${this.baseURL}/cryptocurrency/info`, {
        headers: this.deriveDefaultHeaders(),
        params: {
          id: options?.id,
          slug: options?.slug,
          symbol: options?.symbol?.join(","),
          aux: options?.aux?.join(","),
        },
      });
    } catch (error) {
      this.handleRequestError(error);
    }

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
    let response;

    try {
      response = await axios.get(`${this.baseURL}/cryptocurrency/map`, {
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
    } catch (error) {
      this.handleRequestError(error);
    }

    return response?.data;
  };

  // Get a list of all the cryptocurrencies' latest quotes.
  // https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyQuotesLatest
  // @param {Object} options
  // @param {Array}[String] options.symbol
  // @param {Array}[String] options.aux
  getCryptocurrencyQuotesLatest = async (options = {}) => {
    let response;

    try {
      response = await axios.get(
        `${this.baseURL}/cryptocurrency/quotes/latest`,
        {
          headers: this.deriveDefaultHeaders(),
          params: {
            symbol: options?.symbol?.join(","),
            aux: options?.aux?.join(","),
          },
        }
      );
    } catch (error) {
      this.handleRequestError(error);
    }

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
    let response;

    try {
      response = await axios.get(
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
    } catch (error) {
      this.handleRequestError(error);
    }

    return response?.data;
  };
}

module.exports = CoinMarketCapAPI;
