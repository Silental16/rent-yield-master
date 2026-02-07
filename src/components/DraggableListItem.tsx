
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

interface DraggableListItemProps {
  id: string;
  index: number;
  name: string;
  percentage: number;
  onNameChange: (value: string) => void;
  onPercentageChange: (value: number) => void;
  onDelete: () => void;
  isDragging?: boolean;
  showDate?: boolean;
  date?: string;
  onDateChange?: (value: string) => void;
}

export const DraggableListItem = ({
  id,
  index,
  name,
  percentage,
  onNameChange,
  onPercentageChange,
  onDelete,
  showDate = false,
  date,
  onDateChange
}: DraggableListItemProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center gap-4 p-3 rounded-lg border ${
            snapshot.isDragging ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
          }`}
        >
          <div {...provided.dragHandleProps} className="flex-shrink-0">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Name"
              className="h-8"
            />
          </div>
          
          <div className="w-24">
            <Input
              type="number"
              value={percentage}
              onChange={(e) => onPercentageChange(Number(e.target.value))}
              placeholder="%"
              className="h-8"
            />
          </div>
          
          {showDate && (
            <div className="w-32">
              <Input
                type="date"
                value={date}
                onChange={(e) => onDateChange?.(e.target.value)}
                className="h-8"
              />
            </div>
          )}
          
          <Button
            onClick={onDelete}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Draggable>
  );
};
