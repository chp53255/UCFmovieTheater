
PREREQUISITES
--------------------------------------------------------------------------------

  1. Node.js       https://nodejs.org  
  2. MongoDB       https://www.mongodb.com/try/download/community
                   Install as a Service so it runs automatically in the background.
  3. MongoDB Compass (optional, for inspecting the database visually)
============================================================

  DEFAULT LOGIN CREDENTIALS (seeded automatically)
--------------------------------------------------------------------------------

  Administrator Account:
    Username : admin
    Password : admin123

  Standard User Account:
    Username : john
    Password : user123

  Standard User Account 2:
    Username : jane
    Password : user123

  Additional standard user accounts can be created through the Register page.

  ============================================================
--- STEP 1: Extract the ZIP ---

  Unzip the submitted file and open a terminal (Command Prompt)
  Navigate into the extracted project folder inside cmd

--- STEP 2: Install Backend Dependencies & Seed the Database ---

  (Assuming MongoDB already running as service)
  Navigate to the backend directory:

    cd backend
    npm install
    npm run seed

  The seed script will create the database "movieTheaterDB" and populate it with:
    - 2 default user accounts and 1 admin account (see credentials below)
    - 7 genres
    - 5 movies with genre tags
    - 2 theaters
    - 4 showtimes
                      
--- STEP 3: Start the Backend Server ---

  From inside the /backend directory:

    npm run dev

  The Express server will start and listen on port 5000.
  You should see: "Server running on port 5000" and "Connected to MongoDB"

  Keep terminal window open and running

--- STEP 4: Install Frontend Dependencies & Start the React App ---

  Open a SECOND terminal window and navigate to the frontend directory:

    cd frontend
    npm install
    npm run dev

  The Vite development server will start and listen on port 5173.
  You should see a local URL printed in the terminal.

  The React app runs on: http://localhost:5173

--------------------------------------------------------------------------------
  c. HOW TO NAVIGATE TO THE APPLICATION

  Once both servers are running, open a web browser and go to:

    http://localhost:5173

  The first screen is the Login page. 
  Default credenitals are at the beginning of README.txt
  Also able to create custom user account

  Backend API base URL (for reference only — do not navigate here directly):

    http://localhost:5000/api


================================================================================
  d. MONGODB COLLECTIONS
================================================================================

  Database name: movieTheaterDB

  The following 6 collections are used by the application:

  Collection      Mongoose Model   Description
  ------------    --------------   -------------------------------------------
  users           User             Stores user accounts with hashed passwords
                                   and role (admin or user).

  movies          Movie            Stores movie records including title,
                                   description, duration, poster URL, and an
                                   array of Genre ObjectId references.

  genres          Genre            Stores genre tags (e.g. Action, Drama).
                                   Referenced by Movie in a many-to-many
                                   relationship.

  theaters        Theater          Stores theater screens with name and total
                                   seat count.

  showtimes       Showtime         Stores scheduled screenings linking a Movie
                                   to a Theater with date, time, price, and
                                   available seat count.

  bookings        Booking          Stores ticket reservations. Each booking
                                   links to a Showtime and records the customer
                                   username, selected seat labels, and total
                                   price.

  Many-to-Many Relationship:
    Movies <--> Genres
    A movie can belong to multiple genres, and a genre can apply to many movies.
    Implemented via an array of Genre ObjectIds stored on each Movie document,
    populated using Mongoose's .populate("genres", "name") on read operations.

================================================================================
  SUMMARY OF PORTS
================================================================================

  Service          Port    URL
  ---------------  ------  ---------------------------------
  React Frontend   5173    http://localhost:5173      <-- open this in browser
  Express Backend  5000    http://localhost:5000/api
  MongoDB          27017   mongodb://localhost:27017/movieTheaterDB


================================================================================
