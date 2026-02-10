// src/components/SearchableSelect.js
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.error ? '#f44336' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#2196F3'};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Option = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchableSelect = ({ value, onChange, options, placeholder, error, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState(value || '');
  const containerRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setDisplayValue(value || '');
    setSearchTerm('');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setDisplayValue(value || '');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    setSearchTerm(inputValue);
    setIsOpen(true);
    
    // If exact match, select it
    const exactMatch = options.find(option => 
      option.toLowerCase() === inputValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch);
    } else {
      onChange('');
    }
  };

  const handleOptionClick = (option) => {
    setDisplayValue(option);
    setSearchTerm('');
    setIsOpen(false);
    onChange(option);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm(displayValue);
  };

  return (
    <Container ref={containerRef}>
      <Input
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        error={error}
        required={required}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <Dropdown>
          {filteredOptions.map((option, index) => (
            <Option
              key={index}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </Option>
          ))}
        </Dropdown>
      )}
    </Container>
  );
};

export default SearchableSelect;