import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import CalculateEmi from '../pages/CalculateEmi';

const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 z-50 group"
        title="Salary Calculator"
      >
        <Calculator className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          💰
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Calculator Component */}
            <div className="p-6">
              <CalculateEmi />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator;