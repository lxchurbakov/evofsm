// Import plugins
import CanvasRender from './plugins/canvas-render';
import CanvasEvents from './plugins/canvas-events';

import RenderWindow from './plugins/render-window';

// Kickoff the app
export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);
};
