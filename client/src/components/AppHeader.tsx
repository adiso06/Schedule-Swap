import React from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, Repeat, Moon } from "lucide-react";

export default function AppHeader() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CalendarDays className="text-primary-600 h-6 w-6 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">SWAP <span className="text-sm font-normal text-gray-500">(Switch With A Person)</span></h1>
          </div>
          <div className="flex space-x-6">
            <nav className="flex space-x-6 mr-6">
              <Link href="/">
                <div className={`flex items-center text-sm font-medium ${location === '/' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Repeat className="h-4 w-4 mr-1" />
                  Swap Finder
                </div>
              </Link>
              <Link href="/moonlighting">
                <div className={`flex items-center text-sm font-medium ${location === '/moonlighting' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Moon className="h-4 w-4 mr-1" />
                  Moonlighting
                </div>
              </Link>
            </nav>
            <div>
              <span className="text-sm text-gray-500">v1.3</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
