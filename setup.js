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
import { getDatabase, ref, set } from 'firebase/database';

// Pull configuration file
dotenv.config();

// Brief validation
if (!process.env.FIREBASE_API_KEY) {
  console.warn("FIREBASE_API_KEY not set. Did you forget to create the .env file?");
  process.exit(0);
}

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
const db = getDatabase(firebase);
const reference = ref(db, process.env.FIREBASE_RTD_ACTIVE_INVENTORY);
const inventory = [];

// Generate a fake vehicle
const generateVehicle = () => {
  let vehicle = {
    Sold: Math.random() < 0.2,
    StockNum: Math.floor(Math.random() * 250) + 1,
    ModelYear: Math.floor(Math.random() * (2022 - 2017) + 2016),
    Make: "Toyota",
    Model: "Camry",
    Trim: "XLE",
    Drivetrain: "FWD",
    Link: "",
    Price: 23075,
    MSRP: 27950,
    VIN: "T7H29FE0DGK025802",
    IntColor: ["Black", "#3b3b3b"],
    ExtColor: ["Black", "#454545"],
    Owners: Math.floor(Math.random() * 3) + 1,
    EPA: {
      "City": 26,
      "Highway": 32
    },
    Odometer: Math.floor(Math.random() * 100000),
    Images: [],
  };
  vehicle.Link = process.env.APPLICATION_URL + "/vehicles/" + `${vehicle.StockNum}-${vehicle.ModelYear}-${vehicle.Model.trim()}`.toLowerCase().replace(/\s/g, "-");

  return vehicle;
};

// Generate 32 vehicles
for (let i = 0; i < 33; i++) {
  inventory.push(generateVehicle());
}

// Setup inventory in database
set(reference, inventory).then(d => {
  console.log("Done!");
  process.exit(0);
});