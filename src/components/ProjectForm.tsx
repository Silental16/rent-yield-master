import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DragDropListEditor } from './DragDropListEditor';
import { ProjectData } from '@/pages/Index';

interface ProjectFormProps {
  data: ProjectData;
  onChange: (data: ProjectData) => void;
}

export const ProjectForm = ({ data, onChange }: ProjectFormProps) => {
  const [entryDate, setEntryDate] = useState<Date | undefined>(data.entryDate ? new Date(data.entryDate) : undefined);
  const [constructionEndDate, setConstructionEndDate] = useState<Date | undefined>(data.constructionEndDate ? new Date(data.constructionEndDate) : undefined);

  const handleEntryDateChange = (date: Date | undefined) => {
    setEntryDate(date);
    if (date) {
      onChange({ ...data, entryDate: date.toISOString().split('T')[0] });
    }
  };

  const handleConstructionEndDateChange = (date: Date | undefined) => {
    setConstructionEndDate(date);
    if (date) {
      onChange({ ...data, constructionEndDate: date.toISOString().split('T')[0] });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Временные параметры</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryDate">Дата входа в проект</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !entryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={handleEntryDateChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="constructionEndDate">Дата завершения строительства</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !constructionEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {constructionEndDate ? format(constructionEndDate, "PPP") : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={constructionEndDate}
                    onSelect={handleConstructionEndDateChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Характеристики юнита</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Площадь (м2)</Label>
              <Input
                type="number"
                id="area"
                value={data.area}
                onChange={(e) => onChange({ ...data, area: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="cost">Стоимость ($)</Label>
              <Input
                type="number"
                id="cost"
                value={data.cost}
                onChange={(e) => onChange({ ...data, cost: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adr">Средний дневной доход (ADR, $)</Label>
              <Input
                type="number"
                id="adr"
                value={data.adr}
                onChange={(e) => onChange({ ...data, adr: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="occupancy">Заполняемость (%)</Label>
              <Input
                type="number"
                id="occupancy"
                value={data.occupancy}
                onChange={(e) => onChange({ ...data, occupancy: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Операционные расходы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monthlyExpenses">Ежемесячные расходы ($)</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                id="monthlyExpenses"
                value={data.monthlyExpenses.value}
                onChange={(e) =>
                  onChange({
                    ...data,
                    monthlyExpenses: { ...data.monthlyExpenses, value: parseFloat(e.target.value) },
                  })
                }
                disabled={!data.monthlyExpenses.enabled}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() =>
                  onChange({
                    ...data,
                    monthlyExpenses: { ...data.monthlyExpenses, enabled: !data.monthlyExpenses.enabled },
                  })
                }
              >
                {data.monthlyExpenses.enabled ? 'Выключить' : 'Включить'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="annualRepair">Ежегодный ремонт ($)</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                id="annualRepair"
                value={data.annualRepair.value}
                onChange={(e) =>
                  onChange({
                    ...data,
                    annualRepair: { ...data.annualRepair, value: parseFloat(e.target.value) },
                  })
                }
                disabled={!data.annualRepair.enabled}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() =>
                  onChange({
                    ...data,
                    annualRepair: { ...data.annualRepair, enabled: !data.annualRepair.enabled },
                  })
                }
              >
                {data.annualRepair.enabled ? 'Выключить' : 'Включить'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="insurance">Страховка ($)</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                id="insurance"
                value={data.insurance.value}
                onChange={(e) =>
                  onChange({
                    ...data,
                    insurance: { ...data.insurance, value: parseFloat(e.target.value) },
                  })
                }
                disabled={!data.insurance.enabled}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() =>
                  onChange({
                    ...data,
                    insurance: { ...data.insurance, enabled: !data.insurance.enabled },
                  })
                }
              >
                {data.insurance.enabled ? 'Выключить' : 'Включить'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Каналы продаж</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="directBookings">Прямые бронирования (%)</Label>
            <Input
              type="number"
              id="directBookings"
              value={data.directBookings}
              onChange={(e) => onChange({ ...data, directBookings: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="otaBookings">OTA бронирования (%)</Label>
            <Input
              type="number"
              id="otaBookings"
              value={data.otaBookings}
              onChange={(e) => onChange({ ...data, otaBookings: parseFloat(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Параметры роста</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="agr">Рост ADR (AGR, %)</Label>
            <Input
              type="number"
              id="agr"
              value={data.agr}
              onChange={(e) => onChange({ ...data, agr: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="propertyGrowth">Рост стоимости объекта (%)</Label>
            <Input
              type="number"
              id="propertyGrowth"
              value={data.propertyGrowth}
              onChange={(e) => onChange({ ...data, propertyGrowth: parseFloat(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Лизхолд</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="leaseholdTerm">Срок лизхолда (лет)</Label>
            <Input
              type="number"
              id="leaseholdTerm"
              value={data.leaseholdTerm}
              onChange={(e) => onChange({ ...data, leaseholdTerm: parseFloat(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Этапы ценообразования</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropListEditor
            items={data.pricingStages.map(stage => ({
              id: `${stage.name}-${stage.date}`,
              name: stage.name,
              percentage: stage.percentage,
              date: stage.date
            }))}
            onItemsChange={(items) => {
              const newStages = items.map(item => ({
                name: item.name,
                percentage: item.percentage,
                date: item.date || new Date().toISOString().split('T')[0]
              }));
              onChange({ ...data, pricingStages: newStages });
            }}
            title="Этапы ценообразования"
            showDate={true}
            itemNamePlaceholder="Название этапа"
            addButtonText="Добавить этап"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сценарии выхода</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="variableCosts">Переменные расходы (%)</Label>
            <Input
              type="number"
              id="variableCosts"
              value={data.variableCosts}
              onChange={(e) => onChange({ ...data, variableCosts: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="agentCommission">Комиссия агента (%)</Label>
            <Input
              type="number"
              id="agentCommission"
              value={data.agentCommission}
              onChange={(e) => onChange({ ...data, agentCommission: parseFloat(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сезонность</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label>Включить сезонность</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  seasonality: { ...data.seasonality, enabled: !data.seasonality.enabled },
                })
              }
            >
              {data.seasonality.enabled ? 'Выключить' : 'Включить'}
            </Button>
          </div>
          {data.seasonality.enabled && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {data.seasonality.coefficients.map((coefficient, index) => (
                <div key={index}>
                  <Label htmlFor={`coefficient-${index}`}>Месяц {index + 1}</Label>
                  <Input
                    type="number"
                    id={`coefficient-${index}`}
                    value={coefficient}
                    onChange={(e) => {
                      const newCoefficients = [...data.seasonality.coefficients];
                      newCoefficients[index] = parseFloat(e.target.value);
                      onChange({
                        ...data,
                        seasonality: { ...data.seasonality, coefficients: newCoefficients },
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
        <CardContent className="grid gap-6">
          <div>
            <Label>Включить NPV</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  npvEnabled: !data.npvEnabled,
                })
              }
            >
              {data.npvEnabled ? 'Выключить' : 'Включить'}
            </Button>
          </div>
          {data.npvEnabled && (
            <div>
              <Label htmlFor="discountRate">Ставка дисконтирования (%)</Label>
              <Input
                type="number"
                id="discountRate"
                value={data.discountRate}
                onChange={(e) => onChange({ ...data, discountRate: parseFloat(e.target.value) })}
              />
            </div>
          )}
          <div>
            <Label>Включить IRR</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  irrEnabled: !data.irrEnabled,
                })
              }
            >
              {data.irrEnabled ? 'Выключить' : 'Включить'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Расходы из выручки</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropListEditor
            items={data.revenueExpenses.map((expense, index) => ({
              id: `revenue-${index}`,
              name: expense.name,
              percentage: expense.percentage
            }))}
            onItemsChange={(items) => {
              const newExpenses = items.map(item => ({
                name: item.name,
                percentage: item.percentage
              }));
              onChange({ ...data, revenueExpenses: newExpenses });
            }}
            title="Расходы из выручки"
            itemNamePlaceholder="Название расхода"
            addButtonText="Добавить расход"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Расходы из прибыли</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropListEditor
            items={data.profitExpenses.map((expense, index) => ({
              id: `profit-${index}`,
              name: expense.name,
              percentage: expense.percentage
            }))}
            onItemsChange={(items) => {
              const newExpenses = items.map(item => ({
                name: item.name,
                percentage: item.percentage
              }));
              onChange({ ...data, profitExpenses: newExpenses });
            }}
            title="Расходы из прибыли"
            itemNamePlaceholder="Название расхода"
            addButtonText="Добавить расход"
          />
        </CardContent>
      </Card>
    </div>
  );
};
