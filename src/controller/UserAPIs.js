const UserModel = require('../models/UserModel')

const createUserAPIs = async function (req, res) {
    try{
        const data = req.body
        let savedData = await UserModel.create(data)
        res.status(201).send({status :true, msg:"succesfully run", data: savedData })

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

 const loginUser = function(req,res){
   try{
    const credentials = req.body
    const {email, password} = credentials
    if(Object.keys.length == 0){return res.status(400).send({status: false, message:"Enter your email and password"})}
    if(!email)  {return res.status(400).send({status:false, message: "Enter your email"})}
    if(!password) {return res.status(400).send({status:false, message:"Enter your password"})}
    
    const isValid = UserModel.findOne({email:email, password:password })
    if(isValid == null) {return res.status(400).send({status:false, message:"Invalid credential"})}
    
   }catch (err) {
    res.status(500).send({ status: false, msg: err.message })
}
}
module.exports={createUserAPIs,loginUser}