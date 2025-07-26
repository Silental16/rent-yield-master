
export interface PaymentPlan {
  id: string;
  name: string;
  type: 'full' | 'construction' | 'fixed';
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  // For construction type
  downPaymentPercent?: number;
  constructionPaymentPercent?: number;
  launchPaymentPercent?: number;
  // For fixed type
  downPaymentPercentFixed?: number;
  installmentMonths?: number;
  // Additional payments at launch
  additionalPayments?: AdditionalPayment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalPayment {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface PaymentScheduleItem {
  date: string;
  amount: number;
  description: string;
  type: 'down' | 'monthly' | 'launch' | 'additional';
}

export interface PaymentCalculation {
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  schedule: PaymentScheduleItem[];
  totalAmount: number;
  savings: number;
}
