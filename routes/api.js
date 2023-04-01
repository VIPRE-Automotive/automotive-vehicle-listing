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
import ejs from 'ejs';
import ratelimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import path from 'path';
import { getActiveInventory, getActiveInventoryItem } from '../database/index.js';

const router = express.Router();
router.use(ratelimit({
  windowMs: 15 * 1000,
  max: 5
}));

/**
 * Root API directory
 *
 * @route GET /
 */
router.get('/', async (request, response) => {
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
router.get('/inventory', async (request, response) => {
  // Retrieve all inventory
  const inventory = await getActiveInventory() || [];

  response.status(200).json({
    status_code: 200,
    data: inventory,
    count: inventory.length,
    error: null,
  });
});

/**
 * Submit an interest form
 *
 * @route POST /interest
 */
router.post('/interest', async (request, response) => {
  // Validate StockNum
  const StockNum = parseInt(request.body.stocknum) || 0;
  if (Number.isNaN(StockNum) || StockNum <= 0) {
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
  const vehicle = await getActiveInventoryItem(StockNum, false) || [];
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
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const status = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: Email,
      bcc: process.env.COMPANY_EMAIL,
      subject: `Vehicle Interest - ${vehicle.ModelYear} ${vehicle.Make} ${vehicle.Model}`,
      html: template,
      text: "Your email provider does not support HTML content."
    }, null);

    response.status(200).json({
      status_code: 200,
      error: null,
    });
  } catch (e) {
    response.status(500).json({
      status_code: 500,
      error: "Internal Server Error",
    });
  };
});

// Export Router
export default router;
