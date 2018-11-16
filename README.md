# yelpcamp-wdb

The web development bootcamp project is a market place for campgrounds

[![node](https://img.shields.io/badge/node-v10.11.0-blue.svg)](https://nodejs.org/en/)
[![npm](https://img.shields.io/badge/npm-v6.4.1-green.svg)](https://www.npmjs.com/)

## Live Demo

[YelpCamp Demo](https://yelpcamp-jbf.herokuapp.com/)

## Usage

### 1. Clone the repo & install dependencies

```bash
git clone https://github.com/julisbf/yelpcamp-wdb.git
cd yelpcamp-wbd
npm install
```

### 2. Create .env file

> **Note:** You’ll need to create an account in [Cloudinary](https://cloudinary.com/users/register/free), [MLab](https://mlab.com/signup/), [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key) and [Mailgun](https://signup.mailgun.com/new/signup) to get your API keys.

```bash
touch .env
open .env
```

Add Cloudinary Api Key \
`CLOUDINARY_API_KEY = "__YOUR_CLOUDINARY_API_TOKEN__"`

Add Cloudinary Api Secret \
`CLOUDINARY_API_SECRET = "__YOUR_CLOUDINARY_API_SECRET__"`

Add your MongoDB url in MLab \
`DATABASEURL = "__YOUR_MLAB_DATABASE_URL__"`

Add your Google Map Api Key \
`GEOCODER_API_KEY = __YOUR_GOOGLE_MAP_API_KEY__`

Add your Mailgun Api Key \
`MAILGUN_KEY = __YOUR_MAILGUN_API_KEY__`

`PORT = 8080`

### 3. Start your server

```bash
node app.js
```
