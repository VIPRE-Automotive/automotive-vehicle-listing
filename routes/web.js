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
import { URL } from 'url';
import {
  getActiveInventory, getActiveInventoryItem,
  getInventoryRecommendations, searchActiveInventory
} from '../database/index.js';

const router = express.Router();
router.use(ratelimit({
  windowMs: 15 * 1000,
  max: 5
}));

/**
 * Root Search View
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  const {
    view: requestCardView,
    page: requestPage,
  } = request.query;
  const cardView = ["card", "list"].includes(requestCardView) ? requestCardView : "card"
  const page = parseInt(requestPage) || 1;

  const {
    APPLICATION_URL = "",
    SEARCH_PAGINATION,
  } = process.env;

  const {
    data,
    count,
    pages,
  } = await getActiveInventory(SEARCH_PAGINATION, (page-1) * SEARCH_PAGINATION) || [];

  const url = new URL(APPLICATION_URL);
  url.searchParams.append("view", cardView);

  const pagination = [];
  for (let i = 1; i <= pages; i++) {
    url.searchParams.set("page", i);
    pagination.push({
      page: i,
      url: url.toString(),
      current: i === page,
    });
  }

  const oppositeView = cardView === "card" ? "list" : "card";
  url.searchParams.set("page", page);
  url.searchParams.set("view", oppositeView);

  response.render('search', {
    env: process.env,
    context: {
      query: "All Vehicles",
      filters: ["Year (All)", "Make (BMW)", "Transmission (A/T)"],
      cardView: cardView,
      oppositeViewUrl: url.toString(),
      page: page,
      pages: pages,
      pagination: pagination,
      prevUrl: page > 1 && pagination[page-2] ? pagination[page-2].url : null,
      nextUrl: page < pages && pagination[page] ? pagination[page].url : null,
      count: count,
    },
    inventory: data
  });
});

/**
 * Inventory View
 *
 * @author Alec M.
 */
router.get('/inventory/:StockNum', async (request, response) => {
  const { referer = "" } = request.headers;
  const { APPLICATION_URL = "" } = process.env;

  // Validation
  const StockNum = parseInt(request.params.StockNum) || 0;
  if (Number.isNaN(StockNum) || StockNum <= 0) {
    response.status(404).render('error', {});
    return;
  }

  // Retrieve inventory vehicle
  const vehicle = await getActiveInventoryItem(StockNum, true) || [];
  const { data: recommendations } = await getInventoryRecommendations(StockNum) || [];

  response.render('listing', {
    env: process.env,
    context: {
      query: "",
      back: referer.indexOf(APPLICATION_URL) !== -1 ? referer : "/",
    },
    vehicle: vehicle,
    recommendations: recommendations,
  });
});


/**
 * Text search query for vehicles
 *
 * @author Alec M.
 */
router.get('/search/:query', async (request, response) => {
  const { query = "" } = request.params;
  let vehicles = [];

  if (query.trim() !== "") {
    vehicles = await searchActiveInventory(query) || [];
  }

  // Render response
  response.render('partials/navigationSearchResults', {
    env: process.env,
    vehicles: vehicles,
  });
});

export default router;
