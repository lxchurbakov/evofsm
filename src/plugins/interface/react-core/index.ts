import ReactDOM from 'react-dom/client';
import { EventEmitter } from '/src/libs/events';

export default class ReactInterfaceCore {
  public onContent = new EventEmitter();

  constructor (private rootNode: HTMLElement) {
    const interfaceNode = document.createElement('div');

    this.rootNode.style.position = 'relative';
    interfaceNode.style.position = 'absolute';
    interfaceNode.style.top = '0px';
    interfaceNode.style.left = '0px';
    interfaceNode.style.width = '100%';
    interfaceNode.style.height = '100%';
    interfaceNode.style.zIndex = '200';
    interfaceNode.style.pointerEvents = 'none';


    rootNode.appendChild(interfaceNode);

    setTimeout(() => {
      const root = ReactDOM.createRoot(interfaceNode);
      const content = this.onContent.emitps(null);

      root.render(content);
    }, 0);
  }
};
