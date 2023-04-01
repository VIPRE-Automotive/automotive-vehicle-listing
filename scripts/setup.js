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

// Generate 32 vehicles
for (let i = 0; i < 33; i++) {
  set(ref(db, process.env.FIREBASE_RTD_ACTIVE_INVENTORY + "/" + (i+1)), {
    Sold: Math.random() < 0.2,
    StockNum: i+1,
    ModelYear: Math.floor(Math.random() * (2023 - 2017) + 2016),
    Make: "Toyota",
    Model: "Camry",
    Trim: "XLE",
    Drivetrain: "FWD",
    Price: 23075,
    MSRP: 27950,
    VIN: "T7H29FE0DGK025802",
    IntColor: ["Black", "#3b3b3b"],
    ExtColor: ["Jigglypuff", "#ff9ff3"],
    Owners: Math.floor(Math.random() * 3) + 1,
    EPA: {
      "City": 26,
      "Highway": 32
    },
    Odometer: Math.floor(Math.random() * 100000),
    Images: [],
  }).then(d => {
    console.log(`Set StockNum #${i+1}`);
  });
}
