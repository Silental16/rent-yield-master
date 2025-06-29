import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { PlusCircle } from 'lucide-react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { DraggableListItem } from './DraggableListItem';
import { ProjectData } from '@/pages/Index';

interface ProjectFormProps {
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}

export const ProjectForm = ({ data, onChange }: ProjectFormProps) => {
  const updateData = (updates: Partial<ProjectData>) => {
    onChange({ ...data, ...updates });
  };

  const addPricingStage = () => {
    const newStage = {
      name: `Этап ${data.pricingStages.length + 1}`,
      percentage: 100,
      date: new Date().toISOString().split('T')[0]
    };
    updateData({
      pricingStages: [...data.pricingStages, newStage]
    });
  };

  const removePricingStage = (index: number) => {
    updateData({
      pricingStages: data.pricingStages.filter((_, i) => i !== index)
    });
  };

  const updatePricingStage = (index: number, field: string, value: any) => {
    const updated = data.pricingStages.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    );
    updateData({ pricingStages: updated });
  };

  const onDragEndPricingStages = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(data.pricingStages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateData({ pricingStages: items });
  };

  const addRevenueExpense = () => {
    updateData({
      revenueExpenses: [...data.revenueExpenses, { name: 'Новый расход', percentage: 0 }]
    });
  };

  const removeRevenueExpense = (index: number) => {
    updateData({
      revenueExpenses: data.revenueExpenses.filter((_, i) => i !== index)
    });
  };

  const onDragEndRevenueExpenses = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(data.revenueExpenses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateData({ revenueExpenses: items });
  };

  const addProfitExpense = () => {
    updateData({
      profitExpenses: [...data.profitExpenses, { name: 'Новый расход', percentage: 0 }]
    });
  };

  const removeProfitExpense = (index: number) => {
    updateData({
      profitExpenses: data.profitExpenses.filter((_, i) => i !== index)
    });
  };

  const onDragEndProfitExpenses = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(data.profitExpenses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateData({ profitExpenses: items });
  };

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Основные</TabsTrigger>
        <TabsTrigger value="growth">Рост и этапы</TabsTrigger>
        <TabsTrigger value="expenses">Расходы</TabsTrigger>
        <TabsTrigger value="payment">Оплата</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Временные параметры</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry-date">Дата входа в проект</Label>
              <Input
                id="entry-date"
                type="date"
                value={data.entryDate}
                onChange={(e) => updateData({ entryDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="construction-end">Дата завершения строительства</Label>
              <Input
                id="construction-end"
                type="date"
                value={data.constructionEndDate}
                onChange={(e) => updateData({ constructionEndDate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Характеристики юнита</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Площадь (м²)</Label>
              <Input
                id="area"
                type="number"
                value={data.area}
                onChange={(e) => updateData({ area: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="cost">Стоимость ($)</Label>
              <Input
                id="cost"
                type="number"
                value={data.cost}
                onChange={(e) => updateData({ cost: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="adr">ADR ($)</Label>
              <Input
                id="adr"
                type="number"
                value={data.adr}
                onChange={(e) => updateData({ adr: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="occupancy">Заполняемость (%)</Label>
              <Input
                id="occupancy"
                type="number"
                value={data.occupancy}
                onChange={(e) => updateData({ occupancy: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Операционные расходы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="monthly-expenses">Месячные расходы ($)</Label>
                <Input
                  id="monthly-expenses"
                  type="number"
                  value={data.monthlyExpenses.value}
                  onChange={(e) => updateData({
                    monthlyExpenses: { ...data.monthlyExpenses, value: Number(e.target.value) }
                  })}
                  disabled={!data.monthlyExpenses.enabled}
                />
              </div>
              <Switch
                checked={data.monthlyExpenses.enabled}
                onCheckedChange={(checked) => updateData({
                  monthlyExpenses: { ...data.monthlyExpenses, enabled: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="annual-repair">Годовые затраты на ремонт ($)</Label>
                <Input
                  id="annual-repair"
                  type="number"
                  value={data.annualRepair.value}
                  onChange={(e) => updateData({
                    annualRepair: { ...data.annualRepair, value: Number(e.target.value) }
                  })}
                  disabled={!data.annualRepair.enabled}
                />
              </div>
              <Switch
                checked={data.annualRepair.enabled}
                onCheckedChange={(checked) => updateData({
                  annualRepair: { ...data.annualRepair, enabled: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="insurance">Страховка ($)</Label>
                <Input
                  id="insurance"
                  type="number"
                  value={data.insurance.value}
                  onChange={(e) => updateData({
                    insurance: { ...data.insurance, value: Number(e.target.value) }
                  })}
                  disabled={!data.insurance.enabled}
                />
              </div>
              <Switch
                checked={data.insurance.enabled}
                onCheckedChange={(checked) => updateData({
                  insurance: { ...data.insurance, enabled: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Каналы продаж</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Распределение источников выручки</Label>
              <div className="mt-4 space-y-4">
                <Slider
                  value={[data.directBookings]}
                  onValueChange={(value) => updateData({ 
                    directBookings: value[0],
                    otaBookings: 100 - value[0]
                  })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Прямые брони: {data.directBookings}%</span>
                  <span>AirBnB/Booking: {data.otaBookings}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="growth" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Параметры роста</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="agr">AGR (%)</Label>
              <Input
                id="agr"
                type="number"
                value={data.agr}
                onChange={(e) => updateData({ agr: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="property-growth">Рост стоимости объекта (%)</Label>
              <Input
                id="property-growth"
                type="number"
                value={data.propertyGrowth}
                onChange={(e) => updateData({ propertyGrowth: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="leasehold">Срок лизхолда (лет)</Label>
              <Input
                id="leasehold"
                type="number"
                value={data.leaseholdTerm}
                onChange={(e) => updateData({ leaseholdTerm: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Этапы ценообразования
              <Button onClick={addPricingStage} size="sm" variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                Добавить этап
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DragDropContext onDragEnd={onDragEndPricingStages}>
              <Droppable droppableId="pricing-stages">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {data.pricingStages.map((stage, index) => (
                      <DraggableListItem
                        key={`stage-${index}`}
                        id={`stage-${index}`}
                        index={index}
                        name={stage.name}
                        percentage={stage.percentage}
                        onNameChange={(value) => updatePricingStage(index, 'name', value)}
                        onPercentageChange={(value) => updatePricingStage(index, 'percentage', value)}
                        onDelete={() => removePricingStage(index)}
                        showDate={true}
                        date={stage.date}
                        onDateChange={(value) => updatePricingStage(index, 'date', value)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сезонность спроса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Учитывать сезонность</Label>
              <Switch
                checked={data.seasonality.enabled}
                onCheckedChange={(checked) => updateData({
                  seasonality: { ...data.seasonality, enabled: checked }
                })}
              />
            </div>
            {data.seasonality.enabled && (
              <div className="grid grid-cols-4 gap-4">
                {data.seasonality.coefficients.map((coef, index) => (
                  <div key={index}>
                    <Label>{['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][index]}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="2.0"
                      value={coef}
                      onChange={(e) => {
                        const updated = [...data.seasonality.coefficients];
                        updated[index] = Number(e.target.value);
                        updateData({
                          seasonality: { ...data.seasonality, coefficients: updated }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Финансовые метрики</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Расчет NPV</Label>
              <Switch
                checked={data.npvEnabled}
                onCheckedChange={(enabled) => updateData({ npvEnabled: enabled })}
              />
            </div>
            {data.npvEnabled && (
              <div>
                <Label htmlFor="discount-rate">Ставка дисконтирования (%)</Label>
                <Input
                  id="discount-rate"
                  type="number"
                  value={data.discountRate}
                  onChange={(e) => updateData({ discountRate: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Расчет IRR</Label>
              <Switch
                checked={data.irrEnabled}
                onCheckedChange={(enabled) => updateData({ irrEnabled: enabled })}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="expenses" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Расходы из валовой выручки
              <Button onClick={addRevenueExpense} size="sm" variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DragDropContext onDragEnd={onDragEndRevenueExpenses}>
              <Droppable droppableId="revenue-expenses">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {data.revenueExpenses.map((expense, index) => (
                      <DraggableListItem
                        key={`revenue-${index}`}
                        id={`revenue-${index}`}
                        index={index}
                        name={expense.name}
                        percentage={expense.percentage}
                        onNameChange={(value) => {
                          const updated = [...data.revenueExpenses];
                          updated[index].name = value;
                          updateData({ revenueExpenses: updated });
                        }}
                        onPercentageChange={(value) => {
                          const updated = [...data.revenueExpenses];
                          updated[index].percentage = value;
                          updateData({ revenueExpenses: updated });
                        }}
                        onDelete={() => removeRevenueExpense(index)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Расходы из операционной прибыли
              <Button onClick={addProfitExpense} size="sm" variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DragDropContext onDragEnd={onDragEndProfitExpenses}>
              <Droppable droppableId="profit-expenses">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {data.profitExpenses.map((expense, index) => (
                      <DraggableListItem
                        key={`profit-${index}`}
                        id={`profit-${index}`}
                        index={index}
                        name={expense.name}
                        percentage={expense.percentage}
                        onNameChange={(value) => {
                          const updated = [...data.profitExpenses];
                          updated[index].name = value;
                          updateData({ profitExpenses: updated });
                        }}
                        onPercentageChange={(value) => {
                          const updated = [...data.profitExpenses];
                          updated[index].percentage = value;
                          updateData({ profitExpenses: updated });
                        }}
                        onDelete={() => removeProfitExpense(index)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сценарии выхода</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variable-costs">Переменные расходы (%)</Label>
              <Input
                id="variable-costs"
                type="number"
                value={data.variableCosts}
                onChange={(e) => updateData({ variableCosts: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="agent-commission">Комиссия агенту (%)</Label>
              <Input
                id="agent-commission"
                type="number"
                value={data.agentCommission}
                onChange={(e) => updateData({ agentCommission: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>План оплаты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тип скидки</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={data.paymentPlan.discountType === 'percentage' ? 'default' : 'outline'}
                    onClick={() => updateData({
                      paymentPlan: { ...data.paymentPlan, discountType: 'percentage' }
                    })}
                  >
                    Процент
                  </Button>
                  <Button
                    variant={data.paymentPlan.discountType === 'fixed' ? 'default' : 'outline'}
                    onClick={() => updateData({
                      paymentPlan: { ...data.paymentPlan, discountType: 'fixed' }
                    })}
                  >
                    Сумма
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="discount-value">
                  Скидка ({data.paymentPlan.discountType === 'percentage' ? '%' : '$'})
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  value={data.paymentPlan.discountValue}
                  onChange={(e) => updateData({
                    paymentPlan: { ...data.paymentPlan, discountValue: Number(e.target.value) }
                  })}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Рассрочка</Label>
              <Switch
                checked={data.paymentPlan.isInstallment}
                onCheckedChange={(checked) => updateData({
                  paymentPlan: { ...data.paymentPlan, isInstallment: checked }
                })}
              />
            </div>

            {data.paymentPlan.isInstallment && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Тип первоначального взноса</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={data.paymentPlan.downPayment.type === 'percentage' ? 'default' : 'outline'}
                        onClick={() => updateData({
                          paymentPlan: {
                            ...data.paymentPlan,
                            downPayment: { ...data.paymentPlan.downPayment, type: 'percentage' }
                          }
                        })}
                      >
                        %
                      </Button>
                      <Button
                        size="sm"
                        variant={data.paymentPlan.downPayment.type === 'fixed' ? 'default' : 'outline'}
                        onClick={() => updateData({
                          paymentPlan: {
                            ...data.paymentPlan,
                            downPayment: { ...data.paymentPlan.downPayment, type: 'fixed' }
                          }
                        })}
                      >
                        $
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="down-payment">
                      Первоначальный взнос ({data.paymentPlan.downPayment.type === 'percentage' ? '%' : '$'})
                    </Label>
                    <Input
                      id="down-payment"
                      type="number"
                      value={data.paymentPlan.downPayment.value}
                      onChange={(e) => updateData({
                        paymentPlan: {
                          ...data.paymentPlan,
                          downPayment: { ...data.paymentPlan.downPayment, value: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="construction-percentage">Платежи во время строительства (%)</Label>
                    <Input
                      id="construction-percentage"
                      type="number"
                      value={data.paymentPlan.constructionPayments.percentage}
                      onChange={(e) => updateData({
                        paymentPlan: {
                          ...data.paymentPlan,
                          constructionPayments: {
                            ...data.paymentPlan.constructionPayments,
                            percentage: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Режим оплаты</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={data.paymentPlan.constructionPayments.mode === 'monthly' ? 'default' : 'outline'}
                        onClick={() => updateData({
                          paymentPlan: {
                            ...data.paymentPlan,
                            constructionPayments: {
                              ...data.paymentPlan.constructionPayments,
                              mode: 'monthly'
                            }
                          }
                        })}
                      >
                        Помесячно
                      </Button>
                      <Button
                        size="sm"
                        variant={data.paymentPlan.constructionPayments.mode === 'fixed' ? 'default' : 'outline'}
                        onClick={() => updateData({
                          paymentPlan: {
                            ...data.paymentPlan,
                            constructionPayments: {
                              ...data.paymentPlan.constructionPayments,
                              mode: 'fixed'
                            }
                          }
                        })}
                      >
                        Фиксированное
                      </Button>
                    </div>
                  </div>
                </div>

                {data.paymentPlan.constructionPayments.mode === 'fixed' && (
                  <div>
                    <Label htmlFor="payment-count">Количество платежей</Label>
                    <Input
                      id="payment-count"
                      type="number"
                      value={data.paymentPlan.constructionPayments.count || 12}
                      onChange={(e) => updateData({
                        paymentPlan: {
                          ...data.paymentPlan,
                          constructionPayments: {
                            ...data.paymentPlan.constructionPayments,
                            count: Number(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-700">
                    Платежи после окончания строительства
                  </Label>
                  <p className="text-sm text-blue-600 mt-1">
                    {100 - data.paymentPlan.downPayment.value - data.paymentPlan.constructionPayments.percentage}% 
                    будет списано в день запуска проекта
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
