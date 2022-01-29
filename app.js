//---------------------//
//importing required modules//
//--------------------//
const express=require('express');
const mongoose=require('mongoose');
const passport=require('passport');
const User=require('./models/logindb');
const passportLocal=require("passport-local");
const bodyParser=require("body-parser");
const { check, validationResult } = require('express-validator')

var num1=0;
var num2=0;

const app=express();

app.set('view engine','ejs');
app.use(express.static('public'));

//---------------------//
//connecting mongodb//
//--------------------//
const dburl="mongodb+srv://Shruthi_11:shruthi2003@testing.rcoxf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(process.env.PORT || 3000))
  .catch(err => console.log(err));
app.use(express.urlencoded({ extended: true }));

app.use(require("express-session")({
    secret:"agwqrgbuiuebuinhruqewfnbuioyhnouyhiewirbfduiqbfjougun",//decode or encode session
    resave: false,          
    saveUninitialized:false    
}));

passport.serializeUser(User.serializeUser());//session encoding
passport.deserializeUser(User.deserializeUser());//session decoding
const LocalStrategy=passportLocal.Strategy;
passport.use(new LocalStrategy(User.authenticate()));
app.use(bodyParser.urlencoded({ extended:true }));
app.use(passport.initialize());
app.use(passport.session());
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//---------------------//
//------Routing--------//
//--------------------//
app.get('/',(req,res)=>{
    res.render('index',{title:'Home'});
});
app.get('/register',(req,res)=>{
    res.render('signup',{num1,title:'Registrartion-form'});
});
app.get('/login',(req,res)=>{
    res.render('login',{num2,title:'Login-form'});
});
app.get('/account/~:id',isLoggedIn,(req,res)=>{
    const id=req.params.id;
    User.findById(id)
    .then(result=>{
        res.render('account',{title:result.username});
    })
    .catch(err=>{
        console.log(err);
    });
})
app.get("/logout",(req,res)=>{
    num1=0;
    num2=0;
    req.logout();
    res.redirect("/");
});

//---------------------//
//---Post middleware---//
//--------------------//
app.post("/register",urlencodedParser, [
    check('username', 'This username must me 3+ characters long')
        .isLength({ min: 3 }),
    check('password', 'The password must me 4+ characters long')
        .isLength({min:4,max:4})
    ],(req,res)=>{
        const error=validationResult(req);
        if(error.isEmpty())
        {
            User.register(new User({username: req.body.username,email:req.body.email}),req.body.password,function(err,user){
                if(err){
                    num1=-1;
                    res.redirect("/register");
                }
                passport.authenticate("local")(req,res,function(){
                    num2=1;
                    res.redirect("/login");
                })  
            }) 
        }
        else
        {
            num1=-1;
            res.redirect('/register');
        } 
});
app.post('/login', function (req, res){
    passport.authenticate('local', function(err, user, info){
        if (err) 
        {
            num2=-1;
            return res.redirect('/login')
        }
        else {
            req.login(user, function(err) {
                if (err) 
                {
                    num2=-1;
                    return res.redirect('/login')
                }
                User.findOne({username:req.body.username})
                .then(result=>{
                    var id=result._id
                    res.redirect('/account/~'+id);
                })
                .catch(err=>{
                  console.log(err);
                });
            });
        }
    })(req, res);
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
