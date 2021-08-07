/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import Daemon from './Persons/Daemon';
import Undead from './Persons/Undead';
import Vampire from './Persons/Vampire';
import { generateTeam, shuffle } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';

export default class Team {
  constructor(characterCount, maxLevel, allowedTypesPlayer) {
    this.characterCount = characterCount;
    this.maxLevel = maxLevel;
    this.allowedTypesPlayer = allowedTypesPlayer;
    this.allowedTypesCom = [new Daemon(), new Undead(), new Vampire()];
    this.positionsPlay = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
    this.positionCom = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
  }

  ranking() {
    const arr = [];
    const p = generateTeam(shuffle(this.allowedTypesPlayer), this.maxLevel, this.characterCount);
    if (GameState.char) {
      GameState.char.forEach((el) => {
        el.character.defence = Math.max(el.character.defence, el.character.defence * (1.8 - el.character.health / 100)) + 5;
        el.character.attack = Math.max(el.character.attack, el.character.attack * (1.8 - el.character.health / 100)) + 5;
        el.character.health += 80;
        el.character.level++;
        if (el.character.health > 100) {
          el.character.health = 100;
        }
        p.push(el.character);
      });
      while (p.length > 10) {
        p.shift();
      }
    }
    const pos = shuffle(this.positionsPlay);
    for (let i = 0; i <= p.length - 1; i++) {
      arr.push(new PositionedCharacter(p[i], pos[i]));
    }

    const c = generateTeam(shuffle(this.allowedTypesCom), this.maxLevel, p.length);
    const com = shuffle(this.positionCom);
    for (let i = 0; i <= c.length - 1; i++) {
      arr.push(new PositionedCharacter(c[i], com[i]));
    }

    return arr;
  }
}
