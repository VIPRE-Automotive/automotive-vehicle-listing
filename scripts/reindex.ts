/*
 * Produced: Tue Apr 04 2023
 * Author: Alec M.
 * GitHub: https://amattu.com/links/github
 * Copyright: (C) 2023 Alec M.
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
import { get, set, getDatabase, ref } from 'firebase/database';
import { Metadata, Vehicle } from '../types/global';

dotenv.config();

const {
  DATABASE_INVENTORY,
  DATABASE_INVENTORY_METADATA,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} = process.env;

const appHandle = initializeApp({
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
});

(async () => {
  const database = getDatabase(appHandle);

  console.log("Fetching inventory from:", DATABASE_INVENTORY);
  const records = await get(ref(database, DATABASE_INVENTORY));
  const inventory: Vehicle[] = records.exists() ? Object.values(records.val()) : [];

  console.log("Found", inventory.length, "records");

  const metadata: Metadata = {
    Makes: inventory.reduce((acc: any, value) => {
      acc[value.Make] = (acc[value.Make] || 0) + 1;
      return acc;
    }, {}),
    ModelYears: inventory.reduce((acc: any, value) => {
      acc[value.ModelYear] = (acc[value.ModelYear] || 0) + 1;
      return acc;
    }, {}),
  };

  console.log("Updating metadata to:", metadata);

  await set(ref(database, DATABASE_INVENTORY_METADATA), metadata);

  console.log("Done!");
  process.exit(0);
})();
