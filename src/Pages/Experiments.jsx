import React from 'react';
import { FlaskRound as Flask, Search, Filter } from 'lucide-react';

const Experiments = () => {
  const experiments = [
    { id: 1, name: 'Acid-Base Titration', category: 'Chemistry', difficulty: 'Intermediate', duration: '30 min' },
    { id: 2, name: 'Paper Chromatography', category: 'Chemistry', difficulty: 'Beginner', duration: '20 min' },
    { id: 3, name: 'Electrolysis of Water', category: 'Physics', difficulty: 'Advanced', duration: '45 min' },
    { id: 4, name: 'pH Scale Measurement', category: 'Chemistry', difficulty: 'Beginner', duration: '15 min' },
    { id: 5, name: 'Osmosis in Cells', category: 'Biology', difficulty: 'Intermediate', duration: '25 min' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Experiments</h1>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
            <Filter size={18} className="mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search experiments..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-3">
              <Flask className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800">{exp.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{exp.category}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {exp.difficulty}
              </span>
              <span className="text-xs text-gray-400">{exp.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experiments;