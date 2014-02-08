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

  this.run = false;
  this.startRound = { active: true, players: [] };

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
  this.addEventListener('player-cpu-turn', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-piece-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-piece-move-complete', lo.util.getEventListener(this, "handleEvent"));
}

LO.Game.prototype.constructor = LO.Game;

LO.Game.prototype.start = function() {
  if (this.gameOverWindow !== null) {
    this.gameOverWindow.hide();
  }

  this.players = [
    new LO.Player(this, "green", false),
    new LO.Player(this, "red", true)
  ];
  if (this.playersAmount > 2) {
    this.players.push(new LO.Player(this, "yellow", true));
  }
  if (this.playersAmount > 3) {
    this.players.push(new LO.Player(this, "blue", true));
  }
  this.players[0].active = true;

  for (var i = 0; i < this.players.length; i++) {
    this.startRound.players[i] = true;
  }

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

LO.Game.prototype.checkFieldBlocked = function(playerColor, fieldId, resultType) {
  var playerPieceIds = [];
  for (var pI = 0; pI < this.players.length; pI++) {
    if (fieldId >= 0 || this.players[pI].color == playerColor) {
      for (var pJ = 0; pJ < this.players[pI].pieces.length; pJ++) {
        if (this.players[pI].pieces[pJ].fieldId == fieldId) {
          playerPieceIds.push([pI, pJ]);
        }
      }
    }
  }
  if (resultType === "count") return playerPieceIds.length;
  if (resultType === "ids") return playerPieceIds;
  if (fieldId == -6) return false;
  if (fieldId < 0 && fieldId > -6) {
    return (playerPieceIds.length == 1) ? true : false; // blocked field in end fields area
  } else {
    return (playerPieceIds.length == 2) ? true : false; // blocked field in regular fields area
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
        } else if (currentFieldId >= 0) {
          currentFieldId = currentFieldId + 1;
        } else if (currentFieldId < 0 && currentFieldId > -6) {
          currentFieldId = currentFieldId - 1;
        } else if (currentFieldId < -6) {
          blocked = true; // field out of end bound
          break;
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
      // first player after last player in list
      nextPlayerId = 0;
      // or handle end of start round or repeat start round
      if (this.startRound.active == true) {
        var maxDiceValue = 0;
        for (var i = 0; i < this.startRound.players.length; i++) {
          if (this.startRound.players[i] == true && this.players[i].dice.value > maxDiceValue) {
            maxDiceValue = this.players[i].dice.value;
            nextPlayerId = i;
          }
        }
        var winners = 0;
        for (var i = 0; i < this.startRound.players.length; i++) {
          if (this.startRound.players[i] == true && this.players[i].dice.value == maxDiceValue) {
            if (winners == 0) nextPlayerId = i;
            winners++;
          } else {
            this.startRound.players[i] = false;
          }
        }
        if (winners == 1) this.startRound.active = false;
      }
    } else if (this.startRound.active == true) {
      // or get next player in current start round, depends on active players in start round
      for (var i = currentPlayerId + 1; i < this.startRound.players.length; i++) {
        if (this.startRound.players[i] == true) {
          nextPlayerId = i;
          break;
        }
      }
      if (nextPlayerId == -1) {
        // start round end if no more active players in start round
        this.switchPlayer(this.startRound.players.length-1);
        return;
      }
    } else {
      // regular move to next player in list
      nextPlayerId = currentPlayerId + 1;
    }
    this.players[nextPlayerId].setActive(true);
    if (this.players[nextPlayerId].cpu == true) {
      this.dispatchEvent({
        type: "player-cpu-turn", content: { playerId: nextPlayerId }
      });
    }
  } else if (this.players[currentPlayerId].cpu == true) {
    this.dispatchEvent({
      type: "player-cpu-turn", content: { playerId: currentPlayerId }
    });
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
          this.checkFieldBlocked(player.color, player.pieces[event.content.pieceId].fieldId, "count") == 4) {
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
    case "player-cpu-turn":
      var scope = this, playerId = event.content.playerId, player = this.players[playerId];
      global.setTimeout(function() {
        console.log("cpu turn", event.content.playerId);

        if (player.active == true) {
          if (player.activeMove == false) {
            // throw dice if possible
            scope.dispatchEvent({
              type: "player-dice-click", content: { playerId: event.content.playerId }
            });

          } else {
            // get piece to move, simple logic
            var piecesStart = [], piecesRegular = [], piecesEnd = [], selectedPieceId = -1;
            for (var i = 0; i < player.pieces.length; i++) {
              if (scope.checkPlayerPieceMoveBlocked(playerId, i) == false) {
                if (player.pieces[i].fieldId < -6) {
                  piecesStart.push(i);
                } else if (player.pieces[i].fieldId < 0) {
                  piecesEnd.push(i);
                } else {
                  piecesRegular.push(i);
                }
              }
            }
            console.log("pieces", piecesStart, piecesRegular, piecesEnd);
            if (piecesStart.length > 0) {
              selectedPieceId = piecesStart[Math.round(Math.random() * (piecesStart.length-1))];
            } else if (piecesRegular.length > 0) {
              selectedPieceId = piecesRegular[Math.round(Math.random() * (piecesRegular.length-1))];
            } else if (piecesEnd.length > 0) {
              selectedPieceId = piecesEnd[Math.round(Math.random() * (piecesEnd.length-1))];
            }
            if (selectedPieceId > -1) {
              console.log("piece id", selectedPieceId);
              scope.dispatchEvent({
                type: "player-piece-click",
                content: { playerId: playerId, pieceId: selectedPieceId }
              });
            } else {
              player.setActive(false);
              scope.dispatchEvent({
                type: "player-dice-click", content: { playerId: playerId }
              });
            }
          }
        }
      }, 500); // short delay before action, wait for display update
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
      var newId = this.switchPlayer(event.content.playerId);
      this.display.drawPlayerDices();
      this.display.drawPlayerPieces();
      break;
  }
}