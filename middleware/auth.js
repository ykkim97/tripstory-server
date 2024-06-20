const { User } = require("../models/user");

// 인증처리
const auth = async (req, res, next) => {
    try {
        // 클라이언트 쿠키에서 토큰을 가져온다.
        // console.log(req.headers.x_auth, "req.headers.x_auth")
        let token = req.headers.x_auth;

        if (!token) {
            return res.status(401).json({ isAuth: false, message: "No token provided" });
        }

        // 토큰을 복호화 한 후 유저를 찾는다.
        const user = await User.findByToken(token);

        if (!user) {
            return res.status(401).json({ isAuth: false, message: "Authentication failed" });
        }

        // 사용할 수 있게 해준다.
        req.token = token;
        req.user = user;
        next(); // 미들웨어에서 다음으로 넘어가는 것

    } catch (err) {
        console.error("Authentication error: ", err);
        res.status(400).json({ isAuth: false, message: "Invalid token" });
    }
};

module.exports = { auth };
