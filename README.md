# Introduction
This is a comprehensive Automotive Vehicle Catalog/Listing application. The front-end relies strictly on Bulma styling, with a Node.js/Express backend. It is designed to be lightly focused on automotive vehicle listing, and could be easily reconfigured to focus on a different type of product or service.

# Setup
## Basics
1. Get to the root folder

```
cd /automotive-vehicle-listing
```

2. Install packages

```
npm install
```

3. Create the .env file from the below template


4. Run Setup
```
npm run setup
```
(This will create the demo vehicles in your Firebase database)

5. Run server
```
npm start
```

6. Visit `http://localhost:3000` in your browser

## .env
This file houses all of the important configuration details, and is in the root folder. See the example below.

```ini
# Basic Application Configuration
APPLICATION_NAME="Inventory"
APPLICATION_URL="http://localhost:3000"
PORT=3000
SEARCH_PAGINATION=9

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USERNAME=""
EMAIL_PASSWORD=""

# Company Configuration
COMPANY_NAME="Auto Company"
COMPANY_ADDRESS_STREET=""
COMPANY_ADDRESS_CITY=""
COMPANY_ADDRESS_STATE=""
COMPANY_ADDRESS_ZIP=""
COMPANY_ADDRESS_COUNTRY=""
COMPANY_PHONE=""
COMPANY_EMAIL=""

# Firebase Configuration
FIREBASE_API_KEY=""
FIREBASE_AUTH_DOMAIN=""
FIREBASE_PROJECT_ID=""
FIREBASE_STORAGE_BUCKET=""
FIREBASE_MESSAGING_SENDER_ID=""
FIREBASE_APP_ID=""
FIREBASE_MEASUREMENT_ID=""

# Firebase Routes
FIREBASE_RTD_ACTIVE_INVENTORY="/inventory"
FIREBASE_RTD_INACTIVE_INVENTORY="/inactive-inventory"
FIREBASE_STO_ACTIVE_INVENTORY="/inventory"
```

## Firebase
This application relies on Google Firebase realtime database and storage for basic inventory management. The default structure of the database is below. You can import it directly to Google Firebase.

### Database Engine
Access rules:
```JSON
{
  "rules": {
    "inventory": {
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
- Google Firebase (Realtime DB and Storage)
- Bulma 0.93
- Font-Awesome 5.15.4
- Node.js, Express, & EJS
- Etc
