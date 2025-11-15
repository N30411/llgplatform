import React from 'react';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  const hasData = data && data.length > 0;

  return (
  <div className="bg-white shadow-xl rounded-2xl border border-gray-100/60">
  <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {hasData ? (
              data.map((item, idx) => (
                <tr 
                  key={item.id}
                  className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary/5 hover:shadow-lg`}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 font-medium"
                    >
                      {column.render ? 
                        column.render(item[column.key], item) :
                        column.key.toLowerCase().includes('amount') || column.key.toLowerCase().includes('budget') ?
                          `$${Number(item[column.key]).toLocaleString()}` :
                        column.key === 'status' ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${item[column.key] === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                              item[column.key] === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {item[column.key]}
                          </span>
                        ) : column.key === 'progress' ? (
                          <div className="flex items-center">
                            <span className="mr-2">{item[column.key]}%</span>
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-1.5 bg-blue-600 rounded-full"
                                style={{ width: `${item[column.key]}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          item[column.key]
                        )
                      }
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors mr-2 inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors inline-flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + 1} 
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="mt-2 font-medium">No data available</span>
                    <span className="text-gray-400">Add some items to see them here</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;