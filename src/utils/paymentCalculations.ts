import { PaymentPlan, PaymentCalculation, PaymentScheduleItem } from '@/types/paymentPlan';

export const calculatePaymentPlan = (
  plan: PaymentPlan,
  unitPrice: number,
  entryDate: string,
  constructionEndDate: string
): PaymentCalculation => {
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
        description: 'Full Payment',
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

      schedule.push({
        date: entryDate,
        amount: downPayment,
        description: 'Down Payment',
        type: 'down'
      });

      if (monthsBetween >= 1) {
        const monthlyAmount = constructionPayment / monthsBetween;
        for (let i = 1; i <= monthsBetween; i++) {
          const paymentDate = new Date(entryDateTime.getTime() + i * 30 * 24 * 60 * 60 * 1000);
          schedule.push({
            date: paymentDate.toISOString().split('T')[0],
            amount: monthlyAmount,
            description: `Payment ${i}`,
            type: 'monthly'
          });
        }
      } else {
        schedule[0].amount += constructionPayment;
        schedule[0].description = 'Down Payment + Construction Payments';
      }

      if (launchPayment > 0) {
        schedule.push({
          date: constructionEndDate,
          amount: launchPayment,
          description: 'Final Payment at Launch',
          type: 'launch'
        });
      }
      break;

    case 'fixed':
      const downPaymentFixed = discountedPrice * (plan.downPaymentPercentFixed! / 100);
      const remainingAmount = discountedPrice - downPaymentFixed;
      const monthlyPayment = remainingAmount / plan.installmentMonths!;

      schedule.push({
        date: entryDate,
        amount: downPaymentFixed,
        description: 'Down Payment',
        type: 'down'
      });

      for (let i = 1; i <= plan.installmentMonths!; i++) {
        const paymentDate = new Date(entryDateTime.getTime() + i * 30 * 24 * 60 * 60 * 1000);
        schedule.push({
          date: paymentDate.toISOString().split('T')[0],
          amount: monthlyPayment,
          description: `Payment ${i} of ${plan.installmentMonths}`,
          type: 'monthly'
        });
      }
      break;
  }

  if (plan.additionalPayments && plan.additionalPayments.length > 0) {
    plan.additionalPayments.forEach(additionalPayment => {
      let amount = 0;
      if (additionalPayment.type === 'percentage') {
        amount = discountedPrice * (additionalPayment.value / 100);
      } else {
        amount = additionalPayment.value;
      }

      schedule.push({
        date: constructionEndDate,
        amount,
        description: additionalPayment.name,
        type: 'additional'
      });
    });
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
