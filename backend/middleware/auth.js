import jwt from "jsonwebtoken";

const verifyToken=async(req,res,next)=>{
    let token=req.headers["authorization"]

    if(token){
        token=token.split(" ")[1]
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                return res.status(400).json({message:"Invalid token"})
            }
            else{
                console.log(decoded)
                req.user=decoded
                next(); // Call next only if token is valid
            }
        })
    }
    else{
        return res.status(400).json({message:"Invalid token"})
    }
}
export default verifyToken;