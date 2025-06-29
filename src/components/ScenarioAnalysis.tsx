
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ProjectData } from '@/pages/Index';
import { PaymentPlan } from '@/types/paymentPlan';
import { FinancialCalculations } from '@/utils/calculations';

interface ScenarioAnalysisProps {
  data: ProjectData;
  paymentPlan?: PaymentPlan;
}

export const ScenarioAnalysis = ({ data, paymentPlan }: ScenarioAnalysisProps) => {
  const [adrMultiplier, setAdrMultiplier] = useState(1);
  const [occupancyMultiplier, setOccupancyMultiplier] = useState(1);
  const [expenseMultiplier, setExpenseMultiplier] = useState(1);

  const calculations = new FinancialCalculations(data, paymentPlan);
  const baseMetrics = calculations.calculateKeyMetrics();

  // Расчет сценариев
  const optimisticScenario = calculations.calculateStressTest('demand', 1.2);
  const pessimisticScenario = calculations.calculateStressTest('demand', 0.8);
  const expenseStressTest = calculations.calculateStressTest('expenses', 1.5);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Анализ чувствительности</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Изменение ADR: {formatPercent((adrMultiplier - 1) * 100)}</Label>
              <Slider
                value={[adrMultiplier]}
                onValueChange={(value) => setAdrMultiplier(value[0])}
                min={0.5}
                max={1.5}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>-50%</span>
                <span>+50%</span>
              </div>
            </div>

            <div>
              <Label>Изменение заполняемости: {formatPercent((occupancyMultiplier - 1) * 100)}</Label>
              <Slider
                value={[occupancyMultiplier]}
                onValueChange={(value) => setOccupancyMultiplier(value[0])}
                min={0.5}
                max={1.5}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>-50%</span>
                <span>+50%</span>
              </div>
            </div>

            <div>
              <Label>Изменение расходов: {formatPercent((expenseMultiplier - 1) * 100)}</Label>
              <Slider
                value={[expenseMultiplier]}
                onValueChange={(value) => setExpenseMultiplier(value[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>-50%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Влияние на ROI (10 лет)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Изменение ADR</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercent(calculations.calculateSensitivity('adr', adrMultiplier))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Изменение заполняемости</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercent(calculations.calculateSensitivity('occupancy', occupancyMultiplier))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Изменение расходов</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercent(calculations.calculateSensitivity('expenses', expenseMultiplier))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Стресс-тестирование</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-800 mb-2">Оптимистичный сценарий</h3>
                <p className="text-sm text-green-600 mb-2">Спрос +20%</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatPercent(optimisticScenario)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Базовый сценарий</h3>
                <p className="text-sm text-gray-600 mb-2">Текущие параметры</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatPercent(baseMetrics.roi10Year)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-red-800 mb-2">Пессимистичный сценарий</h3>
                <p className="text-sm text-red-600 mb-2">Спрос -20%</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatPercent(pessimisticScenario)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Стресс-тест: Рост расходов на 50%</h3>
                <p className="text-sm text-orange-600 mb-2">ROI при увеличении всех расходов</p>
                <p className="text-2xl font-bold text-orange-800">
                  {formatPercent(expenseStressTest)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Риски проекта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Риск спроса</h4>
              <p className="text-sm text-yellow-700">
                При снижении спроса на 20% ROI падает до {formatPercent(pessimisticScenario)}
              </p>
            </div>

            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Риск роста расходов</h4>
              <p className="text-sm text-red-700">
                При росте расходов на 50% ROI снижается до {formatPercent(expenseStressTest)}
              </p>
            </div>

            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Конструкционный риск</h4>
              <p className="text-sm text-blue-700">
                Задержка строительства на 6 месяцев может снизить ROI на 5-10%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
