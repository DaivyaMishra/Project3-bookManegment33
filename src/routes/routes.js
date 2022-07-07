const express = require("express");
const router = express.Router();

const UserAPIs = require("../controller/UserAPIs");
const BookAPIs = require("../controller/BookAPIs");
const ReviewAPIs = require("../controller/ReviewAPIs");
const middleware = require("../middle/midfile");

router.post("/register", UserAPIs.createUser);
router.post("/login", UserAPIs.loginUser);
router.post("/books", BookAPIs.createBook);
router.get("/books", BookAPIs.getbooks);
router.get("/books/bookid", BookAPIs.getBooksRevies);
router.put("/books/bookid", BookAPIs.updateBooks);
router.delete("/books/bookId", BookAPIs.deleteBook);
module.exports = router;
