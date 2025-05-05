import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500">
        <p className="flex items-center justify-center">
          Made with <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> by 
          <a 
            href="https://adityasood.me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 text-primary-600 hover:text-primary-800 hover:underline"
          >
            Aditya
          </a>
        </p>
      </div>
    </footer>
  );
}