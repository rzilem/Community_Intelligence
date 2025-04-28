
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
}

const SignatureComponent: React.FC<SignatureCanvasProps> = ({ onSave, onCancel }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const save = () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.toDataURL();
      onSave(signatureData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-md bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-48"
          }}
        />
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={clear}>
          Clear
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={save}>
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureComponent;
