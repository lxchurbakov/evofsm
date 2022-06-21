import { EventEmitter } from '/src/libs/events';

export default class CanvasRender {
  onRender = new EventEmitter<CanvasRenderingContext2D>();

  context: CanvasRenderingContext2D;
  rect: DOMRect;

  constructor (rootNode: HTMLElement) {
    // First of all we create a canvas element and append
    // it to the root node
    const canvasNode = document.createElement('canvas');

    rootNode.appendChild(canvasNode);

    // Grab the sizing parameters and set up canvas
    // just right minding the pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    this.rect = rootNode.getBoundingClientRect();

    canvasNode.style.width = this.rect.width + 'px';
    canvasNode.style.height = this.rect.height + 'px';

    canvasNode.width = this.rect.width * pixelRatio;
    canvasNode.height = this.rect.height * pixelRatio;

    // Grab the context, scale and start rendering cycle
    this.context = canvasNode.getContext('2d') as CanvasRenderingContext2D;

    if (!this.context) {
      throw new Error(`Something went wrong while initializing context`);
    }

    this.context.scale(pixelRatio, pixelRatio);
    this.render();
  }

  render = () => {
    this.context.clearRect(0, 0, this.rect.width, this.rect.height);
    this.onRender.emitps(this.context);

    requestAnimationFrame(this.render);
  };
};
