
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
  const { projects, currentProject, setCurrentProject, saveProject, deleteProject, defaultProjectData } = useProjectStorage();
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | undefined>();

  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);

  useEffect(() => {
    if (currentProject) {
      setProjectData(currentProject.data);
    } else {
      setProjectData(defaultProjectData);
    }
  }, [currentProject, defaultProjectData]);

  const handleDataChange = (newData: ProjectData) => {
    setProjectData(newData);
    if (currentProject) {
      const updatedProject = { ...currentProject, data: newData };
      saveProject(updatedProject);
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
            <Dashboard data={projectData} />
          </TabsContent>
          
          <TabsContent value="scenarios">
            <ScenarioAnalysis data={projectData} />
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
