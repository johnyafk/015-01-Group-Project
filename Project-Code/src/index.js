// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require("express"); // To build an application server or API
const app = express();
const pgp = require("pg-promise")(); // To connect to the Postgres DB from the node server
const bodyParser = require("body-parser");
const session = require("express-session"); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require("bcrypt"); //  To hash passwords
const axios = require("axios"); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
    host: "db", // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then((obj) => {
        console.log("Database connection successful"); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch((error) => {
        console.log("ERROR:", error.message || error);
    });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.use(express.static('resources'));
app.set("view engine", "ejs"); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

const user = {
    username: undefined,
    password: undefined,
    email: undefined,
    first_name: undefined,
    last_name: undefined
};

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
});

//Login API's
app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.post("/login", async (req, res) => {
    
    try {
        const query = "SELECT * FROM users WHERE username = $1;";
        const data = await db.any(query, [req.body.username]);
        if (!data.length) {
            throw new Error("User not found! Please register your account!");
        }
        user.username = data[0].username;
        user.password = data[0].password;
        user.email = data[0].email;
        user.first_name = data[0].first_name;
        user.last_name = data[0].last_name;
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match == true) {
            req.session.user = user;
            req.session.save();
            res.render("pages/account", {user});
        } else {
          res.status(200);
          throw new Error("Incorrect username/password");
        }
    } catch (error) {
        console.log("in catch block");
        res.render("pages/login", {
            error: true,
            message: error.message,
        });
    }
});

//Register API's
app.get("/register", (req, res) => {
    res.render("pages/register");
});

app.post("/register", async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    console.log(hash);
    // To-DO: Insert username and hashed password into the 'users' table
    const query =
        "insert into users (username, password) values ($1, $2) returning * ;";
    db.any(query, [req.body.username, hash]) //will replace with hash after fixing bcrypt function
        // if query execution succeeds
        .then(function (data) {
            res.render("pages/login");
        })
        // if query execution fails
        .catch(function (err) {
            res.render("pages/register");
        });
});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
  };

// Authentication Required
app.use(auth);

app.get("/home", (req, res) => {
    res.redirect("/home_page", {user});
});

app.get("/account", (req, res) => {
    res.render("pages/account", {user});
});

app.get("/search_page", (req, res) => {
    res.render("pages/search", {user});
});

let videos = undefined;
app.post("/search", (req, res) => {
    console.log("Query:");
    console.log(req.body.query);
    axios({
      url: `https://www.googleapis.com/youtube/v3/search`,
      method: 'GET',
      dataType: 'json',
      params: {
        part: 'snippet',
        maxResults: 12, 
        q: `${req.body.query}`,
        key: process.env.API_KEY,
        type: 'video'
      },
    })
      .then(results => {
        console.log(results.data.items); 
        videos = results.data.items;
        res.render("pages/results", {videos});
      })
      .catch(error => {
        // Handle errors
      });
  });

  //API to save videos for each user
  app.post("/saveVideo", async (req, res) => {
    const query =
        "insert into userVideos (username, videoID, videoTitle) values ($1, $2, $3) returning * ;";
    await db.any(query, [user.username, req.body.videoID, req.body.videoTitle]) 
        // if query execution succeeds
        .then(function (data) {
            res.render("pages/results", {videos});
        });
});

app.post("/removeVideo", async (req, res) => {
    const query =
        `DELETE FROM userVideos WHERE username = '${user.username}' AND videoID = '${req.body.videoID}';`;
    
    console.log(query);

    await db.any(query) 
        // if query execution succeeds
        .then(function (data) {
            res.redirect("/home_page");
        });
});

app.get("/home_page", async (req, res) => {
    
    try {
        const query = "SELECT * FROM userVideos WHERE username = $1;";
        const data = await db.any(query, [user.username]);
        
        let savedVideos = data;
        console.log(savedVideos);
        res.render("pages/home", {savedVideos, user});
        
    } catch (error) {
        console.log("in catch block");
        res.render("pages/login", {
            error: true,
            message: error.message,
        });
    }
});

app.get("/clear", async (req, res) => {
    const query =
        "DELETE FROM userVideos WHERE username = $1;";
    await db.any(query, [user.username])
    res.redirect("/home_page")
});

  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/logout");
    })

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log("Server is listening on port 3000");