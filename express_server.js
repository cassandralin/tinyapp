const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


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
}

console.log(users);

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ["userRandomID"] },
  "9sm5xK": { longURL: "http://www.google.com", userID: ["userRandomID"] }
};

const checkUser = (user_id, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
}


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (!req.cookies["user_id"]) { //if there is no user id cookie-then the user is not logged in
    res.redirect("/login")  // want to redirect them to login page
  } else { 
    let templateVars  = { user: users[req.cookies["user_id"]] }
    // res.render("urls_new", templateVars)
  }


  res.render("urls_index", templateVars);
});

const findUserByUrl = (longURLinput, urlDb) => {
  const results = {};
  for (let url of Object.keys(urlDb)) { //searching through keys of urlDb which stores 
    if (urlDb[url].longURL === longURLinput) {
      results[url]
    };
  }
  return results;
}

// const urlsByUser = (userID, db) => { // by mara <3<3<3
//   const results = {};
//   for (let key in db) {
//     if (db[key].userID === userID) {
//       results[key] = db[key].longURL;
//     }
//   }
//   return results;
// }

// urlsByUser(req.session.user_id, urlDatabase)



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
  if (!req.cookies["user_id"]) { //if no cookie exists-no one is logged in
    res.redirect("/login") //redirect them to login
  } else { 
    let templateVars  = { user: users[req.cookies["user_id"]] }
    res.render("urls_new", templateVars)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]}; //urlDatabase is object, shortURL is the key to access longURL
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log('before: ', urlDatabase);
  if (!req.cookies["user_id"]) { // if there is no user cookie 
    res.redirect("/login") // want them to login
  } else if (findUserByUrl(req.body.longURL, urlDatabase) === undefined) {  
    let randomString = generateRandomString(); 
    urlDatabase[randomString] = {"longURL": req.body.longURL, "userID": [req.cookies.user_id]}
    console.log('after: ', urlDatabase);
    res.redirect("/urls/" + randomString);
  } else if (findUserByUrl(req.body.longURL, urlDatabase) !== undefined) {
      if (!findUserByUrl(req.body.longURL, urlDatabase).userID.includes(req.cookies.user_id)) {
        urlDatabase[findUserByUrl(req.body.longURL, urlDatabase)].userID.push(req.cookies.user_id);
      }
    console.log('after: ', urlDatabase);
    res.redirect("/urls/" + findUserByUrl(req.body.longURL, urlDatabase));
  }
})

// app.post("/urls", (req, res) => {
//   console.log('before: ', urlDatabase);
//   if (!req.cookies["user_id"]) { // if there is no user cookie 
//     res.redirect("/login") // want them to login
//   } else if (findUserByUrl(req.body.longURL, urlDatabase) === undefined) {  
//     let randomString = generateRandomString(); 
//     urlDatabase[randomString] = {"longURL": req.body.longURL, "userID": [req.cookies.user_id]}
//     console.log('after: ', urlDatabase);
//     res.redirect("/urls/" + randomString);
//   } else if (findUserByUrl(req.body.longURL, urlDatabase) !== undefined) {
//       if (!findUserByUrl(req.body.longURL, urlDatabase).userID.includes(req.cookies.user_id)) {
//         urlDatabase[findUserByUrl(req.body.longURL, urlDatabase)].userID.push(req.cookies.user_id);
//       }
//     console.log('after: ', urlDatabase);
//     res.redirect("/urls/" + findUserByUrl(req.body.longURL, urlDatabase));
//   }

app.get("/u/:shortURL", (req, res) => {
  // const longURL = urlDatabase[req.params.shortURL];
  res.redirect(urlDatabase[req.params.shortURL].longURL); 
});


app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.cookies["user_id"]) { //if no cookie exists, no one is logged in
    res.redirect("/urls");  //direct them to urls
  } else {
    const user = checkUser(req.cookies["user_id"], users); //use helper function to check if the cookie matches the users
    console.log(user)
    if (user) {

      if (urlDatabase[req.params.shortURL].userID[0] === user.id) { //returns the correct user check if the id matches
        delete urlDatabase[req.params.shortURL]; //they can then delete
        res.redirect("/urls"); //then redirect to urls
      } else {
        res.redirect("/urls");
      }

    } else {
      res.redirect("/urls");
    }
  }
})

app.get("/register", (req, res) => {
  let templateVars  = { urls:urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
})

app.post('/urls/:id', (req, res) => {
  if (req.cookies["user_id"]) { //if the cookie exists 
  const id = req.params.id; 
  const longURL = req.body.URL;
  urlDatabase[id] = {longURL, userID: req.cookies["user_id"]}; //correct
  res.redirect("/urls");
} else {
  res.redirect("/urls");
}
})


app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  let templateVars  = { user: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
})

app.post("/register", (req, res) => {
  console.log(req.body)
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  // const hashedPassword = bcrypt.hashSync(userPassword, 10) //changed to use bcrypt
  if (userEmail === "" || userPassword === "") {
    res.send('404: Information not found', 400);
  } else if (findUserByEmail(req.body.email, users)) {
    res.redirect("/login");
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID, 
      email: userEmail, 
      password: bcrypt.hashSync(userPassword, 10)
    }
    console.log(`SAVING USER AS:`);
    console.log(users);
    res.cookie('user_id', userID)
    res.redirect("/urls");
  }
})



app.get("/login", (req, res) => {
  let templateVars  = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  // let password = req.body.password;
  let user = findUserByEmail(req.body.email, users)
  if (user && bcrypt.compareSync(req.body.password, user.password)) { //use bcrpt to compare passwords
      res.cookie("user_id", user.id); 
      res.redirect("/urls");
  } else {
    res.send('403: Forbidden', 403);
  }
})


