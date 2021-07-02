// Node modules.
import axios from "axios";

class CoinAPI {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error("API key is required.");
    }

    this.apiKey = apiKey;
    this.isSandbox = options?.isSandbox || false;
  }

  deriveBaseURL() {
    if (this.isSandbox) {
      return `https://rest-sandbox.coinapi.io/${this.deriveVersion()}`;
    }

    return `https://rest.coinapi.io/${this.deriveVersion()}`;
  }

  deriveVersion() {
    return "v1";
  }

  deriveDefaultHeaders() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CoinAPI-Key": this.apiKey,
    };
  }

  getExchanges = async (exchangeIDs) => {
    const response = await axios.get(`${this.deriveBaseURL()}/exchanges`, {
      headers: this.deriveDefaultHeaders(),
      params: { filter_exchange_id: exchangeIDs?.join(",") },
    });

    return response?.data;
  };

  getExchangeIcons = async (iconSize) => {
    if (!iconSize) {
      throw new Error("Icon size is required.");
    }

    const response = await axios.get(
      `${this.deriveBaseURL()}/exchanges/icons/${iconSize}`,
      {
        headers: this.deriveDefaultHeaders(),
      }
    );

    return response?.data;
  };

  getAssets = async (assetIDs) => {
    const response = await axios.get(`${this.deriveBaseURL()}/assets`, {
      headers: this.deriveDefaultHeaders(),
      params: { filter_asset_id: assetIDs?.join(",") },
    });

    return response?.data;
  };

  getAssetIcons = async (iconSize) => {
    if (!iconSize) {
      throw new Error("Icon size is required.");
    }

    const response = await axios.get(
      `${this.deriveBaseURL()}/assets/icons/${iconSize}`,
      {
        headers: this.deriveDefaultHeaders(),
      }
    );

    return response?.data;
  };
}

export default CoinAPI;
