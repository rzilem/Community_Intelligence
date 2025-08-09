import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useOnboardingTemplates } from '@/hooks/onboarding/useOnboardingTemplates';
import { useOnboardingProjects } from '@/hooks/onboarding/useOnboardingProjects';
import { useLeads } from '@/hooks/leads/useLeads';

interface CreateOnboardingProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  onCreated?: (projectId: string) => void;
}

const CreateOnboardingProjectModal: React.FC<CreateOnboardingProjectModalProps> = ({
  open,
  onOpenChange,
  defaultName,
  onCreated,
}) => {
  const { templates, isLoading: templatesLoading } = useOnboardingTemplates();
  const { leads = [] } = useLeads();
  const { createProjectFromTemplate } = useOnboardingProjects();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [projectName, setProjectName] = useState<string>(defaultName || 'New Onboarding Project');
  const [templateId, setTemplateId] = useState<string>('');
  const [leadId, setLeadId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(today);
  const [submitting, setSubmitting] = useState(false);

  // Keep projectName in sync when defaultName changes
  React.useEffect(() => {
    if (defaultName) setProjectName(defaultName);
  }, [defaultName]);

  const handleCreate = async () => {
    if (!projectName?.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!templateId) {
      toast.error('Please select a template');
      return;
    }
    if (!leadId) {
      toast.error('Please select a lead');
      return;
    }

    try {
      setSubmitting(true);
      const project = await createProjectFromTemplate({
        name: projectName.trim(),
        lead_id: leadId,
        template_id: templateId,
        start_date: startDate,
      });
      if (project?.id) {
        toast.success('Onboarding project created');
        onOpenChange(false);
        onCreated?.(project.id);
      }
    } catch (e: any) {
      console.error('Failed to create onboarding project', e);
      toast.error(e?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Onboarding Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={templatesLoading ? 'Loading templates...' : 'Select a template'} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger>
                <SelectValue placeholder={leads.length ? 'Select a lead' : 'No leads found'} />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.association_name || l.company || l.name || l.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting || templatesLoading || !leads.length}>
              {submitting ? 'Creating...' : 'Create project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOnboardingProjectModal;
