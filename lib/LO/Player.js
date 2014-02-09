/*
 * This file is part of Ludo.
 * Copyright 2014 by Martin Kelm - All rights reserved.
 * Project page @ https://github.com/mkelm/nuaox
 *
 * Ludo is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * Ludo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Ludo. If not, see <http://www.gnu.org/licenses/>.
 */

LO.Player = function(game, color, cpu) {

  this.game = game;
  this.color = color;
  this.cpu = cpu;

  this.active = false;
  this.activeMove = false;
  this.lastMoveFieldId = null;

  // fieldId -1 to -6 for end
  // fieldId -7 to -10 for start
  this.pieces = [
    { fieldId: -10, sprite: false, block: false, move: [] },
    { fieldId: -9, sprite: false, block: false, move: [] },
    { fieldId: -8, sprite: false, block: false, move: [] },
    { fieldId: -7, sprite: false, block: false, move: [] }
  ];
  this.activePieces = 0;

  this.dice = { value: 0, throws: 0, sprite: false, text: false };
}

LO.Player.prototype.constructor = LO.Player;

LO.Player.prototype.countActivePieces = function() {
  this.activePieces = 0;
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].fieldId > -6) this.activePieces++;
    if (this.dice.value > 0) {
      if (this.pieces[i].fieldId > -6 && this.pieces[i].fieldId < 0 &&
          this.pieces[i].fieldId - this.dice.value < -6) {
        this.activePieces--;
      }
    }
  }
}

LO.Player.prototype.setActive = function(value) {
  if (value == true) {
    this.active = true;
    this.activeMove = false;
    this.lastMoveFieldId = null;
    this.dice.value = 0;
    this.dice.throws = 0;
    this.countActivePieces();
  } else {
    this.active = false;
    this.activeMove = false;
    this.lastMoveFieldId = null;
  }
}

LO.Player.prototype.getTargetFieldId = function(pieceId) {
  var fieldId = this.pieces[pieceId].fieldId, newFieldId,
      startFieldId = this.game.board.specialRegularFields[this.color].start,
      endFieldId = this.game.board.specialRegularFields[this.color].end;

  if (this.dice.value == 6 && fieldId < -6 &&
      this.game.checkFieldBlocked(this.color, startFieldId) == false) {
    return startFieldId;

  } else if (!(fieldId < 0 && fieldId - this.dice.value < -6)) {

    if (fieldId < 0) {
      newFieldId = fieldId - this.dice.value;
    } else {
      newFieldId = fieldId + this.dice.value;
    }

    if (newFieldId >= this.game.board.fieldCoors.regular.length) {
      // new field out of regular fields bounds
      newFieldId = newFieldId - this.game.board.fieldCoors.regular.length;
    }
    if (fieldId >= 0 && fieldId <= endFieldId && newFieldId > endFieldId) {
      // new field in end fields bounds
      newFieldId = 0 - (newFieldId - endFieldId);
      // new field out of end fields bounds
      if (newFieldId < -6) return -101;
    }
    if (this.game.checkFieldBlocked(this.color, newFieldId) == false) return newFieldId;
  }
  return -100;
}

LO.Player.prototype.setBlockFieldStatus = function(fieldId) {
  var blocked = this.game.checkFieldBlocked(this.color, fieldId);
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].fieldId == fieldId) this.pieces[i].block = blocked;
  }
}

LO.Player.prototype.performMove = function(pieceId) {
  if (this.activeMove == true && typeof pieceId == "number") {
    var newFieldId = this.getTargetFieldId(pieceId);
    if (newFieldId <= -100) return newFieldId; // move error
    // valid move
    this.pieces[pieceId].move = [ this.pieces[pieceId].fieldId, newFieldId ];
    this.pieces[pieceId].fieldId = newFieldId;
    this.lastMoveFieldId = this.pieces[pieceId].fieldId;
    this.countActivePieces();
    this.setActive((this.dice.value == 6) ? true : false);
    this.setBlockFieldStatus(this.pieces[pieceId].fieldId);
    return this.pieces[pieceId].fieldId;
  }
  return -102; // error, invalid field selection
}

LO.Player.prototype.checkPiecesMoveable = function() {
  var result = 0;
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.getTargetFieldId(i) > -100) result++;
  }
  return result > 0;
}

LO.Player.prototype.throwDice = function() {
  var validThrow = false;
  if (this.active == true && this.activeMove == false) {
    if (this.game.startRound.active == true && this.dice.throws == 1) {
      // no further throws after initial throw in start round to determine max dice value later
      this.setActive(false);
      return validThrow;
    };
    if ((this.dice.value == 0 && this.dice.throws == 0) ||
        (this.dice.value != 6 && this.activePieces == 0 && this.dice.throws < 3)) {
      this.dice.value = Math.round(Math.random() * 5) + 1;
      validThrow = true;
    }
    this.dice.throws++;
    this.countActivePieces();
    if (this.game.startRound.active == true) return validThrow; // no further actions in start round
    if ((this.activePieces == 0 && this.dice.throws < 4 && this.dice.value == 6) ||
        (this.activePieces > 0 && this.dice.value != 0)) {
      this.activeMove = this.checkPiecesMoveable();
    } else if (this.activePieces == 0 && this.dice.throws == 4) {
      this.setActive(false);
      validThrow = false;
    }
  }
  return validThrow;
}