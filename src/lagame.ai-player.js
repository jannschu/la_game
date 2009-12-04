/*
 * This file is part of La Game.
 * Copyright 2009 Shahriar Heidrich and Jannik Schürg
 * 
 * La Game is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * La Game is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with La Game.  If not, see <http://www.gnu.org/licenses/>. 
 */

/*
 * THE PLAN:

0.) increase count variable
1.) get all possible L and N positions
2.) map those to L pieces
3.) create hash and store it somewhere
4.) compare this hash to any hashes so far; if it's equal, stop the current
    branch of execution
5.) if the situation means win, return "win"
6.) if the situation means fail, return "fail"

 * :NALP EHT
 */
