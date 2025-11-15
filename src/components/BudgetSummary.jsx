import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const BudgetSummary = ({ budgetData = [] }) => {
  const totalBudget = useMemo(() => budgetData.reduce((acc, item) => acc + (item.amount || 0), 0), [budgetData]);
  const totalAllocated = useMemo(() => budgetData.reduce((acc, item) => acc + (item.allocated || 0), 0), [budgetData]);
  const allocationPercentage = useMemo(() => totalBudget ? Math.round((totalAllocated / totalBudget) * 100) : 0, [totalAllocated, totalBudget]);

  return (
    <div className="rounded-2xl bg-white p-6 border border-gray-100/60 shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-primary">Budget Summary</h3>
        <Link
          to="/budgets"
          className="text-sm font-bold text-secondary hover:text-primary flex items-center transition-colors duration-200"
        >
          View details
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="text-sm text-primary mb-1 font-bold">Total Budget</div>
          <div className="text-2xl font-extrabold text-primary">
            ${totalBudget.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-secondary/5 rounded-lg">
          <div className="text-sm text-secondary mb-1 font-bold">Allocated</div>
          <div className="text-2xl font-extrabold text-secondary">
            ${totalAllocated.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {budgetData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">{item.category || 'N/A'}</div>
              <div className="text-xs text-gray-500">{item.wardName || 'Unknown Ward'}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-900">
                ${item.allocated?.toLocaleString() || 0}
              </div>
              <div className={`flex items-center ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.trend > 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">Budget Allocation</div>
          <div className="text-sm font-medium text-gray-900">{allocationPercentage}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              allocationPercentage > 90 ? 'bg-red-600' : allocationPercentage > 75 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${allocationPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
