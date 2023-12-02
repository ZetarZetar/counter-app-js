// Pinia store for managing counter state and API interactions

import { defineStore } from "pinia";
import axios from "axios";

// Setting up the default base URL for Axios HTTP requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const useCounterStore = defineStore("counter", {
  // State: Represents starting data/state of the store
  state: () => ({
    counter: 0,
  }),

  // Actions: Methods for performing operations that can include asynchronous tasks
  actions: {
    // Fetches the current counter value from the server
    async fetchCounter() {
      try {
        const response = await axios.get("counter");
        console.log("get counter:", response.data.c);
        this.counter = response.data.c;
      } catch (error) {
        console.error("Error fetching counter:", error);
      }
    },

    // Increments the counter value
    async increase() {
      try {
        const response = await axios.post("counter", { c: "i" });
        console.log("post counter:", response.data.c);
        this.counter = response.data.c;
      } catch (error) {
        console.error("Error increasing counter:", error);
      }
    },

    // Decrements the counter value
    async decrease() {
      try {
        const response = await axios.post("counter", { c: "d" });
        console.log("post counter:", response.data.c);
        this.counter = response.data.c;
      } catch (error) {
        console.error("Error decreasing counter:", error);
      }
    },

    // Sets the counter to a specific value
    async setCounter(newVal) {
      this.counter = newVal;
      console.log("websockert counter:", newVal);
    },
  },
});
