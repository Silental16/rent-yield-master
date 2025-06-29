
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';

interface CashFlowTableProps {
  data: ProjectData;
}

export const CashFlowTable = ({ data }: CashFlowTableProps) => {
  const calculations = new FinancialCalculations(data);
  const cashFlow = calculations.calculateCashFlow();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Cash Flow Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-2 font-semibold">Период</th>
                <th className="text-right p-2 font-semibold">Платежи инвестора</th>
                <th className="text-right p-2 font-semibold">Доход от аренды</th>
                <th className="text-right p-2 font-semibold">Операционные расходы</th>
                <th className="text-right p-2 font-semibold">Чистый денежный поток</th>
                <th className="text-right p-2 font-semibold">Накопленный CF</th>
              </tr>
            </thead>
            <tbody>
              {cashFlow.map((month, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2 font-medium">{formatDate(month.date)}</td>
                  <td className={`text-right p-2 ${month.investorPayment < 0 ? 'text-red-600' : ''}`}>
                    {month.investorPayment !== 0 ? formatCurrency(month.investorPayment) : '-'}
                  </td>
                  <td className={`text-right p-2 ${month.rentalIncome > 0 ? 'text-green-600' : ''}`}>
                    {month.rentalIncome > 0 ? formatCurrency(month.rentalIncome) : '-'}
                  </td>
                  <td className={`text-right p-2 ${month.operatingExpenses > 0 ? 'text-red-600' : ''}`}>
                    {month.operatingExpenses > 0 ? `-${formatCurrency(month.operatingExpenses)}` : '-'}
                  </td>
                  <td className={`text-right p-2 font-semibold ${month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.netCashFlow)}
                  </td>
                  <td className={`text-right p-2 font-semibold ${month.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.cumulativeCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Сводка */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700">Общие инвестиции</h4>
            <p className="text-xl font-bold text-blue-800">
              {formatCurrency(Math.abs(cashFlow.reduce((sum, month) => sum + (month.investorPayment < 0 ? month.investorPayment : 0), 0)))}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700">Общий доход от аренды</h4>
            <p className="text-xl font-bold text-green-800">
              {formatCurrency(cashFlow.reduce((sum, month) => sum + month.rentalIncome, 0))}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-700">Итоговый Cash Flow</h4>
            <p className={`text-xl font-bold ${cashFlow[cashFlow.length - 1]?.cumulativeCashFlow >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(cashFlow[cashFlow.length - 1]?.cumulativeCashFlow || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
