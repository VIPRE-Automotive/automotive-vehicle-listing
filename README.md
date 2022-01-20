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

## .env
This file houses all of the important configuration details, and is in the root folder. See the example below.

```ini
# Basic Application Configuration
APPLICATION_NAME="Inventory"
APPLICATION_URL="http://localhost:3000"
SERVER_PORT=3000
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
```

# Requirements & Dependencies
- Bulma 0.93
- Font-Awesome 5.15.4
- Node.js, Express, & EJS
- Etc
