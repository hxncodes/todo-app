require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const res = require("express/lib/response");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //to link css and images
app.use(bodyParser.urlencoded({ extended: true })); //parse data to server

//Connection to mongoDB
mongoose.connect(process.env.QUERY);

//Schema Declaration
const itemsSchema = { task: String, status: String };
const Item = mongoose.model("Item", itemsSchema);

//making documents according to schema
const item1 = new Item({ task: "Welcome to Todo List", status: "active" });
const item2 = new Item({ task: "Hello", status: "completed" });

const defaultItems = [item1, item2];

// Count Active Task
let activeTask;
function countActive() {
  Item.count({ status: "active" }, function (err, count) {
    if (!err) {
      activeTask = count;
    }
  });
}

//get method route
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      activeTask = 1;
      res.redirect("/");
    } else {
      countActive();
      res.render("todo", {
        newListItems: foundItems,
        activeTask: activeTask,
      });
    }
  });
});

//post method route
app.post("/", function (req, res) {
  const btnAction = req.body.todoAction;

  // Add new todo
  if (btnAction === "add") {
    const itemName = req.body.newItem;
    const item = new Item({
      task: itemName,
      status: "active",
    });
    item.save();
    res.redirect("/");
  }

  // Show all todos
  else if (btnAction === "all") {
    countActive();
    res.redirect("/");
  }

  // Show active todos
  else if (btnAction === "active") {
    Item.find({ status: "active" }, function (err, foundItems) {
      countActive();
      res.render("todo", {
        newListItems: foundItems,
        activeTask: activeTask,
      });
    });
  }

  // Delete completed todos
  else if (btnAction === "clear") {
    Item.deleteMany({ status: "completed" }, function (err) {
      if (!err) {
        countActive();
        res.redirect("/");
      }
    });
  }

  // Mark checked todos as completed
  else if (btnAction === "completed") {
    const checkedItemId = req.body.checkbox;

    Item.updateMany(
      { _id: checkedItemId },
      { status: "completed" },
      function (err) {
        if (!err) {
          countActive();
          res.redirect("/");
        }
      }
    );
  }
});

//listen server on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started at Heroku or Port 3000");
});
