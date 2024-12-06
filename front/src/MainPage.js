import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Clock, MapPin, Briefcase, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './MainPage.css';

const JobCard = ({ job }) => {
  const calculateRemainingDays = (deadlineText) => {
    const regex = /(\d{2})\/(\d{2})\((.)\)/;
    const match = deadlineText.match(regex);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = new Date().getFullYear();
      const deadlineDate = new Date(year, month - 1, day);
      const currentDate = new Date();
      const timeDifference = deadlineDate - currentDate;
      return Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24)));
    }
    return 0;
  };

  return (
    <div className="enhanced-job-card">
      <div className="job-card-content">
        <div className="job-card-header">
          <h2 className="job-title">{job.title}</h2>
          <span className="job-deadline">
            D-{calculateRemainingDays(job.deadline)}
          </span>
        </div>
        <div className="job-details">
          <div className="job-company">{job.company}</div>
          <div className="job-location">{job.location}</div>
          <div className="job-meta">
            <span>{job.experience}</span>
            <span>{job.jobType}</span>
          </div>
        </div>
        <div className="job-card-actions">
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="job-details-link"
          >
            상세 정보
          </a>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    career: '',
    employmentType: '',
    region: ''
  });
  const [user, setUser] = useState(null); // 로그인 상태 확인용
  const jobsPerPage = 10;

  useEffect(() => {
    // 로컬스토리지에서 로그인된 사용자 정보 확인
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }

    axios
      .get('http://localhost:5000/api/crawl')
      .then((response) => {
        if (response.data.success) {
          const jobsData = response.data.jobs.map((job) => ({
            ...job,
            companyLogo: `/logos/${job.company}.png`
          }));
          setJobs(jobsData);
          setFilteredJobs(jobsData);
          setLoading(false);
        } else {
          console.log('크롤링된 데이터가 없습니다.');
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('데이터 로딩 오류:', error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // 로컬스토리지에서 사용자 정보 삭제
    setUser(null); // 상태 초기화
    navigate('/main'); // 로그인 페이지로 이동
  };

  const filteredAndSearchedJobs = useMemo(() => {
    return filteredJobs.filter((job) => {
      const matchesCareer = !filters.career || job.experience === filters.career;
      const matchesEmploymentType =
        !filters.employmentType || job.jobType === filters.employmentType;
      const matchesRegion = !filters.region || job.location.includes(filters.region);
      return matchesCareer && matchesEmploymentType && matchesRegion;
    });
  }, [filteredJobs, filters]);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredAndSearchedJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredAndSearchedJobs.length / jobsPerPage);
  const range = 2;
  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);
  const pageNumbers = [];

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="main-header">
        <div className="header-content">
          <div className="logo">JOBHUB</div>
          <nav className="main-nav">
            <Link to="/jobs" className="nav-link">채용</Link>
            <Link to="/companies" className="nav-link">기업</Link>
            <Link to="/resumes" className="nav-link">이력서</Link>
            <Link to="/ChatUI" className="nav-link">직군추천</Link>
            <Link to="/mypage" className="nav-link">마이페이지</Link>
          </nav>
          <div className="auth-buttons">
            {user ? (
              <>
                <span>{user.username}님 접속</span>
                <button className="logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button className="login-btn" onClick={() => navigate('/login')}>
                  로그인
                </button>
                <button className="signup-btn" onClick={() => navigate('/register')}>
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="main-content-grid">
        <div className="enhanced-left-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">
              <Filter size={20} /> 상세 검색
            </h3>

            <div className="filter-group">
              <label>경력</label>
              <select
                onChange={(e) => handleFilterChange('career', e.target.value)}
                value={filters.career}
              >
                <option value="">전체</option>
                <option value="신입">신입</option>
                <option value="경력">경력</option>
                <option value="무관">경력무관</option>
              </select>
            </div>

            <div className="filter-group">
              <label>고용 형태</label>
              <select
                onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                value={filters.employmentType}
              >
                <option value="">전체</option>
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="인턴">인턴</option>
              </select>
            </div>

            <div className="filter-group">
              <label>지역</label>
              <select
                onChange={(e) => handleFilterChange('region', e.target.value)}
                value={filters.region}
              >
                <option value="">전체</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
              </select>
            </div>
          </div>
        </div>

        <div className="job-listings">
          <div className="job-search">
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="job-cards">
            {currentJobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => paginate(prevPage)} disabled={!prevPage}>
              이전
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={number === currentPage ? 'active' : ''}
              >
                {number}
              </button>
            ))}
            <button onClick={() => paginate(nextPage)} disabled={!nextPage}>
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
