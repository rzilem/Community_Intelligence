
import React from "react";
import { FormTemplate, FormType } from "@/types/form-builder-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormGroup } from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FormDetailsSectionProps {
  template: FormTemplate;
  onTemplateDetailsChange: (key: keyof FormTemplate, value: any) => void;
  onIsPublicChange: (checked: boolean) => void;
}

const FormDetailsSection: React.FC<FormDetailsSectionProps> = ({
  template,
  onTemplateDetailsChange,
  onIsPublicChange,
}) => {
  const formTypeOptions = [
    { value: "portal_request", label: "Portal Request" },
    { value: "arc_application", label: "ARC Application" },
    { value: "pool_form", label: "Pool Form" },
    { value: "gate_request", label: "Gate Request" },
    { value: "other", label: "Other" },
  ];

  const categoryOptions = [
    { value: "residents", label: "Residents" },
    { value: "board", label: "Board" },
    { value: "management", label: "Management" },
    { value: "vendors", label: "Vendors" },
    { value: "general", label: "General" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    onTemplateDetailsChange(id as keyof FormTemplate, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Form Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={template.name}
                onChange={handleInputChange}
                placeholder="Enter form name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form_type">Form Type</Label>
              <Select
                value={template.form_type || ""}
                onValueChange={(value) => onTemplateDetailsChange("form_type", value as FormType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form type" />
                </SelectTrigger>
                <SelectContent>
                  {formTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={template.category || ""}
                onValueChange={(value) => onTemplateDetailsChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_public"
                checked={template.is_public}
                onCheckedChange={onIsPublicChange}
              />
              <Label htmlFor="is_public">Make this form publicly available</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={template.description || ""}
              onChange={handleInputChange}
              placeholder="Describe the purpose of this form"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormDetailsSection;
