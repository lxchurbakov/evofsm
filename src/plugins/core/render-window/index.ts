import { EventEmitter } from '/src/libs/events';

import CanvasRender from '/src/plugins/core/canvas-render';
import CanvasEvents from '/src/plugins/core/canvas-events';

export default class RenderWindow {
  public onRender = new EventEmitter<CanvasRenderingContext2D>();
  public offset = { x: 0, y: 0 };

  constructor (private render: CanvasRender, private events: CanvasEvents) {
    this.events.onDrag.on((p) => {
      this.offset.x += p.x;
      this.offset.y += p.y;
    });

    this.render.onRender.on((context) => {
      context.save();
      context.translate(this.offset.x, this.offset.y);
      this.onRender.emitps(context);
      context.restore();
    });
  }
};
