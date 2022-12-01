const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
};

const findUserEmail = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

function generateRandomString() {
  let RdmNum = Math.random().toString(36).substring(3, 9);
  return RdmNum;
}

// HOMEPAGE REQUEST THAT SHOWS THE DATABASE OF URLS
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});

// SHOWS 'NEW' PAGE WHICH SHOWS THE FORM TO ENTER A 'NEW' URL
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Receives the input from the form and creates a short URL, and adds it and the long version 
//  to the database. Also then creates a redirect link.
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// DELETE
app.post("/urls/:id/delete", (req, res) => {
  console.log("Delete button has been clicked", urlDatabase);
  const templateVars = { id: req.params.id };
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// UPDATE
app.post("/urls/:id/update", (req, res) => {
  console.log("Update button has been clicked", urlDatabase);
  const templateVars = { id: req.params.id };
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// REGISTER
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  res.render("urls_register", templateVars);
});
app.post("/urls_register", (req, res) => {
  console.log("Register button has been clicked!",);
  if (req.body.email === '') {
    console.log('Empty email register attempt');
    return res.status(400).send('Email cannot be empty');
  }
  if (req.body.password === '') {
    console.log('Empty password register attempt');
    return res.status(400).send('Email cannot be empty');
  }
  if (findUserEmail(req.body.email)) {
    console.log(`Email already registered => ${req.body.email}`);
    return res.status(400).send('Email already registered');

  };
  const user = {};
  user.id = generateRandomString();
  user.email = req.body.email;
  user.password = req.body.password;
  users[user.id] = user;
  res.cookie('user_id', users[user.id].id);
  res.redirect("/urls");
});


// LOG IN
app.get("/login", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  res.render("urls_login", templateVars);
});
app.post("/urls_login", (req, res) => {
  console.log("Log In button has been clicked");
  if (!findUserEmail(req.body.email)) {
    return res.status(403).send('Email not registered');
  }
  if (findUserEmail(req.body.email).password !== req.body.password) {
    return res.status(403).send('Password does not match')
  }
  res.cookie('user_id', findUserEmail(req.body.email).id);
  res.redirect("urls");
});

// LOG OUT
app.post("/logout", (req, res) => {
  console.log("Logout button has been clicked and cookies cleared");
  res.clearCookie('user_id');
  res.redirect("login");
});



// RESULTS PAGE AFTER CREATING TINY URL. ALSO INCLUDES CLICKABLE LINK TO THE NEW TINY URL
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    id: req.params.id,
    user: users[user_id],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
