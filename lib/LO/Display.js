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
  this.boardSprite = null;

  this.playerColors = {
    green: 0x65B848,
    red: 0xE31D27,
    blue: 0x2483DC,
    yellow: 0xFECB02
  };

  this.playerPiecesLayer = null;
  this.playerDicesLayer = null;
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
  if (this.boardSprite !== null) this.container.removeChild(this.boardSprite);
  var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame("data/gfx/board.png"));
  sprite.anchor = { x: 0.5, y: 0.5 };
  sprite.position = { x: 0, y: 0 };
  this.container.addChild(sprite);
  this.boardSprite = sprite;
}

LO.Display.prototype.resetPlayerDicesLayer = function() {
  if (this.playerDicesLayer !== null)
    this.container.removeChild(this.playerDicesLayer);

  this.playerDicesLayer = new PIXI.DisplayObjectContainer();
  this.playerDicesLayer.position =  { x: -1 * 1024/2, y: -1 * 1024/2 };
  this.container.addChild(this.playerDicesLayer);
}

LO.Display.prototype.setDiceThrow = function(playerId) {
  var playerDice = this.game.players[playerId].dice, scope = this;

  if (playerDice.value > 0 && typeof playerDice.sprite == "object") {
    playerDice.sprite.setTexture(PIXI.Texture.fromFrame("data/gfx/dice_throw.png"));
    if (typeof playerDice.text == "object") {
      this.playerDicesLayer.removeChild(playerDice.text);
      playerDice.text = false;
    }
    new TWEEN.Tween( { y: 0 } )
      .to(
        { y: Math.radians(360) }, 500
      )
      .onUpdate( function() {
        playerDice.sprite.rotation = this.y;
        if (typeof playerDice.text == "object") playerDice.text.rotation = this.y;
      })
      .onComplete( function() {
        scope.game.dispatchEvent({
          type: "player-dice-throw-complete", content: { playerId: playerId }
        });
      })
      .start();
  }
}

LO.Display.prototype.drawPlayerDices = function() {
  this.resetPlayerDicesLayer();

  if (this.game.run == true) {
    var pI, playerColor, fieldCoor, scope = this, diceValue, textStyle, text;
    for (pI = 0; pI < this.game.players.length; pI++) {
      if (this.game.players[pI].active == true) {

        playerColor = this.game.players[pI].color;
        fieldCoor = this.game.board.fieldCoors.dice[playerColor];
        diceValue = this.game.players[pI].dice.value > 0 ? this.game.players[pI].dice.value : 0;

        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(
          "data/gfx/dice_"+ ( (diceValue > 0) ? "blank" : "throw" ) +".png"
        ));
        sprite.anchor = { x: 0.5, y: 0.5 };
        sprite.width = 51;
        sprite.height = 51;
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
        this.playerDicesLayer.addChild(sprite);
        this.game.players[pI].dice.sprite = sprite;

        if (diceValue > 0) {
          textStyle = {font: "bold 32px Arial", fill: "000000"};
          text = new PIXI.Text(diceValue, textStyle);
          text.anchor = { x: 0.5, y: 0.5 };
          text.position = { x: fieldCoor[0], y: fieldCoor[1] };
          this.playerDicesLayer.addChild(text);
        } else {
          text = false;
        }
        this.game.players[pI].dice.text = text;
      }
    }
  }
}

LO.Display.prototype.setPieceMove = function(playerId, pieceId) {
  var player = this.game.players[playerId], piece = player.pieces[pieceId], scope = this;

  if (piece.move.length == 2 && typeof piece.sprite == "object") {
    piece.sprite.setTexture(PIXI.Texture.fromFrame("data/gfx/piece_"+player.color+".png"));

    if (piece.fieldId < -6) {
      // 4 start fields (-7 to -10)
      var fieldId = Math.abs(piece.fieldId + 7),
          fieldCoor = this.game.board.fieldCoors.start[player.color][fieldId];
    } else if (piece.fieldId < 0) {
      // 6 end fields (-1 to -6)
      var fieldId = Math.abs(piece.fieldId + 1),
          fieldCoor = this.game.board.fieldCoors.end[player.color][fieldId];
    } else {
      // regular field
      var fieldId = piece.fieldId,
          fieldCoor = this.game.board.fieldCoors.regular[fieldId];
    }

    var distance = Math.sqrt(
      Math.pow(piece.sprite.position.x - fieldCoor[0], 2) +
      Math.pow(piece.sprite.position.y - fieldCoor[1], 2)
    );

    new TWEEN.Tween( { x: piece.sprite.position.x, y: piece.sprite.position.y } )
      .to(
        { x: fieldCoor[0], y: fieldCoor[1] }, 200 * (distance / 100)
      )
      .onUpdate( function() {
        piece.sprite.position.x = this.x;
        piece.sprite.position.y = this.y;
      })
      .onComplete( function() {
        scope.game.dispatchEvent({
          type: "player-piece-move-complete", content: { playerId: playerId, pieceId: pieceId }
        });
      })
      .start();
  }
}

LO.Display.prototype.resetPlayerPiecesLayer = function() {
  if (this.playerPiecesLayer !== null)
    this.container.removeChild(this.playerPiecesLayer);

  this.playerPiecesLayer = new PIXI.DisplayObjectContainer();
  this.playerPiecesLayer.position = { x: -1 * 1024/2, y: -1 * 1024/2 };
  this.container.addChild(this.playerPiecesLayer);
}

LO.Display.prototype.drawPlayerPieces = function() {
  this.resetPlayerPiecesLayer();

  if (this.game.run == true) {
    var pI, pJ, piece, interactive, checkBlockFieldIds = [], blockPiece = false;

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
        interactive = this.game.players[pI].active;

        piece = this.game.players[pI].pieces[pJ];
        blockPiece = false;
        if (typeof checkBlockFieldIds[piece.fieldId] != "undefined") {
          if (checkBlockFieldIds[piece.fieldId] === 0) {
            checkBlockFieldIds[piece.fieldId] = 1;
            interactive = false;
          } else if (checkBlockFieldIds[piece.fieldId] === 1) {
            blockPiece = true;
          }
        }
        this.drawPlayerPiece(pI, pJ, interactive, blockPiece);
      }
    }
  }
}

LO.Display.prototype.drawPlayerPiece = function(playerId, pieceId, interactive, blockPiece) {
  var piece = this.game.players[playerId].pieces[pieceId],
      playerColor = this.game.players[playerId].color, scope = this;

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

  var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(
    "data/gfx/piece_"+ playerColor + ((blockPiece == true) ? "_block" : "") + ".png"
  ));
  sprite.anchor = { x: 0.5, y: 0.5 };
  sprite.width = 30;
  sprite.height = 30;
  sprite.position = { x: fieldCoor[0], y: fieldCoor[1] };

  if (interactive == true) {
    sprite.interactive = true;
    sprite.click = function(mouse) {
      scope.game.dispatchEvent({
        type: "player-piece-click",
        content: { mouse: mouse, playerId: playerId, pieceId: pieceId }
      });
    };
  }

  this.playerPiecesLayer.addChild(sprite);
  this.game.players[playerId].pieces[pieceId].sprite = sprite;
}