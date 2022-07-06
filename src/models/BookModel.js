const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId
const BookSchema = new mongoose.Schema(
    {
        title:
        {
            type: String,
            required: [true, "title is required"],
            unique: true,
            trim: true
        },

        excerpt:
        {
            type: String,
            required: [true, "ISBN is required"],
            trim: true
        },

        userId: {
            type: ObjectId,
            required: [true, "userId is required"],
            ref: "Users"
        },
        ISBN: {
            type: String,
            required: [true, "ISBN is required"],
            unique: true,
            trim: true
        },

        category:
        {
            type: String,
            required: [true, "category is required"],
            trim: true
        },

        subcategory: [{
            type: String, 
            required: [true,"subcategory is required"],
            trim: true
        }],
        reviews:
        {
            type: Number,
            default: 0
         },

        deletedAt: {
            type: Date
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        releasedAt: {
            type: Date,
            required: [true,"ReleasedAt is required"],

        },



    }, { timestamps: true });

module.exports =mongoose.model("Books",BookSchema)