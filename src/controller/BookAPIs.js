const mongoose = require("mongoose");
const BookModel = require("../models/BookModel");
const UserModel = require("../models/UserModel");
const reviewModel = require("../models/reviewModel");
const { exists } = require("../models/BookModel");
const jwt = require("jsonwebtoken");


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
 const excerptRegex = /^\\s+[a-zA-Z\\s]+[.?!]$/;    
 const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/

// /////////////////////[create books]/////////////////////////////////////////////////////////////////////////////////////

const createBook = async function (req, res) {
  try {
    let bookData = req.body;
  let validUser = req.decodedToken.userId
   
    let { title, excerpt, userId, ISBN, category, subcategory, isDeleted } = bookData;
      
    if (!isValidRequestBody(bookData))return res.status(400).send({ status: false, message: "No input by user.." });
    
    if (!isValidObjectId(userId))return res.status(400).send({ status: false, message: "Please provide valid user Id" });
   
    if(userId != validUser) {return res.status(400).send({status:false, message:"unauthorised access"})}

    if (!isValid(title))return res.status(400).send({ status: false, message: "Title is required." });

    if (!isValid(excerpt))return res.status(400).send({ status: false, message: "Excerpt required." });

    if (!isValid(userId))return res.status(400).send({ status: false, message: "User Id is required." });

    if (!isValid(ISBN))return res.status(400).send({ status: false, message: "ISBN number is required." });

    if (!isValid(category))return res.status(400).send({ status: false, message: "Category is required." });

    if (!isValid(subcategory))return res.status(400).send({ status: false, message: "Subcategory is required." });

    if (!titleRegex.test(title))return res.status(400).send({status: false,message: " Please provide valid title including characters only."});

    if (!ISBNRegex.test(ISBN))return res.status(400).send({status: false, message: " Please provide valid ISBN of 13 digits."});

    const findUser = await UserModel.findOne({ _id: userId });

    if (!findUser) return res.status(404).send({ status: false, message: "No such user found with this Id" });

    const duplicateTitle = await BookModel.findOne({ title });
    if (duplicateTitle) return res.status(400).send({ status: false, message: "Title already exists" });

    const duplicateISBN = await BookModel.findOne({ ISBN });

    if (duplicateISBN) return res.status(400).send({ status: false, message: "ISBN already exists" });

    // let newBookData = { title: title, excerpt: excerpt,userId: userId, ISBN: ISBN, category: category,subcategory: subcategory,releasedAt: Date.now(),isDeleted};
let newBookData = {title, excerpt, userId, ISBN, category, subcategory, isDeleted, releasedAt: Date.now() }
    const newBook = await BookModel.create(newBookData);
   
    return res.status(201).send({ status: true,message: "New book created sucessfully", data: newBook });
  } catch (err) { return res.status(500).send({ status: false, message: "Error", error: err.message });
  }
};
// ///////////////////////////////[Get Books by querying]///////////////////////////////////////////////////////////////////////////
const getBooksByQuery = async function (req, res) {
  try {
    let data = req.query;
    let { userId, category, subcategory } = data;

    let filter = { isDeleted: false };

    if (isValid(userId) && isValidObjectId(userId)) { filter["userId"] = userId }
   
    if (isValid(category)) { filter["category"] = category }

    if (isValid(subcategory)) { filter["subcategory"] = subcategory }

    let books = await BookModel.find(filter).select({ _id: 1,title: 1,excerpt: 1,userId: 1,category: 1,reviews: 1,releasedAt: 1}).sort({ title: 1 });

    if ( books && books.length === 0)
      return res.status(404).send({status: false, msg: "no such document exist or it maybe deleted"});

    return res.status(200).send({status: true,msg: "Book list",data: books});
  } catch (err) {
    return res.status(500).send({ status: false, message: "Error", error: err.message });
  }
}
// ////////////////////////////////////////[Get Books By Id]//////////////////////////////////////////////////////////
const getBooksById = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    if (!isValidObjectId(bookId))return res.status(400).send({status: false,message: "invalid Book Id... Plz Enter the valid BookId"});

    const bookData = await BookModel.findOne({ _id: bookId, isDeleted: false });
   
    if (!bookData)return res.status(404).send({ status: false, message: "No such document found or it may be delete" });

    const findReview = await reviewModel.find({ bookId: bookId,isDeleted: false});

    const bookandReview = bookData.toObject();
    
    bookandReview["reviewsData"] = findReview;
   
    return res.status(200).send({ status: true, message: "Books List", data: bookandReview });

  } catch (err) {return res.status(500).send({ status: false, message: "Error", error: err.message });}
};

// //////////////////////////////////////////[Update Books]////////////////////////////////////////////////////////////
const updateBooks = async function (req, res){
  try {
    let  bookId = req.params.bookId
    let  reqbody = req.body 
    let {title, excerpt, ISBN, releasedAt } = reqbody

if(!isValidObjectId(bookId)){ return res.status(400).send({ status: false, message: "Enter the valid Book Id"});}

if(!isValidRequestBody(reqbody)){return res.status(400).send({ status: false, message: "Enter the details(title,excerpt,release date,ISBN)that you would like to update"})}
    
const getbook = await BookModel.findOne({_id:bookId, isDeleted:false})
if(getbook == null ) {return res.status(404).send({ status: false, message: "No data found"}) }

const isDuplicateTitle = await BookModel.findOne({title:title})
if(title && (!isValid(title) )) {return res.status(400).send({status:false, message:"Enter the valid title"})}
if(title && !titleRegex.test(title)) {return res.status(400).send({status:false, message:"Enter the valid title"}) }
if(title && isDuplicateTitle ) {return res.status(400).send({status:false, message:`title ${title} already exists`})}

const isDuplicateISBN = await BookModel.findOne({ISBN:ISBN}) 
if(ISBN && (!ISBNRegex.test(ISBN)) ){return res.status(400).send({status:false, message:"Enter the valid ISBN"})}
if(ISBN && isDuplicateISBN) {return res.status(400).send({status:false, message:`ISBN ${ISBN} already exists`})}
    
if(excerpt && (!isValid(excerpt)) ) {return res.status(400).send({status:false, message:"Enter the valid excerpt"})}
if(excerpt && excerptRegex.test(excerpt))  { return res.status(400).send({status:false, message:"Enter the valid excerpt"})}

if(releasedAt && (!dateRegex.test(releasedAt)) ) {return res.status(400).send({status:false, message:"Enter the date in the valid format YY-MM-DD"})}

const newData = await BookModel.findOneAndUpdate({_id:bookId, isDeleted:false},{$set:{title:title, excerpt:excerpt, ISBN:ISBN, releasedAt:releasedAt}}, {new:true})

res.status(200).send({status:true, message: 'Success', data:newData})

}catch(err){return res.status(500).send({ status: false, message: err.message })}
}

// ///////////////////////////////////////////////[Delete Books]///////////////////////////////////////////////////
const deleteBook = async function (req, res) {

  try {

      let bookId = req.params.bookId
      
      if (!isValidObjectId(bookId)) 
      return res.status(400).send({ status: false, message: "Invalid Book Id. please Enter the valid Book Id" })

      const getbook = await BookModel.findOne({ _id: bookId, isDeleted: false })

      if (!getbook) 
      return res.status(404).send({ status: false, message: "No document found or may be deleted" })

      const deleteBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false}, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

      return res.status(200).send({ status: true, message: "successfully deleted" })

  }
  catch (err) {
      return res.status(500).send({ status: false, message: "Error", error: err.message })
  }
}


module.exports.createBook = createBook;
module.exports.getBooksByQuery = getBooksByQuery;
module.exports.getBooksById = getBooksById;
module.exports.updateBooks = updateBooks
module.exports.deleteBook =deleteBook




// const updateBook = await BookModel.findByIdAndUpdate({_id:bookId},{title:reqbody.title,excerpt:reqbody.excerpt,releasedAt:reqbody.releasedAt,ISBN:reqbody.ISBN},{new:true})
// return res.status(200).send({ status: false, message: "successful update",data :updateBook});