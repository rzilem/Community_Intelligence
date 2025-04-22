
import React from "react";
import { FormTemplate, FormType } from "@/types/form-builder-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FormDetailsSectionProps {
  template: FormTemplate;
  onTemplateDetailsChange: (key: keyof FormTemplate, value: any) => void;
  onIsPublicChange: (isPublic: boolean) => void;
}

const FormDetailsSection: React.FC<FormDetailsSectionProps> = ({
  template,
  onTemplateDetailsChange,
  onIsPublicChange,
}) => {
  const formTypes: { value: FormType; label: string }[] = [
    { value: "portal_request", label: "Portal Request" },
    { value: "arc_application", label: "ARC Application" },
    { value: "pool_form", label: "Pool Form" },
    { value: "gate_request", label: "Gate Request" },
    { value: "other", label: "Other" },
  ];

  const categories = [
    { value: "maintenance", label: "Maintenance" },
    { value: "legal", label: "Legal" },
    { value: "approval", label: "Approval" },
    { value: "survey", label: "Survey" },
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
        <CardDescription>
          Basic information about your form template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Form Name</Label>
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
              value={template.form_type || "other"}
              onValueChange={(value) => onTemplateDetailsChange("form_type", value)}
            >
              <SelectTrigger id="form_type">
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                {formTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={template.category || "general"}
              onValueChange={(value) => onTemplateDetailsChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="block mb-2">Visibility</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={template.is_public}
                  onCheckedChange={onIsPublicChange}
                />
                <Label htmlFor="is_public">
                  Make form available to portal users
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, this form will be shown to users in portals based on its form type
              </p>
            </div>
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
      </CardContent>
    </Card>
  );
};

export default FormDetailsSection;
