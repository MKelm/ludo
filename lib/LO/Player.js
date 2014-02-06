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

LO.Player = function(game, color) {

  this.game = game;
  this.color = color;

  this.active = false;
  this.activeMove = false;
  this.lastMoveFieldId = null;

  // fieldId -1 to -6 for end
  // fieldId -7 to -10 for start
  this.pieces = [
    { fieldId: -10, sprite: false, move: [] },
    { fieldId: -9, sprite: false, move: [] },
    { fieldId: -8, sprite: false, move: [] },
    { fieldId: -7, sprite: false, move: [] }
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

LO.Player.prototype.performMove = function(pieceId) {
  if (this.activeMove == true && typeof pieceId == "number") {
    var fieldId = this.pieces[pieceId].fieldId, newFieldId,
        startFieldId = this.game.board.specialRegularFields[this.color].start;

    var startFieldMoveBlocked = false;
    if (this.pieces[pieceId].fieldId - this.dice.value == startFieldId) {
      var targetFieldPieces = 0;
      for (var i = 0; i < 4; i++) {
        if (this.pieces[i].fieldId == this.pieces[pieceId].fieldId) targetFieldPieces++;
      }
      if (targetFieldPieces > 1) startFieldMoveBlocked = true;
    }

    if (this.lastMoveFieldId == startFieldId && this.pieces[pieceId].fieldId != startFieldId &&
        startFieldMoveBlocked == false) {
      return -3; // error, start field blocked
    } else if (startFieldMoveBlocked == false && this.dice.value == 6 &&
               fieldId != startFieldId && this.activePieces < 4 && fieldId >= 0) {
      return -4; // error, invalid piece selection
    } else if (this.dice.value == 6 && fieldId < -6) {
      // start piece move
      this.pieces[pieceId].move = [ this.pieces[pieceId].fieldId, startFieldId ];
      this.pieces[pieceId].fieldId = startFieldId;
      this.countActivePieces();
      this.setActive(true);
      this.lastMoveFieldId = this.pieces[pieceId].fieldId;
      return this.pieces[pieceId].fieldId;
    } else if (this.dice.value > 0 && fieldId >= -6) {
      if (fieldId < 0 && fieldId - this.dice.value < -6) {
        return -2; // error, target field out of bounds
      } else if (fieldId < 0) {
        newFieldId = fieldId - this.dice.value;
      } else {
        newFieldId = fieldId + this.dice.value;
      }

      if (newFieldId >= this.game.board.fieldCoors.regular.length) {
        // new field out of regular fields bounds
        newFieldId = newFieldId - this.game.board.fieldCoors.regular.length;
      }
      if (fieldId >= 0 && fieldId <= this.game.board.specialRegularFields[this.color].end &&
          newFieldId > this.game.board.specialRegularFields[this.color].end) {
        // new field in end fields bounds
        newFieldId = 0 - (newFieldId - this.game.board.specialRegularFields[this.color].end);
      }

      // count pieces on target field
      var targetFieldPieces = 0;
      for (var i = 0; i < 4; i++) {
        if (this.pieces[i].fieldId == newFieldId) targetFieldPieces++;
      }
      if (targetFieldPieces > 1) return -5; // error, target field blocked

      this.pieces[pieceId].move = [ this.pieces[pieceId].fieldId, newFieldId ];
      this.pieces[pieceId].fieldId = newFieldId;
      this.setActive((this.dice.value == 6) ? true : false);
      this.lastMoveFieldId = this.pieces[pieceId].fieldId;
      return newFieldId;
    }
  }
  return -1; // error, another invalid field selection
}

LO.Player.prototype.throwDice = function() {
  var validThrow = false;
  if (this.activeMove == false) {
    if ((this.dice.value == 0 && this.dice.throws == 0) ||
        (this.dice.value != 6 && this.activePieces == 0 && this.dice.throws < 3)) {
      this.dice.value = Math.round(Math.random() * 5) + 1;
      validThrow = true;
    }
    this.dice.throws++;
    this.countActivePieces();
    if (this.activePieces == 0 && this.dice.throws < 4 && this.dice.value == 6) {
      this.activeMove = true;
    } else if (this.activePieces == 0 && this.dice.throws == 4) {
      this.setActive(false);
      if (validThrow == true) validThrow = false;
    } else if (this.activePieces > 0 && this.dice.value != 0) {
      this.activeMove = true;
    }
  }
  return validThrow;
}