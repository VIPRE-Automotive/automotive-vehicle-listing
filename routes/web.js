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
import { cache } from './utils.js';
import {
  getActiveInventory, getActiveInventoryItem,
  getActiveInventoryMeta,
  getInventoryItemImages,
  getInventoryRecommendations, searchActiveInventory
} from '../database/index.js';

const router = express.Router();
router.use(ratelimit({
  windowMs: 15 * 1000,
  max: 5
}));

const {
  APPLICATION_URL = "",
  SEARCH_PAGINATION,
} = process.env;

/**
 * Root Search View
 *
 * @author Alec M.
 */
router.get('/', async (request, response) => {
  const {
    view: requestCardView, page: requestPage, sort: requestSortKey,
    order: requestSortOrder, ModelYear: filterModelYear, Make: filterMake,
    Transmission: filterTransmission, Drivetrain: filterDrivetrain, Availability: filterAvailability,
  } = request.query;
  const cardView = ["card", "list"].includes(requestCardView) ? requestCardView : "card"
  const page = parseInt(requestPage) || 1;
  const sort = ["ModelYear", "Make", "Odometer", "Price"].includes(requestSortKey) ? requestSortKey : null;
  const order = ["asc", "desc"].includes(requestSortOrder) ? requestSortOrder : null;
  const modelYearFilter = filterModelYear ? filterModelYear.toString().split(",") : [];
  const makeFilter = filterMake ? filterMake.toString().split(",") : [];
  const availabilityFilter = filterAvailability === "Sold";

  const url = new URL(APPLICATION_URL);
  if (cardView) url.searchParams.append("view", cardView);
  if (sort) url.searchParams.append("sort", sort);

  const appliedFilters = [];
  if (modelYearFilter.length > 0) {
    appliedFilters.push({key: "ModelYear", value: `Year: ${modelYearFilter.join(", ")}`, raw: modelYearFilter});
    url.searchParams.set("ModelYear", modelYearFilter.join(","));
  }
  if (makeFilter.length > 0) {
    appliedFilters.push({key: "Make", value: `Make: ${makeFilter.join(", ")}`, raw: makeFilter});
    url.searchParams.set("Make", makeFilter.join(","));
  }
  if (filterTransmission) {
    appliedFilters.push({key: "Transmission", value: `Transmission: ${filterTransmission}`, raw: filterTransmission});
    url.searchParams.set("Transmission", filterTransmission);
  }
  if (filterDrivetrain) {
    appliedFilters.push({key: "Drivetrain", value: `Drivetrain: ${filterDrivetrain}`, raw: filterDrivetrain});
    url.searchParams.set("Drivetrain", filterDrivetrain);
  }
  if (filterAvailability) {
    appliedFilters.push({key: "Availability", value: `Availability: ${filterAvailability}`, raw: filterAvailability});
    url.searchParams.set("Availability", filterAvailability);
  }

  const inventoryMetadata = await getActiveInventoryMeta();
  const {
    data = [], count, pages = 0,
  } = await getActiveInventory(
    {key: sort, order},
    (e) => {
      if (modelYearFilter.length > 0 && !modelYearFilter.includes(e.ModelYear.toString())) return false;
      if (makeFilter.length > 0 && !makeFilter.includes(e.Make)) return false;
      if (filterTransmission && e.Transmission !== filterTransmission) return false;
      if (filterDrivetrain && e.Drivetrain !== filterDrivetrain) return false;
      if (filterAvailability && e.Sold !== availabilityFilter) return false;

      return true;
    },
    {limit: SEARCH_PAGINATION, offset: (page-1) * SEARCH_PAGINATION}
  ) || {};

  const dataWithImages = await Promise.all(data.map(async (e) => {
    return {
      ...e,
      Images: await getInventoryItemImages(e.StockNum, 1),
    }
  }));

  const pagination = [];
  for (let i = 1; i <= pages; i++) {
    url.searchParams.set("page", i.toString());
    pagination.push({
      page: i,
      url: url.toString(),
      current: i === page,
    });
  }

  const oppositeView = cardView === "card" ? "list" : "card";
  url.searchParams.set("page", page.toString());
  url.searchParams.set("view", oppositeView);

  response.render('search', {
    env: process.env,
    context: {
      query: "All Vehicles",
      filters: appliedFilters,
      sort: sort,
      cardView: cardView,
      oppositeViewUrl: url.toString(),
      page: page,
      pages: pages,
      pagination: pagination,
      prevUrl: page > 1 && pagination[page-2] ? pagination[page-2].url : null,
      nextUrl: page < pages && pagination[page] ? pagination[page].url : null,
      count: count,
    },
    inventory: dataWithImages,
    inventoryMetadata: inventoryMetadata,
  });
});

/**
 * Inventory View
 *
 * @author Alec M.
 */
router.get('/inventory/:StockNum', cache(100), async (request, response) => {
  const { referer = "" } = request.headers;
  const { StockNum } = request.params;

  // Retrieve inventory vehicle
  const vehicle = await getActiveInventoryItem(StockNum, true);

  const { data: recommendations = [] } = await getInventoryRecommendations(StockNum) || {};
  const recommendationsWithImages = await Promise.all(recommendations.map(async (e) => {
    return {
      ...e,
      Images: await getInventoryItemImages(e.StockNum, 1),
    }
  }));

  if (!vehicle || vehicle.StockNum !== StockNum) {
    response.status(404).render('error', {});
    return;
  }

  response.render('listing', {
    env: process.env,
    context: {
      query: "",
      back: referer.indexOf(APPLICATION_URL) !== -1 ? referer : "/",
    },
    vehicle: vehicle,
    recommendations: recommendationsWithImages,
  });
});


/**
 * Text search query for vehicles
 *
 * @author Alec M.
 */
router.get('/search/:query', cache(100), async (request, response) => {
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
