
// Extend the Document interface to handle the document.createElement method issue
interface Document {
  createElement(tagName: string): HTMLElement;
  body: HTMLElement;
}

interface Window {
  // Add any window specific types here if needed
}
