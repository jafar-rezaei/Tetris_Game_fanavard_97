/** @module */

/**
 *  Interval setting control - Better way to manage setInterval and make it easily to destroy
 */
export default class Interval {

    /**
     * Constructor of interval class - register intervals field here.
     */
    constructor() {
        //to keep a reference to all the intervals
        this.intervals = {};
    }


    /**
     * Create another interval
     * @param usedFunction
     * @param delay
     * @return {number}
     */
    make( usedFunction , delay ) {

        //see explanation after the code
        let newInterval = setInterval.apply(
            window,
            [ usedFunction , delay ].concat( [].slice.call(arguments, 2) )
        );

        this.intervals[ newInterval ] = true;
        return newInterval;
    }

    /**
     * Clear a single interval
     * @param id
     */
    clear( id ) {
        return clearInterval(id);
    }

    /**
     * Clear all intervals
     */
    clearAll() {
        let all = Object.keys( this.intervals ), len = all.length;

        while ( len-- > 0 ) {
            let itemIndex = all.shift();
            clearInterval(parseInt(itemIndex));
            delete this.intervals[itemIndex];
        }
    }
}