
import { useState, useEffect } from 'react';
import { ProjectData } from '@/pages/Index';

interface StoredProject {
  id: string;
  name: string;
  data: ProjectData;
  createdAt: string;
  updatedAt: string;
}

export const useProjectStorage = (initialData: ProjectData) => {
  const [currentProject, setCurrentProject] = useState<ProjectData>(initialData);
  const [savedProjects, setSavedProjects] = useState<StoredProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Загрузка сохраненных проектов при инициализации
  useEffect(() => {
    const stored = localStorage.getItem('financial-projects');
    if (stored) {
      try {
        const projects = JSON.parse(stored);
        setSavedProjects(projects);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      }
    }

    // Загрузка текущих данных
    const currentData = localStorage.getItem('financial-current-data');
    if (currentData) {
      try {
        const data = JSON.parse(currentData);
        setCurrentProject(data);
      } catch (error) {
        console.error('Ошибка загрузки текущих данных:', error);
      }
    }
  }, []);

  // Сохранение текущих данных при изменении
  useEffect(() => {
    localStorage.setItem('financial-current-data', JSON.stringify(currentProject));
  }, [currentProject]);

  // Сохранение списка проектов при изменении
  useEffect(() => {
    localStorage.setItem('financial-projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const saveCurrentProject = (name: string) => {
    const newProject: StoredProject = {
      id: Date.now().toString(),
      name,
      data: { ...currentProject },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    return newProject.id;
  };

  const loadProject = (projectId: string) => {
    const project = savedProjects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project.data);
      setActiveProjectId(projectId);
    }
  };

  const deleteProject = (projectId: string) => {
    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const updateCurrentProject = (data: ProjectData) => {
    setCurrentProject(data);
    
    // Если есть активный проект, обновляем его
    if (activeProjectId) {
      setSavedProjects(prev => prev.map(p => 
        p.id === activeProjectId 
          ? { ...p, data: { ...data }, updatedAt: new Date().toISOString() }
          : p
      ));
    }
  };

  return {
    currentProject,
    savedProjects,
    activeProjectId,
    saveCurrentProject,
    loadProject,
    deleteProject,
    updateCurrentProject
  };
};
