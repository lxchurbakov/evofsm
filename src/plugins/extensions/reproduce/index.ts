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
        if (this.food.fullness[id] > 15) {
          const cell = this.cells.get(id) as any;

          const x = cell.x + Math.floor(Math.random() * 3 - 2);
          const y = cell.y + Math.floor(Math.random() * 3 - 2);

          const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

          if (!spaceOccupiedByCell) {
            const newCellBrainId = this.brains.clone(cell.brainId);
            const newCellId = this.cells.add({ x, y }, newCellBrainId);

            this.food.fullness[id] -= 15;
            this.food.fullness[newCellId] = 15;
          }
        }
      }
    });
  }
};
