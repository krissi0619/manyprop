import React from 'react';
import './NavigationDropdown.css';

const NavigationDropdown = ({ type, isOpen, onClose }) => {
  const dropdownContent = {
    BUY: {
      sections: [
        {
          title: 'Properties by Type',
          items: ['Flat / Apartments', 'House / Villas', 'Plots / Land', 'Commercial', 'Others']
        },
        {
          title: 'Properties by budget',
          items: ['Under 50 lakh', '50 lakh - 80 lakh', '1 crore - 5 crore', 'Luxury Homes', 'Others']
        }
      ]
    },
    Rent: {
      sections: [
        {
          title: 'Properties by Type',
          items: ['Apartments for Rent', 'Individual Houses', 'PG/Co-Living Spaces', 'Commercial Rentals']
        },
        {
          title: 'Quick Searches',
          items: ['Furnished Apartments', 'Semi-Furnished', 'Rental Homes by Owner', 'Immediate Possession']
        },
        {
          title: 'Popular Location',
          items: ['Rent in Mumbai', 'Rent in Bangalore', 'Rent in Delhi', 'Rent in Pune']
        }
      ]
    },
    Sell: {
      sections: [
        {
          title: 'Tools for you',
          items: ['Post Property (Free)', 'Check Property Valuation', 'Find an Agent Near Me', 'Advice / Guide / Tips']
        }
      ]
    }
  };

  const content = dropdownContent[type];

  if (!content || !isOpen) return null;

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose}></div>
      <div className={`navigation-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="dropdown-content">
          {content.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="dropdown-section">
              <h4 className="dropdown-section-title">{section.title}</h4>
              <ul className="dropdown-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="dropdown-item">
                    <a href="#" className="dropdown-link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavigationDropdown;