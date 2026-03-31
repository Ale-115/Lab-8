const express = require('express')
const path = require('path')
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');

const Order = mongoose.model('Order',{
  name:String,
  email:String,
  phone:String,
  postcode:String,
  lunch:String,
  ticket:Number,
  campus:String,
  sub:Number,
  tax:Number,
  total:Number
});


const app = express()
mongoose.connect("mongodb+srv://hellobyaledesign_db:ale123@cluster0.boqmu7v.mongodb.net/CollegeOrder")

app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
    res.render('form.ejs');
})


app.post('/processForm',[
  check('name', 'Name is Empty').notEmpty(),
  check('email', 'Not a valid Email').isEmail(),
  check('tickets','Ticket Not Selected').notEmpty().custom(value=>{
    if (isNaN(value)){
      throw Error("Tickets must be a valid number.");
    }else if(value <= 0){
       throw Error("Tickets must be greater than 0.");
    }else{
      return true;
    }
  }),
  check('campus','Campus Not Selected').notEmpty(),
  check('lunch','Select Yes/No for Lunch').notEmpty(),
  check('postcode','Invalid Post Code Format').matches(/^[a-zA-Z]\d[a-zA-Z]\s\d[a-zA-Z]\d$/),
  check('phone','Invalid phone Number').matches(/^\d{3}(\s|-)\d{3}(\s|-)\d{4}$/),
  check('lunch').custom((value,{req})=>{
     if(typeof(value) != 'undefined'){
      if (value == 'yes' && req.body.tickets < 3){
        throw Error("Lunch can only be purchased when buying 3 or more tickets.")
      }
     }else{
        throw Error("Lunch Selection (Yes/No) Not Completed")
     }
     return true;
  })
  
],(req,res)=>{

  const errors = validationResult(req);  
    if(errors.isEmpty()){
      var lunch_index = -1, cost = 0, tax, total; 
      
      var name = req.body.name;
      var email = req.body.email;
      var campus = req.body.campus;
      var tickets = req.body.tickets;
      var lunch = req.body.lunch;

      for(var i = 0; i< lunch.length; i++){
        if(lunch[i].checked){
            lunch_index = i;
            break;
        }
      }
      if(lunch_index > -1){
          lunch = lunch[lunch_index].value;
      }

      if(tickets > 0){
          cost = 100*tickets;
      }
      if(lunch == 'yes'){
          cost += 60;
      }

      tax = cost * 0.13;
      total = cost + tax;

      var receipt = {
        "name":name,
        "email":email,
        "lunch":lunch,
        "campus":campus,
        "sub":cost.toFixed(2),
        "tax":tax.toFixed(2),
        "total":total.toFixed(2)
      }

      var newOrder = new Order({
          name: receipt.name,
          email: receipt.email,
          phone: req.body.phone,
          postcode: req.body.postcode,
          lunch: receipt.lunch,
          ticket: tickets,
          campus: receipt.campus,
          sub: receipt.sub,
          tax: receipt.tax,
          total: receipt.total
      })

      newOrder.save().then((data)=>{  
         res.render('form',{recpt: data});
      }).catch((err)=>{
        console.log("Data Saving Error!!!");
      })

    }else{
      res.render('form',{errors:errors.array(), old:req.body}) 
    }
});


app.get('/allOrders',(req,res)=>{
    Order.find({}).then((data)=>{
        res.render('orders',{datax:data});
    }).catch((err)=>{
      console.log("Data Read Error");
    })
})


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
