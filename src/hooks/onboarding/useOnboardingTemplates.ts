
import { useTemplateOperations } from './templates/useTemplateOperations';
import { useStageOperations } from './templates/useStageOperations';
import { useTaskOperations } from './templates/useTaskOperations';

export const useOnboardingTemplates = () => {
  const templateOps = useTemplateOperations();
  const stageOps = useStageOperations();
  const taskOps = useTaskOperations();

  return {
    // Template operations
    templates: templateOps.templates,
    isLoading: templateOps.isLoading,
    error: templateOps.error,
    createTemplate: templateOps.createTemplate,
    updateTemplate: templateOps.updateTemplate,
    deleteTemplate: templateOps.deleteTemplate,
    isCreating: templateOps.isCreating,
    isUpdating: templateOps.isUpdating,
    isDeleting: templateOps.isDeleting,
    refreshTemplates: templateOps.refreshTemplates,

    // Stage operations
    getTemplateStages: stageOps.getTemplateStages,
    createStage: stageOps.createStage,
    updateStage: stageOps.updateStage,
    deleteStage: stageOps.deleteStage,

    // Task operations
    getStageTasks: taskOps.getStageTasks,
    createTask: taskOps.createTask,
    updateTask: taskOps.updateTask,
    deleteTask: taskOps.deleteTask
  };
};
