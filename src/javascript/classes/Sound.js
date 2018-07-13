/**
 * @module
 */

/**
 * Sound
 * @class Sound Manager - Main class to add and manage game sounds
 */
export default class Sound {

    /**
     * Plays the current instance of media
     * @param instance
     * @return {Sound}
     */
    static play(instance){
        if(instance !== undefined || this.audio) {
            if(!instance){
                instance = this.audio;
            }
            instance.pause();
            instance.currentTime = 0;
            let noPromise = {
                catch : new Function()
            };
            (instance.play() || noPromise).catch(() => {});
        }
        return instance;
    }


    /**
     * Create instance correct name
     * @param key
     * @return {string}
     * @private
     */
    static _makeInstanceName(key){
        return key + "Instance";
    }


    /**
     * Make singleton design pattern to getv only one innstance of class.
     * @param key
     * @return {*}
     * @private
     */
    static _getInstance(key){
        let instanceName = this._makeInstanceName(key);
        return this[instanceName];
    }


    /**
     * Set instance
     * @param key
     * @param instance
     * @private
     */
    static _setInstance(key, instance){
        let instanceName = this._makeInstanceName(key);
        this[instanceName] = instance;
    }


    /**
     * Play sound based on it's name
     * @param key
     * @param canPlay
     * @return Audio
     */
    static playByKey(key , canPlay){

        if(!canPlay){
            return false;
        }

        let audioInstance;
        if(!(audioInstance = Sound._getInstance(key))) {
            audioInstance = new Audio('assets/mp3/' + key + '.mp3');
            Sound._setInstance(key , audioInstance);
        }

        this.play(audioInstance);

        return audioInstance;

    }
}
