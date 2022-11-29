const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let RdmNum = Math.random().toString(36).substring(3,9)
  return RdmNum;
}

// HOMEPAGE REQUEST THAT SHOWS THE DATABASE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// SHOWS 'NEW' PAGE WHICH SHOWS THE FORM TO ENTER A 'NEW' URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});


// DELETE
app.post("/urls/:id/delete", (req, res) => {
  console.log("Delete button has been clicked", urlDatabase);
  const templateVars = { id: req.params.id};
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`)
});

// UPDATE
app.post("/urls/:id/update", (req, res) => {
  console.log("Update button has been clicked", urlDatabase);
  const templateVars = { id: req.params.id };
  urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls")
});


// RESULTS PAGE AFTER CREATING TINY URL. ALSO INCLUDES CLICKABLE LINK TO THE NEW TINY URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});
