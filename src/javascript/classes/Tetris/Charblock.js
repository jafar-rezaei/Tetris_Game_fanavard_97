/**
 * @module
 */

import TetrisGame from './TetrisGame';
import Gameplay from './Gameplay';
import Sound from '../Sound';
import WordsHelper from './WordsHelper';
import MaterialColor from '../MaterialColor';
import Timeout from '../Timeout';
import Helper from '../Helper';
import Explosion from '../Explosion';
import Animate from './Animate';
import Interval from "../Interval";

/**
 * @class Charblock make easier our life on manage characters block
 */
export default class Charblock {
	/**
	 * Create new char block
	 * @return {boolean}
	 */
	static create() {
		const initValues = TetrisGame.initValues;

		// if game is finished
		if (initValues.finished) {
			initValues.upComingCharEl.innerHTML = '';
			return false;
		}


		this.column = Math.random() * initValues.validatedColumnsCount << 0;
		this.row = 0; // top is 0 and bottom is max
		this.char = initValues.nextChar === '' ? WordsHelper.chooseChar() : initValues.nextChar;


		// is character special ?
		if (typeof this.char === 'object' && this.char.special === 'true') {
			this.type = this.char.type;
			this.typeSize = this.char.typeSize;
			Helper.log(`Special: ${this.type}`);
		} else {
			this.type = 'regualar';
			this.color = MaterialColor.getRandomColor(); // random material color
		}

		this.element = null; // holds our character element


		// interval
		if (!this.interval) {
			const intervalData = this.getInterval();
			this.interval = TetrisGame.interval.make(
				intervalData.fn,
				intervalData.delay
			);
		}


		// create and show up coming char
		this._showUpComingChar();

		// add this char as active char
		initValues.activeChar = this;

		return this;
	}


	/**
	 * Factory of character
	 * @param charblock
	 * @param initializeElement
	 */
	static factory(charblock, initializeElement) {
		// if char is not supplied create new one
		if (typeof charblock === 'undefined') {
			charblock = Charblock.create();

			if (Object.keys(charblock).length !== 0) {
				initializeElement = Charblock._getEl(charblock.row, charblock.column);
			} else {
				return false;
			}
		}

		const charBlockEl = document.createElement('span');
		const animateClass = TetrisGame.config.useAnimationFlag ? ' animated ' : '';
		let plusCharBlockClass = '';

		if (charblock.type === 'regualar') {
			charBlockEl.style.background = charblock.color;
			charBlockEl.innerHTML = charblock.char;
		} else {
			if (charblock.type === 'bomb') {

				plusCharBlockClass = 'bombBlock animated';
				charBlockEl.style.background = 'transparent';
				charBlockEl.dataset.size = charblock.typeSize;

			} else if (charblock.type === 'skull') {

				// set skull styling class
				plusCharBlockClass = 'skullBlock animated';
				charBlockEl.style.background = '#000';

				// Register click listener on skullBlock
				Charblock._registerSkullClick(charBlockEl);

			} else if (charblock.type === 'star') {
				plusCharBlockClass = 'starBlock animated';
				charBlockEl.style.background = MaterialColor.getRandomColor();
			}

			charBlockEl.appendChild(charblock.char);
		}

		charBlockEl.className = `charBlock ${plusCharBlockClass} ${animateClass}${charblock.animateInClass || ''}`;

		charblock.element = charBlockEl;

		initializeElement.innerHTML = '';
		initializeElement.appendChild(charBlockEl);
	}


	/**
	 * Move char block
	 * @param eventKeyCode
	 * @param position
	 * @return {boolean}
	 */
	static move(eventKeyCode, position) {
		const initValues = TetrisGame.initValues;
		const config = TetrisGame.config;
		const isBottomMove = TetrisGame.controlCodes.DOWN === eventKeyCode;

		let moveTo;


		// user could not move skull
		if (!this.element.classList.contains('skullBlock')) {
			moveTo = Charblock._generateMove(eventKeyCode);
		} else if (isBottomMove) {
			moveTo = Charblock._generateMove(eventKeyCode);
		}


		// if move to is out of range
		if (!moveTo || moveTo.column >= initValues.validatedColumnsCount || moveTo.column < 0 || initValues.finished) {
			return false;
		}

		const destinationEl = Charblock._getEl(moveTo.row, moveTo.column) || null;
		if (moveTo.row >= config.rows || (destinationEl.innerHTML.trim() !== '')) {
			if (isBottomMove) {
				// remove styles of coming special char
				this.element.classList.remove('skullBlock', 'bombBlock', 'starBlock');

				// Remove onclick if element reached bottom
				this.element.removeEventListener('click', Charblock._skullClick, true);
				this.element.removeEventListener('touchstart', Charblock._skullClick, true);

				// check words
				TetrisGame.checkWordSuccess(this);

				if (this.row !== 0) {
					if (initValues.wordsFinished) {
						Gameplay.finish('finishWords');
					} else {
						// add new char
						Charblock.factory();
					}
				} else {

					// if we arrived to top of the page
					if(TetrisGame.initValues.activeChar.type !== 'bomb') {
						Gameplay.finish('gameOver');
					}
				}
			}
		} else {
			// remove char with animation
			Charblock._destroy(this.element, moveTo.animateOutClass);

			// update current char info
			this.row = moveTo.row;
			this.column = moveTo.column;
			this.animateInClass = moveTo.animateInClass;

			// add our char in destination
			Charblock.factory(this, destinationEl);
		}

		// play move char
		Sound.playByKey('moveChar', config.playEventsSound);
	}


	/**
	 * Get interval used data
	 * @return {{fn: function(), delay: number}}
	 */
	static getInterval() {
		const config = TetrisGame.config;

		return {
			fn: () => {
				if (!TetrisGame.initValues.paused) {
					Charblock.move(40);
				}
			},
			delay: (config.charSpeed / config.level)
		};
	}



	/**
	 * Get charBlock position and width in page
	 * @param row
	 * @param column
	 * @return {{top: number, left: number, width: number}}
	 */
	static getBlockPosition(row, column) {
		const blockElement = this._getEl(row, column);
		return {
			top: blockElement.offsetTop,
			left: blockElement.offsetLeft,
			width: blockElement.offsetWidth
		};
	}


	/**
	 * Gets an element from cache or create it
	 * @param row
	 * @param column
	 * @param charBlock
	 * @return {*}
	 */
	static _getEl(row, column, charBlock) {
		let charBlockString = '';
		if (typeof charBlock !== 'undefined' && charBlock) {
			charBlockString = ' .charBlock';
		}

		const cachedRow = TetrisGame.initValues.cachedRows[row] || false;
		if (Object.keys(cachedRow) > 0) {
			return Helper._(`.column_${column}${charBlockString}`, TetrisGame.initValues.cachedRows[row]);
		} else {
			const rowElement = Helper._(`.row_${row}`, TetrisGame.playBoard);
			if (rowElement) {
				TetrisGame.initValues.cachedRows[row] = rowElement;
				return Helper._(`.column_${column}${charBlockString}`, rowElement);
			} else {
				return null;
			}
		}
	}


	/**
	 * Generate charBlock movement
	 * @param keyCode
	 * @return {*}
	 * @private
	 */
	static _generateMove(keyCode) {
		let moveTo;
		const row = this.row;
		const column = this.column;

		switch (keyCode) {
		case TetrisGame.controlCodes.LEFT: // left
			moveTo = {
				row,
				column: column + 1,
				animateOutClass: (window.lang.rtl ? 'fadeOutLeft' : 'fadeOutRight'),
				animateInClass: (window.lang.rtl ? 'fadeInRight' : 'fadeInLeft')
			};
			break;
		case TetrisGame.controlCodes.RIGHT: // right
			moveTo = {
				row,
				column: column - 1,
				animateOutClass: (window.lang.rtl ? 'fadeOutRight' : 'fadeOutLeft'),
				animateInClass: (window.lang.rtl ? 'fadeInLeft' : 'fadeInRight')
			};
			break;
		case TetrisGame.controlCodes.DOWN: // down
			moveTo = {
				row: row + 1,
				column,
				animateOutClass: 'fadeOutDown',
				animateInClass: 'fadeInDown'
			};
			break;
		default:
			return false;
		}

		return moveTo;
	}


	/**
	 * Create and show upcoming character
	 * @private
	 */
	static _showUpComingChar() {
		const initValues = TetrisGame.initValues;

		initValues.nextChar = WordsHelper.chooseChar();

		const upComingCharHolder = initValues.upComingCharEl;
		const upcomingCharEl = document.createElement('span');
		const animateClass = TetrisGame.config.useAnimationFlag ? ' animated bounceIn' : '';

		upComingCharHolder.innerHTML = '';
		upcomingCharEl.className = animateClass;

		if (typeof initValues.nextChar === 'object') {
			upcomingCharEl.appendChild(initValues.nextChar);
		} else {
			upcomingCharEl.innerHTML = initValues.nextChar || '';
		}

		upComingCharHolder.appendChild(upcomingCharEl);
	}


	/**
	 * Destroy char block
	 * @param workingElement
	 * @param outgoingAnimation
	 * @private
	 */
	static _destroy(workingElement, outgoingAnimation) {
		const config = TetrisGame.config;
		const animateClass = config.useAnimationFlag ? ' animated ' : '';

		workingElement.className += animateClass + outgoingAnimation;
		Timeout.request(
			() => {
				// remove current char
				if (workingElement.parentNode) {
					workingElement.parentNode.removeChild(workingElement);
				}
			},
			(config.useAnimationFlag ? 200 / config.level : 0)
		);
	}


	/**
	 * Register click ability on skull charBlock
	 * @param charBlockEl
	 * @private
	 */
	static _registerSkullClick(charBlockEl) {
		charBlockEl.addEventListener('click', Charblock._skullClick, true);
		charBlockEl.addEventListener('touchstart', Charblock._skullClick, true);
	}


	/**
	 * Fire skull click event
	 * @param event
	 */
	static _skullClick(event) {
		const charBlockEl = event.target.closest('.charBlock');
		if (!charBlockEl) return;
		if (!TetrisGame.initValues.paused) {
			const skullCharacter = charBlockEl.childNodes[0];

			if (skullCharacter) {
				const remainingClicks = Helper.int(skullCharacter.dataset.clicks) - 1;
				skullCharacter.dataset.clicks = remainingClicks.toString();

				if (remainingClicks === 0) {
					const YX = Helper.getYX(skullCharacter);

					// explode skull charBlock
					Explosion.explode(skullCharacter, YX.x, YX.y);
					Animate.fallNodeAnimate(YX.y, YX.x, null, null);

					TetrisGame.initValues.paused = true;

					// get new charBlock
					Timeout.request(
						() => {
							TetrisGame.initValues.paused = false;
							Charblock.factory();
						}, 500
					);

				}
			}
		}
	}
}
