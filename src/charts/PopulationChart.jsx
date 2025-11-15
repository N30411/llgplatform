import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PopulationChart = ({ data }) => {
  return (
    <div className="bg-transparent p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-slate-900">Ward Population Distribution</h3>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="population" fill="#4f46e5" />
      </BarChart>
    </div>
  );
};

export default PopulationChart;