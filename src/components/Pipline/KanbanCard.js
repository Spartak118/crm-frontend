import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import {
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/outline';

const KanbanCard = ({ customer, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: customer.id,
    data: {
      type: 'card',
      customer,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const primaryContact = customer.contact_info?.find(
    (info) => info.is_primary
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow"
    >
      <div className="mb-2">
        <h4 className="font-medium text-gray-900">
          {customer.first_name} {customer.last_name}
        </h4>
        <p className="text-sm text-gray-600">{customer.company_name}</p>
      </div>

      {customer.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {customer.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1 text-sm text-gray-600">
        {primaryContact?.type === 'email' && (
          <div className="flex items-center">
            <MailIcon className="w-4 h-4 mr-1" />
            <span className="truncate">{primaryContact.value}</span>
          </div>
        )}
        {primaryContact?.type === 'phone' && (
          <div className="flex items-center">
            <PhoneIcon className="w-4 h-4 mr-1" />
            <span>{primaryContact.value}</span>
          </div>
        )}
      </div>

      {customer.expected_deal_size && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-700">
            <CurrencyDollarIcon className="w-4 h-4 mr-1" />
            {customer.expected_deal_size.toLocaleString()}
          </div>
          {customer.next_follow_up && (
            <div className="flex items-center text-xs text-gray-500">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {format(new Date(customer.next_follow_up), 'MMM d')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KanbanCard;