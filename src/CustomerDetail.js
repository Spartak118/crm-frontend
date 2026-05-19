import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Customer Details</h1>
      <p className="text-gray-600">Customer ID: {id}</p>
      <p className="text-gray-500 mt-4">Coming soon...</p>
    </div>
  );
};

export default CustomerDetail;