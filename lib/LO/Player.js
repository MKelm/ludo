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

  // fieldId -1 to -6 for end
  // fieldId -7 to -10 for start
  this.pieces = [
    { fieldId: -10 },
    { fieldId: -9 },
    { fieldId: -8 },
    { fieldId: -7 }
  ];
  this.activePieces = 0;

  this.diceValue = 0;
  this.diceThrowCount = 0;
}

LO.Player.prototype.constructor = LO.Player;

LO.Player.prototype.countActivePieces = function() {
  this.activePieces = 0;
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].fieldId > -6) this.activePieces++;
  }
}

LO.Player.prototype.setActive = function(value) {
  if (value == true) {
    this.active = true;
    this.activeMove = false;
    this.diceValue = 0;
    this.diceThrowCount = 0;
    this.countActivePieces();
  } else {
    this.active = false;
  }
}

LO.Player.prototype.throwDice = function() {
  if (this.activeMove == false) {
    if ((this.diceValue == 0 && this.diceThrowCount == 0) ||
        (this.diceValue != 6 && this.activePieces == 0 && this.diceThrowCount < 3)) {
      this.diceValue = Math.round(Math.random() * 5) + 1;
      this.diceThrowCount++;
      console.log("valid dice throw");
    }
    if (this.activePieces == 0 && this.diceThrowCount < 4 && this.diceValue == 6) {
      this.activeMove = true;
    } else if (this.activePieces == 0 && this.diceThrowCount == 3) {
      this.setActive(false);
    } else if (this.activePieces > 0 && this.diceValue != 0) {
      this.activeMove = true;
    }
  }
}