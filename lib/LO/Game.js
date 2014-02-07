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

LO.Game = function() {
  // use pixi event target to handle display object interaction events
  PIXI.EventTarget.call(this);
  this.fps = -1;

  this.run = false;
  this.lastUpdateTime = null;

  this.display = new LO.Display(this);
  this.display.initialize();

  this.board = new LO.Board(this);

  this.playersAmount = 2;
  this.players = [];

  this.gameOverWindow = null;

  // register interaction event listeners
  this.addEventListener('window-close-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-dice-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-dice-throw-complete', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-piece-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-piece-move-complete', lo.util.getEventListener(this, "handleEvent"));
}

LO.Game.prototype.constructor = LO.Game;

LO.Game.prototype.start = function() {
  if (this.gameOverWindow !== null) {
    this.gameOverWindow.hide();
  }

  this.players = [
    new LO.Player(this, "green"),
    new LO.Player(this, "red")
  ];
  if (this.playersAmount > 2) {
    this.players.push(new LO.Player(this, "yellow"));
  }
  if (this.playersAmount > 3) {
    this.players.push(new LO.Player(this, "blue"));
  }
  this.players[0].active = true;

  this.lastUpdateTime = lo.util.time();
  this.run = true;

  this.display.drawBoard();
  this.display.drawPlayerDices();
  this.display.drawPlayerPieces();
}

LO.Game.prototype.showGameOverWindow = function(winnerColor) {
  this.gameOverWindow = new LO.DisplayWindow(this, 550, 100)
  this.gameOverWindow.handle = "gameover";
  this.gameOverWindow.show();
  this.gameOverWindow.title = "Game over!";
  this.gameOverWindow.drawTitle();
  this.gameOverWindow.drawContentText(
    "Player "+ winnerColor + " wins, press F5 to restart.", 500, 55
  );
}

LO.Game.prototype.addPlayer = function() {
  if (this.playersAmount < 4) this.playersAmount++;
  this.start();
}

LO.Game.prototype.removePlayer = function() {
  if (this.playersAmount > 2) this.playersAmount--;
  this.start();
}

LO.Game.prototype.update = function(scope) {
  var timeDiff = lo.util.time() - scope.lastUpdateTime;
  scope.fps = 1000 / timeDiff;
  // update game elements

  scope.lastUpdateTime = lo.util.time();
}

LO.Game.prototype.handlePlayerPieceCollision = function(playerId, fieldId) {
  var piece, iPiece, fieldIdUsage;
  for (var i = 0; i < this.players.length; i++) {
    if (i != playerId) {
      for (var j = 0; j < this.players[i].pieces.length; j++) {
        piece = this.players[i].pieces[j];
        if (piece.fieldId >= 0 && piece.fieldId == fieldId) {
          // collision, find free start field for affected player
          fieldIdUsage = { "-7": false, "-8": false, "-9": false, "-10": false };
          for (var k = 0; k < this.players[i].pieces.length; k++) {
            if (k != j) {
              iPiece = this.players[i].pieces[k];
              if (typeof fieldIdUsage[iPiece.fieldId] != "undefined" &&
                  fieldIdUsage[iPiece.fieldId] == false)
                fieldIdUsage[iPiece.fieldId] = true;
            }
          }
          for (var k = -7; k > -11; k--) {
            if (fieldIdUsage[k] == false) {
              piece.fieldId = k;
              break;
            }
          }
        }
      }
    }
  }
}

LO.Game.prototype.checkFieldBlocked = function(playerColor, fieldId, getPiecesCount) {
  var playerPiecesCount = 0;
  for (var pI = 0; pI < this.players.length; pI++) {
    if (fieldId >= 0 || this.players[pI].color == playerColor) {
      for (var pJ = 0; pJ < this.players[pI].pieces.length; pJ++) {
        if (this.players[pI].pieces[pJ].fieldId == fieldId) playerPiecesCount++;
      }
    }
  }
  if (getPiecesCount === true) return playerPiecesCount;
  if (fieldId == -6) return false;
  if (fieldId < 0 && fieldId > -6) {
    return (playerPiecesCount == 1) ? true : false; // blocked field in end fields area
  } else {
    return (playerPiecesCount == 2) ? true : false; // blocked field in regular fields area
  }
}

LO.Game.prototype.checkPlayerPieceMoveBlocked = function(playerId, pieceId) {
  var player = this.players[playerId];
  if (player.activeMove == true && typeof pieceId == "number") {
    var currentFieldId = player.pieces[pieceId].fieldId;

    if (currentFieldId < -6 && player.dice.value == 6) {
      // check target field start field
      return this.checkFieldBlocked(player.color, this.board.specialRegularFields[player.color].start);
    } else {
      var blocked = false;
      for (var dI = 0; dI < player.dice.value; dI++) {
        // check target field
        if (dI > 0 && blocked == false && this.checkFieldBlocked(player.color, currentFieldId) == true) blocked = true;
        // determine next field id
        if (currentFieldId == this.board.fieldCoors.regular.length - 1) {
          currentFieldId = 0; // next field at start of regular fields area
        } else if (currentFieldId == this.board.specialRegularFields[player.color].end) {
          currentFieldId = -1; // next field in end fields area
        } else {
          currentFieldId = (currentFieldId < 0) ? currentFieldId - 1 : currentFieldId + 1;
        }
      }
      return blocked;
    }
  }
  return false;
}

LO.Game.prototype.switchPlayer = function(currentPlayerId) {
  if (this.players[currentPlayerId].active == false) {
    var nextPlayerId = -1;
    if (currentPlayerId == this.players.length-1) {
      nextPlayerId = 0;
    } else {
      nextPlayerId = currentPlayerId + 1;
    }
    this.players[nextPlayerId].setActive(true);
  }
}

LO.Game.prototype.handleEvent = function(event) {
  switch (event.type) {
    case "player-piece-click":
      var player = this.players[event.content.playerId];
      if (this.checkPlayerPieceMoveBlocked(event.content.playerId, event.content.pieceId) == false) {
        var newFieldId = player.performMove(event.content.pieceId);
        if (newFieldId > -100) {
          this.display.setPieceMove(event.content.playerId, event.content.pieceId);
        } else {
          this.dispatchEvent({
            type: "player-piece-move-complete", content: event.content
          });
        }
      }
      break;
    case "player-piece-move-complete":
      var player = this.players[event.content.playerId];
      if (player.pieces[event.content.pieceId].fieldId == -6 &&
          this.checkFieldBlocked(player.color, player.pieces[event.content.pieceId].fieldId, true) == 4) {
        this.showGameOverWindow(player.color);
        this.run = false;
      } else {
        this.handlePlayerPieceCollision(
          event.content.playerId,
          player.pieces[event.content.pieceId].fieldId
        );
        this.switchPlayer(event.content.playerId);
      }
      this.display.drawPlayerDices();
      this.display.drawPlayerPieces();
      break;
    case "player-dice-click":
      var player = this.players[event.content.playerId];
      var validThrow = player.throwDice();
      if (validThrow == true) {
        this.display.setDiceThrow(event.content.playerId);
      } else {
        this.dispatchEvent({
          type: "player-dice-throw-complete", content: event.content
        });
      }
      break;
    case "player-dice-throw-complete":
      this.switchPlayer(event.content.playerId);
      this.display.drawPlayerDices();
      this.display.drawPlayerPieces();
      break;
  }
}