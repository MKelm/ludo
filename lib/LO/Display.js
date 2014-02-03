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

LO.Display = function(game) {

  this.game = game;
  this.container = null;

  this.playerColors = {
    green: 0x65B848,
    red: 0xE31D27,
    blue: 0x2483DC,
    yellow: 0xFECB02
  };
  this.playerPiecesLayer = null;

  this.playerDicesGfx = null;
  this.playerDicesClickLayer = null;
}

LO.Display.prototype.constructor = LO.Display;

LO.Display.prototype.initialize = function() {
  this.container = new PIXI.DisplayObjectContainer();
  lo.pixi.stage.addChild(this.container);
  this.container.scale = {x: lo.pixi.screen.ratio, y: lo.pixi.screen.ratio};
  this.container.position = {x: lo.pixi.screen.width/2, y: lo.pixi.screen.height/2 };

  var scope = this;
  lo.pixi.resizeCallback = function() { scope.handleResize(); };
}

LO.Display.prototype.handleResize = function() {
  this.container.scale = {x: lo.pixi.screen.ratio, y: lo.pixi.screen.ratio};
  this.container.position = {x: lo.pixi.screen.width/2, y: lo.pixi.screen.height/2 };
}

LO.Display.prototype.drawBoard = function() {
  var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("data/gfx/board.png"));
  sprite.anchor = { x: 0.5, y: 0.5 };
  sprite.position = { x: 0, y: 0 };
  this.container.addChild(sprite);
}

LO.Display.prototype.resetPlayerDicesLayers = function() {
  if (this.playerDicesGfx === null) {
    this.playerDicesGfx = new PIXI.Graphics();
    this.playerDicesGfx.position = { x: -1 * 1024/2, y: -1 * 1024/2 };
    this.container.addChild(this.playerDicesGfx);

  } else {
    this.playerDicesGfx.clear();
    if (this.playerDicesClickLayer !== null)
      this.container.removeChild(this.playerDicesClickLayer);
  }
  this.playerDicesClickLayer = new PIXI.DisplayObjectContainer();
  this.playerDicesClickLayer.position = this.playerDicesGfx.position;
  this.container.addChild(this.playerDicesClickLayer);
}

LO.Display.prototype.drawPlayerDices = function() {
  this.resetPlayerDicesLayers();

  this.playerDicesGfx.beginFill(0xFFFFFF);
  this.playerDicesGfx.lineStyle(3, 0x000000);

  var pI, playerColor, fieldCoor, scope = this, textStyle, textValue, text;
  for (pI = 0; pI < this.game.players.length; pI++) {
    if (this.game.players[pI].active == true) {
      playerColor = this.game.players[pI].color;
      fieldCoor = this.game.board.fieldCoors.dice[playerColor];
      this.playerDicesGfx.drawRect(fieldCoor[0] - 24, fieldCoor[1] - 24, 48, 48);

      textStyle = {font: 32 + "px " + "Arial", fill: "000000"};
      textValue = this.game.players[pI].diceValue > 0 ?
        this.game.players[pI].diceValue : "R";
      text = new PIXI.Text(textValue, textStyle);
      text.position = { x: fieldCoor[0]-text.width/2, y: fieldCoor[1]-text.height/2 };
      this.playerDicesClickLayer.addChild(text);

      var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("data/gfx/blank.png"));
      sprite.anchor = { x: 0.5, y: 0.5 };
      sprite.width = 48;
      sprite.height = 48;
      sprite.position = { x: fieldCoor[0], y: fieldCoor[1] };
      sprite.interactive = true;
      !function(iPlayerId) {
        sprite.click = function(mouse) {
          scope.game.dispatchEvent({
            type: "player-dice-click",
            content: { mouse: mouse, playerId: iPlayerId }
          });
        };
      }(pI);
      this.playerDicesClickLayer.addChild(sprite);
    }
  }

  this.playerDicesGfx.endFill();
  this.playerDicesGfx.lineStyle(0);
}

LO.Display.prototype.resetPlayerPiecesLayers = function() {
  if (this.playerPiecesLayer !== null)
    this.container.removeChild(this.playerPiecesLayer);

  var position = { x: -1 * 1024/2, y: -1 * 1024/2 };

  this.playerPiecesLayer = new PIXI.DisplayObjectContainer();
  this.playerPiecesLayer.position = position;
  this.container.addChild(this.playerPiecesLayer);
}

LO.Display.prototype.drawPlayerPieces = function() {
  this.resetPlayerPiecesLayers();

  var pI, pJ, piece, playerColor, fieldId, fieldCoor, scope = this, interactive,
      checkBlockFieldIds = [], blockField = false;

  // check for field with two pieces as block field
  for (pI = 0; pI < this.game.players.length; pI++) {
    for (pJ = 0; pJ < this.game.players[pI].pieces.length; pJ++) {
      piece = this.game.players[pI].pieces[pJ];
      if (piece.fieldId >= 0) {
        if (typeof checkBlockFieldIds[piece.fieldId] == "undefined") {
          checkBlockFieldIds[piece.fieldId] = -1;
        } else {
          checkBlockFieldIds[piece.fieldId] = 0;
        }
      }
    }
  }
  for (pI = 0; pI < checkBlockFieldIds.length; pI++) {
    if (checkBlockFieldIds[pI] === -1) {
      delete checkBlockFieldIds[pI];
    }
  }

  for (pI = 0; pI < this.game.players.length; pI++) {
    for (pJ = 0; pJ < this.game.players[pI].pieces.length; pJ++) {
      piece = this.game.players[pI].pieces[pJ];
      playerColor = this.game.players[pI].color;

      blockField = false, ignoreField = false;
      if (typeof checkBlockFieldIds[piece.fieldId] != "undefined") {
        if (checkBlockFieldIds[piece.fieldId] === 0) {
          checkBlockFieldIds[piece.fieldId] = 1;
          ignoreField = true;
        } else if (checkBlockFieldIds[piece.fieldId] === 1) {
          blockField = true;
        }
      }

      interactive = true;
      if (piece.fieldId < -6) {
        // 4 start fields (-7 to -10)
        var fieldId = Math.abs(piece.fieldId + 7),
            fieldCoor = this.game.board.fieldCoors.start[playerColor][fieldId];
      } else if (piece.fieldId < 0) {
        // 6 end fields (-1 to -6)
        var fieldId = Math.abs(piece.fieldId + 1),
            fieldCoor = this.game.board.fieldCoors.end[playerColor][fieldId];
        if (fieldId == 5) interactive = false;
      } else {
        // regular field
        var fieldId = piece.fieldId,
            fieldCoor = this.game.board.fieldCoors.regular[fieldId];
      }

      if (ignoreField == false) {
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(
          "data/gfx/piece_"+ playerColor + ((blockField == true) ? "_block" : "") + ".png"
        ));
        sprite.anchor = { x: 0.5, y: 0.5 };
        sprite.width = 30;
        sprite.height = 30;
        sprite.position = { x: fieldCoor[0], y: fieldCoor[1] };

        if (interactive == true) {
          sprite.interactive = true;
          !function(iPlayerId, iPieceId) {
            sprite.click = function(mouse) {
              scope.game.dispatchEvent({
                type: "player-piece-click",
                content: { mouse: mouse, playerId: iPlayerId, pieceId: iPieceId }
              });
            };
          }(pI, pJ);
        }

        this.playerPiecesLayer.addChild(sprite);
      }
    }
  }
}