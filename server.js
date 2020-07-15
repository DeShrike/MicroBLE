const express = require("express");
const app = express();
const port = 3000;

// https://expressjs.com/en/guide/routing.html

var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js"],
  index: false,
  maxAge: "1d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now())
  }
};

var myLogger = function (req, res, next) {
    console.log(req.hostname, req.ip, req.method, req.originalUrl);
    next();
};

app.use(myLogger);

app.use("/", express.static("www", options));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/" , function(req, res) {
    res.send("Hello");
});

app.get("/buttons" , function(req, res) {
    res.send("Getting buttons state");
});

app.get("/buttons/:id" , function(req, res) {
    res.send("Getting button " + req.params.id + " state");
});

app.get("/temp" , function(req, res) {
    res.send("Getting temperature");
});

app.get("/leds" , function(req, res) {
    res.send("Getting LED Matrix State");
});

app.get("/pins" , function(req, res) {
    res.send("Getting PIN IO State");
});

app.post("/", function (req, res) {
    res.send("Got a POST request");
});

app.put("/leds", function (req, res) {
    res.send("Got a PUT request at /leds");
});

app.delete("/leds", function (req, res) {
    res.send("Got a DELETE request at /leds");
});

app.post('/profile', function (req, res) {
    console.log(req.body);
    res.cookie("rememberme", "1", { expires: new Date(Date.now() + 900000), httpOnly: true });
    res.json(req.body);
});

app.get("/temp2", function (req, res) {
    res.redirect(301, "/temp");
});

app.get("/notfound", function (req, res) {
    res.status(404).send('Sorry, we cannot find that!');
});

app.listen(port, function() {
    console.log(`Example app listening at http://localhost:${port}`);
});

// GET /search?q=tobi+ferret
// console.dir(req.query.q)
// => 'tobi ferret'
