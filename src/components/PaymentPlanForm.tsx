import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentPlan } from '@/types/paymentPlan';
import { AdditionalPaymentsManager } from './AdditionalPaymentsManager';
import { AlertCircle } from 'lucide-react';

interface PaymentPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingPlan?: PaymentPlan | null;
}

export const PaymentPlanForm = ({ isOpen, onClose, onSubmit, editingPlan }: PaymentPlanFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'full' as 'full' | 'construction' | 'fixed',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    downPaymentPercent: 30,
    constructionPaymentPercent: 50,
    downPaymentPercentFixed: 30,
    installmentMonths: 12,
    additionalPayments: [] as any[],
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        type: editingPlan.type,
        discountType: editingPlan.discount.type,
        discountValue: editingPlan.discount.value,
        downPaymentPercent: editingPlan.downPaymentPercent || 30,
        constructionPaymentPercent: editingPlan.constructionPaymentPercent || 50,
        downPaymentPercentFixed: editingPlan.downPaymentPercentFixed || 30,
        installmentMonths: editingPlan.installmentMonths || 12,
        additionalPayments: editingPlan.additionalPayments || [],
        isActive: editingPlan.isActive
      });
    } else {
      setFormData({
        name: '',
        type: 'full',
        discountType: 'percentage',
        discountValue: 0,
        downPaymentPercent: 30,
        constructionPaymentPercent: 50,
        downPaymentPercentFixed: 30,
        installmentMonths: 12,
        additionalPayments: [],
        isActive: true
      });
    }
    setErrors({});
  }, [editingPlan, isOpen]);

  const launchPaymentPercent = 100 - formData.downPaymentPercent - formData.constructionPaymentPercent;
  const remainingPercentFixed = 100 - formData.downPaymentPercentFixed;
  const monthlyPaymentPercent = remainingPercentFixed / formData.installmentMonths;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название плана обязательно';
    }

    if (formData.type === 'construction') {
      if (formData.downPaymentPercent + formData.constructionPaymentPercent > 100) {
        newErrors.construction = 'Сумма первоначального взноса и платежей во время строительства не может превышать 100%';
      }
    }

    if (formData.type === 'fixed') {
      if (formData.downPaymentPercentFixed >= 100) {
        newErrors.fixedDown = 'Первоначальный взнос должен быть меньше 100%';
      }
      if (formData.installmentMonths <= 0) {
        newErrors.months = 'Срок рассрочки должен быть больше 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const plan: Omit<PaymentPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      type: formData.type,
      discount: {
        type: formData.discountType,
        value: formData.discountValue
      },
      additionalPayments: formData.additionalPayments,
      isActive: formData.isActive
    };

    if (formData.type === 'construction') {
      plan.downPaymentPercent = formData.downPaymentPercent;
      plan.constructionPaymentPercent = formData.constructionPaymentPercent;
      plan.launchPaymentPercent = launchPaymentPercent;
    }

    if (formData.type === 'fixed') {
      plan.downPaymentPercentFixed = formData.downPaymentPercentFixed;
      plan.installmentMonths = formData.installmentMonths;
    }

    onSubmit(plan);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? 'Редактировать план оплаты' : 'Создать план оплаты'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Название плана *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название плана"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-3">
            <Label>Тип плана *</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full">Полная оплата</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="construction" id="construction" />
                <Label htmlFor="construction">До конца стройки</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Фиксированное количество месяцев</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Скидка</Label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <ToggleGroup
                type="single"
                value={formData.discountType}
                onValueChange={(value) => value && setFormData({ ...formData, discountType: value as any })}
              >
                <ToggleGroupItem value="percentage">%</ToggleGroupItem>
                <ToggleGroupItem value="fixed">$</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {formData.type === 'full' && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Клиент оплачивает 100% стоимости юнита в момент входа в проект с учетом указанной скидки.
                </p>
              </CardContent>
            </Card>
          )}

          {formData.type === 'construction' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="downPayment">Первоначальный взнос (%)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={formData.downPaymentPercent}
                    onChange={(e) => setFormData({ ...formData, downPaymentPercent: Number(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="constructionPayment">Платежи во время строительства (%)</Label>
                  <Input
                    id="constructionPayment"
                    type="number"
                    value={formData.constructionPaymentPercent}
                    onChange={(e) => setFormData({ ...formData, constructionPaymentPercent: Number(e.target.value) })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div>
                <Label>Платеж при запуске (%)</Label>
                <Input
                  value={launchPaymentPercent}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              {errors.construction && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.construction}
                </div>
              )}

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">
                    Платежи во время строительства будут распределены равномерно по месяцам. Если до запуска остается менее месяца, вся сумма спишется при входе в проект.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {formData.type === 'fixed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="downPaymentFixed">Первоначальный взнос (%)</Label>
                  <Input
                    id="downPaymentFixed"
                    type="number"
                    value={formData.downPaymentPercentFixed}
                    onChange={(e) => setFormData({ ...formData, downPaymentPercentFixed: Number(e.target.value) })}
                    min="0"
                    max="99"
                    className={errors.fixedDown ? 'border-red-500' : ''}
                  />
                  {errors.fixedDown && <p className="text-sm text-red-500">{errors.fixedDown}</p>}
                </div>
                <div>
                  <Label htmlFor="installmentMonths">Срок рассрочки (месяцев)</Label>
                  <Input
                    id="installmentMonths"
                    type="number"
                    value={formData.installmentMonths}
                    onChange={(e) => setFormData({ ...formData, installmentMonths: Number(e.target.value) })}
                    min="1"
                    className={errors.months ? 'border-red-500' : ''}
                  />
                  {errors.months && <p className="text-sm text-red-500">{errors.months}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Сумма рассрочки (%)</Label>
                  <Input
                    value={remainingPercentFixed}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Ежемесячный платеж (%)</Label>
                  <Input
                    value={monthlyPaymentPercent.toFixed(2)}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <AdditionalPaymentsManager 
              payments={formData.additionalPayments}
              onChange={(payments) => setFormData({ ...formData, additionalPayments: payments })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingPlan ? 'Сохранить изменения' : 'Создать план'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
