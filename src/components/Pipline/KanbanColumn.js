import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ column, customers }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const totalValue = customers.reduce(
    (sum, customer) => sum + (customer.expected_deal_size || 0),
    0
  );

  return (
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">{column.name}</h3>
          <span className="text-sm text-gray-500">{customers.length}</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-sm">
          <span className="text-gray-600">
            ${totalValue.toLocaleString()}
          </span>
          <span className="text-gray-600">{column.metadata?.probability}%</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-2 min-h-[200px]"
      >
        <SortableContext
          items={customers.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {customers.map((customer) => (
            <KanbanCard key={customer.id} customer={customer} />
          ))}
        </SortableContext>
      </div>

      <button className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors">
        + Add Customer
      </button>
    </div>
  );
};

export default KanbanColumn;