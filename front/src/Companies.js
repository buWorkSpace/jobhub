import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building, MapPin, Star, Clock } from 'lucide-react';
import './Companies.css';

const CompanyCard = ({ company }) => {
  return (
    <div className="company-card">
      <div className="company-card-logo">
        <img 
          src={company.logoUrl} 
          alt={`${company.companyName} 로고`} 
          className="company-logo"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/default-logo.png'; // 기본 로고 이미지 경로
          }}
        />
      </div>
      <div className="company-card-content">
        <div className="company-card-header">
          <h2 className="company-name">{company.companyName}</h2>
          <span className="company-type">{company.companyType}</span>
        </div>
        <div className="company-card-details">
          <div className="company-detail">
            <Building className="company-icon blue" />
            <span>{company.industry}</span>
          </div>
          <div className="company-detail">
            <MapPin className="company-icon green" />
            <span>{company.location || '위치 정보 없음'}</span>
          </div>
          <div className="company-detail">
            <Clock className="company-icon purple" />
            <span>평균 연봉: {company.avgSalary} KRW</span>
          </div>
          <div className="company-detail">
            <Star className="company-icon yellow" />
            <span>연봉 범위: {company.minSalary} - {company.maxSalary} KRW</span>
          </div>
        </div>
      </div>
      <div className="company-card-actions">
        <a 
          href="#" 
          className="company-details-link"
        >
          상세 정보
        </a>
      </div>
    </div>
  );
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    minSalary: '',
    companyType: ''
  });
  const companiesPerPage = 10;

  useEffect(() => {
    axios.get('http://localhost:5000/api/salary-crawl')
      .then(response => {
        if (response.data.success) {
          const companiesWithValidLogos = response.data.salaries.map(company => ({
            ...company,
            logoUrl: company.logoUrl || '/default-logo.png' // 로고 URL이 없는 경우 기본 로고 사용
          }));
          setCompanies(companiesWithValidLogos);
          setFilteredCompanies(companiesWithValidLogos);
          setLoading(false);
        } else {
          console.log('기업 데이터가 없습니다.');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('데이터 로딩 오류:', error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    applyFilters(searchQuery, { ...filters, [name]: value });
  };

  const applyFilters = (query = searchQuery, currentFilters = filters) => {
    let filtered = companies;

    // 검색어 필터
    if (query) {
      filtered = filtered.filter((company) =>
        company.companyName.toLowerCase().includes(query.toLowerCase()) ||
        company.industry.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 산업 필터
    if (currentFilters.industry) {
      filtered = filtered.filter(company => 
        company.industry === currentFilters.industry
      );
    }

    // 최소 연봉 필터
    if (currentFilters.minSalary) {
      filtered = filtered.filter(company => 
        parseInt(company.avgSalary.replace(/,/g, '')) >= parseInt(currentFilters.minSalary)
      );
    }

    // 기업 유형 필터
    if (currentFilters.companyType) {
      filtered = filtered.filter(company => 
        company.companyType === currentFilters.companyType
      );
    }

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  };

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  
  const range = 2;
  const startPage = Math.max(1, currentPage - range);
  const endPage = Math.min(totalPages, currentPage + range);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  // 고유한 산업 목록 생성
  const uniqueIndustries = [...new Set(companies.map(company => company.industry))];
  const uniqueCompanyTypes = [...new Set(companies.map(company => company.companyType))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="companies-container">
      <h1 className="companies-title">기업 정보</h1>

      <div className="search-filter-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="기업 검색"
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select 
            name="industry"
            value={filters.industry}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">전체 산업</option>
            {uniqueIndustries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          <select 
            name="minSalary"
            value={filters.minSalary}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">전체 연봉</option>
            <option value="30000000">3천만원 이상</option>
            <option value="40000000">4천만원 이상</option>
            <option value="50000000">5천만원 이상</option>
          </select>

          <select 
            name="companyType"
            value={filters.companyType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">전체 기업 유형</option>
            {uniqueCompanyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="companies-grid">
          {currentCompanies.map((company, index) => (
            <CompanyCard key={index} company={company} />
          ))}
        </div>
      ) : (
        <div className="no-companies">
          <p>현재 기업 정보가 없습니다.</p>
        </div>
      )}

      <div className="pagination">
        {prevPage && (
          <button 
            onClick={() => paginate(prevPage)} 
            className="page-button"
          >
            이전
          </button>
        )}
        {pageNumbers.map((number) => (
          <button 
            key={number} 
            onClick={() => paginate(number)} 
            className={`page-button ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        {nextPage && (
          <button 
            onClick={() => paginate(nextPage)} 
            className="page-button"
          >
            다음
          </button>
        )}
      </div>

      <div className="total-pages">
        <p>{`전체 페이지: ${totalPages}`}</p>
      </div>
    </div>
  );
};

export default Companies;