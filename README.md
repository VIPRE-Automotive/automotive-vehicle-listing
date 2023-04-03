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
- ... Etc

# Previews

![index](https://user-images.githubusercontent.com/38357871/229307852-7721f46d-d510-47f9-b2dc-8d90bb8f4e3e.png)
![interest-form](https://user-images.githubusercontent.com/38357871/229307858-86845c48-f5b9-478c-b9ba-e95d97422fe7.png)
![listing](https://user-images.githubusercontent.com/38357871/229307864-dd59726b-639d-4b44-8e43-74965ce1da13.png)

# Setup

## Basics

1. Get to the root folder

```bash
cd /automotive-vehicle-listing
```

2. Install packages

```bash
npm install
```

3. Rename `.env.example` to `.env` and update settings

4. Run Setup

```bash
npm run setup
```

(This will create the demo vehicles in your Firebase database)

5. Run server

```bash
npm start
```

6. Visit `http://localhost:3000` in your browser

## Firebase

This application relies on Google Firebase realtime database and storage for basic inventory management. The default structure of the database is below. You can import it directly to Google Firebase.

### Database Engine

Access rules:

```JSON
{
  "rules": {
    "inventory": {
      ".read": true,
      ".write": false,
      ".indexOn": ["StockNum", "ModelYear", "Make", "Odometer", "Price"]
    },
    "metadata": {
      ".read": true,
      ".write": false
    }
  }
}
```

Database structure

```JSON
{
  "inventory": [],
  "inactive-inventory": []
}
```

### Storage Engine

N/A

# Requirements & Dependencies

- Google Firebase
- Bulma 0.9.4
- Font-Awesome 5.15.4
- Node.js 14+
- Express/EJS

# To-Do

- [X] Fix live vehicle search box
- [ ] Finish "Similar Vehicles" recommendation system
- [ ] Implement vehicle image gallery
- [ ] Separate Routes from controller
- [X] Implement sidebar search filters
- [ ] Implement inventory listing "Share" card button
- [X] Implement inventory listing filters:
  - [X] Sold/Available
  - [X] Display type (card/list)
  - [X] Sort by (Price, age, etc)
- [ ] Convert all StockNum from numbers to uuid
