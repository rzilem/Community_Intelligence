
import { LineItemRow } from './LineItemRow';

interface LineItem {
  glAccount: string;
  fund: string;
  bankAccount: string;
  description: string;
  amount: number;
}

interface LineItemsListProps {
  lines: LineItem[];
  glAccounts: any[];
  onLineChange: (index: number, field: string, value: string | number) => void;
  onRemoveLine: (index: number) => void;
  showPreview?: boolean;
}

export const LineItemsList = ({
  lines,
  glAccounts,
  onLineChange,
  onRemoveLine,
  showPreview = true,
}: LineItemsListProps) => {
  return (
    <>
      {lines.map((line, index) => (
        <LineItemRow
          key={index}
          index={index}
          line={line}
          isFirstLine={index === 0}
          glAccounts={glAccounts}
          onLineChange={onLineChange}
          onRemoveLine={onRemoveLine}
          showPreview={showPreview}
        />
      ))}
    </>
  );
};
