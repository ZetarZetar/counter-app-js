<template>
  <div class="center">
    <div class="number">{{ number }}</div>

    <table class="buttons">
      <tr>
        <td>
          <button class="button btn btn-orange" @click="decrease">
            Decrease
          </button>
        </td>
        <td>
          <button class="button btn btn-green" @click="increase">
            Increase
          </button>
        </td>
        <td>
          <button class="button btn btn-danger" @click="reset">
            Reset
          </button>
        </td>
      </tr>
    </table>

    <div class="notifications">
      <table>
        <tr v-for="notification in notifications" :key="notification.id">
          <td class="alert alert-info">{{ notification.message }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
// Importing necessary Vue and Pinia functionalities
import { onMounted, onUnmounted, computed, ref } from "vue";
import { usenumberStore } from "@/stores/numberStore";

export default {
  setup() {
    // number store and reactive properties setup
    const store = usenumberStore();
    const number = computed(() => store.number);
    const notifications = ref([]);
    let websocket = null;
    let reconnectInterval = null;
    const maxReconnectAttempts = 5;
    let reconnectAttempts = 0;

    onMounted(() => {
      // Fetch initial number value and set up WebSocket on component mount
      store.fetchnumber();
      setupWebSocket();
    });

    onUnmounted(() => {
      // Clean up WebSocket connection on component unmount
      if (websocket) {
        websocket.close();
      }
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    });

    // Sets up WebSocket connection with the server
    function setupWebSocket() {
      websocket = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts = 0;
        startHeartbeat();
      };

      websocket.onmessage = (event) => {
        try {
          const newnumberValue = parseInt(event.data);
          if (!isNaN(newnumberValue)) {
            store.setnumber(newnumberValue);
            addNotification(event.data);
          } else {
            console.error("Received non-numeric number value");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        attemptReconnect();
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error: ", error);
        websocket.close();
      };
    }

    // Sends a ping message at regular intervals to keep WebSocket connection alive
    function startHeartbeat() {
      setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send("ping");
        }
      }, 30000); // Send a ping every 30 seconds
    }

    // Attempts to reconnect to WebSocket server if the connection is lost
    function attemptReconnect() {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectInterval = setTimeout(() => {
          console.log(
            `Attempting WebSocket reconnect (${
              reconnectAttempts + 1
            }/${maxReconnectAttempts})`
          );
          setupWebSocket();
          reconnectAttempts++;
        }, 3000); // Attempt to reconnect every 3 seconds
      }
    }

    // Adds a new notification message
    function addNotification(message) {
      const id = Date.now();
      notifications.value.push({ id, message });
      setTimeout(() => {
        notifications.value = notifications.value.filter(
          (notification) => notification.id !== id
        );
      }, 2000); // Remove notification after 2 seconds
    }

    // Exposing properties and methods to the template
    return {
      number,
      increase: store.increase,
      decrease: store.decrease,
      reset: store.reset, // connect to gRPC plugin reset method
      notifications,
    };
  },
};
</script>

<style>
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#app {
  color: #ffffff;
  background: #191970;
  transition: color 0.5s, background-color 0.5s;
  display: flex;
  place-items: center;
  justify-content: center;
}

.number {
  text-align: center;
  font-size: 10rem;
}

.buttons {
  display: flex;
  justify-content: center;
}

.button {
  margin: 0 1rem;
}

.buttons {
  margin-top: 1rem; /* Add some margin between number and buttons */
}

.buttons button {
  margin: 0; /* Remove margin on individual buttons */
}

.notifications {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    margin-top: 1rem;
  }

  .notifications table {
    display: flex;
    flex-direction: row; /* Display notifications horizontally */
    gap: 0.5rem; /* Add some space between notifications */
  }

  .notifications td {
    padding: 0.5rem;
    border: none; /* Remove the border */
    background-color: grey; /* Set the background color to green */
    color: white; /* Set the text color to white */
    border-radius: 4px; /* Optional: Add border-radius for rounded corners */
  }

  .button.btn-orange {
    background-color: orange; /* Set the background color for the "Decrease" button */
    color: white; /* Set the text color for the "Decrease" button */
  }

  .button.btn-green {
    background-color: green; /* Set the background color for the "Increase" button */
    color: white; /* Set the text color for the "Increase" button */
  }

  .button.btn-danger {
    background-color: red; /* Set the background color for the "Reset" button */
    color: white; /* Set the text color for the "Reset" button */
  }
</style>
