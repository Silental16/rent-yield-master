
import { ProjectData } from '@/pages/Index';
import { PaymentPlan } from '@/types/paymentPlan';

export class FinancialCalculations {
  constructor(private data: ProjectData, private paymentPlan?: PaymentPlan) {}

  calculateRentalIncome() {
    const results = [];
    const entryDate = new Date(this.data.entryDate);
    const constructionEndDate = new Date(this.data.constructionEndDate);
    
    // Calculate initial cost based on payment plan discount
    let initialCost = this.data.cost;
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialCost = this.data.cost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialCost = this.data.cost - this.paymentPlan.discount.value;
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
      
      // Calculate revenue expenses
      const totalRevenueExpenses = this.data.revenueExpenses.reduce((sum, expense) => {
        return sum + (grossIncome * expense.percentage / 100);
      }, 0);
      
      const revenueExpensesBreakdown = this.data.revenueExpenses.map(expense => ({
        name: expense.name,
        amount: grossIncome * expense.percentage / 100
      }));
      
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
    
    // Calculate initial cost based on payment plan discount
    let initialCost = this.data.cost;
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialCost = this.data.cost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialCost = this.data.cost - this.paymentPlan.discount.value;
      }
    }

    let cumulativeCashFlow = 0;

    for (let year = 0; year < 10; year++) {
      for (let month = 0; month < 12; month++) {
        const monthIndex = year * 12 + month;
        const currentDate = new Date(entryDate);
        currentDate.setFullYear(currentDate.getFullYear() + year);
        currentDate.setMonth(currentDate.getMonth() + month);
        
        const isConstructionComplete = currentDate >= constructionEndDate;
        
        // Investment payment (simplified - assuming full payment at entry)
        let investorPayment = 0;
        if (monthIndex === 0) {
          investorPayment = -initialCost;
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
        
        // Revenue expenses
        const revenueExpensesTotal = this.data.revenueExpenses.reduce((sum, expense) => {
          return sum + (rentalIncome * expense.percentage / 100);
        }, 0);

        const revenueExpensesBreakdown = this.data.revenueExpenses.map(expense => ({
          name: expense.name,
          amount: rentalIncome * expense.percentage / 100
        }));
        
        // Operational expenses (monthly)
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
        const netProfit = investorPayment + operatingProfit - profitExpensesTotal;
        
        cumulativeCashFlow += netProfit;
        
        results.push({
          month: monthIndex + 1,
          year: year + 1,
          monthName: new Date(currentDate).toLocaleDateString('ru-RU', { month: 'short' }),
          investorPayment,
          rentalIncome,
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
    let initialCost = this.data.cost;
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialCost = this.data.cost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialCost = this.data.cost - this.paymentPlan.discount.value;
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
    
    // Calculate initial investment based on payment plan
    let initialInvestment = this.data.cost;
    if (this.paymentPlan && this.paymentPlan.discount.value > 0) {
      if (this.paymentPlan.discount.type === 'percentage') {
        initialInvestment = this.data.cost * (1 - this.paymentPlan.discount.value / 100);
      } else {
        initialInvestment = this.data.cost - this.paymentPlan.discount.value;
      }
    }
    
    const totalNetProfit10Years = rentalIncome.reduce((sum, year) => sum + year.netProfit, 0);
    const roi10Year = (totalNetProfit10Years / initialInvestment) * 100;
    const averageAnnualReturn = roi10Year / 10;
    
    // Calculate payback period
    let cumulativeProfit = 0;
    let paybackPeriod = 0;
    
    for (const year of rentalIncome) {
      cumulativeProfit += year.netProfit;
      if (cumulativeProfit >= initialInvestment && paybackPeriod === 0) {
        const previousCumulative = cumulativeProfit - year.netProfit;
        const remainingAmount = initialInvestment - previousCumulative;
        const monthsIntoYear = (remainingAmount / year.netProfit) * 12;
        paybackPeriod = year.year - 1 + (monthsIntoYear / 12);
        break;
      }
    }
    
    // Calculate NPV
    let npv = 0;
    if (this.data.npvEnabled) {
      const discountRate = this.data.discountRate / 100;
      npv = -initialInvestment;
      
      for (const year of rentalIncome) {
        npv += year.netProfit / Math.pow(1 + discountRate, year.year);
      }
      
      // Add terminal value (property appreciation)
      const terminalValue = initialInvestment * Math.pow(1 + this.data.propertyGrowth / 100, 10);
      npv += terminalValue / Math.pow(1 + discountRate, 10);
    }
    
    // Calculate IRR
    let irr = 0;
    if (this.data.irrEnabled) {
      const cashFlows = [-initialInvestment, ...rentalIncome.map(year => year.netProfit)];
      
      // Add terminal value to last cash flow
      const terminalValue = initialInvestment * Math.pow(1 + this.data.propertyGrowth / 100, 10);
      cashFlows[cashFlows.length - 1] += terminalValue;
      
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
