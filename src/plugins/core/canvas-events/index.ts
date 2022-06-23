import { EventEmitter } from '/src/libs/events';

export type Point = { x: number, y: number };

export default class CanvasEvents {
  public onDrag = new EventEmitter<Point>();
  public onKeyDown = new EventEmitter<number>();

  constructor (rootNode: HTMLElement) {
    const eventsOverlayNode = document.createElement('div');

    rootNode.style.position = 'relative';
    eventsOverlayNode.style.position = 'absolute';
    eventsOverlayNode.style.top = '0px';
    eventsOverlayNode.style.left = '0px';
    eventsOverlayNode.style.width = '100%';
    eventsOverlayNode.style.height = '100%';
    eventsOverlayNode.style.zIndex = '100';

    rootNode.appendChild(eventsOverlayNode);

    eventsOverlayNode.addEventListener('mousedown', this.handleMouseDown);
    eventsOverlayNode.addEventListener('mousemove', this.handleMouseMove);
    eventsOverlayNode.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private mouseButtonDownPosition = null as Point | null;

  private handleMouseDown = (e: MouseEvent) => {
    this.mouseButtonDownPosition = { x: e.clientX, y: e.clientY };
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.mouseButtonDownPosition !== null) {
      this.onDrag.emitps({
        x: e.clientX - this.mouseButtonDownPosition.x,
        y: e.clientY - this.mouseButtonDownPosition.y,
      });

      this.mouseButtonDownPosition = { x: e.clientX, y: e.clientY };
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    this.mouseButtonDownPosition = null;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.onKeyDown.emitps(e.keyCode);
  };
};
