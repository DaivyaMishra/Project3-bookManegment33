const jwt = require("jsonwebtoken");
const { isValidObjectId, default: mongoose } = require("mongoose");
const BookModel = require("../models/BookModel")


const tokenRegex = /^[A-Za-z0-9-=]+\.[A-Za-z0-9-=]+\.?[A-Za-z0-9-_.+/=]*$/

const  isValidObjectId = function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const authentication = async function (res,res, next){
    try {
        let token = (req.header["x-api-key"])
        let secretKey = "Group33-book/management"

        if(!token){
            return res.status(400).send({status :false, msg: "Token must  be presents"});

        }
        if(!tokenRegex.test(token))
        return res.send(400).send({status :false,message: "Please provide a valid  token"})

        let decodedToken  = jwt.verify(token,secretKey)

        if(!decodedToken){
            return res.status(400).send({status :false , msg :"Authentication error"})
        }
        next()
    }
    catch(err){
        res.status(500).send({msg:"Error",error:err.message})
    }
}

const authorization = async function(req, res, next) {
    try{
        let  userId = req.userId
        let  bookId = req.param.bookId

        decodedToken = req.decodedToken

        if(!isValidObjectId(bookId))
        return res.status(400).send({status :false, message: "please provided valid book  id"})
        
        const findBook = await BookModel.find({_id:bookId, isDeleted:false})
        if(!findBook)
         res.status(404).send({status:false,msg :"No book found or it may be deleted"})

       if(decodedToken.userId != findBook.userId)  {
        next();

       }else {
        res.status(401).send({status:false,msg:"user logged is not  allows or modify or assess the author Data"})
       }
    }
    catch(err) {
        res.status(500).send({msg : "Error",error : err.message})
    }
}

module.exports.authentication =authentication
module.exports.authorization =authorization