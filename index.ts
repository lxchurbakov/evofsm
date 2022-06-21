import main from './src';

const node = document.getElementById('app');

if (!node) {
  throw new Error(`Node #app not found.`);
}

main(node);