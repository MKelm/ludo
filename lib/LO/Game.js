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

  this.players = [
    new LO.Player(this, "green"),
    new LO.Player(this, "red"),
    new LO.Player(this, "blue"),
    new LO.Player(this, "yellow")
  ];

  this.welcomeWindow = null;

  // register interaction event listeners
  this.addEventListener('window-close-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-dice-click', lo.util.getEventListener(this, "handleEvent"));
  this.addEventListener('player-piece-click', lo.util.getEventListener(this, "handleEvent"));
}

LO.Game.prototype.constructor = LO.Game;

LO.Game.prototype.start = function() {
  this.players[0].active = true;

  this.display.drawBoard();
  this.display.drawPlayerPieces();
  this.display.drawPlayerDices();

  //this.showWelcomeWindow();
}

LO.Game.prototype.showWelcomeWindow = function() {
  this.welcomeWindow = new LO.DisplayWindow(this, 550, 100)
  this.welcomeWindow.handle = "welcome";
  this.welcomeWindow.show();
  this.welcomeWindow.drawCloseButton();
  this.welcomeWindow.drawContentText(
    "Welcome to Ludo!", 500, 20
  );
}

LO.Game.prototype.update = function(scope) {
  var timeDiff = lo.util.time() - scope.lastUpdateTime;
  scope.fps = 1000 / timeDiff;
  // update game elements

  scope.lastUpdateTime = lo.util.time();
}

LO.Game.prototype.setNextPlayerActive = function(currentPlayerId) {
  var nextPlayerId = -1;
  if (currentPlayerId == this.players.length-1) {
    nextPlayerId = 0;
  } else {
    nextPlayerId = currentPlayerId + 1;
  }
  this.players[nextPlayerId].setActive(true);
}

LO.Game.prototype.handleEvent = function(scope, event) {
  switch (event.type) {
    case "window-close-click":
      if (event.content.window == "welcome") {
        scope.welcomeWindow.hide();
        // start game process
        scope.lastUpdateTime = lo.util.time();
        scope.run = true;
      }
      break;
    case "player-piece-click":
      if (scope.players[event.content.playerId].activeMove == true) {
        console.log("valid piece selection");
      }
      break;
    case "player-dice-click":
      var validDice = scope.players[event.content.playerId].throwDice();
      if (scope.players[event.content.playerId].active == false)
        scope.setNextPlayerActive(event.content.playerId);
      scope.display.drawPlayerDices();
      break;
  }
}