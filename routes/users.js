const express= require('express')
const router = express.Router()

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('../models/user')
const {storeReturnTo}=require('../middleware')
router.get('/register',async(req,res)=>{ 
    res.render('user/register')
  })
  router.post('/register',async(req,res)=>{
    try{const{email,username,password}=req.body 
    const user = new User({
      email,username
    })
    const registeredUser = await User.register(user,password) 
    req.login(registeredUser,err=>{ 
      if(err) return next(err)
      req.flash('success','Welcome to Notes Diary')
      res.redirect('/newnote')
    }) }
    catch(e){ 
      req.flash('error',e.message)
      console.log(e.message)
      res.redirect('/register')
    }
    
  })
  router.get('/login',async(req,res)=>{ 
    res.render('user/login')
  })
  router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) ,(req,res)=>{ 
    req.flash('success','Welcome back')
    
    res.redirect("/notes")
  })
  
  router.get('/logout',(req,res,next)=>{ 
    req.logout((err)=>{
      if(err) return next(err)
      req.flash('success','Goodbye')
    res.redirect('/login')
    })
  })
module.exports=router