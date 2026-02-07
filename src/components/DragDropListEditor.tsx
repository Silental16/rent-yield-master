
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, GripVertical, Plus } from 'lucide-react';

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
  protectedItems?: string[];
  percentageLabel?: string;
}

export const DragDropListEditor = ({
  items,
  onItemsChange,
  title,
  showDate = false,
  itemNamePlaceholder = "Item name",
  addButtonText = "Add Item",
  protectedItems = [],
  percentageLabel = "%"
}: DragDropListEditorProps) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPercentage, setNewItemPercentage] = useState(0);
  const [newItemDate, setNewItemDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    onItemsChange(newItems);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ListItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: newItemName,
      percentage: newItemPercentage,
      ...(showDate && { date: newItemDate })
    };

    onItemsChange([...items, newItem]);
    setNewItemName('');
    setNewItemPercentage(0);
    setNewItemDate(new Date().toISOString().split('T')[0]);
  };

  const updateItem = (id: string, field: keyof ListItem, value: string | number) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && protectedItems.includes(item.name)) {
      return; // Don't remove protected items
    }
    onItemsChange(items.filter(item => item.id !== id));
  };

  const isProtected = (itemName: string) => protectedItems.includes(itemName);

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border rounded-lg p-4 ${
                        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                      } ${isProtected(item.name) ? 'border-blue-200 bg-blue-50' : ''}`}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div {...provided.dragHandleProps} className="col-span-1 flex justify-center">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        <div className={showDate ? "col-span-4" : "col-span-6"}>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            placeholder={itemNamePlaceholder}
                            disabled={isProtected(item.name)}
                            className={isProtected(item.name) ? 'bg-gray-100' : ''}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.percentage}
                            onChange={(e) => updateItem(item.id, 'percentage', parseFloat(e.target.value))}
                            placeholder={percentageLabel}
                          />
                        </div>
                        
                        {showDate && (
                          <div className="col-span-3">
                            <Input
                              type="date"
                              value={item.date || ''}
                              onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                            />
                          </div>
                        )}
                        
                        <div className={`${showDate ? 'col-span-2' : 'col-span-3'} flex justify-end`}>
                          {!isProtected(item.name) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add new item form */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-1"></div>
          
          <div className={showDate ? "col-span-4" : "col-span-6"}>
            <Label>Name</Label>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={itemNamePlaceholder}
            />
          </div>
          
          <div className="col-span-2">
            <Label>{percentageLabel}</Label>
            <Input
              type="number"
              value={newItemPercentage}
              onChange={(e) => setNewItemPercentage(parseFloat(e.target.value))}
              placeholder={percentageLabel === "%" ? "Percent" : "Price"}
            />
          </div>
          
          {showDate && (
            <div className="col-span-3">
              <Label>Date</Label>
              <Input
                type="date"
                value={newItemDate}
                onChange={(e) => setNewItemDate(e.target.value)}
              />
            </div>
          )}
          
          <div className={`${showDate ? 'col-span-2' : 'col-span-3'} flex justify-end`}>
            <Button onClick={addItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
