const request = require('supertest');

const healthController = async (req,res) => {
        res.status(200).json({status:"ok"})
}

module.exports = healthController