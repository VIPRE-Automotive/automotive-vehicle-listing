/*
 * Produced: Fri Jan 21 2022
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
import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dRef, set } from 'firebase/database';
import { getStorage, ref as sRef, uploadString } from "firebase/storage";
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';

dotenv.config();

const configuration = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Setup Handles
const firebase = initializeApp(configuration);

const generateImages = (count = 5) => {
  const images = [];

  for (let i = 0; i < count; i++) {
    images.push(faker.image.image(1280, 960, true));
  }

  return images;
};

/**
 * Generate N vehicle objects
 *
 * @param {number} [count]
 * @returns {object} { vehicles: [], years: Set, makes: Set }
 */
const generateVehicles = (count = 30) => {
  const vehicles = {};
  const yearMakeArray = [];

  for (let i = 0; i < count; i++) {
    const price = faker.finance.amount(10000, 50000, 0);
    const year = Math.floor(Math.random() * (2023 - 2008) + 2008);
    const make = faker.vehicle.manufacturer();
    const mpg = Math.floor(Math.random() * (40 - 11) + 11);
    const uuid = faker.datatype.uuid();

    // Add to vehicles array
    vehicles[uuid] = {
      StockNum: uuid,
      Sold: Math.random() < 0.2,
      ModelYear: year,
      Make: make,
      Model: faker.vehicle.model(),
      Trim: ["M", "SE", "S", "Sport", "Lariat", "LT"][Math.floor(Math.random() * 6)],
      Transmission: Math.random() < 0.5 ? "Automatic" : "Manual",
      Drivetrain: ["AWD", "FWD", "RWD"][Math.floor(Math.random() * 3)],
      Price: price,
      MSRP: (parseInt(price) + Math.floor(Math.random() * 5000) + 1000).toString(),
      VIN: faker.vehicle.vin(),
      IntColor: [
        faker.vehicle.color(),
        faker.color.rgb({ format: 'hex', casing: 'lower' })
      ],
      ExtColor: [
        faker.vehicle.color(),
        faker.color.rgb({ format: 'hex', casing: 'lower' })
      ],
      Owners: Math.floor(Math.random() * 3) + 1,
      EPA: {
        "City": mpg,
        "Highway": mpg + Math.floor(Math.random() * 5)
      },
      Odometer: Math.floor(Math.random() * 100000),
    };

    // Add to metadata sets
    yearMakeArray.push({ModelYear: year, Make: make});
  }

  return {
    vehicles,
    metadata: {
      Makes: yearMakeArray.reduce((acc, value) => {
        acc[value.Make] = (acc[value.Make] || 0) + 1;
        return acc;
      }, {}),
      ModelYears: yearMakeArray.reduce((acc, value) => {
        acc[value.ModelYear] = (acc[value.ModelYear] || 0) + 1;
        return acc;
      }, {}),
    }
  };
};

(async () => {
  // Generate Vehicles
  const database = getDatabase(firebase);
  const { vehicles, metadata } = generateVehicles();
  set(dRef(database, process.env.DATABASE_INVENTORY), vehicles);
  set(dRef(database, process.env.DATABASE_INVENTORY_METADATA), metadata);

  // Generate Images for Each Vehicle
  const storage = getStorage(firebase);
  Object.keys(vehicles).forEach((uuid) => {
    const images = generateImages(3);

    images.forEach(async (imageUrl, idx) => {
      console.log(`Uploading ${imageUrl}...`);

      const ref = sRef(storage, `${process.env.DATABASE_INVENTORY}/${uuid}/${idx}.jpg`);
      const dataUrl = await fetch(imageUrl)
        .then(r => r.buffer())
        .then(buffer => buffer.toString("base64"));

      uploadString(ref, `data:image/jpg;base64,${dataUrl}`, 'data_url', {
        contentType: 'image/jpg',
      });
    });
  });
})();
