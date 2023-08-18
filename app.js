const express= require('express')
const app = express()
const path = require('path')
const engine = require('ejs-mate')
const Notes = require('./models/notes')
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.engine('ejs',engine)
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
const methodOverride = require('method-override')
const flash = require('connect-flash')
app.use(methodOverride('_method'))
const session = require('express-session')
const mongoose = require('mongoose');
const userRoutes = require('./routes/users')
const {isLoggedIn} = require('./middleware')
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/notes');
  

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().then(()=>{
    console.log("Connected to mongodb")
})
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const sessionConfig = { 
  secret:'this is a better secret',
  resave: false, 
  saveUninitialized:true, 
  cookie:{ 
    httpOnly: true  ,
    expires:Date.now()+1000*60*60*24*7 ,
    maxAge:1000*60*60*24*7
  }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser()) 

app.use((req,res,next)=>{ 
  res.locals.currentUser = req.user ; 
  res.locals.success=req.flash('success')
  res.locals.error = req.flash('error')
  next() 
})
app.get('/',(req,res)=>{
    res.render('home')
})
//NOTES ROUTES
app.use('/',userRoutes)
//AUTHENTICATION ROUTES 
app.get('/fakeUser',async(req,res)=>{ 
  const user = new User({email:'matin@gmail.com',username:'mateen'})
  const newUser = await User.register(user,'chicken')
  res.send(newUser)
})


app.get('/notes',isLoggedIn,async(req,res)=>{
  const notes = await Notes.find({user:req.user.id}).sort('-createdAt');
    if(!notes)
    { 
      req.flash('error','Sorry you do not have any notes')
      res.redirect('/newnote')
    }
  res.render('note/notes',{notes})
   })
app.get('/newnote',isLoggedIn,(req,res)=>{ 
    if(!req.isAuthenticated()){
      req.flash('error','you must be signed in')
      res.redirect('/login')
    }
    res.render('note/NewNote')
})

app.post('/notes',isLoggedIn,async(req,res)=>{ 
    let note = await new Notes({
        title: req.body.title,
        description: req.body.description,
      });
      
      try {
        note.user = req.user.id;
        note = await note.save();
        req.flash('success','Note successfully created')
        res.redirect('/notes');
      } catch (e) {
        console.log(e);
        req.flash('error','Sorry Couldnt create note ')
        res.redirect('/newnote');
      }
    });

app.get('/notes/:id',isLoggedIn,async(req,res)=>{ 
  const note = await Notes.findById(req.params.id)
  if(!note)
  { 
    return res.redirect('/notes'); 
  }
  res.render('note/show',{note})
})
app.get('/note/:id/edit',isLoggedIn,async(req,res)=>{ 
  const {id} =req.params 
  const note = await Notes.findById(id);
  if(!note)
  { 
    req.flash('error','Sorry Couldnt find the note you want to edit ')
    return res.redirect('/notes')
  }
  else
  { 
    res.render('note/edit',{note})
  }
})
app.put('/notes/:id',isLoggedIn,async(req,res)=>{ 
 const {id} = req.params 
 const note = await Notes.findByIdAndUpdate(id,{...req.body})
 await note.save()
 req.flash('success','Successfully Updated Notes')
 res.redirect(`/notes/${id}`)
 
})
app.delete('/note/:id',isLoggedIn, async(req,res)=>{ 
  const{id}=req.params 
  await Notes.findByIdAndDelete(id)
  req.flash('success','Successfully deleted notes')
  res.redirect('/notes')
})
app.use((err,req,res,next)=>{ 
  if(!err.message)err.message="OH NO !!!"
  res.render('error',{err})
})
app.listen(3000,(req,res)=>{
    console.log("Listening on port 3000")
})