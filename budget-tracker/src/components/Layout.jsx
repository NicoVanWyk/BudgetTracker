// src/components/Layout.js
import React from 'react';
import Navigation from './Navigation';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #2196F3;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    h1 {
      font-size: 1.25rem;
    }
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 1rem;
  padding-bottom: 80px; /* Space for bottom navigation */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem 80px;
  }
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header>
        <h1>Budget Tracker</h1>
      </Header>
      <Main>
        {children}
      </Main>
      <Navigation />
    </LayoutContainer>
  );
};

export default Layout;