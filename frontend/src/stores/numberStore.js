// Pinia store for managing number state and API interactions

import { defineStore } from "pinia";
import axios from "axios";

// Setting up the default base URL for Axios HTTP requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const usenumberStore = defineStore("number", {
  // State: Represents starting data/state of the store
  state: () => ({
    number: 0,
  }),

  // Actions: Methods for performing operations that can include asynchronous tasks
  actions: {
    // Fetches the current number value from the server
    async fetchnumber() {
      try {
        const response = await axios.get("number");
        console.log("get number:", response.data.n);
        this.number = response.data.n;
      } catch (error) {
        console.error("Error fetching number:", error);
      }
    },

    // Increments the number value
    async increase() {
      try {
        const response = await axios.post("number", { n: "increase" });
        console.log("Increase number:", response.data.n);
        this.number = response.data.n;
      } catch (error) {
        console.error("Error Increase number:", error);
      }
    },

    // Decrements the number value
    async decrease() {
      try {
        const response = await axios.post("number", { n: "decrease" });
        console.log("decrease number:", response.data.n);
        this.number = response.data.n;
      } catch (error) {
        console.error("Error decrease number:", error);
      }
    },

    // Reset the number value
    async reset() {
      try {
        const response = await axios.post("number", { n: "reset" });
        console.log("Reset number:", response.data.n);
        this.number = response.data.n;
      } catch (error) {
        console.error("Error Reset number:", error);
      }
    },

    // Sets the number to a specific value
    async setnumber(newVal) {
      this.number = newVal;
      console.log("Websocket of number:", newVal);
    },
  },
});
