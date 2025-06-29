
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectForm } from '@/components/ProjectForm';
import { Dashboard } from '@/components/Dashboard';
import { CashFlowTable } from '@/components/CashFlowTable';
import { ScenarioAnalysis } from '@/components/ScenarioAnalysis';
import { Calculator, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export interface ProjectData {
  // Временные параметры
  entryDate: string;
  constructionEndDate: string;
  
  // Характеристики юнита
  area: number;
  cost: number;
  adr: number;
  occupancy: number;
  
  // Операционные расходы
  monthlyExpenses: { enabled: boolean; value: number };
  annualRepair: { enabled: boolean; value: number };
  insurance: { enabled: boolean; value: number };
  
  // Каналы продаж
  directBookings: number;
  otaBookings: number;
  
  // Параметры роста
  agr: number;
  propertyGrowth: number;
  
  // Лизхолд
  leaseholdTerm: number;
  
  // Этапы ценообразования
  pricingStages: Array<{
    name: string;
    percentage: number;
    date: string;
  }>;
  
  // Сценарии выхода
  variableCosts: number;
  agentCommission: number;
  
  // Сезонность
  seasonality: {
    enabled: boolean;
    coefficients: number[];
  };
  
  // Финансовые метрики
  npvEnabled: boolean;
  discountRate: number;
  irrEnabled: boolean;
  
  // Расходы
  revenueExpenses: Array<{ name: string; percentage: number }>;
  profitExpenses: Array<{ name: string; percentage: number }>;
  
  // План оплаты
  paymentPlan: {
    type: 'construction' | 'monthly';
    months?: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isInstallment: boolean;
    downPayment: { type: 'percentage' | 'fixed'; value: number };
    constructionPayments: {
      percentage: number;
      mode: 'monthly' | 'fixed';
      count?: number;
    };
  };
}

const Index = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    entryDate: new Date().toISOString().split('T')[0],
    constructionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    area: 50,
    cost: 100000,
    adr: 200,
    occupancy: 70,
    monthlyExpenses: { enabled: true, value: 500 },
    annualRepair: { enabled: true, value: 2000 },
    insurance: { enabled: true, value: 1200 },
    directBookings: 30,
    otaBookings: 70,
    agr: 5,
    propertyGrowth: 6,
    leaseholdTerm: 25,
    pricingStages: [
      { name: 'Pre-sale', percentage: 100, date: '2024-01-01' },
      { name: 'Sale', percentage: 120, date: '2024-06-01' },
      { name: 'Release', percentage: 150, date: '2024-09-01' }
    ],
    variableCosts: 3,
    agentCommission: 5,
    seasonality: {
      enabled: false,
      coefficients: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    npvEnabled: true,
    discountRate: 8,
    irrEnabled: true,
    revenueExpenses: [
      { name: 'Комиссия OTA', percentage: 12 },
      { name: 'Комиссия УК с выручки', percentage: 8 },
      { name: 'Расходы на содержание', percentage: 5 },
      { name: 'Налог на аренду', percentage: 10 }
    ],
    profitExpenses: [
      { name: 'Маркетинг', percentage: 3 },
      { name: 'Комиссия УК с прибыли', percentage: 15 },
      { name: 'Налог на прибыль', percentage: 13 }
    ],
    paymentPlan: {
      type: 'construction',
      months: 12,
      discountType: 'percentage',
      discountValue: 5,
      isInstallment: true,
      downPayment: { type: 'percentage', value: 30 },
      constructionPayments: {
        percentage: 50,
        mode: 'monthly'
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Финансовые модели v2
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Система моделирования и анализа инвестиций в недвижимость с арендным доходом
          </p>
        </div>

        <Tabs defaultValue="parameters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Параметры
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Сценарии
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Параметры проекта
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectForm data={projectData} onChange={setProjectData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard data={projectData} />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowTable data={projectData} />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioAnalysis data={projectData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
