
import { FormField, FormType } from "@/types/form-builder-types";

export function parseFields(fieldsRaw: any): FormField[] {
  try {
    if (typeof fieldsRaw === "string") {
      return JSON.parse(fieldsRaw);
    } else if (Array.isArray(fieldsRaw)) {
      return fieldsRaw as FormField[];
    }
    return [];
  } catch {
    return [];
  }
}

export function parseMetadata(metadataRaw: any): Record<string, any> {
  try {
    if (metadataRaw && typeof metadataRaw === "string") {
      return JSON.parse(metadataRaw);
    } else if (metadataRaw && typeof metadataRaw === "object") {
      return metadataRaw;
    }
    return {};
  } catch {
    return {};
  }
}

export function parseFormType(typeRaw: any): FormType | null {
  if (typeRaw && typeof typeRaw === "string") {
    const validFormTypes: FormType[] = [
      "portal_request",
      "arc_application",
      "pool_form",
      "gate_request",
      "other",
    ];
    if (validFormTypes.includes(typeRaw as FormType)) {
      return typeRaw as FormType;
    }
  }
  return null;
}
