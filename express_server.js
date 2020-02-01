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
    password: bcrypt.hashSync("a", 10) 
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@gmail.com",
    password: bcrypt.hashSync("a", 10) 
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ["userRandomID"] },
  "9sm5xK": { longURL: "http://www.google.com", userID: ["userRandomID"] }
};

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

const checkUser = (user_id, users) => { //check if user exists by comparing user cookie to user object, if it does return the user id
  for (let user of Object.keys(users)) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
};


const findShortUrl = (longURLinput, urlDatabase) => { //loops through urlDatabase to check if longURL exists, if it does return shortURL
  for (let url of Object.keys(urlDatabase)) {
    if (urlDatabase[url].longURL === longURLinput) return url; 
  }
  return undefined;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => { // checks if user is logged in, if not they they are redirected to their own index page
  let templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  if (!req.session["user_id"]) { 
    res.redirect("/login");  
  } else {
    res.render("urls_index", templateVars)
  }
});

app.get("/urls/new", (req, res) => { 
  if (!req.session["user_id"]) { 
    res.redirect("/login"); 
  } else {
    let templateVars  = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post("/urls", (req, res) => { //checks if user is logged in and allows them to add another long url if they are logged in
  if (!req.session["user_id"]) { 
    res.redirect("/login") 
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

app.post('/urls/:shortURL/delete', (req, res) => { //allows user to delete urls from database if they're logged in
  const user = checkUser(req.session.user_id, users); 
  if (user && urlDatabase[req.params.shortURL].userID === user.id) { 
    delete urlDatabase[req.params.shortURL]; 
  }
  res.redirect("/urls"); 
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
  if (req.session.user_id) { 
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: req.session.user_id
    } 
    res.render("urls_show", templateVars );
  } else res.send('403: Forbidden-Please login', 403)
});

app.post('/logout', (req, res) => { //clears cookies and redirects to home page
  req.session = null
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars  = { user: req.session.user_id };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => { //lets user register, if the email exists in users direct them to login, if they're already logged in direct to login page
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

app.post("/login", (req, res) => { // checking if user and encrpyted password that is entered is correct by comparing to user database
  let user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.send('403: Unauthorized Access', 403);
  }
});

