
export type DataCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  selected: boolean;
  seedFunction: (associationId: string, count: number) => Promise<void>;
};
