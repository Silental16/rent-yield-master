import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentPlanForm } from './PaymentPlanForm';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { PaymentPlan } from '@/types/paymentPlan';
import { Edit, CreditCard, Building, Calendar, Plus } from 'lucide-react';

export const PaymentPlansManager = () => {
  const { plan, updatePlan, resetToDefault } = usePaymentPlans();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEditPlan = () => {
    setIsFormOpen(true);
  };

  const handleResetPlan = () => {
    if (confirm('Are you sure you want to reset the payment plan to default?')) {
      resetToDefault();
    }
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
      case 'full': return 'Full Payment';
      case 'construction': return 'Until Construction End';
      case 'fixed': return 'Fixed Installments';
      default: return 'Unknown Type';
    }
  };

  const getDiscountLabel = (plan: PaymentPlan) => {
    if (plan.discount.value === 0) return 'No Discount';
    return plan.discount.type === 'percentage' 
      ? `${plan.discount.value}%` 
      : `$${plan.discount.value.toLocaleString()}`;
  };

  const getConditionsDescription = (plan: PaymentPlan) => {
    switch (plan.type) {
      case 'full':
        return 'One-time payment at project entry';
      case 'construction':
        return `${plan.downPaymentPercent}% at entry, ${plan.constructionPaymentPercent}% during construction, ${plan.launchPaymentPercent}% at launch`;
      case 'fixed':
        return `${plan.downPaymentPercentFixed}% at entry, then ${plan.installmentMonths} months of installments`;
      default:
        return '';
    }
  };

  const getAdditionalPaymentsDescription = (plan: PaymentPlan) => {
    if (!plan.additionalPayments || plan.additionalPayments.length === 0) {
      return null;
    }

    const fixedPayments = plan.additionalPayments.filter(p => p.type === 'fixed');
    const percentagePayments = plan.additionalPayments.filter(p => p.type === 'percentage');
    
    const fixedTotal = fixedPayments.reduce((sum, p) => sum + p.value, 0);
    const percentageTotal = percentagePayments.reduce((sum, p) => sum + p.value, 0);

    let description = 'Additional payments at launch: ';
    const parts = [];
    
    if (fixedTotal > 0) {
      parts.push(`$${fixedTotal.toLocaleString()}`);
    }
    
    if (percentageTotal > 0) {
      parts.push(`${percentageTotal}% of unit cost`);
    }

    return description + parts.join(' + ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Plan</h2>
          <p className="text-gray-600">Configure the payment plan for the project</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleResetPlan} variant="outline" className="flex items-center gap-2">
            Reset
          </Button>
          <Button onClick={handleEditPlan} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getTypeIcon(plan.type)}
            <div>
              <CardTitle className="text-lg">
                {plan.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{getTypeLabel(plan.type)}</Badge>
                <Badge variant="outline">{getDiscountLabel(plan)}</Badge>
                {plan.additionalPayments && plan.additionalPayments.length > 0 && (
                  <Badge variant="outline" className="bg-blue-50">
                    <Plus className="w-3 h-3 mr-1" />
                    {plan.additionalPayments.length} add. payment{plan.additionalPayments.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-600">{getConditionsDescription(plan)}</p>
          {getAdditionalPaymentsDescription(plan) && (
            <p className="text-sm text-blue-600 font-medium">
              {getAdditionalPaymentsDescription(plan)}
            </p>
          )}
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
