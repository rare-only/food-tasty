var express = require('express');
var app = express();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const openurl = require('openurl');
const path = require('path'); // Added for path manipulation
var passwordHash = require("password-hash")

var serviceAccount = require("./key.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up static file middleware to serve public directory
app.use(express.static('public'));

// Middleware to parse request bodies as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', function (req, res) {
  res.redirect('/signup');
});

app.get('/signup', function (req, res) {
  res.render('signup'); // Render the EJS template
});



app.post('/signupsubmit', function (req, res) {
  // Retrieve user data from the request body
  const { fullname, email, password, number, hashedpassword } = req.body;

  // Check if the email already exists in Firestore
  db.collection("saiki")
    .where("Email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        // Email already exists, show an error message
        res.send("This account already exists.");
      } else {
        // Email doesn't exist, add the user data to Firestore
        db.collection("saiki").add({
          Fullname: fullname,
          Email: email,
          hashedPassword: passwordHash.generate(password),
          Number: number,
        });

        res.redirect('/login'); // Redirect after successful signup
      }
    })
   
});
app.get('/login', function (req, res) {
  res.render('login'); // Render the EJS template
});


app.post('/loginsubmit', function (req, res) {
  const { email, password } = req.body;

  db.collection("saiki")
    .where("Email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size === 0) {
        // No matching account found
        res.send("No account with this email exists.");
      } else {
        // Matching account found, now check the hashed password
        const userDoc = docs.docs[0];
        const storedHashedPassword = userDoc.data().hashedPassword;

        if (passwordHash.verify(password, storedHashedPassword)) {
          // Successful login, redirect to the appropriate URL
          res.redirect('/hotel-website');
        } else {
          // Incorrect login credentials
          res.send("Incorrect Email-Id or Password. Please enter the correct details.");
        }
      }
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      res.status(500).send("An error occurred while logging in.");
    });
});
   
app.get('/hotel-website', function (req, res) {
  res.render('hotel-website'); 
});
for (let i = 1; i <= 8; i++) {
  const itemRoute = `/path-to/item${i}`;
  const itemTemplate = `item${i}`;
  
  app.get(itemRoute, function (req, res) {
    res.render(itemTemplate); // Render the item template corresponding to the value of i
  });
}

app.listen(3000, function () {
  console.log('Server running at http://localhost:3000 displaying the content of webpage');
  openurl.open('http://localhost:3000/signup');
});