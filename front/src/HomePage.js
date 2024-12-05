import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to the Main Page!</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
}

export default HomePage;
