
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save, FolderOpen } from 'lucide-react';

interface ProjectManagerProps {
  savedProjects: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
  activeProjectId: string | null;
  onSaveProject: (name: string) => void;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectManager = ({
  savedProjects,
  activeProjectId,
  onSaveProject,
  onLoadProject,
  onDeleteProject
}: ProjectManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleSaveProject = () => {
    if (projectName.trim()) {
      onSaveProject(projectName.trim());
      setProjectName('');
      setIsDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Сохранить расчет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Сохранить текущий расчет</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Название расчета"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveProject()}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveProject} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedProjects.length > 0 && (
        <div className="flex gap-2 items-center">
          <FolderOpen className="w-4 h-4 text-gray-500" />
          <Select value={activeProjectId || ''} onValueChange={onLoadProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Выберите расчет" />
            </SelectTrigger>
            <SelectContent>
              {savedProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{project.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {savedProjects.length > 0 && (
        <Card className="w-full sm:w-auto">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Сохраненные расчеты:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteProject(project.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
