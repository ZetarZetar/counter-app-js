# Simple counter application
Simple counter application written in JavaScript. Frontend shows counter value and two buttons to incerease and decrease counter value. On value change notifications appear.

## Traefik
- Proxy

## Frontend
- Vue.js and Pinia
- Nginx

## Backend app
- Store conter value in Redis
- On each value change post event to RabbitMQ with new counter value
- Connects to counting logic plugin over gRPC

## Plugin incdec
- Simple logic to increase or decrease conitr value

## Notifications
- Provide websocket endpoint for frontend
- Serve counter updates from RabbitMQ to frontend 

## Commands
You could start eacj service manually in dev mode by running npm run dev in each service directory. Don't forget to install node packets for each service with 'npm ci' command.

Or you could use Docker Compose to start everything in production mode, the same way it will be on the server after deploy.
- Check that Docker engine is running with 'docker ps' (show list of running containers) command.
- Run 'docker compose -f docker-compose.local.yml up --build'
- Go to 'http://counter.localhost/' in your browser