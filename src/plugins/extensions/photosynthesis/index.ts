import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

import CellsManager from '/src/plugins/simulation/cells-manager';
import BrainsManager from '/src/plugins/simulation/brains-manager';

const GRID_SIZE = 20;
const SUN_TO_HAVE = 2000;

const SUNLIGHT_COLOR = '#ffeb3b5a';
const FOOD_COLOR = '#4caf50';

// A plugin that adds a sun sectors where
// cells can fin the food spawning, but
// the sectors are moving, so should the
// cells do as well.
export default class Photosynthesis {
  // Here we store all of the spots, they will
  // eventually move around by changing x and y
  public sunSpots = [
    { x: 10, y: 10, r: 20 }
  ] as { x: number, y: number, r: number}[];
  public food = [] as { x: number, y: number, value: number }[];
  public fullness = { '0': 100 } as any;

  constructor (private window: RenderWindow, private ticks: SimulationTicks, private cells: CellsManager, private brains: BrainsManager) {
    // Now we render the sunlight
    this.window.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = SUNLIGHT_COLOR;

      let dots = [] as { x: number, y: number }[];

      this.sunSpots.forEach(({ x, y, r }) => {
        for (let i = 0; i < r; ++i) {
          for (let j = 0; j < r; ++j) {
            if (Math.sqrt(i * i + j * j) * 1.08 < r) {
              dots.push({ x: x + i, y: y + j })
              dots.push({ x: x - i, y: y + j })
              dots.push({ x: x - i, y: y - j })
              dots.push({ x: x + i, y: y - j })
            }
          }
        }
      });

      dots = dots.filter((d, $i) => $i === dots.findIndex(($d) => d.x === $d.x && d.y === $d.y));

      dots.forEach(({ x, y }) => {
        context.beginPath();
        context.rect((x) * GRID_SIZE, (y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      })
    });

    // Now we want to support some level of sun all over the game board
    this.ticks.add({ color: SUNLIGHT_COLOR.substr(0, 7), interval: 2500 }, () => {
      const sunWeHave = this.sunSpots.reduce((acc, sunSpot) => acc + Math.PI * sunSpot.r * sunSpot.r, 0);

      if (sunWeHave < SUN_TO_HAVE) {
        if (this.sunSpots.length < 5) {
          this.sunSpots.push({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            r: 3,
          })
        } else {
          this.sunSpots[Math.floor(Math.random() * this.sunSpots.length)].r++;
        }
      }

      this.sunSpots[Math.floor(Math.random() * this.sunSpots.length)][Math.random() > .5 ? 'x' : 'y'] += Math.floor(Math.random() * 4) - 2;
      this.sunSpots[Math.floor(Math.random() * this.sunSpots.length)][Math.random() > .5 ? 'x' : 'r'] += Math.floor(Math.random() * 4) - 2;
      this.sunSpots[Math.floor(Math.random() * this.sunSpots.length)][Math.random() > .5 ? 'y' : 'r'] += Math.floor(Math.random() * 4) - 2;

      this.sunSpots = this.sunSpots.filter(({ r }) => r > 1);
    });

    // Now we proceed to the second part - we want the food to spawn in the sunlight
    // First of all we render it
    this.window.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = FOOD_COLOR;

      this.food.forEach((cell) => {
        context.beginPath();
        context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      });
    });

    // After that we want the food to spawn in the sunlight
    this.ticks.add({ interval: 100, color: FOOD_COLOR }, () => {
      const randomSunSpot = this.sunSpots[Math.floor(Math.random() * this.sunSpots.length)];

      if (randomSunSpot) {
        const x = randomSunSpot.x + Math.floor(Math.random() * randomSunSpot.r * 1.6 - randomSunSpot.r *.8);
        const y = randomSunSpot.y + Math.floor(Math.random() * randomSunSpot.r * 1.6 - randomSunSpot.r *.8)

        const spaceOccupiedByFood = this.food.some(($food) => $food.x === x && $food.y === y);
        const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

        if (!spaceOccupiedByCell && !spaceOccupiedByFood) {
          this.food.push({ x, y, value: 20 });
        }
      }
    });

    // Now we want to keep cells fullness and check if cell has eaten something
    // Check if the cell has eaten the food
    this.cells.onAfterTick.on(() => {
      this.cells.ids().map((id) => {
        const cell = this.cells.get(id) as any;

        this.food.forEach((food) => {
          if (cell.x === food.x && cell.y === food.y) {
            // Food consumption
            this.fullness[id] = (this.fullness[id] || 0) + food.value;
            this.food = this.food.filter((f) => f !== food);
          }
        });
      });
    });

    // And finally we make the cell able to move
    this.brains.onCollectOutputs.on(() => ([
      'move/up',
      'move/right',
      'move/down',
      'move/left',
      'move/random',
    ]));

    this.cells.onDataOutput.on(({ id, action }: { id: number, action: string }) => {
      if (action.startsWith('move/')) {
        const [,direction] = action.split('/');

        this.fullness[id] -= .5;

        const patch = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: +1 },
          left: { x: -1, y: 0 },
          right: { x: +1, y: 0 },
          random: { x: Math.floor(Math.random() * 3 - 1), y: Math.floor(Math.random() * 3 - 1) },
        }[direction] as any;

        const cell = this.cells.get(id) as any;

        const x = cell.x + patch.x;
        const y = cell.y + patch.y;

        const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

        if (!spaceOccupiedByCell) {
          this.cells.update(id, (cell) => ({ ...cell, x, y }))
        }
      }
    });

    // And reproduce
    this.brains.onCollectOutputs.on(() => ([
      'reproduce'
    ]));

    this.cells.onDataOutput.on(({ id, action }: { id: number, action: string }) => {
      if (action === 'reproduce') {
        if (this.fullness[id] > 15) {
          const cell = this.cells.get(id) as any;

          const x = cell.x + Math.floor(Math.random() * 3 - 1);
          const y = cell.y + Math.floor(Math.random() * 3 - 1);

          const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

          if (!spaceOccupiedByCell) {
            const newCellBrainId = this.brains.clone(cell.brainId);
            const newCellId = this.cells.add({ x, y }, newCellBrainId);

            this.fullness[id] -= 15;
            this.fullness[newCellId] = 15;
          }
        }
      }
    });

    // And see sunlight and food
    this.cells.onDataInput.on((cellId: number) => {
      const cell = this.cells.get(cellId) as any;
      let result = [] as any[];

      this.food.forEach((food) => {
        if (food.x === cell.x + 1 && food.y === cell.y) {
          result.push({ type: 'see', what: 'food', where: 'right' });
        }
        if (food.x === cell.x - 1 && food.y === cell.y) {
          result.push({ type: 'see', what: 'food', where: 'left' });
        }
        if (food.x === cell.x && food.y === cell.y + 1) {
          result.push({ type: 'see', what: 'food', where: 'down' });
        }
        if (food.x === cell.x && food.y === cell.y - 1) {
          result.push({ type: 'see', what: 'food', where: 'up' });
        }
      });

      return this.food.filter((food) => Math.abs(cell.x - food.x) <= 1 && Math.abs(cell.y - food.y) <= 1)
        .map((food) => ({ type: 'vision', meta: { type: 'food', position: { x: cell.x - food.x, y: cell.y - food.y } } }));
    });

    this.cells.onDataInput.on((cellId: number) => {
      const cell = this.cells.get(cellId) as any;
      let result = [] as any[];

      let dots = [] as { x: number, y: number }[];

      this.sunSpots.forEach(({ x, y, r }) => {
        for (let i = 0; i < r; ++i) {
          for (let j = 0; j < r; ++j) {
            if (Math.sqrt(i * i + j * j) * 1.08 < r) {
              dots.push({ x: x + i, y: y + j })
              dots.push({ x: x - i, y: y + j })
              dots.push({ x: x - i, y: y - j })
              dots.push({ x: x + i, y: y - j })
            }
          }
        }
      });

      dots = dots.filter((d, $i) => $i === dots.findIndex(($d) => d.x === $d.x && d.y === $d.y));

      dots.forEach((dot) => {
        if (dot.x === cell.x + 1 && dot.y === cell.y) {
          result.push({ type: 'see', what: 'sun', where: 'right' });
        }
        if (dot.x === cell.x - 1 && dot.y === cell.y) {
          result.push({ type: 'see', what: 'sun', where: 'left' });
        }
        if (dot.x === cell.x && dot.y === cell.y + 1) {
          result.push({ type: 'see', what: 'sun', where: 'down' });
        }
        if (dot.x === cell.x && dot.y === cell.y - 1) {
          result.push({ type: 'see', what: 'sun', where: 'up' });
        }
      })

      return this.sunSpots.forEach((sunSpot) => {

      });
    });

    this.brains.onCollectInputs.on(() => {
      return [
        { type: 'see', what: 'food', where: 'up' },
        { type: 'see', what: 'food', where: 'down' },
        { type: 'see', what: 'food', where: 'right' },
        { type: 'see', what: 'food', where: 'left' },
        { type: 'see', what: 'sun', where: 'up' },
        { type: 'see', what: 'sun', where: 'down' },
        { type: 'see', what: 'sun', where: 'right' },
        { type: 'see', what: 'sun', where: 'left' },
      ];
    });

    // Decrease fullness by timer
    const age = {} as any;
    this.ticks.add({ interval: 600, color: 'red' }, () => {
      Object.keys(this.fullness).forEach((id) => {
        age[id] = (age[id] || 0) + 1;

        if (this.fullness[id] < 1 || age[id] > 10) {
          const cell = this.cells.get(parseInt(id));


          if (cell) {
            const { x, y } = cell;

            this.food.push({ x, y, value: 5 })
            this.cells.remove(parseInt(id));
            delete this.fullness[id];
          }
        } else {
          this.fullness[id] -= .5;
        }
      });
    });
  }

};
