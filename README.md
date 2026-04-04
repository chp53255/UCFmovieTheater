
```
# UCF Movie Theater Ticketing Platform

This repository contains the source code for a single-page web application (SPA)
built using the MERN stack (MongoDB, Express, React, Node.js). 

This document provides the necessary setup instructions for group members and graders to run the application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
* Node.js (https://nodejs.org)
* MongoDB (installed and running locally) (https://www.mongodb.com/try/download/community)
* MongoDB Compass (for database GUI) (https://www.mongodb.com/try/download/compass)

## Setup Instructions
```
### Step 1: Download Repo (go to code>download ZIP), 
Extract ZIP file
Open Command Prompt and cd into extracted folder

### Step 2: Install Backend Dependencies and Seed Database
Navigate to the backend directory, install the required Node modules, and seed the local database with initial data:

```bash
cd backend
npm install
npm run seed
```

### Step 3: Start the Backend Server
Start the Express development server. It should run on the port specified in your `.env` file (Port 5000).

```bash
npm run dev
```
*Note: Keep this terminal window open and running.*

### Step 4: Install Frontend Dependencies and Start
Open a **new** terminal window. Navigate to the frontend directory, install the React dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```
*Note: Keep this terminal window open as well.*

### Step 5: Access the Application
Open your web browser and navigate to the frontend URL provided by Vite:

http://localhost:5173

## Default Login Credentials

You can use the following seeded accounts to test the application:

**Admin Account:**
* Username: admin
* Password: admin123

**Standard User Account:**
* Username: john
* Password: user123
```
