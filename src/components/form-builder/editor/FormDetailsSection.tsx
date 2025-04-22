
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormAssociationSelect } from "@/components/form-builder/FormAssociationSelect";
import type { FormTemplate } from "@/types/form-builder-types";

interface FormDetailsSectionProps {
  template: FormTemplate;
  onTemplateDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onIsPublicChange: (checked: boolean) => void;
}

const FormDetailsSection: React.FC<FormDetailsSectionProps> = ({
  template,
  onTemplateDetailsChange,
  onIsPublicChange,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Form Details</CardTitle>
      <CardDescription>Edit the basic details of your form.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={template.name}
            onChange={onTemplateDetailsChange}
          />
        </div>
        <div>
          <Label htmlFor="is_public">Public Form</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              checked={template.is_public}
              onCheckedChange={onIsPublicChange}
            />
            <span>Allow anyone to submit this form</span>
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={template.description || ''}
          onChange={onTemplateDetailsChange}
        />
      </div>
      <FormAssociationSelect
        formId={template.id}
        isGlobal={template.is_global}
        associations={[]}
        onUpdate={() => {}}
      />
    </CardContent>
  </Card>
);

export default FormDetailsSection;
