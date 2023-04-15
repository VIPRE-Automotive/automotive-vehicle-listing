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
import express, { Request, Response } from 'express';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import path from 'path';
import { Parser } from 'json2csv';
import {
  SortKeys,
  SortOrder,
  getInventory, getInventoryItem, getInventoryMeta
} from '../firebase/database.js';
import { getInventoryItemImages } from '../firebase/storage.js';
import { Conditions, Vehicle, InventoryRequestQuery } from '../types/global.js';
import { createTransport } from './utils.js';

const {
  APPLICATION_INVENTORY_URL,
  SEARCH_PAGINATION,
  COMPANY_NAME,
  COMPANY_ADDRESS_STREET,
  COMPANY_ADDRESS_CITY,
  COMPANY_ADDRESS_STATE,
  COMPANY_ADDRESS_ZIP,
  COMPANY_ADDRESS_COUNTRY,
  GOOGLE_LISTING_STORE_CODE,
  GOOGLE_LISTING_PLACE_ID,
} = process.env;

const router = express.Router();

/**
 * Root API directory
 *
 * @route GET /
 */
router.get('/', async (request: Request, response: Response) => {
  response.status(404).json({
    status_code: 404,
    data: null,
    error: "Not Found",
  });
});

/**
 * Retrieve all inventory
 *
 * @route GET /inventory
 */
router.get('/inventory', async (request: Request, response: Response) => {
  // Extract query parameters
  const {
    page: requestPage, sort: requestSortKey, order: requestSortOrder, limit: requestLimit,
    ModelYear: filterModelYear, Make: filterMake, Transmission: filterTransmission,
    Drivetrain: filterDrivetrain, Availability: filterAvailability,
  } = request.query as InventoryRequestQuery;

  // Parse query parameters
  const limit = parseInt(requestLimit) || parseInt(SEARCH_PAGINATION || "0");
  const page = parseInt(requestPage) || 1;
  const sort = Object.values(SortKeys).includes(requestSortKey) ? requestSortKey : SortKeys.MODEL_YEAR;
  const order = requestSortOrder === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;
  const modelYearFilter = filterModelYear ? filterModelYear.toString().split(",") : [];
  const makeFilter = filterMake ? filterMake.toString().split(",") : [];
  const availabilityFilter = filterAvailability === "Sold";

  // Create filter function
  const filterFunction = (e: Vehicle) => {
    if (modelYearFilter.length > 0 && !modelYearFilter.includes(e.ModelYear.toString())) return false;
    if (makeFilter.length > 0 && !makeFilter.includes(e.Make)) return false;
    if (filterTransmission && e.Transmission !== filterTransmission) return false;
    if (filterDrivetrain && e.Drivetrain !== filterDrivetrain) return false;
    if (filterAvailability && e.Sold !== availabilityFilter) return false;

    return true;
  };

  // Fetch inventory data
  const sortOptions = { key: sort, order };
  const paginationLimit = limit > 0 && limit <= (parseInt(SEARCH_PAGINATION || "0") * 2) ? limit : parseInt(SEARCH_PAGINATION || "0");
  const paginationOptions = { limit: paginationLimit, offset: (page - 1) * paginationLimit };
  const { data, count } = await getInventory(sortOptions, filterFunction, paginationOptions) || { data: [], count: 0 };
  const dataWithExtras = await Promise.all(data.map(async (item: any) => {
    return {
      ...item,
      link: `${process.env.APPLICATION_INVENTORY_URL}/${item.StockNum}`,
      Images: await getInventoryItemImages(item.StockNum, 1),
    };
  }));

  response.set("Access-Control-Allow-Origin", "*")
  response.status(200).json({
    status_code: 200,
    data: dataWithExtras,
    count: count,
    error: null,
  });
});

router.get('/google-feed', async (request: Request, response: Response) => {
  // Retrieve all inventory
  const { data } = await getInventory() || { data: [] };
  const dataWithImages = await Promise.all(data.map(async (e) => {
    return { ...e, Images: await getInventoryItemImages(e.StockNum, 1) }
  }));

  const parser = new Parser({
    fields: [
      { label: "vin", value: "VIN" },
      { label: "id", value: "StockNum" },
      { label: "store_code", value: () => GOOGLE_LISTING_STORE_CODE },
      { label: "place_id", value: () => GOOGLE_LISTING_PLACE_ID },
      { label: "dealership_name", value: () => COMPANY_NAME },
      { label: "dealership_address", value: () => `${COMPANY_ADDRESS_STREET}, ${COMPANY_ADDRESS_CITY}, ${COMPANY_ADDRESS_STATE} ${COMPANY_ADDRESS_ZIP}, ${COMPANY_ADDRESS_COUNTRY}`},
      { label: "image_link", value: "Images.0.url" },
      { label: "link", value: (r: Vehicle) => `${APPLICATION_INVENTORY_URL}/${r.StockNum}` },
      { label: "price", value: (r: Vehicle) => parseFloat(r.Price).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) },
      { label: "condition", value: "Condition", default: Conditions.New },
      { label: "make", value: "Make" },
      { label: "model", value: "Model" },
      { label: "trim", value: "Trim" },
      { label: "year", value: "Year" },
      { label: "mileage", value: (r: Vehicle) => (Math.round(Number(r.Odometer) / 100) * 100).toLocaleString() },
      { label: "exterior_color", value: "ExtColor.0" },
      { label: "interior_color", value: "IntColor.0" },
      { label: "body_style", value: "BodyStyle" },
      { label: "vehicle_option", value: (r: Vehicle) => r.Options?.join(", ") },
      { label: "drive_train", value: "DriveTrain"},
      { label: "engine", value: "Engine" },
      { label: "fuel", value: "FuelType" },
      { label: "transmission", value: "Transmission" },
    ],
    header: true,
  });

  response.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.set('Content-Type', 'text/csv');
  response.set('Content-Disposition', 'attachment; filename="feed.csv"');
  response.status(200).send(parser.parse(dataWithImages));
});

/**
 * Retrieve all inventory metadata
 *
 * @route GET /inventory/metadata
 */
router.get('/inventory/metadata', async (request: Request, response: Response) => {
  // Retrieve all inventory metadata
  const data = await getInventoryMeta() || {};

  response.status(200).json({
    status_code: 200,
    data: data,
    error: null,
  });
});

/**
 * Submit an interest form
 *
 * @route POST /interest
 */
router.post('/interest', async (request: Request, response: Response) => {
  // Validate StockNum
  const StockNum = request.body.stocknum;
  if (!StockNum || StockNum.length <= 0) {
    response.status(400).json({
      status_code: 400,
      error: "Invalid stock number",
    });
    return;
  }

  // Check if the email is valid
  const Email = request.body.email || "";
  if (!Email || Email.indexOf("@") === -1) {
    response.status(400).json({
      status_code: 400,
      error: "Invalid email provided",
    });
    return;
  }

  // Check if name is valid
  const FullName = request.body.fullname || "";
  if (!FullName || FullName.indexOf(" ") === -1) {
    response.status(400).json({
      status_code: 400,
      error: "Invalid name provided",
    });
    return;
  }

  // Check if vehicle exists
  const vehicle = await getInventoryItem(StockNum, false);
  if (!vehicle) {
    response.status(400).json({
      status_code: 400,
      error: "Vehicle does not exist",
    });
    return;
  }

  // Build Email and Template
  try {
    const template = await ejs.renderFile(path.resolve() + "/views/email.ejs", {
      env: process.env,
      vehicle: vehicle,
      request: request.body,
    });

    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: Email,
      bcc: process.env.COMPANY_EMAIL,
      subject: `Vehicle Interest - ${vehicle.ModelYear} ${vehicle.Make} ${vehicle.Model}`,
      html: template,
      text: "Your email provider does not support HTML content."
    });
  } catch (e) {
    response.status(500).json({
      status_code: 500,
      error: "Internal Server Error",
    });
  };

  response.status(200).json({
    status_code: 200,
    error: null,
  });
});

export default router;
