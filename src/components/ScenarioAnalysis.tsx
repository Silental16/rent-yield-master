
import { ProjectData } from '@/pages/Index';
import { PaymentPlan } from '@/types/paymentPlan';

interface ScenarioAnalysisProps {
  data: ProjectData;
  paymentPlan?: PaymentPlan;
}

export const ScenarioAnalysis = ({ data, paymentPlan }: ScenarioAnalysisProps) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Анализ сценариев</h2>
      <p className="text-gray-600">Компонент анализа сценариев в разработке...</p>
    </div>
  );
};
