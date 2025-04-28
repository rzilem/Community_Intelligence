
declare module 'react-signature-canvas' {
  import * as React from 'react';

  export interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    onBegin?: () => void;
    onEnd?: () => void;
    penColor?: string;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
  }

  export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataURL: string, options?: object): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    off(): void;
    on(): void;
  }
}
