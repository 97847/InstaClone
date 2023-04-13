const express=require('express');
const mongoose=require('mongoose');
const User_route=require('./Routes/route');
const Post_route=require('./Routes/post')
const User=require('./Modules/user');
const app=express();
require('dotenv').config();
const PORT= process.env.PORT || 3000;;

const GetRoute=require('./Routes/route');
const AuthRoute=require('./Routes/route');
const Protected=require('./Routes/route');
const PostRoute=require('./Routes/post');


const Url='mongodb+srv://Rahul:Super33@cluster0.xyxav4y.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(Url,{
  useNewUrlParser:true,
  useUnifiedTopology:true
}).then(()=>{
  console.log(`connection succesfully`);
}).catch(err=>{
  console.log(err);
})

  
  app.use('/',GetRoute)
app.use('/',AuthRoute)
app.use('/',Protected);
app.use('/',PostRoute);
  app.listen(PORT,()=>{
    console.log(`Server is listening on port no ${PORT}`)
});