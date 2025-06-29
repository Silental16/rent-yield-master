
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { DraggableListItem } from './DraggableListItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ListItem {
  id: string;
  name: string;
  percentage: number;
  date?: string;
}

interface DragDropListEditorProps {
  items: ListItem[];
  onItemsChange: (items: ListItem[]) => void;
  title: string;
  showDate?: boolean;
  itemNamePlaceholder?: string;
  addButtonText?: string;
}

export const DragDropListEditor = ({
  items,
  onItemsChange,
  title,
  showDate = false,
  itemNamePlaceholder = "Название",
  addButtonText = "Добавить пункт"
}: DragDropListEditorProps) => {
  const [localItems, setLocalItems] = useState(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(localItems);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleAddItem = () => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      name: '',
      percentage: 0,
      ...(showDate && { date: new Date().toISOString().split('T')[0] })
    };
    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleItemChange = (index: number, field: keyof ListItem, value: string | number) => {
    const newItems = localItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button onClick={handleAddItem} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {addButtonText}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {localItems.map((item, index) => (
                <DraggableListItem
                  key={item.id}
                  id={item.id}
                  index={index}
                  name={item.name}
                  percentage={item.percentage}
                  onNameChange={(value) => handleItemChange(index, 'name', value)}
                  onPercentageChange={(value) => handleItemChange(index, 'percentage', value)}
                  onDelete={() => handleDeleteItem(index)}
                  showDate={showDate}
                  date={item.date}
                  onDateChange={showDate ? (value) => handleItemChange(index, 'date', value) : undefined}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
