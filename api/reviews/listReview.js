const Review = require("../../models/review");

const listReview = async (req, res) => {
    try {
        const { contentId } = req.query;

        const reviews = await Review.find({ locationId: contentId });

        if (!reviews.length) {
            return res.status(404).json({ success: false, message: "등록된 리뷰가 없습니다." });
        }

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Error fetching reviews" });
    }
}

module.exports = listReview;