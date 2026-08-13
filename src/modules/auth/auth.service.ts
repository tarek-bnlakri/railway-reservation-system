import { authRepository } from "./auth.repository.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string;
 
export const authService={

    register:async(name:string, email:string, password:string)=>{
        const existing = await authRepository.findUserByemail(email);
        if(existing){
            throw new Error("EMAIL_ALREADY_EXIST");
        }
        const password_hash = await bcrypt.hash(password,10);
        const user = await authRepository.creatUser({name,email,password_hash});
        return {id:user.id,name:user.name,email:user.email}

    },
    login:async(email:string,password:string)=>{
        const user = await authRepository.findUserByemail(email);
        if(!user)
            throw new Error("INVALIDE_CREDENTIALAS");

        const valide = bcrypt.compare(password, user.password_hash);

        if(!valide)
            throw new Error("INVALIDE_CREDENTIALS");

        const token = jwt.sign({userId:user.id},JWT_SECRET,{expiresIn:"1h"});
        return {token}
    }

}
