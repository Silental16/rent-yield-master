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
