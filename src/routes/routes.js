const express = require("express");
const router = express.Router();

const UserAPIs = require("../controller/UserAPIs");
const BookAPIs = require("../controller/BookAPIs");
const ReviewAPIs = require("../controller/ReviewAPIs");

router.get("/test-me", function (req, res) {
  res.send("My server is running");
});

router.post("/books",BookAPIs.createBook)

module.exports = router;
