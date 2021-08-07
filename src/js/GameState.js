/* eslint-disable max-len */
export default class GameState {
  static from(object) {
    this.level = object.level;
    this.char = object.char;
    this.step = object.step;
    this.state = object.state;
    this.possibleMoves = object.possibleMoves;
    this.possibleAttack = object.possibleAttack;
    this.itemPlay = object.itemPlay;
    this.itemCom = object.itemCom;
    this.scores = object.scores;
    this.maxLevel = object.maxLevel;
    this.save = [{
      level: this.level, char: this.char, step: this.step, state: this.state, scores: this.scores, maxLevel: this.maxLevel,
    }];
    return null;
  }
}
