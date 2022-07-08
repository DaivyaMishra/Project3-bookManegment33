const mongoose = require("mongoose");
const BookModel = require("../models/BookModel");
const UserModel = require("../models/UserModel");
const reviewModel = require("../models/reviewModel");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (request) {
  return Object.keys(request).length > 0;
};

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

const titleRegex = /^[a-zA-Z ]{2,45}$/; //  /^[a-zA-Z\\s]*$/   <--- will not consider space between
const ISBNRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;

const createBook = async function (req, res) {
  try {
    let bookData = req.body;
    let { title, excerpt, userId, ISBN, category, subcategory } = bookData;

    //-----------------------------   validations start from here   ----------------------------------//

    if (!isValidRequestBody(bookData))
      return res
        .status(400)
        .send({ status: false, message: "No input by user.." });

    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Title is required." });

    if (!isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Excerpt are required." });

    if (!isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "User Id is required." });

    if (!isValid(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "ISBN number is required." });

    if (!isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Category is required." });

    if (!isValid(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Subcategory is required." });

    if (!titleRegex.test(title))
      return res.status(400).send({
        status: false,
        message: " Please provide valid title including characters only.",
      });

    if (!ISBNRegex.test(ISBN))
      return res.status(400).send({
        status: false,
        message: " Please provide valid ISBN of 13 digits.",
      });

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid book Id" });

    const findUser = await UserModel.findOne({ _id: userId });

    if (!findUser)
      return res
        .status(404)
        .send({ status: false, message: "No such user found with this Id" });

    const duplicateTitle = await BookModel.findOne({ title });
    if (duplicateTitle)
      return res
        .status(400)
        .send({ status: false, message: "Title already exists" });

    const duplicateISBN = await BookModel.findOne({ ISBN });

    if (duplicateISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN already exists" });

    let newBookData = {
      title: title,
      excerpt: excerpt,
      userId: userId,
      ISBN: ISBN,
      category: category,
      subcategory: subcategory,
      releasedAt: Date.now(),
    };

    const newBook = await BookModel.create(newBookData);
    return res.status(201).send({
      status: true,
      message: "New book created sucessfully",
      data: newBook,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Error", error: err.message });
  }
};

const getbooks = async function (req, res) {
  try {
    let data = req.query;
    let { userId, category, subcategory } = data;

    let filter = { isDeleted: false };

    if (isValid(userId) && isValidRequestBody(userId)) {
      filter["userId"] = userId;
    }

    if (isValid(category)) {
      filter["category"] = category;
    }

    if (isValid(subcategory)) {
      filter["subcategory"] = subcategory;
    }

    let books = await BookModel.find(filter)
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        reviews: 1,
        releasedAt: 1,
      })
      .sort({ title: 1 });

    if (books && books.length === 0)
      return res.status(404).send({
        status: false,
        msg: "no such document exist or it maybe deleted",
      });

    return res.status(200).send({
      status: true,
      msg: "Book list",
      data: books,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Error", error: err.message });
  }
};

const getBooksRevies = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    if (!isValidRequestBody(bookId))
      return res
        .status(400)
        .send({ status: false, message: "No input by user.." });

    if (!isValidObjectId(bookId))
      return res
        .status(400)
        .send({
          status: false,
          message: "invalid Book Id... Plz valid Enter Books",
        });

    const bookData = await BookModel.findOne({ _id: bookId, isDeleted: false });
    if (!bookData)
      return res
        .status(404)
        .send({ status: false, message: "No book document or delete" });

    const findReview = await reviewModel.find({
      bookId: bookId,
      isDeleted: false,
    });

    if (!findReview)
      return res
        .status(404)
        .send({
          status: false,
          message: "No review found or it maybe deleted",
        });

    const bookandReview = bookData.toObject();
    bookandReview["reviewsData"] = findReview;
    return res
      .status(200)
      .send({ status: false, message: "Book List", data: bookandReview });
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "Error", error: err.message });
  }
};

const updateBooks = async function (req, res){
  try {
    let  bookId = req.params.bookId
    let  reqbody = req.body 

    if(!isValidRequestBody(reqbody)){
    return res
      .status(400)
      .send({ status: false, message: "Invalid request"});
     }
    if(!isValidRequestBody(bookId)){
      return res
      .status(400)
      .send({ status: false, message: "Invalid Books"});
    }

    const  getbook = await BookModel.find({_id:bookId,isDeleted:false})

    if(!getbook){
    return res
      .status(404)
      .send({ status: false, message: "No found" });
    }

    const updateBook = await BookModel.findByIdAndUpdate({_id:bookId},{title:reqbody.title,excerpt:reqbody.excerpt,releasedAt:reqbody.releasedAt,ISBN:reqbody.ISBN},{new:true})
    return res
      .status(200)
      .send({ status: false, message: "successful update",data :updateBook});

}catch(err){
  return res
  .status(500)
  .send({ status: false, message: "Error",error:message });
}
}


const deleteBook = async function (req, res) {

  try {

      let bookId = req.params.bookId

      if (!isValidRequestBody(bookId)) 
      return res.status(400).send({ status: false, message: "No input by the user." })

      if (!isValidObjectId(bookId)) 
      return res.status(400).send({ status: false, message: "Invalid Book Id. plz Enter the valid Book id" })

      const getbook = await BookModel.findOne({ _id: bookId, isDeleted: false })

      if (!getbook) 
      return res.status(404).send({ status: false, message: "No document found and  may be deleted" })

      const deleteBook = await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

      return res.status(200).send({ status: true, message: "successfully deleted", data: deleteBook })

  }
  catch (err) {
      return res.status(500).send({ status: false, message: "Error", error: err.message })
  }
}


module.exports.createBook = createBook;
module.exports.getbooks = getbooks;
module.exports.getBooksRevies = getBooksRevies;
module.exports.updateBooks = updateBooks
module.exports.deleteBook =deleteBook