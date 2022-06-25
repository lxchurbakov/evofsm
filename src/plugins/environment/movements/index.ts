import CellsManager from '/src/plugins/simulation/cells-manager';

// // And finally we make the cell able to move
// this.brains.onCollectOutputs.on(() => ([
//   'move/up',
//   'move/right',
//   'move/down',
//   'move/left',
//   'move/random',
// ]));

export default class Movements {
  constructor (private cells: CellsManager) {
    this.cells.onSubmitAction.on(({ id, action }) => {
      if (action.startsWith('move/')) {
        const [,direction] = action.split('/');

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

        if (!this.cells.isOccupied({ x, y })) {
          this.cells.update(id, (c) => ({ ...c, x, y }));
        }
      }
    });
  }
};
