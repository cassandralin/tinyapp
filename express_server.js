const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //convert request body from buffer into string then add data to the req(request) object under the key body

function generateRandomString() {

};

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => { //need to put urls/new before urls/:shortURL or else it won't reach urls/new
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params)
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; //urlDatabase is object, shortURL is the key to access longURL
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  res.send("Ok"); //Respond with "Ok" (we will replace this)
})

