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

// global object initialization
var lo = lo || {};

$(document).ready(function() {
  global.setTimeout(function() {
    //try {
      lo.keys = [];

      lo.util = new LO.Util();

      lo.version = new LO.Version();
      lo.version.updateHashesFile(); // for maintainer

      lo.userConfig = lo.util.loadJSON('./user/data/config.json');
      lo.intervals = {};
      lo.pixi = new LO.Pixi();

      lo.game = new LO.Game();

      // add/start the pixi renderer
      document.body.appendChild(lo.pixi.renderer.view);
      requestAnimFrame(lo.pixi.animate.curry(lo.pixi));

      lo.pixi.loadAssets(function() { lo.game.start(); });

    //} catch (err) {
      //console.log(err);
    //}
  }, 0.00000001); // use timeout to detect fullscreen size correctly
});
