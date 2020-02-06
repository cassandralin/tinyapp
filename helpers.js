const getUserByEmail = (email, users) => {
  console.log(email, users);
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
}

const findUserByUrl = (longURLinput, urlDatabase) => {
  for (let url of Object.keys(urlDatabase)) { //searching through keys of urlDb which stores 
    if (urlDb[url].longURL === longURLinput) return url; //if urldatabase url(shortkey) accessing longURL value
  }
  return undefined;
}

const checkUser = (user_id, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].id === user_id) {
      return users[user];
    }
  }
};

module.exports = { getUserByEmail, checkUser }