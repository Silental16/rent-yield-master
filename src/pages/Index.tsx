import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectForm } from '@/components/ProjectForm';
import { Dashboard } from '@/components/Dashboard';
import { CashFlowTable } from '@/components/CashFlowTable';
import { ScenarioAnalysis } from '@/components/ScenarioAnalysis';
import { ProjectManager } from '@/components/ProjectManager';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { Calculator, TrendingUp, BarChart3, PieChart, CreditCard } from 'lucide-react';
import { PaymentPlansManager } from '@/components/PaymentPlansManager';

export interface ProjectData {
  // Time parameters
  entryDate: string;
  constructionEndDate: string;
  
  // Unit characteristics
  area: number;
  cost: number;
  adr: number;
  occupancy: number;
  
  // Operating expenses
  monthlyExpenses: { enabled: boolean; value: number };
  annualRepair: { enabled: boolean; value: number };
  insurance: { enabled: boolean; value: number };
  
  // Sales channels
  directBookings: number;
  otaBookings: number;
  
  // Growth parameters
  agr: number;
  propertyGrowth: number;
  
  // Leasehold
  leaseholdTerm: number;
  
  // Pricing stages
  pricingStages: Array<{
    name: string;
    price: number;
    date: string;
  }>;
  
  // Exit scenarios
  variableCosts: number;
  agentCommission: number;
  
  // Seasonality
  seasonality: {
    enabled: boolean;
    coefficients: number[];
  };
  
  // Financial metrics
  npvEnabled: boolean;
  discountRate: number;
  irrEnabled: boolean;
  
  // Expenses
  revenueExpenses: Array<{ name: string; percentage: number }>;
  profitExpenses: Array<{ name: string; percentage: number }>;
  
  // Payment plan
  paymentPlan: {
    type: 'full' | 'prelaunch' | 'monthly';
    months?: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isInstallment: boolean;
    downPayment: { type: 'percentage' | 'fixed'; value: number };
    constructionPayments: {
      percentage: number;
    };
  };
}

const Index = () => {
  const initialProjectData: ProjectData = {
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
      { name: 'Pre-sale', price: 100000, date: '2024-01-01' },
      { name: 'Sale', price: 120000, date: '2024-06-01' },
      { name: 'Release', price: 150000, date: '2024-09-01' }
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
      { name: 'OTA Commission', percentage: 12 },
      { name: 'Management Fee (Revenue)', percentage: 8 },
      { name: 'Maintenance Costs', percentage: 5 },
      { name: 'Rental Tax', percentage: 10 }
    ],
    profitExpenses: [
      { name: 'Marketing', percentage: 3 },
      { name: 'Management Fee (Profit)', percentage: 15 },
      { name: 'Income Tax', percentage: 13 }
    ],
    paymentPlan: {
      type: 'prelaunch',
      months: 12,
      discountType: 'percentage',
      discountValue: 5,
      isInstallment: true,
      downPayment: { type: 'percentage', value: 30 },
      constructionPayments: {
        percentage: 50
      }
    }
  };

  const {
    currentProject,
    savedProjects,
    activeProjectId,
    saveCurrentProject,
    loadProject,
    deleteProject,
    updateCurrentProject
  } = useProjectStorage(initialProjectData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Financial Models v2
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real estate investment modeling and analysis system with rental income
          </p>
        </div>

        <ProjectManager
          savedProjects={savedProjects}
          activeProjectId={activeProjectId}
          onSaveProject={saveCurrentProject}
          onLoadProject={loadProject}
          onDeleteProject={deleteProject}
        />

        <Tabs defaultValue="parameters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="payment-plans" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Plans
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Scenarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Project Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectForm data={currentProject} onChange={updateCurrentProject} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-plans">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Payment Plans Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentPlansManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard data={currentProject} />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowTable data={currentProject} />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioAnalysis data={currentProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
