
import { useState, useEffect } from 'react';
import { PaymentPlan } from '@/types/paymentPlan';

const createDefaultPlan = (): PaymentPlan => ({
  id: 'default',
  name: 'Полная оплата',
  type: 'full',
  discount: {
    type: 'percentage',
    value: 0
  },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const usePaymentPlans = () => {
  const [plan, setPlan] = useState<PaymentPlan>(createDefaultPlan());

  useEffect(() => {
    const stored = localStorage.getItem('payment-plan');
    if (stored) {
      try {
        const loadedPlan = JSON.parse(stored);
        setPlan(loadedPlan);
      } catch (error) {
        console.error('Error loading payment plan:', error);
        setPlan(createDefaultPlan());
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payment-plan', JSON.stringify(plan));
  }, [plan]);

  const updatePlan = (updates: Partial<PaymentPlan>) => {
    setPlan(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  return {
    plan,
    updatePlan
  };
};
