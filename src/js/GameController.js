/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import Team from './Team';
import themes from './themes';
import cursors from './cursors';
import GameState from './GameState';
import GamePlay from './GamePlay';
import Bowman from './Persons/Bowman';
import Swordsman from './Persons/Swordsman';
import Magician from './Persons/Magician';
import { shuffle } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];
    GameState.char = null;
    GameState.from({
      level: 1,
      char: new Team(2, 1, [new Bowman(), new Swordsman()]).ranking(),
      step: 'user',
      state: null,
      scores: 0,
      maxLevel: 1,
    });

    this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
    this.gamePlay.redrawPositions(GameState.char);
    this.gamePlay.addNewGameListener(this.init.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoad.bind(this));
    this.gamePlay.addSaveGameListener(this.onSave.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  initSec() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];

    GameState.level++;
    GameState.maxLevel++;
    if (GameState.level > 4) { GameState.level = 1; }
    let count;
    if (GameState.level === 1 || GameState.level === 2) { count = 1; } else { count = 2; }
    const newChar = new Team(count, GameState.maxLevel, [new Bowman(), new Magician(), new Swordsman()]).ranking();
    GameState.char = newChar;

    this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
    this.gamePlay.redrawPositions(GameState.char);
    this.gamePlay.addNewGameListener(this.init.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoad.bind(this));
    this.gamePlay.addSaveGameListener(this.onSave.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onSave() {
    GameState.from({
      level: GameState.level,
      maxLevel: GameState.maxLevel,
      char: GameState.char,
      scores: GameState.scores,

    });
    this.stateService.storage.clear();

    this.stateService.save(GameState.save);
  }

  onLoad() {
    const charLoad = this.stateService.load();

    GameState.from({
      level: charLoad[0].level, char: charLoad[0].char, step: charLoad[0].step, scores: charLoad[0].scores, maxLevel: charLoad[0].maxLevel,
    });

    this.gamePlay.drawUi(`${Object.values(themes)[GameState.level - 1]}`);
    this.gamePlay.redrawPositions(charLoad[0].char);
  }

  onCellClick(index) {
    function play(el) {
      if (el.position === index && (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman')) {
        return true;
      } return false;
    }
    function com(el) {
      if (el.position === index && (el.character.type === 'vampire' || el.character.type === 'undead' || el.character.type === 'daemon')) {
        return true;
      } return false;
    }

    const itemComIndex = GameState.char.findIndex(com);
    const itemPlay = GameState.char.find(play);
    const itemCom = GameState.char.find(com);

    if (GameState.step === 'com') {
      this.paceCom();
    } else if (itemPlay) {
      GameState.itemPlay = itemPlay;
      GameState.possibleAttack = GameController.possible(itemPlay.character.stepAttack, index);
      GameState.possibleMoves = GameController.possible(itemPlay.character.stepMoves, index);
      if (!GameState.state && GameState.state !== 0) {
        this.gamePlay.selectCell(index);
        GameState.state = index;
      } else {
        this.gamePlay.deselectCell(GameState.state);
        GameState.state = index;
        this.gamePlay.selectCell(index);
      }
    } else if (!itemPlay && !itemCom && GameState.possibleMoves && GameState.possibleMoves.includes(index)) {
      GameState.itemPlay.position = index;
      this.gamePlay.redrawPositions(GameState.char);
      this.gamePlay.deselectCell(GameState.state);
      this.gamePlay.deselectCell(index);
      GameState.state = null;
      GameState.itemPlay = null;
      GameState.possibleAttack = null;
      GameState.possibleMoves = null;
      GameState.step = 'com';
      this.onCellClick(index);
    } else if (itemCom && GameState.possibleAttack && GameState.possibleAttack.includes(index)) {
      const damage = Math.round(Math.max(GameState.itemPlay.character.attack - itemCom.character.defence, GameState.itemPlay.character.attack * 0.1));
      GameState.itemCom = itemCom;
      GameState.itemCom.character.health -= damage;
      this.gamePlay.showDamage(index, damage).then(() => {
        this.gamePlay.deselectCell(GameState.state);
        this.gamePlay.deselectCell(index);
        if (GameState.itemCom.character.health <= 0) {
          GameState.char.splice(itemComIndex, 1);
        }
        this.gamePlay.redrawPositions(GameState.char);
        GameState.state = null;
        GameState.itemPlay = null;
        GameState.possibleAttack = null;
        GameState.possibleMoves = null;
        GameState.step = 'com';
        this.onCellClick(index);
      });
    } else {
      GamePlay.showError('Недопустимый ход!!!');
    }
  }

  onCellEnter(index) {
    GameState.char.forEach((el) => {
      if (el.position === index) {
        const message = `${String.fromCodePoint(0x1F396)} ${el.character.level} ${String.fromCodePoint(0x2694)} ${el.character.attack} ${String.fromCodePoint(0x1F6E1)} ${el.character.defence} ${String.fromCodePoint(0x2764)} ${el.character.health}`;
        this.gamePlay.showCellTooltip(message, index);
        if (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman') {
          this.gamePlay.setCursor(cursors.pointer);
        }
      }
    });
    function com(el) {
      if (el.position === index && (el.character.type === 'vampire' || el.character.type === 'undead' || el.character.type === 'daemon')) {
        return true;
      } return false;
    }
    const itemCom = GameState.char.find(com);
    if (GameState.possibleMoves && GameState.possibleMoves.includes(index) && GameState.state !== index && !itemCom) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    }
    if (itemCom && GameState.possibleAttack && GameState.possibleAttack.includes(index)) {
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.notallowed);
    this.gamePlay.deselectCell(index);
    if (GameState.state) {
      this.gamePlay.selectCell(GameState.state);
    }
  }

  static possible(step, index) {
    const arr = [];
    for (let i = 0; i <= step * 2; i++) {
      let n = index - step * 9 + i * 8;
      const x = index - step * 8 + i * 8;
      for (let y = 0; y <= step * 2; y++) {
        if (Math.trunc(n / 8) === Math.trunc(x / 8) && n >= 0 && n <= 63) {
          arr.push(n++);
        } else { n++; }
      }
    }
    return arr;
  }

  //  II logic
  paceCom() {
    const arrCom = [];
    const arrPlay = [];
    let arrAttack = [];
    GameState.char.forEach((el) => {
      if (el.character.type === 'vampire' || el.character.type === 'undead' || el.character.type === 'daemon') {
        arrCom.push(el);
      }
    });
    GameState.char.forEach((el) => {
      if (el.character.type === 'bowman' || el.character.type === 'magician' || el.character.type === 'swordsman') {
        arrPlay.push(el);
      }
    });
    if (arrCom.length === 0) {
      arrPlay.forEach((el) => {
        GameState.scores += el.character.health;
      });
      GamePlay.showMessage(`Ну ладно, ты кое как выиграл и набрал ${GameState.scores} очков!`);
      GamePlay.showMessage('Но это ещё не всё. Ты всё равно проиграешь!');
      GameState.step = 'user';
      this.initSec();
      return;
    }
    const [chooseCom] = shuffle(arrCom);
    arrPlay.forEach((el) => {
      if (GameController.possible(chooseCom.character.stepAttack, chooseCom.position).find((i) => i === el.position)) {
        arrAttack.push(el);
      }
    });
    if (arrAttack.length > 0) {
      [arrAttack] = shuffle(arrAttack);
      const damage = Math.round(Math.max(chooseCom.character.attack - arrAttack.character.defence, chooseCom.character.attack * 0.1));
      arrAttack.character.health -= damage;
      this.gamePlay.showDamage(arrAttack.position, damage).then(() => {
        if (arrAttack.character.health <= 0) {
          GameState.char.splice(GameState.char.indexOf(arrAttack), 1);
          if (arrPlay.length === 1) {
            GamePlay.showMessage('Ну ты даёшь! Даже тут облажался! Лузер!!!');
            GamePlay.showMessage(`вы набрали ${GameState.scores} баллов!`);
            GamePlay.showMessage('Ну тыкни уже в кнопку "НАЧАТЬ НОВУЮ ИГРУ"!');
            this.gamePlay.redrawPositions(GameState.char);
            return;
          }
        }
        this.gamePlay.redrawPositions(GameState.char);
      });
    } else {
      const moves = shuffle(GameController.possible(chooseCom.character.stepMoves, chooseCom.position));
      [...arrPlay, ...arrCom].forEach((el) => {
        if (GameController.possible(chooseCom.character.stepMoves, chooseCom.position).find((i) => i === el.position)) {
          moves.splice(moves.indexOf(el.position), 1);
        }
      });
      // eslint-disable-next-line prefer-destructuring
      chooseCom.position = moves[0];
      this.gamePlay.redrawPositions(GameState.char);
    }

    GameState.step = 'user';
  }
}
