/* eslint-disable no-console */
import express from 'express';
import routes from './routes/index.js';
import config from './configuration.js';

// Initialize express application
const app = express();
const PORT = process.env.PORT || config.server_port;

// Set default options
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configure Endpoints
app.use(express.static("static"));
app.use("/", routes.main);
app.use("/api", routes.api);

// HTTP server function
(async function() {
  try {
    app.listen(PORT, () => {
      console.log(`Listening on: http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
