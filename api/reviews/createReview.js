const Review = require('../../models/review'); // 리뷰 스키마 파일 경로

const createReview = async (req, res) => {
    try {
        const { locationId, userId, nickname, rating, title, description, images } = req.body;

        // 새 리뷰 객체 생성
        const newReview = new Review({
            locationId,
            userId,
            nickname,
            rating,
            title,
            description,
            images,
        });

        if (!title || title === '') {
            res.status(400).json({ success: false, message: "제목을 작성하지 않았습니다." });
        }
        if (!description || description === '') {
            res.status(400).json({ success: false, message: "내용을 작성하지 않았습니다." });
        }

        // 리뷰 저장
        const savedReview = await newReview.save();

        // 성공 응답 반환
        res.status(200).json({ success: true, review: savedReview });
    } catch (error) {
        console.error("리뷰 생성 오류:", error);
        res.status(500).json({ success: false, message: "리뷰 생성 중 오류가 발생했습니다." });
    }
};

module.exports = createReview;