
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { PaymentPlan } from '@/types/paymentPlan';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { PaymentPlanForm } from './PaymentPlanForm';

interface PaymentPlansManagerProps {
  onPaymentPlanSelect: (plan: PaymentPlan) => void;
}

export const PaymentPlansManager = ({ onPaymentPlanSelect }: PaymentPlansManagerProps) => {
  const { plans, addPlan, updatePlan, deletePlan } = usePaymentPlans();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);

  const handleCreatePlan = (planData: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPlan(planData);
    setIsCreating(false);
  };

  const handleUpdatePlan = (planData: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPlan) {
      updatePlan(editingPlan.id, planData);
      setEditingPlan(null);
    }
  };

  const formatDiscount = (plan: PaymentPlan) => {
    if (plan.discount.value === 0) return 'Без скидки';
    return plan.discount.type === 'percentage' 
      ? `${plan.discount.value}%`
      : `$${plan.discount.value}`;
  };

  const formatPlanType = (type: string) => {
    const types = {
      'full': 'Полная оплата',
      'installment': 'Рассрочка',
      'mortgage': 'Ипотека'
    };
    return types[type as keyof typeof types] || type;
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Создание плана платежей</h2>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Отмена
          </Button>
        </div>
        <PaymentPlanForm onSubmit={handleCreatePlan} />
      </div>
    );
  }

  if (editingPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Редактирование плана платежей</h2>
          <Button variant="outline" onClick={() => setEditingPlan(null)}>
            Отмена
          </Button>
        </div>
        <PaymentPlanForm 
          initialData={editingPlan}
          onSubmit={handleUpdatePlan} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление планами платежей</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать план
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`cursor-pointer transition-all ${plan.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {plan.isActive && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Активен
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {plan.id !== 'default' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Тип плана</p>
                <p className="font-medium">{formatPlanType(plan.type)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Скидка</p>
                <p className="font-medium">{formatDiscount(plan)}</p>
              </div>

              {plan.type === 'installment' && plan.installments && (
                <div>
                  <p className="text-sm text-gray-600">Рассрочка</p>
                  <p className="font-medium">{plan.installments.length} платежей</p>
                </div>
              )}

              {plan.type === 'mortgage' && plan.mortgage && (
                <div>
                  <p className="text-sm text-gray-600">Ипотека</p>
                  <p className="font-medium">
                    {plan.mortgage.downPaymentPercentage}% первоначальный взнос
                  </p>
                  <p className="text-sm text-gray-500">
                    {plan.mortgage.termYears} лет, {plan.mortgage.interestRate}% годовых
                  </p>
                </div>
              )}

              <div className="pt-2 border-t">
                <Button
                  className="w-full"
                  onClick={() => onPaymentPlanSelect(plan)}
                  variant={plan.isActive ? "default" : "outline"}
                >
                  Выбрать план
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">Нет созданных планов платежей</p>
            <Button onClick={() => setIsCreating(true)}>
              Создать первый план
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
