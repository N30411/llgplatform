import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon, delta, trend = 'none' }) => {
  return (
  <div className="rounded-xl bg-gradient-to-br from-primary-light to-secondary-light p-5 border border-primary/30 transition-all duration-200 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <dt className="text-base font-bold text-primary drop-shadow">{title}</dt>
          <dd className="mt-1 text-3xl font-extrabold text-secondary drop-shadow">{value}</dd>
        </div>
        <div className="flex items-center">
    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-lg">
            {icon}
          </div>
        </div>
      </div>
      {delta && (
        <div className="mt-4 flex items-center">
          {trend === 'up' && (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
          )}
          {trend === 'down' && (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" aria-hidden="true" />
          )}
          <p className={`text-sm ${
            trend === 'up' ? 'text-green-300' :
            trend === 'down' ? 'text-rose-300' :
            'text-slate-200'
          }`}>
            {delta}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatCard;
