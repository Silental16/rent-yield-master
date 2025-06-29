import { useState, useEffect } from 'react';
import { ProjectForm } from '@/components/ProjectForm';
import { Dashboard } from '@/components/Dashboard';
import { ScenarioAnalysis } from '@/components/ScenarioAnalysis';
import { PaymentPlansManager } from '@/components/PaymentPlansManager';
import { ProjectManager } from '@/components/ProjectManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectStorage } from '@/hooks/useProjectStorage';
import { PaymentPlan } from '@/types/paymentPlan';

export interface ProjectData {
  name: string;
  area: number;
  cost: number;
  adr: number;
  occupancy: number;
  agr: number;
  propertyGrowth: number;
  leaseholdTerm: number;
  variableCosts: number;
  agentCommission: number;
  entryDate: string;
  constructionEndDate: string;
  directBookings: number;
  otaBookings: number;
  pricingStages: Array<{
    name: string;
    price: number;
    percentage: number;
    date: string;
  }>;
  revenueExpenses: Array<{
    name: string;
    percentage: number;
  }>;
  profitExpenses: Array<{
    name: string;
    percentage: number;
  }>;
  monthlyExpenses: {
    enabled: boolean;
    value: number;
  };
  annualRepair: {
    enabled: boolean;
    value: number;
  };
  insurance: {
    enabled: boolean;
    value: number;
  };
  seasonality: {
    enabled: boolean;
    coefficients: number[];
  };
  npvEnabled: boolean;
  discountRate: number;
  irrEnabled: boolean;
}

const Index = () => {
  const { projects, currentProject, setCurrentProject, saveProject, deleteProject } = useProjectStorage();
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | undefined>();

  const defaultProjectData: ProjectData = {
    name: 'Новый проект',
    area: 25,
    cost: 100000,
    adr: 150,
    occupancy: 70,
    agr: 5,
    propertyGrowth: 8,
    leaseholdTerm: 30,
    variableCosts: 5,
    agentCommission: 3,
    entryDate: new Date().toISOString().split('T')[0],
    constructionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    directBookings: 30,
    otaBookings: 70,
    pricingStages: [
      {
        name: 'Базовая цена',
        price: 100000,
        percentage: 100000,
        date: new Date().toISOString().split('T')[0]
      }
    ],
    revenueExpenses: [
      { name: 'Комиссия УК с выручки', percentage: 12 },
      { name: 'Комиссия OTA', percentage: 15 },
      { name: 'Уборка', percentage: 8 },
      { name: 'Белье', percentage: 3 }
    ],
    profitExpenses: [
      { name: 'Налог с прибыли', percentage: 20 },
      { name: 'Комиссия УК с прибыли', percentage: 10 }
    ],
    monthlyExpenses: {
      enabled: true,
      value: 200
    },
    annualRepair: {
      enabled: true,
      value: 2000
    },
    insurance: {
      enabled: true,
      value: 1500
    },
    seasonality: {
      enabled: false,
      coefficients: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    npvEnabled: false,
    discountRate: 10,
    irrEnabled: false
  };

  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);

  useEffect(() => {
    if (currentProject) {
      setProjectData(currentProject.data);
    } else {
      setProjectData(defaultProjectData);
    }
  }, [currentProject]);

  const handleDataChange = (newData: ProjectData) => {
    setProjectData(newData);
    if (currentProject) {
      saveProject({ ...currentProject, data: newData });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <ProjectManager 
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={setCurrentProject}
          onProjectSave={saveProject}
          onProjectDelete={deleteProject}
          projectData={projectData}
          onProjectDataChange={handleDataChange}
        />
        
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parameters">Параметры</TabsTrigger>
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="scenarios">Сценарии</TabsTrigger>
            <TabsTrigger value="payment-plans">Планы платежей</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters">
            <ProjectForm data={projectData} onChange={handleDataChange} />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Dashboard data={projectData} paymentPlan={selectedPaymentPlan} />
          </TabsContent>
          
          <TabsContent value="scenarios">
            <ScenarioAnalysis data={projectData} paymentPlan={selectedPaymentPlan} />
          </TabsContent>
          
          <TabsContent value="payment-plans">
            <PaymentPlansManager onPaymentPlanSelect={setSelectedPaymentPlan} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
