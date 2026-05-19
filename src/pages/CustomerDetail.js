import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
  const { id } = useParams();

  // Mock customer data
  const customer = {
    id: id,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234-567-8901',
    company: 'Tech Corp',
    status: 'Active',
    lastContact: '2024-02-15',
    deals: '$50,000',
    notes: 'Interested in premium plan. Follow up next week.',
    address: '123 Main St, New York, NY 10001'
  };

  return (
    <div className="page-content">
      <h1>Customer Details</h1>
      <div className="card">
        <h2>{customer.name}</h2>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Company:</strong> {customer.company}</p>
        <p><strong>Status:</strong> {customer.status}</p>
        <p><strong>Last Contact:</strong> {customer.lastContact}</p>
        <p><strong>Deals:</strong> {customer.deals}</p>
        <p><strong>Address:</strong> {customer.address}</p>
        <p><strong>Notes:</strong> {customer.notes}</p>
      </div>
    </div>
  );
};

export default CustomerDetail;