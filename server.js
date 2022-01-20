/*
 * Produced: Wed Jan 19 2022
 * Author: Alec M.
 * GitHub: https://amattu.com/links/github
 * Copyright: (C) 2022 Alec M.
 * License: License GNU Affero General Public License v3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Imports
import express from 'express';
import routes from './routes/index.js';
import dotenv from 'dotenv';

// Initialize express application
dotenv.config();
const app = express();
const PORT = process.env.SERVER_PORT || 3000;

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
(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Listening on: http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
