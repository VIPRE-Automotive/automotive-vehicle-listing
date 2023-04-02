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

import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref as dRef } from 'firebase/database';
import { getStorage, getDownloadURL, listAll, ref as sRef } from "firebase/storage";
import dotenv from 'dotenv';

// Initialize Firebase
dotenv.config();
const appHandle = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
});
const database = getDatabase(appHandle);
const storage = getStorage(appHandle);

/**
 * Get all inventory items from the database
 *
 * @return Promise<Array<Inventory>>
 * @author Alec M.
 */
export const getActiveInventory = async () => {
  return new Promise((resolve, reject) => {
    onValue(dRef(database, process.env.FIREBASE_RTD_ACTIVE_INVENTORY), (snapshot) => {
      const d = snapshot.val();

      if (d && typeof(d) === "object") {
        resolve(Object.values(d));
      } else {
        resolve(null);
      }
    }, {onlyOnce: true});
  });
};

/**
 * Find all files in the storage bucket
 *
 * @param {number} StockNum
 * @returns Promise<Array<string>>
 */
export const getInventoryItemImages = async (StockNum = 0) => {
  return new Promise((resolve, reject) => {
    const images = [];

    listAll(sRef(storage, process.env.FIREBASE_STO_ACTIVE_INVENTORY + "/" + StockNum)).then((files) => {
      files.items.forEach(file => {
        images.push(file.name);
      });

      resolve(images);
    });
  });
};

/**
 * Get an active inventory item from the database by StockNum
 *
 * @param {number} StockNum
 * @param {boolean} withImages include vehicle image links
 * @returns Promise<Inventory>
 * @author Alec M.
 */
export const getActiveInventoryItem = async (StockNum, withImages = false) => {
  return new Promise((resolve, reject) => {
    onValue(dRef(database, process.env.FIREBASE_RTD_ACTIVE_INVENTORY + "/" + StockNum), (snapshot) => {
      const vehicle = snapshot.val();
      vehicle.Images = [];

      // Pull Images
      if (withImages) {
        listAll(sRef(storage, process.env.FIREBASE_STO_ACTIVE_INVENTORY + "/" + StockNum)).then((files) => {
          files.items.forEach(file => {
            vehicle.Images.push(file.name);
          });

          resolve(vehicle);
        });
      } else {
        resolve(vehicle);
      }
    }, {onlyOnce: true});
  });
};

/**
 * Get a subset of active inventory items from the database
 *
 * @param {string} query search query
 * @param {number} limit max results
 * @returns Promise<Array<Inventory>>
 */
export const searchActiveInventory = async (query, limit = 5) => {
  return new Promise((resolve, reject) => {
    onValue(dRef(database, process.env.FIREBASE_RTD_ACTIVE_INVENTORY), (snapshot) => {
      const d = snapshot.val();
      const results = [];

      if (d && typeof(d) === "object") {
        Object.values(d).forEach((vehicle) => {
          const { ModelYear, Make, Model, StockNum } = vehicle;

          if (results.length >= limit) {
            return;
          }
          if (!vehicle || !ModelYear || !Make || !Model || !StockNum) {
            return;
          }
          if (ModelYear.toString().includes(query) || Make.toLowerCase().includes(query.toLowerCase()) || Model.toLowerCase().includes(query.toLowerCase()) || StockNum.toString().includes(query)) {
            results.push(vehicle);
          }
        });

        resolve(results);
      } else {
        resolve(null);
      }
    }, {onlyOnce: true});
  });
};

/**
 * Generate a list of related/recommended vehicles
 *
 * @param {number} StockNum The StockNum of the vehicle to get recommendations for
 * @param {number} [limit]
 * @returns Promise<Array<Inventory>>
 */
export const getInventoryRecommendations = async (StockNum, limit = 3) => {
  // TODO: Actually implement this
  const d = await getActiveInventory();

  return d.slice(0, limit);
}
