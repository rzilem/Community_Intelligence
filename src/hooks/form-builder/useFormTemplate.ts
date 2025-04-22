
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormTemplate, FormField, FormType } from "@/types/form-builder-types";
import { parseFields, parseMetadata, parseFormType } from "@/components/form-builder/editor/formTemplateUtils";

export function useFormTemplate(formId: string) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      setLoading(true);
      const { data, error } = await supabase
        .from("form_templates")
        .select("*")
        .eq("id", formId)
        .single();

      if (error) {
        toast.error("Failed to load form template");
        setLoading(false);
        return;
      }

      const parsedFields = parseFields(data.fields);
      const metadata = parseMetadata(data.metadata);
      const formType = parseFormType(data.form_type);

      setTemplate({
        ...data,
        fields: parsedFields,
        metadata,
        form_type: formType,
      });
      setLoading(false);
    }

    fetchTemplate();
  }, [formId]);

  return { template, loading, setTemplate };
}
