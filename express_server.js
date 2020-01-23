const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); //convert request body from buffer into string then add data to the req(request) object under the key body
app.use(cookieParser());

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
  let templateVars = { urls: urlDatabase, username: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};


const findUserByEmail = (email, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user]
    } 
  }
}

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
  if (!req.cookies["user_id"]) {
    res.redirect("/login")
  } else { 
    let templateVars  = { username: users[req.cookies["user_id"]] }
    res.render("urls_new", templateVars)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username: users[req.cookies["user_id"]]}; //urlDatabase is object, shortURL is the key to access longURL
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); 
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {"longURL": longURL, "userID": shortURL}; 
  res.redirect("/urls/" + shortURL ) 
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

app.get("/register", (req, res) => {
  let templateVars  = { username: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
})

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.URL;
  urlDatabase[id] = {longURL, userID: req.cookies["user_id"]};
  res.redirect("/urls");
})

// app.post('/login', (req, res) => {
//   let templateVars = {
//     username: users[req.cookies["user_id"]],
//   }
//   res.cookie("username", req.body.username);
//   res.redirect("/urls");
// })


app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  let templateVars  = { username: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
})

app.post("/register", (req, res) => {
  console.log(req.body)
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.send('404: Information not found', 400);
  } else if (findUserByEmail(req.body.email, users)) {
    res.redirect("/login");
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID, 
      email: userEmail, 
      password: userPassword
    }
    res.cookie('user_id', userID)
    res.redirect("/urls");
  }
})



app.get("/login", (req, res) => {
  let templateVars  = { username: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
})

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.post("/login", (req, res) => {
  let password = req.body.password;
  let user = findUserByEmail(req.body.email, users)
  if (user && user.password === req.body.password) {
      res.cookie("user_id", user.id); 
      res.redirect("/urls");
  } else {
    res.send('403: Forbidden', 403);
  }
})

