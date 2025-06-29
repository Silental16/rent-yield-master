
import { PaymentPlan, PaymentCalculation, PaymentScheduleItem } from '@/types/paymentPlan';

export const calculatePaymentPlan = (
  plan: PaymentPlan,
  unitPrice: number,
  entryDate: string,
  constructionEndDate: string
): PaymentCalculation => {
  // Apply discount
  let discountedPrice = unitPrice;
  let discountAmount = 0;

  if (plan.discount.type === 'percentage') {
    discountAmount = unitPrice * (plan.discount.value / 100);
    discountedPrice = unitPrice - discountAmount;
  } else {
    discountAmount = plan.discount.value;
    discountedPrice = unitPrice - discountAmount;
  }

  const schedule: PaymentScheduleItem[] = [];
  const entryDateTime = new Date(entryDate);
  const constructionEndDateTime = new Date(constructionEndDate);

  switch (plan.type) {
    case 'full':
      schedule.push({
        date: entryDate,
        amount: discountedPrice,
        description: 'Полная оплата',
        type: 'down'
      });
      break;

    case 'construction':
      const monthsBetween = Math.max(0, Math.floor(
        (constructionEndDateTime.getTime() - entryDateTime.getTime()) / (30 * 24 * 60 * 60 * 1000)
      ) - 1);

      const downPayment = discountedPrice * (plan.downPaymentPercent! / 100);
      const constructionPayment = discountedPrice * (plan.constructionPaymentPercent! / 100);
      const launchPayment = discountedPrice * (plan.launchPaymentPercent! / 100);

      // Down payment
      schedule.push({
        date: entryDate,
        amount: downPayment,
        description: 'Первоначальный взнос',
        type: 'down'
      });

      // Construction payments
      if (monthsBetween >= 1) {
        const monthlyAmount = constructionPayment / monthsBetween;
        for (let i = 1; i <= monthsBetween; i++) {
          const paymentDate = new Date(entryDateTime.getTime() + i * 30 * 24 * 60 * 60 * 1000);
          schedule.push({
            date: paymentDate.toISOString().split('T')[0],
            amount: monthlyAmount,
            description: `Платеж ${i}`,
            type: 'monthly'
          });
        }
      } else {
        // Add construction payment to down payment if less than 1 month
        schedule[0].amount += constructionPayment;
        schedule[0].description = 'Первоначальный взнос + платежи во время строительства';
      }

      // Launch payment
      if (launchPayment > 0) {
        schedule.push({
          date: constructionEndDate,
          amount: launchPayment,
          description: 'Финальный платеж при запуске',
          type: 'launch'
        });
      }
      break;

    case 'fixed':
      const downPaymentFixed = discountedPrice * (plan.downPaymentPercentFixed! / 100);
      const remainingAmount = discountedPrice - downPaymentFixed;
      const monthlyPayment = remainingAmount / plan.installmentMonths!;

      // Down payment
      schedule.push({
        date: entryDate,
        amount: downPaymentFixed,
        description: 'Первоначальный взнос',
        type: 'down'
      });

      // Monthly payments
      for (let i = 1; i <= plan.installmentMonths!; i++) {
        const paymentDate = new Date(entryDateTime.getTime() + i * 30 * 24 * 60 * 60 * 1000);
        schedule.push({
          date: paymentDate.toISOString().split('T')[0],
          amount: monthlyPayment,
          description: `Платеж ${i} из ${plan.installmentMonths}`,
          type: 'monthly'
        });
      }
      break;
  }

  const totalAmount = schedule.reduce((sum, item) => sum + item.amount, 0);

  return {
    originalPrice: unitPrice,
    discountedPrice,
    discount: discountAmount,
    schedule,
    totalAmount,
    savings: discountAmount
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getMonthsBetweenDates = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
};
