
import { PaymentPlan } from '@/types/paymentPlan';

interface PaymentPlansManagerProps {
  onPaymentPlanSelect: (plan: PaymentPlan) => void;
}

export const PaymentPlansManager = ({ onPaymentPlanSelect }: PaymentPlansManagerProps) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Управление планами платежей</h2>
      <p className="text-gray-600">Компонент управления планами платежей в разработке...</p>
    </div>
  );
};
