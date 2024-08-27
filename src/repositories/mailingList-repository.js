const CrudRepository = require('./crud-repository');
const { MailingList } = require('../models');


class MailingListRespository extends CrudRepository {
    constructor() {
        super(MailingList)
    }

}

module.exports = MailingListRespository;