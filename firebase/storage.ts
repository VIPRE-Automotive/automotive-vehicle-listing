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
  getStorage, getDownloadURL,
  list, ref,
} from "firebase/storage";

dotenv.config();

const {
  STORAGE_INVENTORY,
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

const storage = getStorage(appHandle);

export interface VehicleImage {
  url: string;
  name: string;
}

/**
 * Find all files in the storage bucket
 *
 * Resolves to an array of objects with the following properties:
 * - name: file name
 * - url: file download URL
 *
 * @param {string} StockNum
 * @param {number} [limit] max images to return
 * @returns Promise<VehicleImage[]>
 */
export const getInventoryItemImages = async (StockNum: string = "", limit: number = 10): Promise<VehicleImage[]> => {
  const records = await list(ref(storage, STORAGE_INVENTORY + "/" + StockNum), { maxResults: limit });

  if (!records?.items || records.items.length === 0) {
    return [];
  }

  const filledRecords = await Promise.allSettled(records.items.map(async (file) => {
    const url = await getDownloadURL(file);
    return { name: file.name, url };
  }));

  return filledRecords
    .map(p => p.status === "fulfilled" ? p.value : null)
    .filter(e => e !== null) as VehicleImage[];
};
