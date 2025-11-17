import React, { useState, useEffect } from 'react';
import axios from 'axios';



const SalaryComponents = () => {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // 👈 ADD THIS LINE

    useEffect(() => {
        fetchComponents();
    }, []);

    const fetchComponents = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:5000/api/v2/salary-components', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-org-id': 'ORG001'
                }
            });
            setComponents(response.data.components);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching components:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    // Filter components based on selected category
    const filteredComponents = components.filter(comp => {
        if (filter === 'ALL') return true;
        if (filter === 'EARNING') return comp.category === 'EARNING';
        if (filter === 'DEDUCTION') return comp.category === 'DEDUCTION';
        return true;
    });
    return (
        <div className="flex min-h-screen bg-gray-50">
        

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header with Filters */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Salary Components</h1>
                    <p className="text-gray-600 mt-2">Manage your salary structure components</p>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            All ({components.length})
                        </button>
                        <button
                            onClick={() => setFilter('EARNING')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'EARNING' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Earnings ({components.filter(c => c.category === 'EARNING').length})
                        </button>
                        <button
                            onClick={() => setFilter('DEDUCTION')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'DEDUCTION' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Deductions ({components.filter(c => c.category === 'DEDUCTION').length})
                        </button>
                    </div>
                </div>
                {/* Components List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">
                            {filter === 'ALL' ? 'All' : filter === 'EARNING' ? 'Earning' : 'Deduction'} Components ({filteredComponents.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredComponents.map((component) => (
                                    <tr key={component._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{component.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{component.code}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${component.category === 'EARNING' ? 'bg-green-100 text-green-800' :
                                                component.category === 'DEDUCTION' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {component.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{component.componentType}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs ${component.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {component.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryComponents;