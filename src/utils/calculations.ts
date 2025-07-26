import { ProjectData } from '@/pages/Index';
import { PaymentPlan } from '@/types/paymentPlan';
import { calculatePaymentPlan } from './paymentCalculations';

export class FinancialCalculations {
  constructor(private data: ProjectData, private paymentPlan?: PaymentPlan) {}

  // Метод для расчета цены юнита на момент входа инвестора
  getUnitPriceAtEntry(): number {
    const entryDate = new Date(this.data.entryDate);
    const pricingStages = this.data.pricingStages;
    
    // Сортируем этапы по дате
    const sortedStages = [...pricingStages].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let currentPrice = this.data.cost; // Fallback to original cost
    let lastStageDate = entryDate;
    let lastStagePrice = this.data.cost;
    
    // Проверяем, есть ли этап ценообразования для даты входа
    let foundStagePrice = false;
    for (const stage of sortedStages) {
      const stageDate = new Date(stage.date);
      if (entryDate >= stageDate) {
        currentPrice = stage.price;
        lastStagePrice = stage.price;
        lastStageDate = stageDate;
        foundStagePrice = true;
      }
    }
    
    // Если есть этапы и дата входа после последнего этапа, применяем рост
    if (sortedStages.length > 0 && foundStagePrice) {
      const lastStage = sortedStages[sortedStages.length - 1];
      const lastStageDateTime = new Date(lastStage.date);
      
      if (entryDate > lastStageDateTime) {
        // Количество месяцев после последнего этапа
        const monthsAfterLastStage = (entryDate.getFullYear() - lastStageDateTime.getFullYear()) * 12 
          + (entryDate.getMonth() - lastStageDateTime.getMonth());
        
        // Применяем экспоненциальный рост: P[n] = lastStagePrice × (1 + propertyGrowth)^(n/12)
        currentPrice = lastStage.price * Math.pow(1 + this.data.propertyGrowth / 100, monthsAfterLastStage / 12);
      }
    }
    
    return currentPrice;
  }

  // Метод для получения данных графика роста цены юнита с учетом этапов ценообразования
  getUnitPriceGrowthData(): Array<{month: number; year: number; price: number; monthName: string}> {
    const entryDate = new Date(this.data.entryDate);
    const pricingStages = this.data.pricingStages;
    
    // Сортируем этапы по дате
    const sortedStages = [...pricingStages].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Найти последний этап ценообразования
    let lastStagePrice = this.data.cost;
    let lastStageDate = entryDate;
    
    if (sortedStages.length > 0) {
      const lastStage = sortedStages[sortedStages.length - 1];
      lastStagePrice = lastStage.price;
      lastStageDate = new Date(lastStage.date);
    }
    
    const data = [];
    const monthlyGrowthMultiplier = Math.pow(1 + this.data.propertyGrowth / 100, 1/12); // k = (1.12)^(1/12)
    
    for (let year = 0; year < 10; year++) {
      for (let month = 0; month < 12; month++) {
        const monthIndex = year * 12 + month;
        const currentDate = new Date(entryDate);
        currentDate.setFullYear(currentDate.getFullYear() + year);
        currentDate.setMonth(currentDate.getMonth() + month);
        
        let price = this.data.cost; // Изначальная цена по умолчанию
        
        // Проверяем, есть ли этап ценообразования для этой даты
        let foundStagePrice = false;
        for (const stage of sortedStages) {
          const stageDate = new Date(stage.date);
          if (currentDate >= stageDate) {
            price = stage.price;
            foundStagePrice = true;
          }
        }
        
        // Если дата после последнего этапа ценообразования, применяем рост
        if (currentDate > lastStageDate && foundStagePrice) {
          // Количество месяцев после последнего этапа
          const monthsAfterLastStage = (currentDate.getFullYear() - lastStageDate.getFullYear()) * 12 
            + (currentDate.getMonth() - lastStageDate.getMonth());
          
          // Применяем экспоненциальный рост: P[n] = lastStagePrice × (1.12)^(n/12)
          price = lastStagePrice * Math.pow(1 + this.data.propertyGrowth / 100, monthsAfterLastStage / 12);
        }
        
        data.push({
          month: monthIndex + 1,
          year: year + 1,
          price: Math.round(price),
          monthName: currentDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
        });
      }
    }
    
    return data;
  }

  calculateRentalIncome() {
    const results = [];
    const entryDate = new Date(this.data.entryDate);
    const constructionEndDate = new Date(this.data.constructionEndDate);
    
    // Calculate initial cost based on entry date and payment plan discount
    let initialCost = this.getUnitPriceAtEntry();
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialCost = initialCost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialCost = initialCost - this.paymentPlan.discount.value;
      }
    }

    for (let year = 1; year <= 10; year++) {
      const currentDate = new Date(entryDate);
      currentDate.setFullYear(currentDate.getFullYear() + year - 1);
      
      const isConstructionComplete = currentDate >= constructionEndDate;
      
      let grossIncome = 0;
      
      if (isConstructionComplete) {
        const adrForYear = this.data.adr * Math.pow(1 + this.data.agr / 100, year - 1);
        const daysInYear = 365;
        const occupiedDays = Math.floor(daysInYear * (this.data.occupancy / 100));
        
        grossIncome = adrForYear * occupiedDays;
        
        // Apply seasonality if enabled
        if (this.data.seasonality.enabled) {
          const avgCoefficient = this.data.seasonality.coefficients.reduce((sum, coeff) => sum + coeff, 0) / 12;
          grossIncome *= avgCoefficient;
        }
      }
      
      // Calculate revenue breakdown by channels
      const directBookingsRevenue = grossIncome * (this.data.directBookings / 100);
      const otaBookingsRevenue = grossIncome * (this.data.otaBookings / 100);
      
      // Calculate revenue expenses with dynamic OTA commission
      const totalRevenueExpenses = this.data.revenueExpenses.reduce((sum, expense) => {
        if (expense.name === 'Комиссия OTA') {
          // OTA commission applies only to OTA bookings revenue
          return sum + (otaBookingsRevenue * expense.percentage / 100);
        } else {
          // Other expenses apply to gross income
          return sum + (grossIncome * expense.percentage / 100);
        }
      }, 0);
      
      const revenueExpensesBreakdown = this.data.revenueExpenses.map(expense => {
        let amount;
        if (expense.name === 'Комиссия OTA') {
          amount = otaBookingsRevenue * expense.percentage / 100;
        } else {
          amount = grossIncome * expense.percentage / 100;
        }
        return {
          name: expense.name,
          amount: amount,
          percentage: expense.percentage
        };
      });
      
      // Calculate operational expenses
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
      
      // Calculate operating profit
      const operatingProfit = grossIncome - totalRevenueExpenses - operationalExpenses;
      
      // Calculate profit expenses (only if operating profit is positive)
      const profitExpenses = operatingProfit > 0 
        ? this.data.profitExpenses.reduce((sum, expense) => {
            return sum + (operatingProfit * expense.percentage / 100);
          }, 0)
        : 0;
      
      // Calculate net profit
      const netProfit = operatingProfit - profitExpenses;
      
      results.push({
        year,
        grossIncome,
        directBookingsRevenue,
        otaBookingsRevenue,
        totalRevenueExpenses,
        revenueExpensesBreakdown,
        operationalExpenses,
        operatingProfit,
        profitExpenses,
        netProfit
      });
    }
    
    return results;
  }

  calculateCashFlow() {
    const results = [];
    const entryDate = new Date(this.data.entryDate);
    const constructionEndDate = new Date(this.data.constructionEndDate);
    
    // Calculate payment plan schedule if payment plan is provided
    let paymentSchedule: Array<{date: string; amount: number}> = [];
    let initialCost = this.getUnitPriceAtEntry();
    
    if (this.paymentPlan) {
      const paymentCalculation = calculatePaymentPlan(
        this.paymentPlan,
        initialCost,
        this.data.entryDate,
        this.data.constructionEndDate
      );
      paymentSchedule = paymentCalculation.schedule.map(item => ({
        date: item.date,
        amount: item.amount
      }));
      initialCost = paymentCalculation.totalAmount;
    }

    let cumulativeCashFlow = 0;

    for (let year = 0; year < 10; year++) {
      for (let month = 0; month < 12; month++) {
        const monthIndex = year * 12 + month;
        const currentDate = new Date(entryDate);
        currentDate.setFullYear(currentDate.getFullYear() + year);
        currentDate.setMonth(currentDate.getMonth() + month);
        
        const isConstructionComplete = currentDate >= constructionEndDate;
        
        // Investment payment - check if there's a payment scheduled for this month
        let investorPayment = 0;
        const currentDateStr = currentDate.toISOString().split('T')[0];
        
        // Find payment for current month (compare by year and month only)
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const monthPayment = paymentSchedule.find(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate.getFullYear() === currentYear && paymentDate.getMonth() === currentMonth;
        });
        
        if (monthPayment) {
          investorPayment = -monthPayment.amount; // Negative for outgoing payment
        }
        
        // Additional payments at launch (if construction is complete this month)
        let additionalPayments = 0;
        const constructionEndYear = constructionEndDate.getFullYear();
        const constructionEndMonth = constructionEndDate.getMonth();
        
        if (currentYear === constructionEndYear && 
            currentMonth === constructionEndMonth &&
            this.paymentPlan?.additionalPayments) {
          
          additionalPayments = this.paymentPlan.additionalPayments.reduce((sum, payment) => {
            if (payment.type === 'percentage') {
              return sum + (initialCost * (payment.value / 100));
            } else {
              return sum + payment.value;
            }
          }, 0);
          additionalPayments = -additionalPayments; // Negative for outgoing payment
        }
        
        // Rental income
        let rentalIncome = 0;
        if (isConstructionComplete) {
          const adrForYear = this.data.adr * Math.pow(1 + this.data.agr / 100, year);
          const daysInMonth = 30; // Simplified
          const occupiedDays = Math.floor(daysInMonth * (this.data.occupancy / 100));
          
          rentalIncome = adrForYear * occupiedDays;
          
          // Apply seasonality if enabled
          if (this.data.seasonality.enabled) {
            rentalIncome *= this.data.seasonality.coefficients[month] || 1;
          }
        }
        
        // Revenue breakdown by channels
        const directBookingsRevenue = rentalIncome * (this.data.directBookings / 100);
        const otaBookingsRevenue = rentalIncome * (this.data.otaBookings / 100);
        
        // Revenue expenses with dynamic OTA commission
        const revenueExpensesTotal = this.data.revenueExpenses.reduce((sum, expense) => {
          if (expense.name === 'Комиссия OTA') {
            return sum + (otaBookingsRevenue * expense.percentage / 100);
          } else {
            return sum + (rentalIncome * expense.percentage / 100);
          }
        }, 0);

        const revenueExpensesBreakdown = this.data.revenueExpenses.map(expense => {
          let amount;
          if (expense.name === 'Комиссия OTA') {
            amount = otaBookingsRevenue * expense.percentage / 100;
          } else {
            amount = rentalIncome * expense.percentage / 100;
          }
          return {
            name: expense.name,
            amount: amount,
            percentage: expense.percentage
          };
        });
        
        // Calculate operational expenses (monthly)
        let operationalExpensesTotal = 0;
        const operationalExpensesBreakdown = [];
        
        if (this.data.monthlyExpenses.enabled) {
          operationalExpensesTotal += this.data.monthlyExpenses.value;
          operationalExpensesBreakdown.push({
            name: 'Месячные расходы',
            amount: this.data.monthlyExpenses.value
          });
        }
        
        if (this.data.annualRepair.enabled && month === 0) {
          operationalExpensesTotal += this.data.annualRepair.value;
          operationalExpensesBreakdown.push({
            name: 'Годовой ремонт',
            amount: this.data.annualRepair.value
          });
        }
        
        if (this.data.insurance.enabled && month === 0) {
          operationalExpensesTotal += this.data.insurance.value;
          operationalExpensesBreakdown.push({
            name: 'Страховка',
            amount: this.data.insurance.value
          });
        }
        
        // Operating profit
        const operatingProfit = rentalIncome - revenueExpensesTotal - operationalExpensesTotal;
        
        // Profit expenses
        const profitExpensesTotal = operatingProfit > 0 
          ? this.data.profitExpenses.reduce((sum, expense) => {
              return sum + (operatingProfit * expense.percentage / 100);
            }, 0)
          : 0;

        const profitExpensesBreakdown = this.data.profitExpenses.map(expense => ({
          name: expense.name,
          amount: operatingProfit > 0 ? operatingProfit * expense.percentage / 100 : 0
        }));
        
        // Net profit
        const netProfit = investorPayment + additionalPayments + operatingProfit - profitExpensesTotal;
        
        // Update cumulative cash flow
        cumulativeCashFlow += netProfit;
        
        results.push({
          month: monthIndex + 1,
          year: year + 1,
          monthName: new Date(currentDate).toLocaleDateString('ru-RU', { month: 'short' }),
          investorPayment,
          rentalIncome,
          directBookingsRevenue,
          otaBookingsRevenue,
          revenueExpensesTotal,
          revenueExpensesBreakdown,
          operationalExpensesTotal,
          operationalExpensesBreakdown,
          operatingProfit,
          profitExpensesTotal,
          profitExpensesBreakdown,
          netProfit,
          cumulativeCashFlow
        });
      }
    }
    
    return results;
  }

  getPropertyValueAtYear(year: number): number {
    // Если year = 0, это означает "после строительства", используем дату завершения строительства
    if (year === 0) {
      const constructionEndDate = new Date(this.data.constructionEndDate);
      const pricingStages = this.data.pricingStages;
      
      // Сортируем этапы по дате
      const sortedStages = [...pricingStages].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let currentPrice = this.data.cost;
      let foundStagePrice = false;
      
      // Проверяем, есть ли этап ценообразования для даты завершения строительства
      for (const stage of sortedStages) {
        const stageDate = new Date(stage.date);
        if (constructionEndDate >= stageDate) {
          currentPrice = stage.price;
          foundStagePrice = true;
        }
      }
      
      // Если есть этапы и дата завершения строительства после последнего этапа, применяем рост
      if (sortedStages.length > 0 && foundStagePrice) {
        const lastStage = sortedStages[sortedStages.length - 1];
        const lastStageDateTime = new Date(lastStage.date);
        
        if (constructionEndDate > lastStageDateTime) {
          // Количество месяцев после последнего этапа
          const monthsAfterLastStage = (constructionEndDate.getFullYear() - lastStageDateTime.getFullYear()) * 12 
            + (constructionEndDate.getMonth() - lastStageDateTime.getMonth());
          
          // Применяем экспоненциальный рост
          currentPrice = lastStage.price * Math.pow(1 + this.data.propertyGrowth / 100, monthsAfterLastStage / 12);
        }
      }
      
      return currentPrice;
    }
    
    // Для остальных лет считаем от даты входа в проект
    let initialCost = this.getUnitPriceAtEntry();
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialCost = initialCost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialCost = initialCost - this.paymentPlan.discount.value;
      }
    }
    
    return initialCost * Math.pow(1 + this.data.propertyGrowth / 100, year);
  }

  getCumulativeRentalIncome(years: number): number {
    const rentalIncome = this.calculateRentalIncome();
    return rentalIncome.slice(0, years).reduce((sum, year) => sum + year.netProfit, 0);
  }

  getExitCosts(year: number): number {
    const propertyValue = this.getPropertyValueAtYear(year);
    // Assuming 5% exit costs (broker fees, taxes, etc.)
    return propertyValue * 0.05;
  }

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
        this.data.revenueExpenses = this.data.revenueExpenses.map(expense => ({
          ...expense,
          percentage: expense.percentage * multiplier
        }));
        break;
    }
    
    const metrics = this.calculateKeyMetrics();
    const roi = metrics.roi10Year;
    
    // Restore original data
    Object.assign(this.data, originalData);
    
    return roi;
  }

  calculateStressTest(scenario: string, value: number): number {
    const originalData = { ...this.data };
    
    switch (scenario) {
      case 'demand':
        this.data.occupancy *= value;
        break;
      case 'expenses':
        this.data.revenueExpenses = this.data.revenueExpenses.map(expense => ({
          ...expense,
          percentage: expense.percentage * value
        }));
        break;
      case 'delay':
        const constructionDate = new Date(this.data.constructionEndDate);
        constructionDate.setMonth(constructionDate.getMonth() + value);
        this.data.constructionEndDate = constructionDate.toISOString().split('T')[0];
        break;
    }
    
    const metrics = this.calculateKeyMetrics();
    const roi = metrics.roi10Year;
    
    // Restore original data
    Object.assign(this.data, originalData);
    
    return roi;
  }

  calculateKeyMetrics() {
    const rentalIncome = this.calculateRentalIncome();
    const entryDate = new Date(this.data.entryDate);
    const constructionEndDate = new Date(this.data.constructionEndDate);
    
    // Calculate initial investment based on entry date and payment plan
    let initialInvestment = this.getUnitPriceAtEntry();
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialInvestment = initialInvestment * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialInvestment = initialInvestment - this.paymentPlan.discount.value;
      }
    }
    
    // Calculate years from entry to construction end (investment period without income)
    const yearsFromEntryToConstEnd = Math.max(0, (constructionEndDate.getTime() - entryDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    const totalNetProfit10Years = rentalIncome.reduce((sum, year) => sum + year.netProfit, 0);
    const roi10Year = (totalNetProfit10Years / initialInvestment) * 100;
    const averageAnnualReturn = roi10Year / 10;
    
    // Calculate payback period accounting for entry date
    let cumulativeProfit = 0;
    let paybackPeriod = yearsFromEntryToConstEnd; // Start from construction completion
    
    for (const year of rentalIncome) {
      cumulativeProfit += year.netProfit;
      if (cumulativeProfit >= initialInvestment && paybackPeriod === yearsFromEntryToConstEnd) {
        const previousCumulative = cumulativeProfit - year.netProfit;
        const remainingAmount = initialInvestment - previousCumulative;
        const monthsIntoYear = year.netProfit > 0 ? (remainingAmount / year.netProfit) * 12 : 12;
        paybackPeriod = yearsFromEntryToConstEnd + year.year - 1 + (monthsIntoYear / 12);
        break;
      }
    }
    
    // Calculate NPV accounting for investment timing
    let npv = 0;
    if (this.data.npvEnabled) {
      const discountRate = this.data.discountRate / 100;
      npv = -initialInvestment; // Investment happens at entry date (time 0)
      
      for (const year of rentalIncome) {
        // Discount from the actual time when cash flow occurs (entry date + years to construction end + rental year)
        const timeFromEntry = yearsFromEntryToConstEnd + year.year;
        npv += year.netProfit / Math.pow(1 + discountRate, timeFromEntry);
      }
      
      // Add terminal value (property appreciation) - occurs at end of 10-year rental period
      const terminalValue = initialInvestment * Math.pow(1 + this.data.propertyGrowth / 100, 10);
      const terminalValueTime = yearsFromEntryToConstEnd + 10;
      npv += terminalValue / Math.pow(1 + discountRate, terminalValueTime);
    }
    
    // Calculate IRR accounting for investment timing
    let irr = 0;
    if (this.data.irrEnabled) {
      // Create cash flow array starting from entry date
      const totalYears = Math.ceil(yearsFromEntryToConstEnd + 10);
      const cashFlows = new Array(totalYears + 1).fill(0);
      cashFlows[0] = -initialInvestment; // Investment at entry date
      
      // Add rental income cash flows starting from construction end
      const constructionEndYearIndex = Math.ceil(yearsFromEntryToConstEnd);
      rentalIncome.forEach((year, index) => {
        const cashFlowIndex = constructionEndYearIndex + index;
        if (cashFlowIndex < cashFlows.length) {
          cashFlows[cashFlowIndex] += year.netProfit;
        }
      });
      
      // Add terminal value to last cash flow
      const terminalValue = initialInvestment * Math.pow(1 + this.data.propertyGrowth / 100, 10);
      const lastIndex = Math.min(constructionEndYearIndex + 9, cashFlows.length - 1);
      cashFlows[lastIndex] += terminalValue;
      
      irr = this.calculateIRR(cashFlows) * 100;
    }
    
    return {
      roi10Year,
      averageAnnualReturn,
      paybackPeriod,
      npv,
      irr
    };
  }

  private calculateIRR(cashFlows: number[], guess: number = 0.1, maxIterations: number = 100): number {
    let rate = guess;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
        dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
      }
      
      if (Math.abs(npv) < 0.0001) {
        return rate;
      }
      
      rate = rate - npv / dnpv;
    }
    
    return rate;
  }
}
