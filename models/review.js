const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    locationId: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 참조할 User 모델
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        maxlength: 50,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        required: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    images: {
        type: [String], // 문자열 배열로 사진 URL 저장
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
});

reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;