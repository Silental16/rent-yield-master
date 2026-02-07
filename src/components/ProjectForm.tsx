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
          <CardTitle>Time Parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryDate">Entry Date</Label>
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
                    {entryDate ? format(entryDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={handleEntryDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="constructionEndDate">Construction End Date</Label>
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
                    {constructionEndDate ? format(constructionEndDate, "PPP") : <span>Select date</span>}
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
          <CardTitle>Unit Characteristics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Area (m²)</Label>
              <Input
                type="number"
                id="area"
                value={data.area}
                onChange={(e) => onChange({ ...data, area: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adr">Average Daily Rate (ADR, $)</Label>
              <Input
                type="number"
                id="adr"
                value={data.adr}
                onChange={(e) => onChange({ ...data, adr: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="occupancy">Occupancy (%)</Label>
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
          <CardTitle>Operating Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
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
                {data.monthlyExpenses.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="annualRepair">Annual Repair ($)</Label>
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
                {data.annualRepair.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="insurance">Insurance ($)</Label>
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
                {data.insurance.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Channels</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label>Revenue Distribution by Channel</Label>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Direct Bookings</span>
                <span className="text-sm font-medium">{data.directBookings}%</span>
              </div>
              <Slider
                value={[data.directBookings]}
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    directBookings: value[0],
                    otaBookings: 100 - value[0],
                  });
                }}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AirBnB/Booking</span>
                <span className="text-sm font-medium">{data.otaBookings}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="agr">ADR Growth (AGR, %)</Label>
            <Input
              type="number"
              id="agr"
              value={data.agr}
              onChange={(e) => onChange({ ...data, agr: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="propertyGrowth">Property Value Growth (%)</Label>
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
          <CardTitle>Leasehold</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="leaseholdTerm">Leasehold Term (years)</Label>
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
          <CardTitle>Pricing Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropListEditor
            items={data.pricingStages.map(stage => ({
              id: `${stage.name}-${stage.date}`,
              name: stage.name,
              percentage: stage.price,
              date: stage.date
            }))}
            onItemsChange={(items) => {
              const newStages = items.map(item => ({
                name: item.name,
                price: item.percentage,
                date: item.date || new Date().toISOString().split('T')[0]
              }));
              onChange({ ...data, pricingStages: newStages });
            }}
            title="Pricing Stages"
            showDate={true}
            itemNamePlaceholder="Stage name (e.g. Base Price)"
            addButtonText="Add Stage"
            percentageLabel="Price ($)"
          />
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              The first stage should be "Base Price" with the initial unit cost.
              Subsequent stages represent price increases with the new price and effective date.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exit Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label htmlFor="variableCosts">Variable Costs (%)</Label>
            <Input
              type="number"
              id="variableCosts"
              value={data.variableCosts}
              onChange={(e) => onChange({ ...data, variableCosts: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="agentCommission">Agent Commission (%)</Label>
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
          <CardTitle>Seasonality</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label>Enable Seasonality</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  seasonality: { ...data.seasonality, enabled: !data.seasonality.enabled },
                })
              }
            >
              {data.seasonality.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          {data.seasonality.enabled && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {data.seasonality.coefficients.map((coefficient, index) => (
                <div key={index}>
                  <Label htmlFor={`coefficient-${index}`}>Month {index + 1}</Label>
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
          <CardTitle>Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <Label>Enable NPV</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  npvEnabled: !data.npvEnabled,
                })
              }
            >
              {data.npvEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          {data.npvEnabled && (
            <div>
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <Input
                type="number"
                id="discountRate"
                value={data.discountRate}
                onChange={(e) => onChange({ ...data, discountRate: parseFloat(e.target.value) })}
              />
            </div>
          )}
          <div>
            <Label>Enable IRR</Label>
            <Button
              variant="outline"
              onClick={() =>
                onChange({
                  ...data,
                  irrEnabled: !data.irrEnabled,
                })
              }
            >
              {data.irrEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Expenses</CardTitle>
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
            title="Revenue Expenses"
            itemNamePlaceholder="Expense name"
            addButtonText="Add Expense"
            protectedItems={['Management Fee (Revenue)', 'OTA Commission']}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Expenses</CardTitle>
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
            title="Profit Expenses"
            itemNamePlaceholder="Expense name"
            addButtonText="Add Expense"
          />
        </CardContent>
      </Card>
    </div>
  );
};
