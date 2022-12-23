//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String,
  list: String
});

const Item = mongoose.model("Item",itemSchema);


app.get("/", function(req, res) {

  const day = date.getDate();
  const items = [];
  const forward = "";

  Item.find(function (err, itemArray) {
    if(err){
      console.log('err');
    }
    else {
      itemArray.forEach(function (item) {
        if(item.list == "Simple"){
          items.push(item.name);
        }
      });
    }
    res.render("list", {listTitle: day, newListItems: items, forward: forward});
  });

});

app.post("/", function(req, res){
  const item = req.body.newItem;

    const normalItem = new Item({
      name: item,
      list: "Simple"
    });
    normalItem.save();
    res.redirect("/");
});

app.post("/delete", function (req,res) {

  const deleteItem = req.body.checkbox;

  var redirect = "";

  Item.find(function (err, itemArray) {
    if(err){
      console.log('err');
    } else {
      itemArray.forEach(function (item) {
        if(item.name == deleteItem){
          redirect = item.list;
          if(redirect == "Simple"){
            redirect = "";
          }
        }
      });
      Item.deleteOne({name: deleteItem},function (err) {

        if(err){
          console.log(err);
        } else {
          console.log("Successful Delete");
        }
      });
      res.redirect("/"+redirect);
      }
  });
});

app.get("/:newList", function (req,res) {
  const items = [];
  const newList = _.lowerCase(req.params.newList);
  Item.find(function (err, itemArray) {
    if(err){
      console.log(err);
    }
    else {
      itemArray.forEach(function (item) {
        if(item.list == newList){
          items.push(item.name);
        }
      });
    }
    res.render("list", {listTitle: newList, newListItems: items, forward: newList});
  });
});

app.post("/:newList",function (req,res) {
  newList = req.params.newList;
  newItem = new Item({
    name: req.body.newItem,
    list: _.lowerCase(newList)
  });
  newItem.save();
  res.redirect("/"+newList)
});

// app.get("/work", function(req,res){
//
//   const workItems = [];
//
//   Item.find(function (err, itemArray) {
//     if(err){
//       console.log(err);
//     }
//     else {
//       itemArray.forEach(function (item) {
//         if(item.list == "Work"){
//           workItems.push(item.name);
//         }
//       });
//     }
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
//   });
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port ",port);
});
