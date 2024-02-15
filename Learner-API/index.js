import express from 'express';
import mongoose from 'mongoose';
import { Student } from './StudentModel.js';
import { DELETE_SUCCESS, ERROR_MESSAGE, INSERT_SUCCESS, STUDENT_NOT_FOUND, UPDATE_SUCCESS,INVALID_USER } from './constants.js';
import {StatusCodes} from 'http-status-codes';
import cors from 'cors';
import { Admin } from './AdminModel.js';
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';


//----------------------------------to verify the token in url request--------------------------------------------

function verifyToken(request,response,next){
    const header = request.get('Authorization');
    if(header){
        const token=header.split(" ")[1];
        jwt.verify(token,"secret1234",(error,payload)=>{
            if(error){
                response.status(StatusCodes.UNAUTHORIZED).send({message:"Invalid"});
            }
            else{
                next();
            }
        });
    }
    else{
        response.status(StatusCodes.UNAUTHORIZED).send({message:"Please Login First"});
    }
}


//--------------------------------to connect the mongodb database and create server---------------------------------------

const app=express();

app.use(cors());
app.use(express.json());

const connectDb=async()=>{
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Elearning'); //to connect monodb database 
        console.log("Database connection created !")
    } catch (error) {
        console.log(error);
    }
}
//----------------------------------------------------------admin API's------------------------------------------------------------
//-----------------------------------------------to save the data of admin--------------------------------------------------------

app.post("/admin",async(request,response)=>{
   
    try {
        const reqData=request.body;
        reqData["Password"]=bcrypt.hashSync(reqData.Password,10);
        const admin=new Admin(reqData);
        await admin.save();
        response.status(StatusCodes.CREATED).send({message:INSERT_SUCCESS});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE});
    }
})

//---------------------------------------------------to login as admin , token will be created--------------------------------------------

app.post("/admin/login",async(request,response)=>{
    try {
        const admin=await Admin.findOne({Phone:request.body.Phone});
        
        if (admin) {
            
            if(bcrypt.compareSync(request.body.Password,admin.Password)){
                const token = jwt.sign({adminPhone:admin.Phone},"secret1234")                           //created token with jwt.sign
                response.status(StatusCodes.OK).send({message:"Login Successful", token:token});        //passed the token to the client in respond
            }
            else{
                response.status(StatusCodes.BAD_REQUEST).send({message:"invalid Password"});
            }
        }
        else{
            response.status(StatusCodes.BAD_REQUEST).send({message:"invalid user"});
        }
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:"not found"});
    }
})

//------------------------------------------------student API's-----------------------------------------------------------------------------------------------------

//------------------------------to check the credentials of student i.e login as student-------------------------------------------------

app.post("/student/login",async(request,response)=>{
    try {
        const stu=await Student.findOne({Phone:request.body.Phone});
        
        if (stu) {
            
            if((request.body.Password)==(stu.Password)){
                const token = jwt.sign({stuPhone:stu.Phone},"secret12345")                           //created token with jwt.sign
                response.status(StatusCodes.OK).send({message:"Login Successful", token:token});        //passed the token to the client in respond
            }
            else{
                response.status(StatusCodes.BAD_REQUEST).send({message:"invalid Password"});
            }
        }
        else{
            response.status(StatusCodes.BAD_REQUEST).send({message:"invalid user"});
        }
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:"not found"});
    }
})

//------------------------to register student , post data in data base---------------------

app.post("/student",async(request,response)=>{
    try {
        const reqData=request.body;
        const student=new Student(reqData);
        await student.save();
        response.status(StatusCodes.CREATED).send({message:INSERT_SUCCESS});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE});
    }
});

//--------------------------to fetch the details of all students ---------------------------------

app.get("/student",async(request,response)=>{
    try {
        const students=await Student.find();  
        response.send({students:students});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE}); 
    }
});

//-------------------------to fetch unique student, to edit the details-------------------------------------------------

app.get("/student/:Phone",async(request,response)=>{
    try {
       const student=await Student.findOne({"Phone":request.params.Phone});
       if (student==null) {
        response.status(StatusCodes.NOT_FOUND).send({message:STUDENT_NOT_FOUND});
       }
       else{
         response.send({student:student});
       }
       
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE});
    }
});

//-----------------------------to delete the data of student---------------------------------------

app.delete("/student/:Phone",async(request,response)=>{
    try {
        await Student.deleteOne({"Phone":request.params.Phone});
        response.send({message:DELETE_SUCCESS});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE});
    }
});

//-----------------------------to update the data of student-------------------------------------------


app.put("/student/:Phone",async(request,response)=>{
    try {
        await Student.updateOne({"Phone":request.params.Phone},request.body);
        response.send({message:UPDATE_SUCCESS});
    } catch (error) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message:ERROR_MESSAGE});
    }
});



//--------------------------to start the server on 4900 port--------------------------------------------

app.listen(4900,()=>{
    console.log("Server has started on 4900");
    connectDb();
});