const jwt = require('jsonwebtoken');

exports.authentication = async function (req, res) {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(400).send({ status: false, message: "token is not given" })
        token = token.slice(7);


        jwt.verify(token, "Group15", function (err, decodedToken) {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).send({ status: false, message: "invalid token" });
                }

                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({ status: false, message: "you are logged out, login again" });
                } else {
                    return res.send({ msg: err.message });
                }
            } else {
                req.token = decodedToken;
                next();
            }
        });
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}