const express = require("express");
const router = express.Router();

const UserAPIs = require("../controller/UserAPIs");
const BookAPIs = require("../controller/BookAPIs");
const ReviewAPIs = require("../controller/ReviewAPIs");
const middleware = require("../middle/midfile");

router.post("/register", UserAPIs.createUser);
router.post("/login", UserAPIs.loginUser);

router.post("/books", middleware.authentication,BookAPIs.createBook);

router.get("/books", middleware.authentication, BookAPIs.getBooksByQuery);
router.get("/books/:bookId", BookAPIs.getBooksById);

router.put("/books/:bookId", BookAPIs.updateBooks);
router.delete("/books/:bookId", BookAPIs.deleteBook);

router.post("/books/:bookId/review", ReviewAPIs.createReview);

//router.put("/books/bookId/",ReviewAPIs.)
//router.delete("/books/bookId/review",ReviewAPIs)
module.exports = router;
