const {noteSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError')
module.exports.validateNote = (req,res,next)=>{ 
    const {error} = noteSchema.validate(req.body)
    if(error)
    { 
        const msg = error.details.map(el=>{ 
            el.message
    }).join(',')
    throw new ExpressError(msg,400)
    }
    else
    { 
        next()
    }
}
module.exports.returnTo=(req,res,next)=>{ 
    if(req.session.returnTo){ 
        res.locals.returnTo = req.session.returnTo 
    }
    next() 
}
module.exports.isLoggedIn=(req,res,next)=>{ 
    console.log("REQ.USER"+req.user)
    if(!req.isAuthenticated())
    { 
        req.flash('error','You must be signed in')
        return res.redirect('/login')
    }
    next() ;
}