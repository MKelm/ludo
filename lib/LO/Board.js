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

LO.Board = function(game) {

  this.game = game;
  this.fields = {
    start : {
      green: [ [223, 159], [288, 223], [223, 288], [159, 223] ],
      red: [ [800, 159], [864, 223], [800, 285], [733, 223] ],
      blue: [ [800, 735], [866, 800], [800, 868], [735, 800] ],
      yellow: [ [223, 737], [288, 800], [223, 866], [159, 800] ]
    },
    end : {
      green: [],
      red: [],
      blue: [],
      yellow: []
    }
  };

}

LO.Board.prototype.constructor = LO.Board;