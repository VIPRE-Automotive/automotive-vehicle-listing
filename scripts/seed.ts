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

import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dRef, set } from 'firebase/database';
import { getStorage, ref as sRef, uploadString } from "firebase/storage";
import { faker } from '@faker-js/faker';
import { Drivetrains, Vehicle } from '../types/global';
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

interface GeneratedVehicle {
  [key: string]: Vehicle;
}

/**
 * Generate N image urls
 *
 * @param {number} [count] number of images to generate
 * @returns {string[]} array of image urls
 */
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
 * @returns GeneratedVehicle
 */
const generateVehicles = (count = 30): GeneratedVehicle => {
  const vehicles: GeneratedVehicle = {};

  for (let i = 0; i < count; i++) {
    const price = faker.finance.amount(10000, 50000, 0);
    const mpg = Math.floor(Math.random() * (40 - 11) + 11);
    const uuid = faker.datatype.uuid();

    // Add to vehicles array
    vehicles[uuid] = {
      StockNum: uuid,
      Sold: Math.random() < 0.2,
      ModelYear: faker.date.past(10).getFullYear(),
      Make: faker.vehicle.manufacturer(),
      Model: faker.vehicle.model(),
      Trim: ["M", "SE", "S", "Sport", "Lariat", "LT"][Math.floor(Math.random() * 6)],
      Transmission: Math.random() < 0.5 ? "Automatic" : "Manual",
      Drivetrain: [Drivetrains.AWD, Drivetrains.FWD, Drivetrains.RWD][Math.floor(Math.random() * 3)],
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
  }

  return vehicles;
};

(async () => {
  // Generate Vehicles
  const database = getDatabase(firebase);
  const vehicles = generateVehicles();
  set(dRef(database, process.env.DATABASE_INVENTORY), vehicles);

  // Generate Images for Each Vehicle
  const storage = getStorage(firebase);
  await Promise.all(Object.keys(vehicles).map(async (uuid) => {
    const images = generateImages(3);

    await Promise.all(images.map(async (url, index) => {
      const ref = sRef(storage, `${process.env.STORAGE_INVENTORY}/${uuid}/${index + 1}.jpg`);

      console.log(`Fetching image ${url} for ${uuid}...`);

      const dataUrl = await fetch(url)
        .then((r: any) => r.buffer())
        .then((buffer: Buffer) => buffer.toString("base64"));

      console.log(`Uploading image ${url} for ${uuid}...`);

      await uploadString(ref, `data:image/jpg;base64,${dataUrl}`, 'data_url', {
        contentType: 'image/jpg',
      });
    }));
  }));

  console.log("Done seeding the database");
  process.exit(0);
})();
