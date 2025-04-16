
declare module 'react-signature-canvas' {
  import * as React from 'react';

  export interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    backgroundColor?: string;
    dotSize?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    penColor?: string;
    throttle?: number;
    velocityFilterWeight?: number;
    onBegin?: (event: MouseEvent | Touch) => void;
    onEnd?: (event: MouseEvent | Touch) => void;
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: (type?: string, encoderOptions?: number) => string;
    fromDataURL: (dataURL: string) => void;
  }
}
