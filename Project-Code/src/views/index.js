// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
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

// TODO - Include your API routes here
const user = {
  password: undefined,
  username: undefined,
};

//Redirect goes to a route
//render renders a page

//Backup transfer systems to pages MAKE SURE TO DELETE WHEN BUILDING SPECIAL FUNCTIONS BECAUSE THEY WILL CONFLICT

app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /login route in the API
});

app.get('/register', (req, res) => {
  res.render('Project-Code/src/views/pages/register')
});

app.get('/search', (req, res) => {
  res.render('Project-Code/src/views/pages/search')
});

app.get('/account', (req, res) => {
  res.render('Project-Code/src/views/pages/account')
});

app.get('/home', (req, res) => {
  res.render('Project-Code/src/views/pages/home')
});

app.get('/login', (req, res) => {
  console.log("hi")
  res.render('Project-Code/src/views/pages/login')
});

/*
app.get('/discover', (req, res) => {
  res.render('pages/discover')
});
*/

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  user.username = req.body.username;

  existsQuery = "SELECT * FROM users WHERE username = $1;";
  //username = req.body.username;

  db.any(existsQuery, user.username)
  .then(data => {
    //check if user exists
    if(data == false) {
      // To-DO: Insert username and hashed password into the 'users' table
      db.any("INSERT INTO users (username, password) VALUES ($1, $2);", [user.username, hash])
      .then((courses) => {
        //console.info(courses);
        res.redirect('/login'//, {
          //courses,
          //message: `Successfully added course ${req.body.course_id}`,
          //action: "add",
        //}
        );
      })
      .catch((err) => {
        res.redirect('/register'//, {
          //courses: [],
          //error: true,
          //message: err.message,
        //}
        );
      });
    }
    else {
      res.render('Project-Code/src/views/pages/login', {message: "User already exists"});
    }
  })
});

app.post('/login', async (req, res) => {
  // check if password from request matches with password in DB
  //need to add variable to get specific user from table
  user.username = req.body.username;
  userReq = "SELECT * FROM users WHERE username = $1;";
  db.any(userReq, user.username)
  .then(async (data) => {
    if (data == false) {
      res.render('Project-Code/src/views/pages/register', {message: "Username doesn't exist"});
    }
    else {
      user.password = data[0].password;
    const match = await bcrypt.compare(req.body.password, user.password);

      if (match == true) {
        req.session.user = user;
        req.session.save();
        res.redirect('/home');
        //res.render("pages/discover")
      }
      else { //this does work
        res.render('Project-Code/src/views/pages/login', {message: "Incorrect username or password."});
      }
    }

  //save user details in session like in lab 8
  })
  .catch (err =>{
    console.log("yo")
    console.log(err.code);
    console.log(err);
  })
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Authentication Middleware.

const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('Project-Code/src/views/pages/login');
  }
  next();
}; 

// Authentication Required
app.use(auth);

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');