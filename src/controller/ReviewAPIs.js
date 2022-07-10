const mongoose = require("mongoose");
const reviewModel = require("../models/reviewModel");
const BookModel = require("../models/BookModel");

const valid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value !== "string") return false;
  if (typeof value === "string" && value.trim().length == 0) return false;

  return true;
};

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

let ObjectIdRegex = /^[0-9a-fA-F]{24}$/;
let reviewRegex = /^[a-zA-Z_.-\s]+$/;
let ratingRegex = /^[1-5]+$/;
let nameRegex = /^[a-zA-Z]{2,45}$/;
const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/

// ///////////////////////////////[Create Review]////////////////////////////////////////////////////////////

const createReview = async function (req, res) {
   const data = req.body;
  const bookId = req.params.bookId;
  const { review, rating, reviewedBy, isDeleted, reviewedAt } = data;

  if (!valid(bookId) || !isValidObjectId(bookId)) {return res.status(400).send({ status: false, message: "Enter the correct bookId" })}
  if (!ObjectIdRegex.test(bookId)) {return res.status(400).send({ status: false, message: "Enter the valid Book Id" })}

  const isValidbookId = await BookModel.findOne({isDeleted: false,_id: bookId});
  
  if (isValidbookId === null) {return res.status(404).send({ status: false, message: "No such book exists" })}

  if (Object.keys(data).length == 0) {return res.status(400).send({ status: false, message: "Enter the details" }) }

  if (review && !valid(review)) {return res.status(400).send({ status: false, message: "Enter the valid review" })}

  if (!reviewRegex.test(review)) {return res.status(400).send({ status: false, message: "Enter the valid review" })}

  if (!rating || !ratingRegex.test(rating)) {return res.status(400).send({status: false, message: "Enter the rating which is in between 1 to 5" })}

  if(!reviewedBy) {return res.status(400).send({status:false, message:"reviewer name is required"})}

  // if (reviewedBy && (!nameRegex.test(reviewedBy)) ) {return res.status(400).send({status: false, message: "Enter the reviewer name in the proper format"})}

  if (isDeleted && (isDeleted != (true || false) || isDeleted == " ")) {return res.status(400).send({ status: false, message: "Please Enter the Boolean value" })}
  
  if(!reviewedAt || !dateRegex.test(reviewedAt)) {return res.status(400).send({status:false, message:"Enter the date in the YYYY-MM-DD format"})}

  const dataTobeAdded = { bookId, review,rating, isDeleted,
    reviewedBy: reviewedBy?reviewedBy:"Guest", reviewedAt }

  const updatereview = await BookModel.findByIdAndUpdate({ _id: bookId },{ $inc: {reviews:+1}},{ new: true })

  const newReview = await reviewModel.create(dataTobeAdded)

  res.status(201).send({ status: true, message: "Success", data: newReview })
 }
module.exports.createReview = createReview
