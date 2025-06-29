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

  // Группируем cash flow по годам
  const yearlyData = [];
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  
  for (let year = 0; year < 10; year++) {
    const yearData = {
      year: year + 1,
      months: []
    };
    
    for (let month = 0; month < 12; month++) {
      const index = year * 12 + month;
      if (index < cashFlow.length) {
        yearData.months.push({
          name: months[month],
          data: cashFlow[index]
        });
      }
    }
    yearlyData.push(yearData);
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Детализированный Cash Flow Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto relative max-h-[600px]">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white z-20 shadow-sm">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold bg-gray-50 sticky left-0 z-30 border-r-2 border-gray-200">Показатель</th>
                {yearlyData.map((year) => (
                  <th key={year.year} className="text-center p-3 font-semibold bg-gray-50" colSpan={12}>
                    Год {year.year}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-gray-100 sticky top-[49px] bg-white z-20">
                <th className="text-left p-2 bg-gray-25 sticky left-0 z-30 border-r-2 border-gray-200"></th>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <th key={`${year.year}-${monthIndex}`} className="text-center p-2 text-xs bg-gray-25">
                      {month.name}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {/* 1. Платежи инвестора */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Платежи инвестора</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`inv-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                      {month.data.investorPayment !== 0 ? formatCurrency(month.data.investorPayment) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* 2. Выручка от аренды */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-green-700 bg-green-50 sticky left-0 z-10 border-r-2 border-gray-200">Выручка от аренды</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`rent-${year.year}-${monthIndex}`} className="text-center p-2 text-green-600">
                      {month.data.rentalIncome > 0 ? formatCurrency(month.data.rentalIncome) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* 3. Расходы на выручку - общая строка */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Расходы на выручку</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`rev-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                      {month.data.revenueExpensesTotal > 0 ? `-${formatCurrency(month.data.revenueExpensesTotal)}` : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* Детализация расходов на выручку */}
              {data.revenueExpenses.map((expense, expenseIndex) => (
                <tr key={`rev-exp-detail-${expenseIndex}`} className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- {expense.name}</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.revenueExpensesBreakdown?.find(b => b.name === expense.name);
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`rev-exp-detail-${expenseIndex}-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}

              {/* 4. Операционные расходы - общая строка */}
              {(data.monthlyExpenses.enabled || data.annualRepair.enabled || data.insurance.enabled) && (
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Операционные расходы</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => (
                      <td key={`op-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                        {month.data.operationalExpensesTotal > 0 ? `-${formatCurrency(month.data.operationalExpensesTotal)}` : '-'}
                      </td>
                    ))
                  )}
                </tr>
              )}

              {/* Детализация операционных расходов */}
              {data.monthlyExpenses.enabled && (
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Месячные расходы</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Месячные расходы');
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`monthly-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              )}

              {data.annualRepair.enabled && (
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Годовой ремонт</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Годовой ремонт');
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`repair-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              )}

              {data.insurance.enabled && (
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Страховка</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Страховка');
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`insurance-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              )}

              {/* 5. Прибыль */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-blue-700 bg-blue-50 sticky left-0 z-10 border-r-2 border-gray-200">Прибыль</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`profit-${year.year}-${monthIndex}`} className={`text-center p-2 font-semibold ${month.data.operatingProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {month.data.operatingProfit !== 0 ? formatCurrency(month.data.operatingProfit) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* 6. Расходы на прибыль - общая строка */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Расходы на прибыль</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`prof-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                      {month.data.profitExpensesTotal > 0 ? `-${formatCurrency(month.data.profitExpensesTotal)}` : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* Детализация расходов на прибыль */}
              {data.profitExpenses.map((expense, expenseIndex) => (
                <tr key={`prof-exp-detail-${expenseIndex}`} className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- {expense.name}</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.profitExpensesBreakdown?.find(b => b.name === expense.name);
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`prof-exp-detail-${expenseIndex}-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}

              {/* 7. Чистая прибыль (чистый денежный поток) */}
              <tr className="border-b-2 border-gray-200 bg-purple-50">
                <td className="p-3 font-bold text-purple-700 sticky left-0 z-10 border-r-2 border-gray-200 bg-purple-50">Чистая прибыль (чистый CF)</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`net-profit-${year.year}-${monthIndex}`} className={`text-center p-2 font-semibold ${month.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(month.data.netProfit)}
                    </td>
                  ))
                )}
              </tr>

              {/* 8. Чистый накопленный CF */}
              <tr className="border-b-2 border-gray-200 bg-indigo-50">
                <td className="p-3 font-bold text-indigo-700 sticky left-0 z-10 border-r-2 border-gray-200 bg-indigo-50">Чистый накопленный CF</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`cum-${year.year}-${monthIndex}`} className={`text-center p-2 font-semibold ${month.data.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(month.data.cumulativeCashFlow)}
                    </td>
                  ))
                )}
              </tr>
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
