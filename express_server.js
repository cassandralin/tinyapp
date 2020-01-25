const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
// const { getUserByEmail } = require("./helpers");
// const generateRandomString = require("./helpers");
// // const findShortUrl = require("./helpers");
// const checkUser = require("./helpers");

const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true})); //convert request body from buffer into string then add data to the req(request) object under the key body
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@a.com",
    password: bcrypt.hashSync("a", 10) //change to hashedPassword
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@gmail.com",
    password: bcrypt.hashSync("a", 10) //change to hashedPassword
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ["userRandomID"] },
  "9sm5xK": { longURL: "http://www.google.com", userID: ["userRandomID"] }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  if (!req.session["user_id"]) { //if there is no user id cookie-then the user is not logged in
    res.redirect("/login");  // want to redirect them to login page
  } else {
    res.render("urls_index", templateVars)
  }
});

app.get("/urls/new", (req, res) => { //need to put urls/new before urls/:shortURL or else it won't reach urls/new
  if (!req.session["user_id"]) { //if no cookie exists-no one is logged in
    res.redirect("/login"); //redirect them to login
  } else {
    let templateVars  = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

const getUserByEmail = (email, users) => { //loops through users object and returns a user if the email matches
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
}

const generateRandomString = () => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuv";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const checkUser = (user_id, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
};


const findShortUrl = (longURLinput, urlDatabase) => {
  for (let url of Object.keys(urlDatabase)) { //searching through keys of urlDb which stores 
    if (urlDatabase[url].longURL === longURLinput) return url; //if urldatabase url(shortkey) accessing longURL value
  }
  return undefined;
}

app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) { // if there is no user cookie 
    res.redirect("/login") // want them to login
  } else if (findShortUrl(req.body.longURL, urlDatabase) === undefined) {  
    let randomString = generateRandomString(); 
    urlDatabase[randomString] = {"longURL": req.body.longURL, "userID": req.session.user_id } 
    res.redirect("/urls/" + randomString);
  } else if (findShortUrl(req.body.shortURL, urlDatabase) !== undefined) {
      if (!findShortUrl(req.body.shortURL, urlDatabase).userID.includes(req.session.user_id)) {
        urlDatabase[findShortURL(req.body.shortURL, urlDatabase)].userID.push(req.session.user_id);
      }
    res.redirect("/urls/" + findShortUrl(req.body.longURL, urlDatabase));
  }
})


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const user = checkUser(req.session.user_id, users); //use helper function to check if the cookie matches the users
  if (user && urlDatabase[req.params.shortURL].userID === user.id) { //if user matches 
    delete urlDatabase[req.params.shortURL]; //they can then delete
  }
  res.redirect("/urls"); // else they will be redirected to /urls
})

app.get("/register", (req, res) => {
  let templateVars  = { urls:urlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_registration", templateVars);
});

app.post('/urls/:id', (req, res) => {
  const user = checkUser(req.session.user_id, users);
  if (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID.includes(req.session.user_id)) {
  const id = req.params.id;
  const longURL = req.body.URL;
  urlDatabase[id].longURL = longURL;
  }
  res.redirect("/urls");
}) 

app.get('/urls/:id', (req, res) => {
  if (req.session.user_id) { // req.cookie["user_id"]//if the cookie exists
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: req.session.user_id
    } 
    // urlDatabase[id] = {longURL, userID: req.session.user_id}; //they are allowed to add a long url to the urlDatabase
    res.render("urls_show", templateVars );
  } else res.render("urls_index");
});

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars  = { user: req.session.user_id };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.send('400: Fields cannot be blank', 400);
  } else if (getUserByEmail(req.body.email, users)) {
    res.redirect("/login");
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10)
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => { 
  let templateVars  = { user: req.session.user_id }; 
    res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => { // checking if user and encrpyted password that is entered is corred by comparing to user database
  let user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.send('403: Unauthorized Access', 403);
  }
});

