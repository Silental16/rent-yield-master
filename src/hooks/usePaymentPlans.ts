
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
  const [plans, setPlans] = useState<PaymentPlan[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('payment-plans');
    let loadedPlans: PaymentPlan[] = [];
    
    if (stored) {
      try {
        loadedPlans = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading payment plans:', error);
      }
    }

    // Ensure default plan always exists
    const defaultPlan = loadedPlans.find(plan => plan.id === 'default');
    if (!defaultPlan) {
      loadedPlans.unshift(createDefaultPlan());
    }

    setPlans(loadedPlans);
  }, []);

  useEffect(() => {
    localStorage.setItem('payment-plans', JSON.stringify(plans));
  }, [plans]);

  const addPlan = (plan: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: PaymentPlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPlans(prev => [...prev, newPlan]);
    return newPlan.id;
  };

  const updatePlan = (id: string, updates: Partial<PaymentPlan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id 
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    ));
  };

  const deletePlan = (id: string) => {
    // Prevent deletion of default plan
    if (id === 'default') return;
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getActivePlans = () => plans.filter(plan => plan.isActive);

  const getDefaultPlan = () => plans.find(plan => plan.id === 'default') || createDefaultPlan();

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
    getActivePlans,
    getDefaultPlan
  };
};
