import BrainsManager from '/src/plugins/simulation/brains-manager';

// const CLONE_RULE_POSSIBILITY = .1;

export default class MutationsManager {
  constructor (private brains: BrainsManager) {
    // First of all we should try to clone the rule
    this.brains.onMutate.on(({ state, rules, actions }) => {
      // if (Math.random() < CLONE_RULE_POSSIBILITY) {
      //
      // }

      return { state, rules, actions };
    });
  }
};

// [{ brain: RANDOM_WALK, id: 0 }] as { brain: Brain, id: number }[];

// public clone = (brainId: number) => {
//   const brain = this.get(brainId) as Brain;
//   let { rules, actions, states } = JSON.parse(JSON.stringify(brain));
//
//   if (Math.random() > .7) {
//     const mutation = ['add-input', 'clone-rule', 'change-from', 'change-to', 'add-output', 'clone-output'][Math.floor(Math.random() * 6)];
//     // const mutation = ['add-input', 'clone-rule', 'remove-rule', 'change-from', 'change-to', 'add-output', 'remove-output', 'clone-output', 'remove-outputs'][Math.floor(Math.random() * 9)];
//
//     if (mutation === 'add-input') {
//       const possibleInputs = this.onCollectInputs.emitps(null).reduce((acc, c) => acc.concat(c), []);
//
//       console.log(possibleInputs, rules)
//
//       rules[random(0, rules.length)].inputs.push(possibleInputs[random(0, possibleInputs.length)]);
//       console.log(rules)
//     }
//
//     if (mutation === 'clone-rule') {
//
//     }
//
//     // if (mutation === 'remove-rule') {
//     //   const toRemove = random(0, rules.length);
//     //   rules = rules.filter((r, i) => i !== toRemove);
//     // }
//
//     if (mutation === 'change-from') {
//       rules[random(0, rules.length)].from = random(0, actions.length);
//     }
//
//     if (mutation === 'change-to') {
//       rules[random(0, rules.length)].to = random(0, actions.length);
//     }
//
//     if (mutation === 'add-output') {
//       const possibleOutputs = this.onCollectOutputs.emitps(null).reduce((acc, c) => acc.concat(c), []);
//
//       actions[random(0, actions.length)].push(possibleOutputs[random(0, possibleOutputs.length)]);
//     }
//
//     // if (mutation === 'remove-output') {
//     //   const actionIndex = random(0, actions.length);
//     //   const toRemove = random(0, actions[actionIndex].length);
//     //
//     //   actions[actionIndex] = actions[actionIndex].filter((a, i) => i !== toRemove);
//     // }
//
//     if (mutation === 'clone-output') {
//       actions.push(actions[random(0, actions.length)]);
//     }
//
//     // if (mutation === 'remove-outputs') {
//     //   const toRemove = random(0, actions.length);
//     //   actions = actions.filter((r, i) => i !== toRemove);
//     // }
//   }
//
//   const id = this.idgen++;
//   const newBrain = new Brain(rules, states, actions);
//
//   this.brains.push({ id, brain: newBrain });
//   return id;
// };
//
// public tick = (brainId: number, inputs: any[]) => this.get(brainId)?.tick(inputs) || [];