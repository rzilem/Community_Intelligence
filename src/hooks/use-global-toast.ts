
import { toast } from 'sonner';

export const useGlobalToast = () => {
  const successToast = (
    title: string, 
    description?: string
  ) => toast.success(title, { description });

  const infoToast = (
    title: string, 
    description?: string
  ) => toast.info(title, { description });

  const errorToast = (
    title: string, 
    description?: string
  ) => toast.error(title, { description });

  const warningToast = (
    title: string, 
    description?: string
  ) => toast.warning(title, { description });

  return {
    successToast,
    infoToast,
    errorToast,
    warningToast
  };
};
