const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {};

const users = {};

const findUserEmail = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id) => {
  const output = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      output[shortURL] = urlDatabase[shortURL];
    }
  }
  return output;
};

function generateRandomString() {
  let RdmNum = Math.random().toString(36).substring(3, 9);
  return RdmNum;
}

// HOMEPAGE REQUEST THAT SHOWS THE DATABASE OF URLS  -----------------------------------------
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    urls: urlsForUser(user_id),
    user: users[user_id]
  };
  if (!req.cookies['user_id']) {
    res.send("Please log in to view URLS");
  }
  else {
    res.render("urls_index", templateVars);
  }
});

// SHOWS 'NEW' PAGE WHICH SHOWS THE FORM TO ENTER A 'NEW' URL  ----------------------------------
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  if (!req.cookies['user_id']) {
    console.log("Redirected to Login   page");
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  };
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//Receives the input from the form and creates a short URL, and adds it and the long version 
//  to the database. Also then creates a redirect link.
app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    res.send("You must be logged in to shorten a URL");
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userID
    };
    console.log('URLDATABASE', urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }
});

// DELETE  -----------------------------------------------------------------------------------
app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.cookies['user_id'];
  console.log("Delete button has been clicked", urlDatabase);
  const templateVars = {
    id: req.params.id,
    urlDatabase: urlDatabase
  };
  // userID on cookies must match userID on shortURL[userID]
  if (user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  }
  else {
    res.send("You do not have access to delete this URL");
  }
});

// UPDATE -------------------------------------------------------------------------------------
app.post("/urls/:id/update", (req, res) => {
  const user_id = req.cookies['user_id'];
  console.log("Update button has been clicked", urlDatabase);
  const templateVars = {
    id: req.params.id,
    urls: urlDatabase,
    urlDatabase: urlDatabase
  };
  if (user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
  else {
    res.send("You do not have access to edit this URL");
  }

});

// REGISTER ------------------------------------------------------------------------------------
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  if (!req.cookies['user_id']) {
    res.render("urls_register", templateVars);
  } else {
    console.log("Redirected to URLS page");
    res.redirect("urls");
  };
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
  console.log("cookie added from registering");
  res.cookie('user_id', users[user.id].id);
  res.redirect("/urls");
});


// LOG IN --------------------------------------------------------------------------------------
app.get("/login", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = {
    user: users[user_id],
  };
  if (!req.cookies['user_id']) {
    res.render("urls_login", templateVars);
  } else {
    console.log("Redirected to URLS page");
    res.redirect("urls");
  };
});
app.post("/urls_login", (req, res) => {
  console.log("Log In button has been clicked");
  if (!findUserEmail(req.body.email)) {
    return res.status(403).send('Email not registered');
  }
  if (findUserEmail(req.body.email).password !== req.body.password) {
    return res.status(403).send('Password does not match');
  }
  console.log("cookie added from logging in");
  res.cookie('user_id', findUserEmail(req.body.email).id);
  res.redirect("urls");
});

// LOG OUT ---------------------------------------------------------------------------------------
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
    longURL: urlDatabase[req.params.id].longURL
  };
  if (!urlDatabase[req.params.id]) {
    res.send("URL ID does not exist");
  } else {
    res.render("urls_show", templateVars);
  }
});


app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
