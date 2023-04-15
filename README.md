# Introduction

This is a comprehensive Automotive Vehicle Catalog/Listing application. The front-end relies strictly on Bulma styling, with a Node.js/Express backend. It is designed to be lightly focused on automotive vehicle listing, and could be easily reconfigured to focus on a different type of product.

# Core Features

- Inventory listing
- Vehicle Search filter design
- Live vehicle search box
- Inventory item page
  - Related item recommendations
  - Preview images
  - "Share with a friend" QR code
  - Key feature highlighting
- Call-To-Action email form
- ... More to come

# Previews

![index](https://user-images.githubusercontent.com/38357871/229307852-7721f46d-d510-47f9-b2dc-8d90bb8f4e3e.png)
![interest-form](https://user-images.githubusercontent.com/38357871/229307858-86845c48-f5b9-478c-b9ba-e95d97422fe7.png)
![listing](https://user-images.githubusercontent.com/38357871/229307864-dd59726b-639d-4b44-8e43-74965ce1da13.png)

# Getting Started

## Basics

1. Clone the repository
   - `git clone https://github.com/amattu2/automotive-vehicle-listing`
   - `cd automotive-vehicle-listing`
2. Install dependencies
   - `npm install`
3. Fill out the `.env` file with your Google Firebase credentials (copy `.env.example` to `.env`)
4. Setup your Google Firebase database (See below)
5. Run the application and seed the database
   - `npm run seed`
   - `npm run dev` or `npm run build && npm start`
6. Visit <https://localhost:3000>

> **Warning**: The `seed.js` script should only be run to test out the application. It may overwrite your existing data.

## Firebase Realtime Database

This application relies on Google Firebase realtime database and storage for basic inventory management. The default structure of the database is below. You can import it directly to Google Firebase.

<details>
  <summary>Rules</summary>

  ```JSON
  {
    "rules": {
      "inventory": {
        ".read": true,
        ".write": true,
        ".indexOn": ["StockNum", "ModelYear", "Make", "Odometer", "Price"],
        "$key": {
          ".validate": "$key.length > 0 && newData.child('StockNum').exists()",
          "StockNum": {
            ".validate": "newData.exists() && newData.isString() && newData.val().length > 0"
          },
          "ModelYear":{
            ".validate": "newData.isNumber() && newData.val() > 1950"
          },
          "Odometer":{
            ".validate": "newData.isNumber() && newData.val() > 0"
          },
        }
      },
      "metadata": {
        ".read": true,
        ".write": true
      }
    }
  }
  ```

  > **Warning**: Beyond running the `seed.js` script, neither the `inventory` nor `metadata` nodes need `write` access.
</details>

<details>
  <summary>Structure</summary>

  ```JSON
  {
    "inventory": {},
    "metadata": {},
  }
  ```

</details>

## Firebase Storage

<details>
  <summary>Rules</summary>

  ```txt
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /inventory/{stockNum}/{file} {
        allow read;
        allow create: if request.resource.size < 5 * 1024 * 1024
          && request.resource.contentType.matches('image/.*')
          && firestore.exists(/databases/(default)/documents/inventory/$(stockNum))
      }
    }
  }
  ```

  > **Warning**: Beyond running the `seed.js` script, the `inventory` folder does not need write access.
</details>

# Dependencies

- Google Firebase
- Bulma 0.9.4
- Font-Awesome 5.15.4
- Node.js 14+
- Express/EJS

# To-Do

- [X] Fix live vehicle search box
- [ ] Finish "Similar Vehicles" recommendation system
- [X] Implement vehicle image gallery
- [X] Implement sidebar search filters
- [ ] Implement inventory listing "Share" card button (mailto link)
- [X] Implement inventory listing filters:
  - [X] Sold/Available
  - [X] Display type (card/list)
  - [X] Sort by (Price, age, etc)
- [X] Click-to-copy ~~VIN~~ and Stock Number on listing page
