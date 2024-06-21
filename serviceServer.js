const express = require('express');
const cors = require('cors');
const search = require('./api/search');
const detail = require('./api/detail');
const festival = require('./api/festival');
const accommodation = require('./api/accommodation');
const areaCode = require('./api/areaCode');
const areaBasedSearch = require('./api/areaBasedSearch');
const createReview = require("./api/reviews/createReview");
const listReview = require('./api/reviews/listReview.js');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = Number(process.env.SERVERPORT);

const { User } = require("./models/user.js");
const { auth } = require("./middleware/auth.js");
const locationBasedSearch = require('./api/locationBasedSearch.js');

const app = express();

app.use(cors({
    // origin: process.env.PAGEURL,
    origin: '*',
    // origin: 'https://tripstory.netlify.app',
    credentials: true, 
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(process.env.DBCONNECTURL, {
    // Node.js Driver 4.0.0 부터 아래 설정값은 기본값이므로 제거
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    dbName: 'tourKR_db'
}).then(() => console.log("Databases Connected..."))
.catch((error) => console.log("MongoDB Connect Error : " + error));

// 회원등록
app.post("/api/users/register", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(200).json({ success: true, user: savedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// 로그인
app.post("/api/users/login", async (req, res) => {
    try {
        // 요청된 이메일을 데이터베이스에서 찾음
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "이메일에 해당하는 유저가 없습니다.",
            });
        }

        // 비밀번호 비교
        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            return res.json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다.",
            });
        }

        // 비밀번호까지 맞으면 토큰 생성
        const token = await user.generateToken();

        // 토큰을 쿠키에 저장하고 로그인 성공 응답
        res.cookie("x_auth", token, { 
            // httpOnly: true,
            // sameSite: 'strict'
            sameSite: 'lax',
            secure: true
        })
        .status(200)
        .json({ 
            loginSuccess: true, 
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userGender: user.gender,
            userBirthDay: user.birthdate,
            userNickname: user.nickname,
            userRole: user.role
        });
    } catch (error) {
        console.error("로그인 오류:", error);
        res.status(500).json({ loginSuccess: false, message: "로그인 중 오류가 발생했습니다." });
    }
});

// 인증
// auth 미들웨어를 통과해야 다음으로 넘어감
app.get("/api/users/auth", auth, (req, res) => {
    // 미들웨어를 통과하면 Authentication이 true
    res.status(200).json({
        userId: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        userEmail: req.user.email,
        userName: req.user.name,
        userNickname: req.user.nickname,
        userBirthDay: req.user.birthdate,
        userRole: req.user.role,
        image: req.user.image,
    });
});
    
// 로그아웃
app.get("/api/users/logout", auth, async (req, res) => {
    try {
        res.clearCookie("x_auth");

        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { token: "" },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "유저를 찾을 수 없습니다." });
        }

        return res.status(200).send({ success: true });
    } catch (error) {
        console.error("로그아웃 오류:", error);
        return res.status(500).json({ success: false, message: "로그아웃 중 오류가 발생했습니다." });
    }
});

// 사용자 정보 수정
app.post("/api/users/update", async (req, res) => {
    try {
        const { userId, nickname, email, birthdate } = req.body;

        console.log(req.body, "req.body");

        const updateUser = await User.findByIdAndUpdate(
            userId,
            { nickname, email, birthdate },
            { new: true }
        )

        console.log(updateUser, "<= updateUser");

        if (!updateUser) {
            return res.status(404).json({ success: false, message : "Not Found User" });
        }
        return res.status(200).json({ success : true, user: updateUser });
    }catch(error) {
        console.log("Update Error : ", error);
        return res.status(500).json({ success : false, message : "수정 중 오류 발생" })
    }
});

// 지역코드
app.get('/api/areaCode', async(req, res) => {
    const queryString = req.query;
    const pageNo = queryString.pageNo || 1;

    await areaCode(pageNo, (error, {result, totalCount}={}) => {
        if (error) {
            res.send(error);
        }
        res.send({result, totalCount});
    });
})

// 키워드 검색
app.get('/api/search', async(req, res) => {
    const queryString = req.query;
    const keyword = queryString.keyword || '서울';
    const pageNo = queryString.pageNo || 1;

    await search(keyword, pageNo, (error, {result, totalCount}={}) => {
        if (error) {
            res.send(error);
        }
        res.send({result, totalCount});
    });
})

// 키워드 검색 상세페이지
app.get('/api/detail', async(req, res) => {
    const queryString = req.query;

    const contentId = queryString.contentid;
    const contentTypeId = queryString.contenttypeid;

    await detail(contentId, contentTypeId, (error, {result}={}) => {
        if (error) {
            res.send(error);
        }
        res.send(result);
    });
})

// 지역기반 검색
app.get('/api/areaBasedSearch', async (req, res) => {
    const queryString = req.query;
    const areaCodeNumber = queryString.areaCode;
    const pageNo = queryString.pageNo || 1;

    await areaBasedSearch(areaCodeNumber, pageNo, (error, {result, totalCount}={}) => {
        if (error) {
            res.send(error);
        }
        res.send({result, totalCount});
    });
})

// 지역기반 검색 상세페이지
app.get('/api/areaBasedSearch/detail', async(req, res) => {
    const queryString = req.query;

    const contentId = queryString.contentid;
    const contentTypeId = queryString.contenttypeid;

    await detail(contentId, contentTypeId, (error, {result}={}) => {
        if (error) {
            res.send(error);
        }
        res.send(result);
    });
})

// 행사 정보
app.get('/api/festival', async (req, res) => {
    const queryString = req.query;
    const pageNo = queryString.pageNo || 1;

    await festival('20170901', pageNo, (error, { result, totalCount } = {}) => {
        if (error) {
            res.send(error);
        }
        res.send({ result, totalCount });
    });
})

// 행사 정보 상세페이지
app.get('/api/festival/detail', async(req, res) => {
    const queryString = req.query;

    const contentId = queryString.contentid;
    const contentTypeId = queryString.contenttypeid;

    await detail(contentId, contentTypeId, (error, {result}={}) => {
        if (error) {
            res.send(error);
        }
        res.send(result);
    });
})

// 숙박 정보 
app.get('/api/accommodation', async (req, res) => {
    const queryString = req.query;
    const pageNo = req.query.pageNo || 1;

    await accommodation(pageNo, (error, { result, totalCount } = {}) => {
        if (error) {
            res.send(error);
        }
        res.send({ result, totalCount });
    });
})

// 숙박 정보 상세페이지
app.get('/api/accommodation/detail', async (req, res) => {
    const queryString = req.query;
    console.log(queryString, "queryString");

    const contentId = queryString.contentid;
    const contentTypeId = queryString.contenttypeid;

    await detail(contentId, contentTypeId, (error, {result}={}) => {
        if (error) {
            res.send(error);
        }
        res.send(result);
    });
})

// 지역기반 검색
app.get('/api/locationBasedSearch', async (req, res) => {
    const queryString = req.query;
    const mapX = queryString.mapX;
    const mapY = queryString.mapY;
    const pageNo = queryString.pageNo || 1;

    await locationBasedSearch(Number(mapX), Number(mapY), pageNo, (error, {result, totalCount}={}) => {
        if (error) {
            res.send(error);
        }
        res.send({result, totalCount});
    });
})

// 리뷰 작성
app.get(`/api/reviews/list`, listReview);
app.post('/api/reviews/create', createReview);

app.listen(PORT, () => {
    console.log(`Server is running at the port ${PORT}...`);
})