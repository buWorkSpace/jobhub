const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');  // JWT 모듈 추가
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// .env 파일에서 환경 변수 불러오기
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
const kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;

// MySQL 연결 설정
const db = mysql.createConnection({
  host: dbHost,  // 환경변수로 DB 호스트 설정
  user: dbUser,  // 환경변수로 DB 사용자 이름 설정
  password: dbPassword,  // 환경변수로 DB 비밀번호 설정
  database: dbName,  // 환경변수로 DB 이름 설정
});

// MySQL 연결 테스트
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
  } else {
    console.log('MySQL에 성공적으로 연결되었습니다.');
  }
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// JWT 인증 미들웨어
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Authorization 헤더에서 Bearer 토큰 추출

  if (!token) {
    return res.status(403).json({ message: '토큰이 제공되지 않았습니다.' });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
    }

    req.user = user;  // 유저 정보 저장
    next();
  });
};

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { username, password, email, birthDate, gender } = req.body;

  if (!username || !password || !email || !birthDate || !gender) {
    return res.status(400).json({ success: false, message: '필수 필드가 누락되었습니다.' });
  }

  try {
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 중복 확인 및 사용자 저장
    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const insertQuery = `
      INSERT INTO users (username, email, password, birthDate, gender)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(checkQuery, [username, email], (err, results) => {
      if (err) {
        console.error('중복 확인 중 오류 발생:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
      }

      if (results.length > 0) {
        return res.json({ success: false, message: '이미 존재하는 아이디 또는 이메일입니다.' });
      }

      // 사용자 데이터 저장
      db.query(
        insertQuery,
        [username, email, hashedPassword, birthDate, gender],
        (err) => {
          if (err) {
            console.error('사용자 저장 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '회원가입 실패' });
          }

          res.json({ success: true, message: '회원가입 성공!' });
        }
      );
    });
  } catch (err) {
    console.error('회원가입 처리 중 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('로그인 중 오류 발생:', err);
      return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    res.json({ success: true, message: '로그인 성공!', user: { id: user.id, username: user.username } });
  });
});

// 카카오 로그인 처리 API
app.get('/auth', async (req, res) => {
  const { code } = req.query;

  try {
    // 카카오에서 access_token 받기
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: kakaoRestApiKey,
          redirect_uri: kakaoRedirectUri,
          code: code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // access_token을 이용하여 카카오 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, kakao_account } = userResponse.data;
    const email = kakao_account.email;

    // 카카오 사용자 데이터 저장 또는 확인
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

    db.query(checkQuery, [email], (err, results) => {
      if (err) {
        console.error('사용자 확인 중 오류 발생:', err);
        return res.status(500).send('서버 오류');
      }

      if (results.length === 0) {
        // 새 사용자 저장
        db.query(insertQuery, [`kakao_${id}`, email, ''], (err) => {
          if (err) {
            console.error('사용자 저장 중 오류 발생:', err);
            return res.status(500).send('서버 오류');
          }

          res.json({ success: true, message: '카카오 로그인 성공!', user: { email } });
        });
      } else {
        res.json({ success: true, message: '기존 사용자 로그인 성공!', user: { email } });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('카카오 로그인 처리 중 오류가 발생했습니다.');
  }
});

// 구인 공고 크롤링 API
app.get('/api/crawl', async (req, res) => {
  const keyword = req.query.keyword || 'developer';  // 기본 키워드 'developer' 사용
  const allpage = req.query.allpage || 1;  // 기본 페이지 수 1

  try {
    const allJobs = [];
    
    for (let page = 1; page <= allpage; page++) {
      const url = `https://www.saramin.co.kr/zf_user/search/recruit?search_area=main&search_done=y&search_optional_item=n&searchType=search&searchword=${keyword}&recruitPage=${page}&recruitSort=relation&recruitPageCount=100`;
      const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

      const $ = cheerio.load(response.data);
      const jobs = $('div.item_recruit');  // 구인 공고 항목 선택

      jobs.each((index, job) => {
        try {
          const today = new Date().toISOString().split('T')[0];  // 현재 날짜 (YYYY-MM-DD)
          const title = $(job).find('a').attr('title').trim().replace(',', '');
          const company = $(job).find('div.area_corp > strong > a').text().trim();
          const jobUrl = 'https://www.saramin.co.kr' + $(job).find('a').attr('href');
          const deadline = $(job).find('span.date').text().trim();
          const location = $(job).find('div.job_condition > span').eq(0).text().trim();
          const experience = $(job).find('div.job_condition > span').eq(1).text().trim();
          const requirement = $(job).find('div.job_condition > span').eq(2).text().trim();
          const jobType = $(job).find('div.job_condition > span').eq(3).text().trim();

          // MySQL에 데이터 저장
          const insertQuery = 'INSERT INTO jobs (date, title, company, url, deadline, location, experience, requirement, job_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
          db.query(insertQuery, [today, title, company, jobUrl, deadline, location, experience, requirement, jobType], (err) => {
            if (err) {
              console.error('크롤링된 데이터 저장 중 오류 발생:', err);
            }
          });

          // 크롤링된 데이터 배열에 추가
          allJobs.push({ today, title, company, jobUrl, deadline, location, experience, requirement, jobType });
        } catch (e) {
          console.error('크롤링 오류 발생:', e);
        }
      });
    }
    
    res.json({ success: true, jobs: allJobs });
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    res.status(500).json({ success: false, message: '크롤링 중 오류가 발생했습니다.' });
  }
});


// 연봉 데이터 크롤링 API
app.get('/api/salary-crawl', async (req, res) => {
  const allpage = req.query.allpage || 1; // 기본 페이지 수: 1

  try {
    const allSalaries = [];
    const baseURL = 'https://www.saramin.co.kr';

    for (let page = 1; page <= allpage; page++) {
      const url = `${baseURL}/zf_user/salaries/industry/it-list?page=${page}`;

      const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });

      if (response.status !== 200) {
        console.warn(`${page}페이지를 불러오는 데 실패했습니다.`);
        continue;
      }

      const $ = cheerio.load(response.data);
      const companies = $('li'); // 기업 정보 포함 태그 선택

      companies.each((_, company) => {
        try {
          const today = new Date().toISOString().split('T')[0]; // 현재 날짜 (YYYY-MM-DD)

          // 기업명 추출
          const companyNameTag = $(company).find('strong.tit_company a.link_tit');
          const companyName = companyNameTag.text().trim() || '기업명 없음';

          if (companyName === '기업명 없음') return; // 기업명이 없는 경우 건너뛰기

          // 기업 URL 추출 (상대 경로 -> 절대 경로 변환)
          const companyUrl = companyNameTag.attr('href') ? new URL(companyNameTag.attr('href'), baseURL).href : 'URL 없음';

          // 로고 URL 추출
          const logoUrl = $(company).find('span.inner_logo img').attr('src') || '로고 없음';

          // 기업 형태 추출
          const companyType = $(company).find('dl.info_item dt:contains("기업형태") + dd').text().trim() || '정보 없음';

          // 산업(업종) 추출
          const industry = $(company).find('dl.info_item dt:contains("산업(업종)") + dd').text().trim() || '정보 없음';

          // 연봉 정보 추출 (평균, 최저, 최고)
          const avgSalary = parseFloat($(company).find('span.wrap_graph.color01 .txt_avg').text().replace(/[^\d.-]/g, '')) || 0;
          const minSalary = parseFloat($(company).find('span.wrap_graph.color02 .txt_g').text().replace(/[^\d.-]/g, '')) || 0;
          const maxSalary = parseFloat($(company).find('span.wrap_graph.color03 .txt_g').text().replace(/[^\d.-]/g, '')) || 0;

          // 크롤링된 데이터 저장
          const insertQuery = `
            INSERT INTO companies (date, company_name, logo_url, company_type, industry, avg_salary, min_salary, max_salary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(
            insertQuery,
            [today, companyName, logoUrl, companyType, industry, avgSalary, minSalary, maxSalary],
            (err) => {
              if (err) {
                console.error('연봉 데이터 저장 중 오류 발생:', err);
              }
            }
          );

          // 결과 배열에 추가
          allSalaries.push({
            date: today,
            companyName,
            companyUrl,
            logoUrl,
            companyType,
            industry,
            avgSalary,
            minSalary,
            maxSalary,
          });
        } catch (e) {
          console.error('기업 데이터 처리 중 오류 발생:', e);
        }
      });
    }

    res.json({ success: true, salaries: allSalaries });
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    res.status(500).json({ success: false, message: '크롤링 중 오류가 발생했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 시작되었습니다.`);
});
