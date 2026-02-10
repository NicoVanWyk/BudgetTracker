// src/components/Navigation.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 100;
`;

const NavItem = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.$active ? '#2196F3' : '#666'};
  transition: color 0.2s ease;
  
  &:hover {
    color: #2196F3;
  }
  
  .icon {
    font-size: 1.25rem;
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  @media (max-width: 480px) {
    .label {
      font-size: 0.7rem;
    }
  }
`;

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/add-entry', icon: '➕', label: 'Add Entry' },
    { path: '/categories', icon: '📂', label: 'Categories' },
    { path: '/reports', icon: '📊', label: 'Reports' }
  ];

  return (
    <NavContainer>
      {navItems.map(item => (
        <NavItem
          key={item.path}
          $active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </NavItem>
      ))}
    </NavContainer>
  );
};

export default Navigation;