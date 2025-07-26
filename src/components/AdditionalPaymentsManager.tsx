import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AdditionalPayment } from '@/types/paymentPlan';
import { Plus, Trash2, DollarSign, Percent } from 'lucide-react';

interface AdditionalPaymentsManagerProps {
  payments: AdditionalPayment[];
  onChange: (payments: AdditionalPayment[]) => void;
}

export const AdditionalPaymentsManager = ({ payments, onChange }: AdditionalPaymentsManagerProps) => {
  const [newPayment, setNewPayment] = useState({
    name: '',
    type: 'fixed' as 'percentage' | 'fixed',
    value: 0
  });

  const addPayment = () => {
    if (!newPayment.name.trim() || newPayment.value <= 0) return;

    const payment: AdditionalPayment = {
      id: Date.now().toString(),
      name: newPayment.name,
      type: newPayment.type,
      value: newPayment.value
    };

    onChange([...payments, payment]);
    setNewPayment({ name: '', type: 'fixed', value: 0 });
  };

  const removePayment = (id: string) => {
    onChange(payments.filter(payment => payment.id !== id));
  };

  const updatePayment = (id: string, updates: Partial<AdditionalPayment>) => {
    onChange(payments.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Дополнительные платежи</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Дополнительные расходы инвестора в момент запуска проекта (сверх стоимости апартамента)
      </p>

      {/* Existing payments */}
      {payments.map((payment) => (
        <Card key={payment.id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={payment.name}
                onChange={(e) => updatePayment(payment.id, { name: e.target.value })}
                placeholder="Название платежа"
              />
            </div>
            
            <div className="w-32">
              <Input
                type="number"
                value={payment.value}
                onChange={(e) => updatePayment(payment.id, { value: Number(e.target.value) })}
                placeholder="Сумма"
                min="0"
              />
            </div>

            <ToggleGroup
              type="single"
              value={payment.type}
              onValueChange={(value) => value && updatePayment(payment.id, { type: value as any })}
            >
              <ToggleGroupItem value="fixed" aria-label="Доллары">
                <DollarSign className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="percentage" aria-label="Проценты">
                <Percent className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removePayment(payment.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}

      {/* Add new payment */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              value={newPayment.name}
              onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
              placeholder="Название платежа (например, Оформление документов)"
            />
          </div>
          
          <div className="w-32">
            <Input
              type="number"
              value={newPayment.value || ''}
              onChange={(e) => setNewPayment({ ...newPayment, value: Number(e.target.value) })}
              placeholder="Сумма"
              min="0"
            />
          </div>

          <ToggleGroup
            type="single"
            value={newPayment.type}
            onValueChange={(value) => value && setNewPayment({ ...newPayment, type: value as any })}
          >
            <ToggleGroupItem value="fixed" aria-label="Доллары">
              <DollarSign className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="percentage" aria-label="Проценты">
              <Percent className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button onClick={addPayment} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {payments.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            Итого дополнительных платежей: {' '}
            {payments.filter(p => p.type === 'fixed').reduce((sum, p) => sum + p.value, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            {payments.filter(p => p.type === 'percentage').length > 0 && 
              ` + ${payments.filter(p => p.type === 'percentage').reduce((sum, p) => sum + p.value, 0)}% от стоимости`
            }
          </p>
        </div>
      )}
    </div>
  );
};
