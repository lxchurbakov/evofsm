// Import plugins
import CanvasRender from './plugins/core/canvas-render';
import CanvasEvents from './plugins/core/canvas-events';
import RenderWindow from './plugins/core/render-window';
import SimulationTicks from './plugins/core/simulation-ticks';

import BrainsManager from './plugins/simulation/brains-manager';
import CellsManager from './plugins/simulation/cells-manager';

import Movements from './plugins/extensions/movements';
import Food from './plugins/extensions/food';
import Reproduce from './plugins/extensions/reproduce';
// import FoodActions from './plugins/simulation/food-actions';
// import SunlightManager from './plugins/simulation/sunlight-manager';

// Kickoff the app
export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);
  const ticks = new SimulationTicks(canvasRender);

  // const sunlight = new SunlightManager(renderWindow);
  const brains = new BrainsManager();
  const cells = new CellsManager(renderWindow, ticks, brains);

  const food = new Food(cells, renderWindow, ticks);
  const movements = new Movements(cells, brains, food);

  const reproduce = new Reproduce(cells, food, brains);
  // const basic = new BasicActions(cells);
  // const food = new FoodActions(cells, renderWindow);

};
