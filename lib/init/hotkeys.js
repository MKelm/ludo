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

// some hotkey functions

$("html").keyup(function(e){
  if (e.which == 27) { // ESC
    lo.util.quit();
  } else if (e.which == 112) { // F1
    lo.pixi.setFpsCounter(true, lo.pixi);

  } else if (e.which == 113) { // F2
    lo.game.removePlayer();
  } else if (e.which == 114) { // F3
    lo.game.addPlayer();

  } else if (e.which == 116) { // F5
    lo.game.start();
  }
});

// keys handler for more game key events
$("html").keydown(function(e) {
    lo.keys[e.which] = true;
});
$("html").keyup(function(e) {
    delete lo.keys[e.which];
});