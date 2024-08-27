const { User } = require('../models')
const CrudRepository = require('./crud-repository');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async getAll() {
        try {
            const users = await User.find().select('firstName lastName phoneNumber').exec();
            return users
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findById(id).exec();
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email });
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUserByUsername(username) {
        try {
            const user = await User.findOne({ username });
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUserByPhoneNumber(phoneNumber) {
        try {
            const user = await User.findOne({ phoneNumber });
            return user;
        } catch (error) {
            throw error;
        }
    }

    async updateByPhoneNumber(phoneNumber, data) {
        try {
            const response = await this.model.findOneAndUpdate(
                { phoneNumber },
                data,
                {
                    new: true
                }
            );
            return response;
        }
        catch (error) {
            throw error;
        }
    }

}

module.exports = UserRepository;