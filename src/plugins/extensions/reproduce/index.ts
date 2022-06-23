import CellsManager from '/src/plugins/simulation/cells-manager';
import BrainsManager from '/src/plugins/simulation/brains-manager';

import Food from '/src/plugins/extensions/food';

export default class Reproduce {
  constructor (private cells: CellsManager, private food: Food, private brains: BrainsManager) {
    this.brains.onCollectOutputs.on(() => ([
      'reproduce'
    ]));

    this.cells.onDataOutput.on(({ id, action }: { id: number, action: string }) => {
      if (action === 'reproduce') {
        // check food level
        if (this.food.fullness[id] > 15) {
          // Get the brain and mutate
          const cell = this.cells.get(id) as any;
          this.food.fullness[id] -= 15;

          const newCellPosition = { x: cell.x + Math.floor(Math.random() * 3 - 2), y: cell.y + Math.floor(Math.random() * 3 - 2) };
          const newCellBrainId = this.brains.clone(cell.brainId);

          this.cells.add(newCellPosition, newCellBrainId);
        }

      }

      // if (action.startsWith('move/')) {
      //   const [,direction] = action.split('/');
      //
      //   const patch = {
      //     up: { x: 0, y: -1 },
      //     bottom: { x: 0, y: +1 },
      //     left: { x: -1, y: 0 },
      //     right: { x: +1, y: 0 },
      //   }[direction] as any;
      //
      //   this.cells.update(id, (cell) => ({
      //     ...cell,
      //     x: cell.x + patch.x,
      //     y: cell.y + patch.y,
      //   }))
      // }

    });
  }
};