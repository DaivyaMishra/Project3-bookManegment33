const mongoose = require("mongoose");
const reviewModel = require("../models/reviewModel");
const BookModel = require("../models/BookModel");

const valid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value !== "string") return false;
  if (typeof value === "string" && value.trim().length == 0) return false;

  return true;
};

const isValidRequestBody = function (request) {
  return Object.keys(request).length > 0;
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

  // if(!reviewedBy) {return res.status(400).send({status:false, message:"reviewer name is required"})}

  if (reviewedBy && (!nameRegex.test(reviewedBy)) ) {return res.status(400).send({status: false, message: "Enter the reviewer name in the proper format"})}

  if (isDeleted && (isDeleted != (true || false) || isDeleted == " ")) {return res.status(400).send({ status: false, message: "Please Enter the Boolean value" })}
  
  // if(!reviewedAt  !dateRegex.test(reviewedAt)) {return res.status(400).send({status:false, message:"Enter the date in the YYYY-MM-DD format"})}

  const dataTobeAdded = { bookId, review,rating, isDeleted,
    reviewedBy: reviewedBy?reviewedBy:"Guest", 
    reviewedAt:Date.now() }
    
  const updatereview = await BookModel.findByIdAndUpdate({ _id: bookId },{ $inc: {reviews:+1}},{ new: true })

  const newReview = await reviewModel.create(dataTobeAdded)

  res.status(201).send({ status: true, message: "Success", data: updatereview, newReview  })
 }

//////////////////////////////////[Update Review]////////////////////////////////////////////////////////////////////
 const updateRview = async function(req,res){
  try{

const data= req.body
const {review, rating, reviewedBy } = data

//bookId
const bookId = req.params.bookId
const reviewId = req.params.reviewId

if(!isValidObjectId(bookId)) return res.status(400).send({status:false, message:"Enter the valid book Id"})

if(!isValidObjectId(reviewId)) return res.status(400).send({status:false, message:"Enter the valid review Id"})

if(!isValidRequestBody(data)) return res.status(400).send({status:false, message:"Enter the details you want to update"})

const isbookId = await BookModel.findOne({isDeleted: false, _id: bookId})
if(!isbookId) return res.status(404).send({status:false, Message:"No Book data found or may be deleted"})

const checkreview = await reviewModel.findOne({isDeleted: false, _id: reviewId})
if(!checkreview) return res.status(404).send({status:false, Message:"No review data found or may be deleted"})

// Reviewed By
if(reviewedBy && !valid(reviewedBy) )  {return res.status(400).send({ status: false, message: "Enter the valid Reviewers name" })}

//review
if (review && !valid(review)) {return res.status(400).send({ status: false, message: "Enter the valid review" })}
if(review &&  !reviewRegex.test(review))   {return res.status(400).send({ status: false, message: "not valid syntax enter the valid review" })}

//Rating
if(rating &&  !ratingRegex.test(rating))   {return res.status(400).send({ status: false, message: "Enter the valid rating which is between 1 to 5" })}

const getId = checkreview.bookId 
if(bookId != getId)  return res.status(404).send({status:false, Message:"bookId not match invalid book id"})

const UpdateReview = await reviewModel.findByIdAndUpdate({_id:reviewId}, {$set:{ review :review, rating: rating, reviewedBy:reviewedBy }}, {new:true})
res.status(200).send({status:true, message:"updated review data successfully", data:isbookId,UpdateReview  })
  }
  catch(err){
    return res.status(500).send({ status: false, message: "Error", error: err.message }) 
  }

}
///////////////////////////////////////////[Delete review]/////////////////////////////////////////////////////////////

// DELETE

const deleteRview = async function(req,res){
//bookId
try{
const bookId = req.params.bookId
if(!isValidObjectId(bookId)) return res.status(400).send({status:false, message:"Enter the valid book Id"})

const reviewId = req.params.reviewId
if(!isValidObjectId(reviewId)) return res.status(400).send({status:false, message:"Enter the valid review Id"})

const isbookId = await BookModel.findOne({isDeleted: false, _id: bookId})
if(!isbookId) return res.status(404).send({status:false, Message:"No data found or may be deleted"})

const checkreview = await reviewModel.findOne({isDeleted: false, _id: reviewId})
if(!checkreview) return res.status(404).send({status:false, Message:"No review data found or may be deleted"})

const getId = checkreview.bookId 
if(bookId != getId)  return res.status(404).send({status:false, Message:"bookId not match invalid book id"})

const decount = await BookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{$inc:{reviews:-1}},{new:true} )

const deleteReview = await reviewModel.findByIdAndUpdate({_id:reviewId,isDeleted:false},{$set:{isDeleted:true}},{new:true})

res.status(200).send({status:true, message:"deleted successfully"})

}catch(err) { res.status(500).send({ status: false, message: "Error", error: err.message }) }
}

module.exports.createReview = createReview
module.exports.updateRview = updateRview
module.exports.deleteRview =deleteRview