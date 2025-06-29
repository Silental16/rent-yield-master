import { ProjectData } from '@/pages/Index';

export class FinancialCalculations {
  private data: ProjectData;

  constructor(data: ProjectData) {
    this.data = data;
  }

  // Расчет валового дохода от аренды по месяцам
  calculateMonthlyRentalIncome(monthsFromStart: number): number {
    const entryDate = new Date(this.data.entryDate);
    const constructionEndDate = new Date(this.data.constructionEndDate);
    const currentDate = new Date(entryDate.getTime() + monthsFromStart * 30 * 24 * 60 * 60 * 1000);

    // Доход начинается только после завершения строительства
    if (currentDate < constructionEndDate) {
      return 0;
    }

    const monthsFromRentalStart = Math.max(0, Math.floor((currentDate.getTime() - constructionEndDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    
    // Расчет текущего ADR с учетом роста
    const currentADR = this.data.adr * Math.pow(1 + this.data.agr / 100, monthsFromRentalStart / 12);
    
    // Коэффициент сезонности
    const monthIndex = currentDate.getMonth();
    const seasonalityCoeff = this.data.seasonality.enabled ? this.data.seasonality.coefficients[monthIndex] : 1;
    
    // Количество дней в месяце
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Валовой доход
    const grossIncome = currentADR * (this.data.occupancy / 100) * daysInMonth * seasonalityCoeff;
    
    return grossIncome;
  }

  // Расчет расходов из выручки с учетом каналов продаж
  calculateRevenueExpenses(grossIncome: number): { total: number; breakdown: Array<{ name: string; amount: number }> } {
    const breakdown = [];
    let total = 0;

    for (const expense of this.data.revenueExpenses) {
      let amount = 0;
      
      // Комиссия OTA начисляется только на выручку от OTA каналов
      if (expense.name.toLowerCase().includes('ota') || expense.name.toLowerCase().includes('комиссия ota')) {
        amount = grossIncome * (this.data.otaBookings / 100) * (expense.percentage / 100);
      } else {
        amount = grossIncome * (expense.percentage / 100);
      }
      
      breakdown.push({ name: expense.name, amount });
      total += amount;
    }

    return { total, breakdown };
  }

  // Расчет таблицы доходности по годам
  calculateRentalIncome() {
    const results = [];
    
    for (let year = 1; year <= 10; year++) {
      let grossIncome = 0;
      
      // Суммируем доходы по месяцам для каждого года
      for (let month = 1; month <= 12; month++) {
        const monthsFromStart = (year - 1) * 12 + month;
        grossIncome += this.calculateMonthlyRentalIncome(monthsFromStart);
      }
      
      // Расчет расходов из выручки с учетом каналов продаж
      const revenueExpensesData = this.calculateRevenueExpenses(grossIncome);
      const revenueExpensesTotal = revenueExpensesData.total;
      
      // Операционные расходы вычитаются из валовой выручки
      let operationalExpenses = 0;
      if (this.data.monthlyExpenses.enabled) {
        operationalExpenses += this.data.monthlyExpenses.value * 12;
      }
      if (this.data.annualRepair.enabled) {
        operationalExpenses += this.data.annualRepair.value;
      }
      if (this.data.insurance.enabled) {
        operationalExpenses += this.data.insurance.value;
      }
      
      const operatingProfit = grossIncome - revenueExpensesTotal - operationalExpenses;
      
      // Расчет расходов из прибыли
      const profitExpensesTotal = this.data.profitExpenses.reduce((sum, expense) => 
        sum + (operatingProfit * expense.percentage / 100), 0
      );
      
      const netProfit = operatingProfit - profitExpensesTotal;

      results.push({
        year,
        grossIncome,
        revenueExpenses: revenueExpensesTotal,
        revenueExpensesBreakdown: revenueExpensesData.breakdown,
        operationalExpenses,
        operatingProfit,
        profitExpenses: profitExpensesTotal,
        netProfit
      });
    }
    
    return results;
  }

  // Расчет стоимости объекта в определенный момент времени
  getPropertyValueAtMonth(months: number): number {
    const entryDate = new Date(this.data.entryDate);
    const currentDate = new Date(entryDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    
    // Найти активный этап ценообразования
    let currentStageValue = this.data.cost;
    let lastStageDate = entryDate;
    
    for (const stage of this.data.pricingStages) {
      const stageDate = new Date(stage.date);
      if (currentDate >= stageDate) {
        currentStageValue = this.data.cost * (stage.percentage / 100);
        lastStageDate = stageDate;
      }
    }
    
    // Если прошли все этапы, применяем рост стоимости объекта
    const lastStage = this.data.pricingStages[this.data.pricingStages.length - 1];
    if (lastStage && currentDate > new Date(lastStage.date)) {
      const monthsAfterLastStage = Math.max(0, Math.floor((currentDate.getTime() - new Date(lastStage.date).getTime()) / (30 * 24 * 60 * 60 * 1000)));
      currentStageValue = currentStageValue * Math.pow(1 + this.data.propertyGrowth / 100, monthsAfterLastStage / 12);
    }
    
    return currentStageValue;
  }

  getPropertyValueAtYear(years: number): number {
    return this.getPropertyValueAtMonth(years * 12);
  }

  // Расчет накопленного дохода от аренды
  getCumulativeRentalIncome(years: number): number {
    const rentalTable = this.calculateRentalIncome();
    let cumulative = 0;
    
    for (let i = 0; i < Math.min(years, rentalTable.length); i++) {
      cumulative += rentalTable[i].netProfit;
    }
    
    return cumulative;
  }

  // Расчет расходов на выход
  getExitCosts(years: number): number {
    const propertyValue = this.getPropertyValueAtYear(years);
    const variableCosts = propertyValue * (this.data.variableCosts / 100);
    const agentCommission = propertyValue * (this.data.agentCommission / 100);
    
    return variableCosts + agentCommission;
  }

  // Расчет ключевых метрик
  calculateKeyMetrics() {
    const rentalTable = this.calculateRentalIncome();
    const totalInvestment = this.calculateTotalInvestment();
    
    // ROI за 10 лет
    const propertyValue10 = this.getPropertyValueAtYear(10);
    const cumulativeRental10 = this.getCumulativeRentalIncome(10);
    const exitCosts10 = this.getExitCosts(10);
    
    const totalReturn10 = propertyValue10 + cumulativeRental10 - exitCosts10;
    const roi10Year = ((totalReturn10 - totalInvestment) / totalInvestment) * 100;
    
    // Средняя годовая доходность
    const averageAnnualReturn = Math.pow(totalReturn10 / totalInvestment, 1/10) * 100 - 100;
    
    // NPV
    let npv = 0;
    if (this.data.npvEnabled) {
      const cashFlow = this.calculateCashFlow();
      npv = cashFlow.reduce((sum, month, index) => {
        const discountFactor = Math.pow(1 + this.data.discountRate / 100, index / 12);
        return sum + month.netCashFlow / discountFactor;
      }, 0);
    }

    // IRR
    const irr = this.calculateIRR();
    
    // Срок окупаемости
    const cashFlow = this.calculateCashFlow();
    let paybackPeriod = 0;
    let cumulativeCF = 0;
    
    for (let i = 0; i < cashFlow.length; i++) {
      cumulativeCF += cashFlow[i].netCashFlow;
      if (cumulativeCF >= 0) {
        paybackPeriod = Math.ceil(i / 12);
        break;
      }
    }
    
    return {
      roi10Year,
      averageAnnualReturn,
      npv,
      irr,
      paybackPeriod
    };
  }

  // Расчет общих инвестиций
  calculateTotalInvestment(): number {
    let totalCost = this.data.cost;
    
    // Применяем скидку
    if (this.data.paymentPlan.discountType === 'percentage') {
      totalCost = totalCost * (1 - this.data.paymentPlan.discountValue / 100);
    } else {
      totalCost = totalCost - this.data.paymentPlan.discountValue;
    }
    
    return totalCost;
  }

  // Расчет плана платежей
  calculatePaymentSchedule() {
    const totalInvestment = this.calculateTotalInvestment();
    const payments = [];
    
    if (!this.data.paymentPlan.isInstallment) {
      // Полная оплата
      payments.push({
        date: this.data.entryDate,
        amount: totalInvestment,
        description: 'Полная оплата'
      });
    } else {
      // Рассрочка
      const entryDate = new Date(this.data.entryDate);
      const constructionEndDate = new Date(this.data.constructionEndDate);

      // Первоначальный взнос
      let downPaymentAmount;
      if (this.data.paymentPlan.downPayment.type === 'percentage') {
        downPaymentAmount = totalInvestment * (
          this.data.paymentPlan.downPayment.value / 100
        );
      } else {
        downPaymentAmount = this.data.paymentPlan.downPayment.value;
      }

      // Платежи во время строительства
      const constructionPaymentAmount =
        totalInvestment *
        (this.data.paymentPlan.constructionPayments.percentage / 100);

      const monthsDuringConstruction = Math.max(
        1,
        Math.floor(
          (constructionEndDate.getTime() - entryDate.getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );

      if (this.data.paymentPlan.type === 'prelaunch') {
        // Months available before the final payment
        const allowedMonths = monthsDuringConstruction - 1;

        if (allowedMonths < 1) {
          // Combine down payment and construction portion into a single payment
          payments.push({
            date: this.data.entryDate,
            amount: downPaymentAmount + constructionPaymentAmount,
            description: 'Первоначальный взнос'
          });
        } else {
          // Down payment on entry
          payments.push({
            date: this.data.entryDate,
            amount: downPaymentAmount,
            description: 'Первоначальный взнос'
          });

          // Spread construction payments evenly until launch minus one month
          const monthlyAmount = constructionPaymentAmount / allowedMonths;
          for (let i = 1; i <= allowedMonths; i++) {
            const paymentDate = new Date(
              entryDate.getTime() + i * 30 * 24 * 60 * 60 * 1000
            );
            payments.push({
              date: paymentDate.toISOString().split('T')[0],
              amount: monthlyAmount,
              description: `Платеж ${i}`
            });
          }
        }
      } else {
        payments.push({
          date: this.data.entryDate,
          amount: downPaymentAmount,
          description: 'Первоначальный взнос'
        });

        if (this.data.paymentPlan.constructionPayments.mode === 'monthly') {
          const monthlyPayment = constructionPaymentAmount / monthsDuringConstruction;

          for (let i = 1; i < monthsDuringConstruction; i++) {
            const paymentDate = new Date(
              entryDate.getTime() + i * 30 * 24 * 60 * 60 * 1000
            );
            payments.push({
              date: paymentDate.toISOString().split('T')[0],
              amount: monthlyPayment,
              description: `Платеж ${i}`
            });
          }
        } else {
          // Фиксированное количество платежей
          const paymentCount =
            this.data.paymentPlan.constructionPayments.count || 12;
          const fixedPayment = constructionPaymentAmount / paymentCount;

          for (let i = 1; i <= paymentCount && i < monthsDuringConstruction; i++) {
            const paymentDate = new Date(
              entryDate.getTime() +
                i * (monthsDuringConstruction / paymentCount) * 30 * 24 * 60 * 60 * 1000
            );
            payments.push({
              date: paymentDate.toISOString().split('T')[0],
              amount: fixedPayment,
              description: `Платеж ${i}`
            });
          }
        }
      }

      // Финальный платеж в день запуска проекта
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const finalPayment = totalInvestment - totalPaid;

      if (finalPayment > 0) {
        payments.push({
          date: this.data.constructionEndDate,
          amount: finalPayment,
          description: 'Финальный платеж при запуске'
        });
      }
    }
    
    return payments;
  }

  // Расчет Cash Flow
  calculateCashFlow() {
    const entryDate = new Date(this.data.entryDate);
    const paymentSchedule = this.calculatePaymentSchedule();
    const months = 120; // 10 лет
    const cashFlow = [];
    
    for (let month = 0; month < months; month++) {
      const currentDate = new Date(entryDate.getTime() + month * 30 * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Платежи инвестора
      let investorPayment = 0;
      const payment = paymentSchedule.find(p => p.date === dateStr);
      if (payment) {
        investorPayment = -payment.amount;
      }
      
      // Доход от аренды
      const rentalIncome = this.calculateMonthlyRentalIncome(month);
      
      // Расходы из выручки с детализацией
      const revenueExpensesData = this.calculateRevenueExpenses(rentalIncome);
      
      // Операционные расходы (вычитаются из выручки)
      const operationalExpensesBreakdown = [];
      let totalOperationalExpenses = 0;
      
      if (rentalIncome > 0) { // Расходы только когда есть доход
        if (this.data.monthlyExpenses.enabled) {
          const amount = this.data.monthlyExpenses.value;
          operationalExpensesBreakdown.push({ name: 'Месячные расходы', amount });
          totalOperationalExpenses += amount;
        }
        if (this.data.annualRepair.enabled && month % 12 === 0) {
          const amount = this.data.annualRepair.value;
          operationalExpensesBreakdown.push({ name: 'Годовой ремонт', amount });
          totalOperationalExpenses += amount;
        }
        if (this.data.insurance.enabled && month % 12 === 0) {
          const amount = this.data.insurance.value;
          operationalExpensesBreakdown.push({ name: 'Страховка', amount });
          totalOperationalExpenses += amount;
        }
      }
      
      // Операционная прибыль после вычета расходов на выручку и операционных расходов
      const operatingProfit = rentalIncome - revenueExpensesData.total - totalOperationalExpenses;
      
      // Расходы из прибыли
      const profitExpensesBreakdown = [];
      let totalProfitExpenses = 0;
      
      for (const expense of this.data.profitExpenses) {
        const amount = operatingProfit * (expense.percentage / 100);
        profitExpensesBreakdown.push({ name: expense.name, amount });
        totalProfitExpenses += amount;
      }
      
      const netProfit = operatingProfit - totalProfitExpenses;
      const netCashFlow = investorPayment + netProfit;
      const cumulativeCashFlow = cashFlow.length > 0 ? 
        cashFlow[cashFlow.length - 1].cumulativeCashFlow + netCashFlow : netCashFlow;
      
      cashFlow.push({
        date: dateStr,
        investorPayment,
        rentalIncome,
        revenueExpensesTotal: revenueExpensesData.total,
        revenueExpensesBreakdown: revenueExpensesData.breakdown,
        operationalExpensesTotal: totalOperationalExpenses,
        operationalExpensesBreakdown,
        operatingProfit,
        profitExpensesTotal: totalProfitExpenses,
        profitExpensesBreakdown,
        netProfit,
        netCashFlow,
        cumulativeCashFlow,
        // Keep legacy fields for compatibility
        operatingExpenses: revenueExpensesData.total + totalProfitExpenses + totalOperationalExpenses
      });
    }
    
    return cashFlow;
  }

  // Расчет стоимости объекта на любую дату
  calculatePropertyValue() {
    const entryDate = new Date(this.data.entryDate);
    const values = [];
    
    for (let month = 0; month <= 120; month++) {
      const value = this.getPropertyValueAtMonth(month);
      const date = new Date(entryDate.getTime() + month * 30 * 24 * 60 * 60 * 1000);
      
      values.push({
        month,
        date: date.toISOString().split('T')[0],
        value
      });
    }
    
    return values;
  }

  // Анализ чувствительности
  calculateSensitivity(parameter: string, multiplier: number): number {
    const originalData = { ...this.data };
    
    switch (parameter) {
      case 'adr':
        this.data.adr *= multiplier;
        break;
      case 'occupancy':
        this.data.occupancy *= multiplier;
        break;
      case 'expenses':
        this.data.monthlyExpenses.value *= multiplier;
        this.data.annualRepair.value *= multiplier;
        this.data.insurance.value *= multiplier;
        break;
    }
    
    const metrics = this.calculateKeyMetrics();
    const sensitivityROI = metrics.roi10Year;
    
    // Восстанавливаем оригинальные данные
    this.data = originalData;
    
    return sensitivityROI;
  }

  // Стресс-тестирование
  calculateStressTest(scenario: string, value: number): number {
    const originalData = { ...this.data };
    
    switch (scenario) {
      case 'demand':
        this.data.occupancy *= value;
        break;
      case 'expenses':
        this.data.monthlyExpenses.value *= value;
        this.data.annualRepair.value *= value;
        this.data.insurance.value *= value;
        break;
      case 'delay':
        const constructionDate = new Date(this.data.constructionEndDate);
        constructionDate.setMonth(constructionDate.getMonth() + value);
        this.data.constructionEndDate = constructionDate.toISOString().split('T')[0];
        break;
    }
    
    const metrics = this.calculateKeyMetrics();
    const stressROI = metrics.roi10Year;
    
    // Восстанавливаем оригинальные данные
    this.data = originalData;
    
    return stressROI;
  }

  // IRR calculation using Newton-Raphson method
  calculateIRR(): number {
    if (!this.data.irrEnabled) return 0;
    
    const cashFlow = this.calculateCashFlow();
    let irr = 0.1; // Initial guess 10%
    
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let dnpv = 0;
      
      cashFlow.forEach((month, index) => {
        const period = index / 12;
        const discountFactor = Math.pow(1 + irr, period);
        npv += month.netCashFlow / discountFactor;
        dnpv -= (period * month.netCashFlow) / Math.pow(1 + irr, period + 1);
      });
      
      if (Math.abs(npv) < 0.01) break;
      if (dnpv === 0) break;
      
      irr = irr - npv / dnpv;
    }
    
    return irr * 100; // Convert to percentage
  }
}
