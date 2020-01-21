const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //convert request body from buffer into string then add data to the req(request) object under the key body


function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuv";
  const charactersLength = characters.length;
  for(let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; //urlDatabase is object, shortURL is the key to access longURL
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); 
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; 
  res.redirect("/urls/" + shortURL ) //Respond with "Ok" (we will replace this)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
})
