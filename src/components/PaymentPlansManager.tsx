import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentPlanForm } from './PaymentPlanForm';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { PaymentPlan } from '@/types/paymentPlan';
import { Edit, CreditCard, Building, Calendar } from 'lucide-react';

export const PaymentPlansManager = () => {
  const { plan, updatePlan } = usePaymentPlans();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditPlan = () => {
    setIsFormOpen(true);
  };

  const handleSubmitPlan = (planData: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    updatePlan(planData);
    setIsFormOpen(false);
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
        return `${plan.downPaymentPercent || 0}% при входе, ${plan.constructionPaymentPercent || 0}% во время стройки, ${plan.launchPaymentPercent || 0}% при запуске`;
      case 'fixed':
        return `${plan.downPaymentPercentFixed || 0}% при входе, затем ${plan.installmentMonths || 0} месяцев рассрочки`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">План оплаты</h2>
          <p className="text-gray-600">Настройка плана оплаты для проекта</p>
        </div>
        <Button onClick={handleEditPlan} className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Редактировать
        </Button>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getTypeIcon(plan.type)}
            <div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{getTypeLabel(plan.type)}</Badge>
                <Badge variant="outline">{getDiscountLabel(plan)}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{getConditionsDescription(plan)}</p>
        </CardContent>
      </Card>

      <PaymentPlanForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitPlan}
        editingPlan={plan}
      />
    </div>
  );
};
