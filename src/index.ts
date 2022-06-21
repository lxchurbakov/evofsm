// Import plugins
import CanvasRender from './plugins/core/canvas-render';
import CanvasEvents from './plugins/core/canvas-events';

import RenderWindow from './plugins/core/render-window';

import CellsManager from './plugins/simulation/cells-manager';
import SunlightManager from './plugins/simulation/sunlight-manager';

// Kickoff the app
export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);

  const sunlight = new SunlightManager(renderWindow);
  const cells = new CellsManager(renderWindow);
};
