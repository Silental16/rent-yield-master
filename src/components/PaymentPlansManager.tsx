
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentPlanForm } from './PaymentPlanForm';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { PaymentPlan } from '@/types/paymentPlan';
import { Plus, Edit, Trash2, CreditCard, Building, Calendar } from 'lucide-react';

export const PaymentPlansManager = () => {
  const { plans, addPlan, updatePlan, deletePlan } = usePaymentPlans();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEditPlan = (plan: PaymentPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот план оплаты?')) {
      deletePlan(planId);
    }
  };

  const handleSubmitPlan = (planData: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPlan) {
      updatePlan(editingPlan.id, planData);
    } else {
      addPlan(planData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <CreditCard className="w-5 h-5" />;
      case 'construction': return <Building className="w-5 h-5" />;
      case 'fixed': return <Calendar className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Полная оплата';
      case 'construction': return 'До конца стройки';
      case 'fixed': return 'Фиксированная рассрочка';
      default: return 'Неизвестный тип';
    }
  };

  const getDiscountLabel = (plan: PaymentPlan) => {
    if (plan.discount.value === 0) return 'Без скидки';
    return plan.discount.type === 'percentage' 
      ? `${plan.discount.value}%` 
      : `$${plan.discount.value.toLocaleString()}`;
  };

  const getConditionsDescription = (plan: PaymentPlan) => {
    switch (plan.type) {
      case 'full':
        return 'Единовременная оплата при входе в проект';
      case 'construction':
        return `${plan.downPaymentPercent}% при входе, ${plan.constructionPaymentPercent}% во время стройки, ${plan.launchPaymentPercent}% при запуске`;
      case 'fixed':
        return `${plan.downPaymentPercentFixed}% при входе, затем ${plan.installmentMonths} месяцев рассрочки`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Планы оплаты</h2>
          <p className="text-gray-600">Управление планами оплаты для клиентов</p>
        </div>
        <Button onClick={handleCreatePlan} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Создать план
        </Button>
      </div>

      <div className="grid gap-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет планов оплаты</h3>
              <p className="text-gray-600 text-center mb-4">
                Создайте первый план оплаты для ваших клиентов
              </p>
              <Button onClick={handleCreatePlan}>
                Создать план
              </Button>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(plan.type)}
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{getTypeLabel(plan.type)}</Badge>
                        <Badge variant="outline">{getDiscountLabel(plan)}</Badge>
                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                          {plan.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{getConditionsDescription(plan)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PaymentPlanForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitPlan}
        editingPlan={editingPlan}
      />
    </div>
  );
};
