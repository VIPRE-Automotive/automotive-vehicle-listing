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
import ratelimit from 'express-rate-limit';
import { getActiveInventory, getActiveInventoryItem } from '../database/index.js';

const router = express.Router();
router.use(ratelimit({
  windowMs: 15 * 1000,
  max: 5
}));

/**
 * Root directory
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  // Retrieve all inventory
  const inventory = await getActiveInventory() || [];

  // Send default response
  response.render('search', {
    env: process.env,
    context: {
      query: "All Vehicles"
    },
    inventory: inventory
  });
});

/**
 * Inventory View
 *
 * @author Alec M.
 * @date 2022-01-21
 */
router.get('/inventory/:StockNum', async (request, response) => {
  // Validation
  const StockNum = parseInt(request.params.StockNum) || 0;
  if (Number.isNaN(StockNum) || StockNum <= 0) {
    response.status(404).render('error', {});
    return;
  }

  // Retrieve inventory vehicle
  const vehicle = await getActiveInventoryItem(StockNum, true) || [];

  // Send default response
  response.render('listing', {
    env: process.env,
    context: {
      query: "",
      queryLink: "/",
    },
    vehicle: vehicle,
    recommendations: [], // TBD
  });
});

// Export Router
export default router;
