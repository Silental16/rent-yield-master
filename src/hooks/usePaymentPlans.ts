
import { useState, useEffect } from 'react';
import { PaymentPlan } from '@/types/paymentPlan';

export const usePaymentPlans = () => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('payment-plans');
    if (stored) {
      try {
        const parsedPlans = JSON.parse(stored);
        setPlans(parsedPlans);
      } catch (error) {
        console.error('Error loading payment plans:', error);
      }
    }
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
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getActivePlans = () => plans.filter(plan => plan.isActive);

  return {
    plans,
    addPlan,
    updatePlan,
    deletePlan,
    getActivePlans
  };
};
