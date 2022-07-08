const mongoose = require ("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({
    bookId : {
        type:ObjectId,
        trim:true,
        required: [true, "Book ID is required"],
        ref: "Books"
    },
    reviewedBy: {
        type: String, 
        required: [true, "Reviewer name is required"], 
        default :'Guest', 
            
    },
    reviewedAt: {
        type: Date, 
        required: [true, "Review date  required"]
    
    },
    rating: {
        type: Number, 
        min :1, 
        max :5, 
        required: [true, "Rating is required"]
    },
    review: {
        type: String, 
        trim: true
        
    },
    isDeleted: {
        type : Boolean, 
        default: false
    }

})

module.exports = mongoose.model("Review",reviewSchema)