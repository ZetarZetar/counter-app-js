<template>
  <div class="center">
    <div class="counter">{{ counter }}</div>
    <div class="buttons">
      <button class="button btn btn-secondary" @click="decrease">
        Decrease
      </button>
      <button class="button btn btn-primary" @click="increase">Increase</button>
    </div>
    <div class="notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="alert alert-info"
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary Vue and Pinia functionalities
import { onMounted, onUnmounted, computed, ref } from "vue";
import { useCounterStore } from "@/stores/counterStore";

export default {
  setup() {
    // Counter store and reactive properties setup
    const store = useCounterStore();
    const counter = computed(() => store.counter);
    const notifications = ref([]);
    let websocket = null;
    let reconnectInterval = null;
    const maxReconnectAttempts = 5;
    let reconnectAttempts = 0;

    onMounted(() => {
      // Fetch initial counter value and set up WebSocket on component mount
      store.fetchCounter();
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
          const newCounterValue = parseInt(event.data);
          if (!isNaN(newCounterValue)) {
            store.setCounter(newCounterValue);
            addNotification(event.data);
          } else {
            console.error("Received non-numeric counter value");
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
      counter,
      increase: store.increase,
      decrease: store.decrease,
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
  background: #181818;
  transition: color 0.5s, background-color 0.5s;
  display: flex;
  place-items: center;
  justify-content: center;
}

.counter {
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

.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
