import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const KanbanBoard = () => {
  const [activeId, setActiveId] = useState(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: pipelineData, isLoading } = useQuery(
    'pipeline',
    async () => {
      const response = await api.get('/pipelines/default/with-customers');
      return response.data;
    }
  );

  const moveCustomerMutation = useMutation(
    async ({ customerId, stageId, data }) => {
      return api.put(`/customers/${customerId}/stage`, {
        stageId,
        ...data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pipeline');
        toast.success('Customer moved successfully');
      },
      onError: () => {
        toast.error('Failed to move customer');
      },
    }
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (overData?.type === 'column') {
      await moveCustomerMutation.mutateAsync({
        customerId: activeData.customer.id,
        stageId: overData.column.id,
        data: {
          expected_deal_size: activeData.customer.expected_deal_size,
          probability: activeData.customer.probability,
        },
      });
    }

    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-screen">
        {pipelineData?.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            customers={column.customers}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <KanbanCard
            customer={pipelineData
              ?.flatMap((col) => col.customers)
              .find((c) => c.id === activeId)}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;