
'use strict'

class PayloadGeneratorInterface {

    constructor(args) {
        this.args = args
    }

    generate() {
        throw new Error('not implemented');
    }

}

module.exports = PayloadGeneratorInterface
    