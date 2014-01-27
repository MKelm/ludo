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
  this.fieldCoors = {
    start : {
      green: [ [223, 159], [288, 223], [223, 288], [159, 223] ],
      red: [ [800, 159], [864, 223], [800, 285], [733, 223] ],
      blue: [ [800, 735], [866, 800], [800, 868], [735, 800] ],
      yellow: [ [223, 737], [288, 800], [223, 866], [159, 800] ]
    },
    end : {
      green: [ [126, 512], [190, 512], [254, 512], [318, 512], [382, 512], [452, 512] ],
      red: [ [512, 126], [512, 190], [512, 254], [512, 318], [512, 382], [512, 452] ],
      blue: [ [896, 512], [832, 512], [768, 512], [704, 512], [640, 512], [568, 512] ],
      yellow: [ [512, 896], [512, 832], [512, 768], [512, 704], [512, 640], [512, 568] ]
    },
    regular : [
      [382, 576], [318, 576], [254, 576], [190, 576], [126, 576], [62, 576], // green bottom 0-5
      [62, 512], // green end 6
      [62, 448], [126, 448], [190, 448], [254, 448], [318, 448], [382, 448], // green top 7-12

      [448, 382], [448, 318], [448, 254], [448, 190], [448, 126], [448, 62], // red right 13-18
      [512, 62], // red end 19
      [576, 62], [576, 126], [576, 190], [576, 254], [576, 318], [576, 382], // red left 20-25

      [640, 448], [704, 448], [768, 448], [832, 448], [896, 448], [960, 448], // blue top 26-31
      [960, 512], // blue end 32
      [960, 576], [896, 576], [832, 576], [768, 576], [704, 576], [640, 576], // blue bottom 33-38

      [576, 640], [576, 704], [576, 768], [576, 832], [576, 896], [576, 960], // yellow right 39-44
      [512, 960], // yellow end 45
      [448, 960], [448, 896], [448, 832], [448, 768], [448, 704], [448, 640] // yellow left 46-51
    ]
  };

  this.specialRegularFields = {
    green: { start: 8, end: 6 },
    red: { start: 21, end: 19 },
    blue: { start: 34, end: 32 },
    blue: { start: 47, end: 45 }
  }

}

LO.Board.prototype.constructor = LO.Board;