
// Extend the Document interface to handle the document.createElement method issue
interface Document {
  createElement(tagName: string): HTMLElement & {
    href: string;
    download: string;
    value: string;
  };
  body: HTMLElement;
}

interface HTMLElement {
  href?: string;
  download?: string;
  value?: string;
}

interface Window {
  // Add any window specific types here if needed
}
