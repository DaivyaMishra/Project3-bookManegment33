const express = require("express");
const router = express.Router();

const UserAPIs = require("../controller/UserAPIs");
const BookAPIs = require("../controller/BookAPIs");
const ReviewAPIs = require("../controller/ReviewAPIs");
const middleware = require("../middle/midfile");

// User API's
router.post("/register", UserAPIs.createUser);
router.post("/login", UserAPIs.loginUser);

// Book API's
router.post("/books",middleware.authentication, BookAPIs.createBook);
router.get("/books", middleware.authentication, BookAPIs.getBooksByQuery);
router.get("/books/:bookId",middleware.authentication, BookAPIs.getBooksById);

router.put("/books/:bookId", middleware.authentication, middleware.authorization, BookAPIs.updateBooks);
router.delete("/books/:bookId",  middleware.authentication, middleware.authorization, BookAPIs.deleteBook);

// Review API's
router.post("/books/:bookId/review", ReviewAPIs.createReview)
router.put("/books/:bookId/review/:reviewId", ReviewAPIs.updateRview)
router.delete("/books/:bookId/review/:reviewId", ReviewAPIs.deleteRview)

//router.put("/books/bookId/",ReviewAPIs.)
//router.delete("/books/bookId/review",ReviewAPIs)
module.exports = router;
