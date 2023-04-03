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
import {
  get, query, orderByChild,
  getDatabase, ref as dRef,
} from 'firebase/database';
import {
  getStorage, getDownloadURL,
  list, ref as sRef,
} from "firebase/storage";

dotenv.config();
const {
  FIREBASE_RTD_ACTIVE_INVENTORY: activeInventory,
  FIREBASE_RTD_ACTIVE_INVENTORY_META: activeInventoryMetadata,
  FIREBASE_STO_ACTIVE_INVENTORY: activeInventoryStorage,
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
const database = getDatabase(appHandle);
const storage = getStorage(appHandle);

/**
 * Get all inventory items from the database
 *
 * @param {object} sort
 * @param {string} [sort.key] sort by key
 * @param {string} [sort.order] sort order
 * @param {function} [filter] vehicle filter function
 * @param {object} [paginate]
 * @param {number} [paginate.limit] number of items to return
 * @param {number} [paginate.offset] number of items to skip
 * @return Promise
 * @author Alec M.
 */
export const getActiveInventory = async (sort = {}, filter = undefined, paginate = {}) => {
  const { key, order } = sort;
  const { limit = 10, offset = 0 } = paginate || {};
  const records = await get(query(dRef(database, activeInventory), orderByChild(key || "ModelYear")));

  if (!records || !records.exists()) {
    return null;
  }

  const data = [];
  records.forEach((record) => {
    const v = record.val();

    if (!v || typeof(v) !== "object") { return; }
    if (typeof filter === "function" && !filter(v)) { return; }

    data.push(v);
  });

  if (order === "desc") {
    data.reverse();
  }

  return {
    count: data.length,
    pages: Math.ceil(data.length / (limit === -1 ? data.length : limit)),
    data: data.slice(offset, offset + (limit === -1 ? data.length : limit))
  };
};

/**
 * Gets filtering metadata for the active inventory
 *
 * Resolves to an object with the following properties:
 * - Makes: { [make]: [count], ... }
 * - ModelYears: { [year]: [count], ... }
 *
 * @returns Promise<Object>>
 */
export const getActiveInventoryMeta = async () => {
  const records = await get(dRef(database, activeInventoryMetadata));

  if (!records || !records.exists()) {
    return null;
  }

  return records.val();
};

/**
 * Find all files in the storage bucket
 *
 * Resolves to an array of objects with the following properties:
 * - name: file name
 * - url: file download URL
 *
 * @param {string} StockNum
 * @param {number} [limit] max images to return
 * @returns Promise<Array<Object>>
 */
export const getInventoryItemImages = async (StockNum = "", limit = 10) => {
  const records = await list(sRef(storage, activeInventoryStorage + "/" + StockNum), {maxResults: limit});

  if (!records?.items || records.items.length === 0) {
    return [];
  }

  const filledRecords = await Promise.allSettled(records.items.map(async (file) => {
    const url = await getDownloadURL(file);
    return { name: file.name, url };
  }));

  return filledRecords
    .map(p => p.status === "fulfilled" ? p.value : null)
    .filter(e => e !== null);
};

/**
 * Get an active inventory item from the database by StockNum
 *
 * @param {string} StockNum
 * @param {boolean} [withImages] include vehicle image links
 * @returns Promise<Inventory>
 * @author Alec M.
 */
export const getActiveInventoryItem = async (StockNum, withImages = false) => {
  const record = await get(dRef(database, activeInventory + "/" + StockNum));

  if (!record || !record.exists()) {
    return null;
  }

  return {
    ...record.val(),
    Images: withImages ? await getInventoryItemImages(StockNum) : []
  };
};

/**
 * Get a subset of active inventory items from the database
 *
 * @param {string} query search query
 * @param {number} limit max results
 * @returns Promise<Array<Inventory>>
 */
export const searchActiveInventory = async (query, limit = 5) => {
  const { data, count } = await getActiveInventory(undefined, undefined, { limit: -1 }) || {};

  if (!data || !count) {
    return null;
  }

  return data.filter((vehicle) => {
    const { ModelYear, Make, Model, StockNum } = vehicle;

    if (!vehicle || !ModelYear || !Make || !Model || !StockNum) {
      return false;
    }
    if (ModelYear.toString().includes(query) || Make.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    if (Model.toLowerCase().includes(query.toLowerCase()) || StockNum.includes(query)) {
      return true;
    }

    return false;
  }).slice(0, limit);
};

/**
 * Generate a list of related/recommended vehicles
 *
 * @param {string} StockNum The StockNum of the vehicle to get recommendations for
 * @param {number} [limit]
 * @returns Promise<Array<Inventory>>
 */
export const getInventoryRecommendations = async (StockNum, limit = 3) => {
  // TODO: Create a real recommendation system
  return getActiveInventory(undefined, undefined, {limit});
}
