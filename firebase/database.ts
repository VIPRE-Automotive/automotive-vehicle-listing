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
  getDatabase, ref,
} from 'firebase/database';
import { Metadata, Vehicle } from '../types/global';
import { VehicleImage, getInventoryItemImages } from './storage';

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
const database = getDatabase(appHandle);

export interface VehicleWithImages extends Vehicle {
  Images: VehicleImage[];
}

export interface SearchResult {
  count: number;
  data: Vehicle[];
  pages: number;
}

export interface SearchSortArgs {
  key: string;
  order?: "asc" | "desc";
}

export interface SearchPaginateArgs {
  limit: number;
  offset?: number;
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc"
}

export enum SortKeys {
  MODEL_YEAR = "ModelYear",
  MAKE = "Make",
  ODOMETER = "Odometer",
  PRICE = "Price",
};

/**
 * Get all inventory items from the database
 *
 * @param {SearchSortArgs} sort
 * @param {string} [sort.key] sort by key
 * @param {SortOrder} [sort.order] sort order
 * @param {CallableFunction} [filter] vehicle filter function
 * @param {SearchPaginateArgs} [paginate]
 * @param {number} [paginate.limit] number of items to return
 * @param {number} [paginate.offset] number of items to skip
 * @return Promise<SearchResult|null>
 * @author Alec M.
 */
export const getInventory = async (sort: SearchSortArgs | null = null, filter: CallableFunction | null = null, paginate: SearchPaginateArgs | null = null): Promise<SearchResult | null> => {
  const { key, order } = sort || {};
  const { limit = 10, offset = 0 } = paginate || {};
  const records = await get(query(ref(database, DATABASE_INVENTORY), orderByChild(key || SortKeys.MODEL_YEAR)));

  if (!records || !records.exists()) {
    return null;
  }

  const data: Array<Vehicle> = [];
  records.forEach((record) => {
    const v = record.val();

    if (!v || typeof (v) !== "object") { return; }
    if (typeof filter === "function" && !filter(v)) { return; }

    data.push(v);
  });

  if (order === SortOrder.DESC) {
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
 * @returns Promise<InventoryMetadata|null>
 */
export const getInventoryMeta = async (): Promise<Metadata | null> => {
  const records = await get(ref(database, DATABASE_INVENTORY_METADATA));

  if (!records || !records.exists()) {
    return null;
  }

  return records.val();
};

/**
 * Get an active inventory item from the database by StockNum
 *
 * @param {string} StockNum
 * @param {boolean} [withImages] include vehicle image links
 * @returns Promise<Vehicle|VehicleWithImages|null>
 * @author Alec M.
 */
export const getInventoryItem = async (StockNum: string, withImages = false): Promise<Vehicle | VehicleWithImages | null> => {
  const record = await get(ref(database, DATABASE_INVENTORY + "/" + StockNum));

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
 * @returns Promise<Array<Vehicle>>
 */
export const searchActiveInventory = async (query: string, limit: number = 5): Promise<Vehicle[] | null> => {
  const { data, count } = await getInventory(null, null, { limit: -1 }) || {};

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
 * @returns Promise<Array<Vehicle>>
 */
export const getInventoryRecommendations = async (StockNum: string, limit = 3): Promise<Vehicle[] | null> => {
  // TODO: Create a real recommendation system
  const { data } = await getInventory(null, null, { limit }) || {};

  return data || null;
}
