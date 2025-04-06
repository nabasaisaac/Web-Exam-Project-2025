/**
 * Navbar Component
 * 
 * This component renders the top navigation bar of the application.
 * It includes the application logo, main navigation links,
 * and user-related actions (notifications and profile).
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    // Navigation bar with white background and shadow
    <nav className="bg-white shadow-lg">
      {/* Container with max width and padding */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Flex container for logo and navigation items */}
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Daystar Daycare
              </Link>
            </div>
          </div>
          
          {/* Right side - Navigation links and user menu */}
          <div className="flex items-center">
            {/* Main navigation links - hidden on mobile */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Navigation links with hover effects */}
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/children" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Children
                </Link>
                <Link to="/babysitters" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Babysitters
                </Link>
                <Link to="/finance" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Finance
                </Link>
              </div>
            </div>
            
            {/* User menu section */}
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications button */}
              <button className="p-1 rounded-full text-gray-600 hover:text-indigo-600 focus:outline-none">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              {/* User profile button */}
              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none">
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 