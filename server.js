/* eslint-disable no-console */
import express from 'express';
import routes from './routes/index.js';

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3000;

// Set default options
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure Endpoints
app.use("/", routes.main);
app.use("/api", routes.api);

// HTTP server function
async function httpServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Listening on: http//localhost:${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
}

// Run HTTP server
httpServer();
