import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { calculatePaymentPlan } from '@/utils/paymentCalculations';

interface CashFlowTableProps {
  data: ProjectData;
}

export const CashFlowTable = ({ data }: CashFlowTableProps) => {
  const { getCurrentPlan } = usePaymentPlans();
  const currentPlan = getCurrentPlan();
  const calculations = new FinancialCalculations(data, currentPlan);
  const cashFlow = calculations.calculateCashFlow();
  
  const paymentCalculation = calculatePaymentPlan(
    currentPlan,
    data.cost,
    data.entryDate,
    data.constructionEndDate
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const yearlyData = [];
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
        <CardTitle className="text-xl font-semibold">Detailed Cash Flow Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto relative max-h-[600px]">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white z-20 shadow-sm">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-semibold bg-gray-50 sticky left-0 z-30 border-r-2 border-gray-200">Metric</th>
                {yearlyData.map((year) => (
                  <th key={year.year} className="text-center p-3 font-semibold bg-gray-50" colSpan={12}>
                    Year {year.year}
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
              {/* 1. Investor Payments */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Investor Payments</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => {
                    const monthData = month.data;
                    const amount = monthData.investorPayment;
                    
                    return (
                      <td key={`inv-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                        {amount !== 0 ? formatCurrency(amount) : '-'}
                      </td>
                    );
                  })
                )}
              </tr>

              {/* 1.1. Additional Payments at Launch */}
              {currentPlan?.additionalPayments && currentPlan.additionalPayments.length > 0 && (
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">
                    - Additional Payments at Launch
                  </td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const constructionEndDate = new Date(data.constructionEndDate);
                      const entryDate = new Date(data.entryDate);
                      const currentDate = new Date(entryDate);
                      currentDate.setFullYear(currentDate.getFullYear() + (year.year - 1));
                      currentDate.setMonth(entryDate.getMonth() + monthIndex);
                      
                      const isLaunchMonth = currentDate.getFullYear() === constructionEndDate.getFullYear() && 
                                           currentDate.getMonth() === constructionEndDate.getMonth();
                      
                      let additionalAmount = 0;
                      if (isLaunchMonth && currentPlan.additionalPayments) {
                        const unitPrice = calculations.getUnitPriceAtEntry();
                        additionalAmount = currentPlan.additionalPayments.reduce((sum, payment) => {
                          if (payment.type === 'percentage') {
                            return sum + (unitPrice * (payment.value / 100));
                          } else {
                            return sum + payment.value;
                          }
                        }, 0);
                      }
                      
                      return (
                        <td key={`add-pay-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-red-500">
                          {additionalAmount > 0 ? `-${formatCurrency(additionalAmount)}` : '-'}
                        </td>
                      );
                    })
                  )}
                </tr>
              )}

              {/* 2. Rental Revenue */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-green-700 bg-green-50 sticky left-0 z-10 border-r-2 border-gray-200">Rental Revenue</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`rent-${year.year}-${monthIndex}`} className="text-center p-2 text-green-600">
                      {month.data.rentalIncome > 0 ? formatCurrency(month.data.rentalIncome) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* Direct Bookings */}
              <tr className="border-b border-gray-50">
                <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Direct Bookings ({data.directBookings}%)</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`direct-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-green-500">
                      {month.data.directBookingsRevenue > 0 ? formatCurrency(month.data.directBookingsRevenue) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* OTA Revenue */}
              <tr className="border-b border-gray-50">
                <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- AirBnB/Booking ({data.otaBookings}%)</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`ota-${year.year}-${monthIndex}`} className="text-center p-2 text-xs text-orange-500">
                      {month.data.otaBookingsRevenue > 0 ? formatCurrency(month.data.otaBookingsRevenue) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* 3. Revenue Expenses */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Revenue Expenses</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`rev-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                      {month.data.revenueExpensesTotal > 0 ? `-${formatCurrency(month.data.revenueExpensesTotal)}` : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* Revenue Expenses Breakdown */}
              {data.revenueExpenses.map((expense, expenseIndex) => (
                <tr key={`rev-exp-detail-${expenseIndex}`} className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">
                    - {expense.name} ({expense.percentage}%)
                  </td>
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

              {/* 4. Operating Expenses */}
              {(data.monthlyExpenses.enabled || data.annualRepair.enabled || data.insurance.enabled) && (
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Operating Expenses</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => (
                      <td key={`op-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                        {month.data.operationalExpensesTotal > 0 ? `-${formatCurrency(month.data.operationalExpensesTotal)}` : '-'}
                      </td>
                    ))
                  )}
                </tr>
              )}

              {/* Operating Expenses Breakdown */}
              {data.monthlyExpenses.enabled && (
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Monthly Expenses</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Monthly Expenses');
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
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Annual Repair</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Annual Repair');
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
                  <td className="p-3 pl-8 text-sm text-gray-600 sticky left-0 z-10 bg-white border-r-2 border-gray-200">- Insurance</td>
                  {yearlyData.map((year) => 
                    year.months.map((month, monthIndex) => {
                      const breakdown = month.data.operationalExpensesBreakdown?.find(b => b.name === 'Insurance');
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

              {/* 5. Profit */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-blue-700 bg-blue-50 sticky left-0 z-10 border-r-2 border-gray-200">Profit</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`profit-${year.year}-${monthIndex}`} className={`text-center p-2 font-semibold ${month.data.operatingProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {month.data.operatingProfit !== 0 ? formatCurrency(month.data.operatingProfit) : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* 6. Profit Expenses */}
              <tr className="border-b border-gray-100">
                <td className="p-3 font-semibold text-red-700 bg-red-50 sticky left-0 z-10 border-r-2 border-gray-200">Profit Expenses</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`prof-exp-${year.year}-${monthIndex}`} className="text-center p-2 text-red-600">
                      {month.data.profitExpensesTotal > 0 ? `-${formatCurrency(month.data.profitExpensesTotal)}` : '-'}
                    </td>
                  ))
                )}
              </tr>

              {/* Profit Expenses Breakdown */}
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

              {/* 7. Net Profit (Net Cash Flow) */}
              <tr className="border-b-2 border-gray-200 bg-purple-50">
                <td className="p-3 font-bold text-purple-700 sticky left-0 z-10 border-r-2 border-gray-200 bg-purple-50">Net Profit (Net CF)</td>
                {yearlyData.map((year) => 
                  year.months.map((month, monthIndex) => (
                    <td key={`net-profit-${year.year}-${monthIndex}`} className={`text-center p-2 font-semibold ${month.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(month.data.netProfit)}
                    </td>
                  ))
                )}
              </tr>

              {/* 8. Cumulative Net CF */}
              <tr className="border-b-2 border-gray-200 bg-indigo-50">
                <td className="p-3 font-bold text-indigo-700 sticky left-0 z-10 border-r-2 border-gray-200 bg-indigo-50">Cumulative Net CF</td>
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
        
        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700">Total Investment</h4>
            <p className="text-xl font-bold text-blue-800">
              {formatCurrency(Math.abs(cashFlow.reduce((sum, month) => sum + (month.investorPayment < 0 ? month.investorPayment : 0), 0)))}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700">Total Rental Income</h4>
            <p className="text-xl font-bold text-green-800">
              {formatCurrency(cashFlow.reduce((sum, month) => sum + month.rentalIncome, 0))}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-700">Total Cash Flow</h4>
            <p className={`text-xl font-bold ${cashFlow[cashFlow.length - 1]?.cumulativeCashFlow >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(cashFlow[cashFlow.length - 1]?.cumulativeCashFlow || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
