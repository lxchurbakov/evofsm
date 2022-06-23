import { EventEmitter } from '/src/libs/events';

export type Point = { x: number, y: number };

const CLICK_THRESHOLD = 200;

export default class CanvasEvents {
  public onDrag = new EventEmitter<Point>();
  public onKeyDown = new EventEmitter<number>();
  public onMouseDown = new EventEmitter<Point>();
  public onMouseUp = new EventEmitter<null>();
  public onMouseClick = new EventEmitter<Point>();

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
  private mouseButtonDownTime = null as number | null;

  private handleMouseDown = (e: MouseEvent) => {
    const p = { x: e.clientX, y: e.clientY };

    this.onMouseDown.emitps(p);
    this.mouseButtonDownPosition = p;
    this.mouseButtonDownTime = new Date().getTime();
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
    if (this.mouseButtonDownTime !== null && this.mouseButtonDownPosition !== null && new Date().getTime() - this.mouseButtonDownTime < CLICK_THRESHOLD) {
      this.onMouseClick.emitps(this.mouseButtonDownPosition);
    }

    this.onMouseUp.emitps(null);
    this.mouseButtonDownPosition = null;
    this.mouseButtonDownTime = null;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.onKeyDown.emitps(e.keyCode);
  };
};
