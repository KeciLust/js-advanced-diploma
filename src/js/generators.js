/* eslint-disable no-proto */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const item = Object.create(allowedTypes[Math.floor(Math.random() * allowedTypes.length)]);
    item.level = Math.floor(Math.random() * maxLevel) + 1;
    yield item;
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const item = characterGenerator(allowedTypes, maxLevel);
  const arr = [];
  for (let i = 0; i < characterCount; i++) {
    const char = item.next().value;
    char.attack = char.__proto__.attack + 5 * (char.level - 1);
    char.defence = char.__proto__.defence + 5 * (char.level - 1);
    char.health = char.__proto__.health + 5 * (char.level - 1);
    char.type = char.__proto__.type;
    char.stepAttack = char.__proto__.stepAttack;
    char.stepMoves = char.__proto__.stepMoves;
    arr[i] = char;
  }
  return arr;
}
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
