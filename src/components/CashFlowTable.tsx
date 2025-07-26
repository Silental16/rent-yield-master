import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectData } from '@/pages/Index';
import { FinancialCalculations } from '@/utils/calculations';
import { usePaymentPlans } from '@/hooks/usePaymentPlans';
import { calculatePaymentPlan } from '@/utils/paymentCalculations';

interface CashFlowTableProps {
  data: ProjectData;
}

export const CashFlowTable = ({ data }: CashFlowTableProps) => {
  const { plan } = usePaymentPlans();
  const calculations = new FinancialCalculations(data, plan);
  const cashFlow = calculations.calculateCashFlow();
  
  // Рассчитываем график платежей
  const unitPrice = calculations.getUnitPriceAtEntry();
  const paymentSchedule = calculatePaymentPlan(plan, unitPrice, data.entryDate, data.constructionEndDate);

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
      months: [],
      total: 0
    };
    
    for (let month = 0; month < 12; month++) {
      const index = year * 12 + month;
      if (index < cashFlow.length) {
        const monthData = {
          name: months[month],
          value: cashFlow[index].netProfit,
          data: cashFlow[index]
        };
        yearData.months.push(monthData);
        yearData.total += monthData.value;
      }
    }
    yearlyData.push(yearData);
  }

  return (
    <div className="space-y-6">
      {/* График платежей */}
      <Card>
        <CardHeader>
          <CardTitle>График платежей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Дата</th>
                  <th className="text-left p-3 font-semibold">Описание</th>
                  <th className="text-right p-3 font-semibold">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {paymentSchedule.schedule.map((payment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{new Date(payment.date).toLocaleDateString('ru-RU')}</td>
                    <td className="p-3">{payment.description}</td>
                    <td className="text-right p-3 font-semibold text-red-600">
                      -{formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 bg-gray-100 font-semibold">
                  <td className="p-3">Итого</td>
                  <td className="p-3">
                    {paymentSchedule.discount > 0 && (
                      <span className="text-green-600">
                        Скидка: {formatCurrency(paymentSchedule.discount)}
                      </span>
                    )}
                  </td>
                  <td className="text-right p-3 text-red-600">
                    -{formatCurrency(paymentSchedule.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Прогноз Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Прогноз Cash Flow (10 лет)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Год</th>
                  {months.map(month => (
                    <th key={month} className="text-center p-2 font-semibold min-w-[80px]">
                      {month}
                    </th>
                  ))}
                  <th className="text-right p-3 font-semibold">Итого за год</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((yearData: any) => (
                  <tr key={yearData.year} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{yearData.year}</td>
                    {yearData.months.map((monthData: any, index: number) => (
                      <td key={index} className="text-center p-2">
                        <span className={`text-sm ${
                          monthData.value > 0 ? 'text-green-600' : 
                          monthData.value < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {formatCurrency(monthData.value)}
                        </span>
                      </td>
                    ))}
                    <td className="text-right p-3 font-semibold">
                      <span className={`${
                        yearData.total > 0 ? 'text-green-600' : 
                        yearData.total < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {formatCurrency(yearData.total)}
                      </span>
                    </td>
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