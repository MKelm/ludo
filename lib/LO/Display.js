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