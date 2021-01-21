//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

const homeStartingContent = "Greeting from MDME, This is the home page of your webside you can add your experience/ blogs here.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Hey! We feel happy if you will give us feedback.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/mdmeDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
  username : String,
  email: String,
  password: String
});
const User = new mongoose.model("User", userSchema);

const itemsSchema = {
  name : String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({ name : "Add new items here!"});
const defaultItems = [item1];



const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);


app.get("/", function(req, res){
  res.render("intro");
});

app.get("/home", function(req, res){

  var today = new Date();
  var options = {
    weekday :  "long",
    day : "numeric",
    month: "long" };

  var day = today.toLocaleDateString("en-US", options);

  Item.find({}, function(err, foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems, function(err){
        if(err){console.log(err);}
      });
      res.redirect("/home");
    }
    else{
    Post.find({}, function(err, posts){
    res.render("home", {
    startingContent: homeStartingContent,
    posts: posts ,
    kindOfDay : day ,
    newListItems : foundItems  });
  });
  }
});
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save(function(err){
    if (!err){
        res.redirect("/home");
    }
  });
});

app.post("/home", function(req,res){
  const itemName = req.body.newItem;
    const item = new Item({
      name : itemName
    });
    item.save();
    res.redirect("/home");
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){ res.redirect("/home");}
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});
app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    username: req.body.name,
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/home");
    };
  });
});

app.post("/login", function(req, res) {
const username = req.body.username;
const password = req.body.password;

User.findOne({ email: username}, function(err, found) {
  if (err) {res.redirect("/register");}
  else {
    if(found) {
      if(found.password == password) {
        res.redirect("/home"); }
      else{res.redirect("/register");}
    }}
});
});
app.get("/logout", function(req, res) {
  res.render("intro");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
