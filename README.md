# Introduction
This is a comprehensive Automotive Vehicle Catalog/Listing application. The front-end relies strictly on Bulma styling, with a Node.js/Express backend. It is designed to be lightly focused on automotive vehicle listing, and could be easily reconfigured to focus on a different type of product or service.

# Setup
## Basics
Get to the root folder

```
cd /automotive-vehicle-listing
```

Install packages

```
npm install
```

Run server

```
npm start
```

Visit `http://localhost:3000` in your browser

## /configuration.js
This file houses all of the important configuration details, and is in the root folder. See the example below.

```JavaScript
export default {
  /* Server */
  server_port: 3000,

  /* Email Details */
  email: {
    Host: "",
    Port: 25,
    Username: "",
    Password: "",
  },

  /* App Info */
  application: {
    Name: "",
    Company: "",
    Address: {
      Street: "",
      City: "",
      State: "",
      Zip: "",
    },
    Phone: "",
    URL: "http://localhost:3000",
  },

  /* Search Options */
  options: {
    search_pagination: 9,
  },
};
```

# Requirements & Dependencies
- Bulma 0.93
- Font-Awesome 5.15.4
- Node.js, Express, & EJS
- Etc
