import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';

interface DashboardProps {
  data: ProjectData;
}

export const Dashboard = ({ data }: DashboardProps) => {
  const { getCurrentPlan } = usePaymentPlans();
  const currentPlan = getCurrentPlan();
  const calculations = new FinancialCalculations(data, currentPlan);
  const rentalIncome = calculations.calculateRentalIncome();
  const keyMetrics = calculations.calculateKeyMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatPaybackPeriod = (years: number) => {
    if (years === 0) return 'Does not pay back';
    
    const wholeYears = Math.floor(years);
    const remainingMonths = Math.round((years - wholeYears) * 12);
    
    if (wholeYears === 0) {
      return `${remainingMonths} mo`;
    } else if (remainingMonths === 0) {
      return `${wholeYears} yr`;
    } else {
      return `${wholeYears} yr ${remainingMonths} mo`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">ROI (10 Years)</p>
                <p className="text-3xl font-bold text-green-800">{formatPercent(keyMetrics.roi10Year)}</p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Annual Return</p>
                <p className="text-3xl font-bold text-blue-800">{formatPercent(keyMetrics.averageAnnualReturn)}</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Payback Period</p>
                <p className="text-3xl font-bold text-orange-800">{formatPaybackPeriod(keyMetrics.paybackPeriod)}</p>
              </div>
              <div className="text-orange-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.npvEnabled && (
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">NPV</p>
                  <p className="text-3xl font-bold text-purple-800">{formatCurrency(keyMetrics.npv)}</p>
                  <p className="text-xs text-purple-500 mt-1">Discount Rate {formatPercent(data.discountRate)}</p>
                </div>
                <div className="text-purple-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.irrEnabled && (
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">IRR</p>
                  <p className="text-3xl font-bold text-indigo-800">{formatPercent(keyMetrics.irr)}</p>
                </div>
                <div className="text-indigo-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Profitability Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Detailed Profitability Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold bg-gray-50">Metric</th>
                  {rentalIncome.map((year) => (
                    <th key={year.year} className="text-center p-3 font-semibold bg-gray-50">
                      Year {year.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Gross Income */}
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-blue-700 bg-blue-50">Gross Income</td>
                  {rentalIncome.map((year) => (
                    <td key={`gross-${year.year}`} className="text-center p-3 text-blue-600">
                      {formatCurrency(year.grossIncome)}
                    </td>
                  ))}
                </tr>

                {/* Direct Bookings Revenue */}
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600">- Direct Bookings ({data.directBookings}%)</td>
                  {rentalIncome.map((year) => (
                    <td key={`direct-${year.year}`} className="text-center p-3 text-xs text-green-600">
                      {formatCurrency(year.directBookingsRevenue)}
                    </td>
                  ))}
                </tr>

                {/* OTA Revenue */}
                <tr className="border-b border-gray-50">
                  <td className="p-3 pl-8 text-sm text-gray-600">- AirBnB/Booking ({data.otaBookings}%)</td>
                  {rentalIncome.map((year) => (
                    <td key={`ota-${year.year}`} className="text-center p-3 text-xs text-orange-600">
                      {formatCurrency(year.otaBookingsRevenue)}
                    </td>
                  ))}
                </tr>

                {/* Revenue Expenses */}
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-red-700 bg-red-50">- Revenue Expenses</td>
                  {rentalIncome.map((year) => (
                    <td key={`rev-exp-${year.year}`} className="text-center p-3 text-red-600">
                      -{formatCurrency(year.totalRevenueExpenses)}
                    </td>
                  ))}
                </tr>

                {/* Revenue Expenses Breakdown */}
                {data.revenueExpenses.map((expense, expenseIndex) => (
                  <tr key={`rev-exp-detail-${expenseIndex}`} className="border-b border-gray-50">
                    <td className="p-3 pl-8 text-sm text-gray-600">
                      - {expense.name}
                      {expense.name === 'OTA Commission' ? ` (${expense.percentage}% of AirBnB/Booking)` : ` (${expense.percentage}%)`}
                    </td>
                    {rentalIncome.map((year) => {
                      const breakdown = year.revenueExpensesBreakdown?.find(b => b.name === expense.name);
                      const amount = breakdown?.amount || 0;
                      return (
                        <td key={`rev-exp-detail-${expenseIndex}-${year.year}`} className="text-center p-3 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Operating Expenses */}
                {(data.monthlyExpenses.enabled || data.annualRepair.enabled || data.insurance.enabled) && (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-semibold text-red-700 bg-red-50">- Operating Expenses</td>
                      {rentalIncome.map((year) => (
                        <td key={`op-exp-${year.year}`} className="text-center p-3 text-red-600">
                          -{formatCurrency(year.operationalExpenses)}
                        </td>
                      ))}
                    </tr>

                    {data.monthlyExpenses.enabled && (
                      <tr className="border-b border-gray-50">
                        <td className="p-3 pl-8 text-sm text-gray-600">- Monthly Expenses</td>
                        {rentalIncome.map((year) => (
                          <td key={`monthly-${year.year}`} className="text-center p-3 text-xs text-gray-500">
                            -{formatCurrency(data.monthlyExpenses.value * 12)}
                          </td>
                        ))}
                      </tr>
                    )}

                    {data.annualRepair.enabled && (
                      <tr className="border-b border-gray-50">
                        <td className="p-3 pl-8 text-sm text-gray-600">- Annual Repair</td>
                        {rentalIncome.map((year) => (
                          <td key={`repair-${year.year}`} className="text-center p-3 text-xs text-gray-500">
                            -{formatCurrency(data.annualRepair.value)}
                          </td>
                        ))}
                      </tr>
                    )}

                    {data.insurance.enabled && (
                      <tr className="border-b border-gray-50">
                        <td className="p-3 pl-8 text-sm text-gray-600">- Insurance</td>
                        {rentalIncome.map((year) => (
                          <td key={`insurance-${year.year}`} className="text-center p-3 text-xs text-gray-500">
                            -{formatCurrency(data.insurance.value)}
                          </td>
                        ))}
                      </tr>
                    )}
                  </>
                )}

                {/* Operating Profit */}
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-green-700 bg-green-50">Operating Profit</td>
                  {rentalIncome.map((year) => (
                    <td key={`op-profit-${year.year}`} className={`text-center p-3 font-semibold ${year.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(year.operatingProfit)}
                    </td>
                  ))}
                </tr>

                {/* Profit Expenses */}
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-semibold text-red-700 bg-red-50">- Profit Expenses</td>
                  {rentalIncome.map((year) => (
                    <td key={`profit-exp-${year.year}`} className="text-center p-3 text-red-600">
                      {year.operatingProfit > 0 ? `-${formatCurrency(year.profitExpenses)}` : formatCurrency(0)}
                    </td>
                  ))}
                </tr>

                {/* Profit Expenses Breakdown */}
                {data.profitExpenses.map((expense, expenseIndex) => (
                  <tr key={`profit-exp-detail-${expenseIndex}`} className="border-b border-gray-50">
                    <td className="p-3 pl-8 text-sm text-gray-600">- {expense.name}</td>
                    {rentalIncome.map((year) => {
                      const amount = year.operatingProfit > 0 ? year.operatingProfit * (expense.percentage / 100) : 0;
                      return (
                        <td key={`profit-exp-detail-${expenseIndex}-${year.year}`} className="text-center p-3 text-xs text-gray-500">
                          {amount > 0 ? `-${formatCurrency(amount)}` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Net Profit */}
                <tr className="border-b-2 border-gray-200 bg-purple-50">
                  <td className="p-3 font-bold text-purple-700">Net Profit</td>
                  {rentalIncome.map((year) => (
                    <td key={`net-profit-${year.year}`} className={`text-center p-3 font-bold ${year.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(year.netProfit)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
