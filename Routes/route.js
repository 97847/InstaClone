const express = require('express');
const jwt = require('jsonwebtoken');
const user_route = express();
const secretKey = 'mysecretkey';
const User = require('../Modules/user');
const bcrypt=require('bcryptjs');
const authenticateUser = require('../middleware/middware');

// Server is starting route
user_route.get('/', (req, res) => {
  res.send("HELLO");
  console.log("hello");
});

user_route.use(express.json());

// User authentication route with JWT token
user_route.post('/authenticate', (req, res) => {
  const { email, password } = req.body;
  
  User.findOne({email:email}).then(saveUser=>{
    if(!saveUser){
      return res.status(422).json({error:"Invalise email"});
    }
    bcrypt.compare(password,saveUser.password).then(doMatch=>{
      if(doMatch){
      const token=jwt.sign({_id:saveUser._id},secretKey);
      res.json({token:token});
      }
      else{
        return res.status(422).json({error:"Invalid User"});
      }
    }).catch(err=>{
      console.log(err);
    })

  })
});
user_route.post('/signup',async (req,res)=>{
  const {email,password}=req.body;
  if(!email || !password){
    return res.status(422).json({error:"Please files all files"});
  }
  User.findOne({email:email}).then((saveUser)=>{
    if(saveUser){
      return res.status(422).json({error:"User already exists"});  
    }
    bcrypt.hash(password,12).then(hashPass=>{
      const user=new User({  // corrected variable name here
        email,
        password:hashPass
      })
      user.save().then(user=>{
        res.json({message:"saved succsefullty"});
      }).catch(err=>{
        console.log(err);
      })
    })
   
  }).catch(err=>{
    console.log(err);
  })
})

//authenticate user checking
user_route.get('/protected', authenticateUser, (req, res) => {
  // Use req.user to access the authenticated user object
  console.log('hello');
  res.json({ user: req.user });
});

module.exports = user_route;
