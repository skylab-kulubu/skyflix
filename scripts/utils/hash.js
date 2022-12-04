const bcrypt = require("bcryptjs");

exports.getHash = async(password) => {
    const hashed = await bcrypt.hash(password, 12);
    return hashed
}   