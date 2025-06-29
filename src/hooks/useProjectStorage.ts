
import { useState, useEffect } from 'react';
import { ProjectData } from '@/pages/Index';

interface StoredProject {
  id: string;
  name: string;
  data: ProjectData;
  createdAt: string;
  updatedAt: string;
}

export const useProjectStorage = () => {
  const [currentProject, setCurrentProject] = useState<StoredProject | null>(null);
  const [projects, setProjects] = useState<StoredProject[]>([]);

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
        percentage: 100,
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

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('financial-projects');
    if (stored) {
      try {
        const parsedProjects = JSON.parse(stored);
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem('financial-projects', JSON.stringify(projects));
  }, [projects]);

  const saveProject = (project: StoredProject) => {
    setProjects(prev => {
      const existingIndex = prev.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...project, updatedAt: new Date().toISOString() };
        return updated;
      } else {
        return [...prev, project];
      }
    });
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  return {
    projects,
    currentProject,
    setCurrentProject,
    saveProject,
    deleteProject,
    defaultProjectData
  };
};
