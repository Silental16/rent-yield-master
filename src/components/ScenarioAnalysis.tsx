
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ScenarioAnalysisProps {
  data: ProjectData;
}

export const ScenarioAnalysis = ({ data }: ScenarioAnalysisProps) => {
  const calculations = new FinancialCalculations(data);
  
  // Сценарии выхода
  const scenarios = [
    {
      name: 'После строительства',
      years: 0,
      propertyValue: calculations.getPropertyValueAtYear(0),
      rentalIncome: 0,
      exitCosts: calculations.getExitCosts(0)
    },
    {
      name: 'Через 5 лет',
      years: 5,
      propertyValue: calculations.getPropertyValueAtYear(5),
      rentalIncome: calculations.getCumulativeRentalIncome(5),
      exitCosts: calculations.getExitCosts(5)
    },
    {
      name: 'Через 10 лет',
      years: 10,
      propertyValue: calculations.getPropertyValueAtYear(10),
      rentalIncome: calculations.getCumulativeRentalIncome(10),
      exitCosts: calculations.getExitCosts(10)
    }
  ];

  // Подготовка данных для графика с двумя столбцами
  const chartData = scenarios.map(scenario => ({
    name: scenario.name,
    investment: data.cost, // Изначальная стоимость юнита
    totalValue: scenario.propertyValue + scenario.rentalIncome - scenario.exitCosts // Общая ценность
  }));

  const scenarioData = scenarios.map(scenario => {
    const purchasePrice = data.cost;
    const salePrice = scenario.propertyValue;
    const exitCosts = scenario.exitCosts;
    const saleProfit = salePrice - exitCosts;
    const rentalIncome = scenario.rentalIncome;
    const totalReturn = saleProfit + rentalIncome - purchasePrice;
    const roi = (totalReturn / purchasePrice) * 100;
    
    return {
      ...scenario,
      purchasePrice,
      salePrice,
      saleProfit,
      totalReturn,
      roi
    };
  });

  // Анализ чувствительности
  const sensitivityAnalysis = [
    {
      parameter: 'ADR +10%',
      impact: calculations.calculateSensitivity('adr', 1.1)
    },
    {
      parameter: 'ADR -10%',
      impact: calculations.calculateSensitivity('adr', 0.9)
    },
    {
      parameter: 'Заполняемость +10%',
      impact: calculations.calculateSensitivity('occupancy', 1.1)
    },
    {
      parameter: 'Заполняемость -10%',
      impact: calculations.calculateSensitivity('occupancy', 0.9)
    },
    {
      parameter: 'Расходы +20%',
      impact: calculations.calculateSensitivity('expenses', 1.2)
    },
    {
      parameter: 'Расходы -20%',
      impact: calculations.calculateSensitivity('expenses', 0.8)
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Кастомный компонент для tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const scenario = scenarioData.find(s => s.name === label);
      if (scenario) {
        return (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold mb-2">{label}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span>Цена при покупке:</span>
                <span className="font-medium">{formatCurrency(scenario.purchasePrice)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Цена при продаже:</span>
                <span className="font-medium">{formatCurrency(scenario.salePrice)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Расходы при продаже:</span>
                <span className="font-medium text-red-600">{formatCurrency(scenario.exitCosts)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Доход от продажи:</span>
                <span className="font-medium text-green-600">{formatCurrency(scenario.saleProfit)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Доход от аренды:</span>
                <span className="font-medium text-green-600">{formatCurrency(scenario.rentalIncome)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between gap-4 font-semibold">
                <span>Общий доход:</span>
                <span className={scenario.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(scenario.totalReturn)}
                </span>
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const keyMetrics = calculations.calculateKeyMetrics();

  return (
    <div className="space-y-6">
      {/* Сценарии выхода */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Инвестиционные сценарии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="investment" fill="#9ca3af" name="Инвестиции" />
                <Bar dataKey="totalValue" fill="#059669" name="Доход" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarioData.map((scenario, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">{scenario.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Цена при покупке:</span>
                    <span className="font-medium">{formatCurrency(scenario.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Цена при продаже:</span>
                    <span className="font-medium">{formatCurrency(scenario.salePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Расходы на выход:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(scenario.exitCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доход от продажи:</span>
                    <span className="font-medium text-green-600">{formatCurrency(scenario.saleProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доход от аренды:</span>
                    <span className="font-medium text-green-600">{formatCurrency(scenario.rentalIncome)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Общий доход:</span>
                    <span className={scenario.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(scenario.totalReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>ROI:</span>
                    <span className={scenario.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercent(scenario.roi)}
                    </span>
                  </div>
                  {data.npvEnabled && (
                    <div className="flex justify-between font-semibold">
                      <span>NPV:</span>
                      <span className={keyMetrics.npv >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(keyMetrics.npv)}
                      </span>
                    </div>
                  )}
                  {data.irrEnabled && (
                    <div className="flex justify-between font-semibold">
                      <span>IRR:</span>
                      <span className={keyMetrics.irr >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercent(keyMetrics.irr)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Анализ чувствительности */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Анализ чувствительности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensitivityAnalysis} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatPercent} />
                <YAxis dataKey="parameter" type="category" width={120} />
                <Tooltip 
                  formatter={(value: number) => [formatPercent(value), 'Влияние на ROI']}
                />
                <Bar dataKey="impact" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Стресс-тестирование */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Стресс-тесты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-700 mb-2">Падение спроса на 30%</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>ROI (10 лет):</span>
                  <span className="font-medium text-red-600">
                    {formatPercent(calculations.calculateStressTest('demand', 0.7))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-700 mb-2">Рост расходов на 50%</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>ROI (10 лет):</span>
                  <span className="font-medium text-orange-600">
                    {formatPercent(calculations.calculateStressTest('expenses', 1.5))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-700 mb-2">Задержка запуска на 6 мес.</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>ROI (10 лет):</span>
                  <span className="font-medium text-yellow-600">
                    {formatPercent(calculations.calculateStressTest('delay', 6))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Распределение доходности */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Структура доходности (10 лет)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Рост капитала', value: scenarioData[2].propertyValue - data.cost },
                      { name: 'Доход от аренды', value: scenarioData[2].rentalIncome },
                      { name: 'Расходы на выход', value: scenarioData[2].exitCosts }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Рост капитала</span>
                <span className="ml-auto font-medium">
                  {formatCurrency(scenarioData[2].propertyValue - data.cost)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Доход от аренды</span>
                <span className="ml-auto font-medium">
                  {formatCurrency(scenarioData[2].rentalIncome)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">Расходы на выход</span>
                <span className="ml-auto font-medium text-red-600">
                  -{formatCurrency(scenarioData[2].exitCosts)}
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex items-center gap-3 font-semibold">
                <span>Итоговая прибыль:</span>
                <span className="ml-auto text-green-600">
                  {formatCurrency(scenarioData[2].totalReturn)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
