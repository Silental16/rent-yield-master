
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';

interface DashboardProps {
  data: ProjectData;
}

export const Dashboard = ({ data }: DashboardProps) => {
  const calculations = new FinancialCalculations(data);
  const rentalTable = calculations.calculateRentalIncome();
  const propertyValue = calculations.calculatePropertyValue();
  const keyMetrics = calculations.calculateKeyMetrics();

  // Подготовка данных для графика капитализации
  const capitalizationData = Array.from({ length: 120 }, (_, i) => {
    const monthsFromStart = i + 1;
    const value = calculations.getPropertyValueAtMonth(monthsFromStart);
    return {
      month: monthsFromStart,
      year: Math.ceil(monthsFromStart / 12),
      value: Math.round(value)
    };
  }).filter((_, i) => i % 12 === 11); // Показываем только годовые значения

  // Подготовка данных для таблицы доходности
  const rentalChartData = rentalTable.map((year, index) => ({
    year: index + 1,
    grossIncome: year.grossIncome,
    operatingProfit: year.operatingProfit,
    netProfit: year.netProfit
  }));

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

  return (
    <div className="space-y-6">
      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">ROI (10 лет)</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatPercent(keyMetrics.roi10Year)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Годовая доходность</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatPercent(keyMetrics.averageAnnualReturn)}
                </p>
              </div>
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {data.npvEnabled && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">NPV</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(keyMetrics.npv)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Срок окупаемости</p>
                <p className="text-2xl font-bold text-orange-700">
                  {keyMetrics.paybackPeriod} лет
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        )}
      </div>

      {/* График капитализации */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">График капитализации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={capitalizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Стоимость']}
                  labelFormatter={(year) => `Год ${year}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* График доходности от аренды */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Доходность от аренды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value)]}
                  labelFormatter={(year) => `Год ${year}`}
                />
                <Bar dataKey="grossIncome" fill="#3b82f6" name="Валовой доход" />
                <Bar dataKey="operatingProfit" fill="#10b981" name="Операционная прибыль" />
                <Bar dataKey="netProfit" fill="#8b5cf6" name="Чистая прибыль" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Таблица доходности */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Таблица доходности аренды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-2 font-semibold">Год</th>
                  <th className="text-right p-2 font-semibold">Валовой доход</th>
                  <th className="text-right p-2 font-semibold">Расходы из выручки</th>
                  <th className="text-right p-2 font-semibold">Операционная прибыль</th>
                  <th className="text-right p-2 font-semibold">Расходы из прибыли</th>
                  <th className="text-right p-2 font-semibold">Чистая прибыль</th>
                </tr>
              </thead>
              <tbody>
                {rentalTable.map((year, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2 font-medium">{index + 1}</td>
                    <td className="text-right p-2">{formatCurrency(year.grossIncome)}</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(year.revenueExpenses)}</td>
                    <td className="text-right p-2 text-blue-600">{formatCurrency(year.operatingProfit)}</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(year.profitExpenses)}</td>
                    <td className="text-right p-2 text-green-600 font-semibold">{formatCurrency(year.netProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
