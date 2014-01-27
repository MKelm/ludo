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
  this.playerPiecesGfx = null;
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

LO.Display.prototype.drawPlayerPieces = function() {
  if (this.playerPiecesGfx === null) {
    this.playerPiecesGfx = new PIXI.Graphics();
    this.playerPiecesGfx.position = { x: -1 * 1024/2, y: -1 * 1024/2 };
    this.container.addChild(this.playerPiecesGfx);
  } else {
    this.playerPiecesGfx.clear();
  }

  var pI, pJ, piece, fieldId, fieldCoor;
  for (pI in this.game.players) {
    for (pJ = 0; pJ < this.game.players[pI].pieces.length; pJ++) {
      piece = this.game.players[pI].pieces[pJ];
      if (piece.fieldId < -6) {
        // 4 start fields (-7 to -10)
        var fieldId = Math.abs(piece.fieldId + 7),
            fieldCoor = this.game.board.fieldCoors.start[pI][fieldId];
      } else if (piece.fieldId < 0) {
        // 6 end fields (-1 to -6)
        var fieldId = Math.abs(piece.fieldId + 1),
            fieldCoor = this.game.board.fieldCoors.end[pI][fieldId];
      } else {
        // regular field
        var fieldId = piece.fieldId,
            fieldCoor = this.game.board.fieldCoors.regular[fieldId];
      }

      this.playerPiecesGfx.beginFill(0x000000);
      this.playerPiecesGfx.drawCircle(fieldCoor[0], fieldCoor[1], 15);

      this.playerPiecesGfx.beginFill(this.playerColors[pI]);
      this.playerPiecesGfx.drawCircle(fieldCoor[0], fieldCoor[1], 12);

      this.playerPiecesGfx.beginFill(0xFFFFFF);
      this.playerPiecesGfx.drawCircle(fieldCoor[0], fieldCoor[1], 5);

      this.playerPiecesGfx.endFill();
    }
  }
}