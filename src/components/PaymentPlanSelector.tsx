
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { PaymentPlan } from '@/types/paymentPlan';
import { CreditCard, Building, Calendar } from 'lucide-react';

interface PaymentPlanSelectorProps {
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
}

export const PaymentPlanSelector = ({ selectedPlanId, onPlanChange }: PaymentPlanSelectorProps) => {
  const { getActivePlans } = usePaymentPlans();
  const activePlans = getActivePlans();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <CreditCard className="w-4 h-4" />;
      case 'construction': return <Building className="w-4 h-4" />;
      case 'fixed': return <Calendar className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getDiscountLabel = (plan: PaymentPlan) => {
    if (plan.discount.value === 0) return '';
    const discount = plan.discount.type === 'percentage' 
      ? `${plan.discount.value}%` 
      : `$${plan.discount.value.toLocaleString()}`;
    return ` (скидка ${discount})`;
  };

  if (activePlans.length <= 1) {
    return null; // Don't show selector if only default plan exists
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        План оплаты
      </label>
      <Select value={selectedPlanId} onValueChange={onPlanChange}>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Выберите план оплаты" />
        </SelectTrigger>
        <SelectContent>
          {activePlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              <div className="flex items-center gap-2">
                {getTypeIcon(plan.type)}
                <span>{plan.name}{getDiscountLabel(plan)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
