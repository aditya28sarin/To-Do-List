const express= require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
const _ = require("lodash");

//to connect to the mongodb server
mongoose.connect("mongodb+srv://admin-aditya:AdityaSarin@28@cluster0.1xkwf.mongodb.net/todolistDB", {useNewUrlParser:true});


const itemSchema = {
	name: String
};

//create a model 
const Item = mongoose.model("Item", itemSchema);

const Task1 = new Item ({
	name:"Welcome To Your New List!"
});


//default items array
const defaultItems = [Task1];


//making schema for different lists 
const listSchema = {
	name: String,
	items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
	
//find items 
	Item.find({},function(err, foundItems){
		
		if(foundItems.length===0){
			//inserting items in the DB
			Item.insertMany(defaultItems, function(err){
				if(err){
					console.log(err);
				}
				else{
					console.log("Successfully added items to database!");
				}
			});
			
			res.redirect("/");
		}
		else{
		res.render('index',{thisDay:"Today",newData:foundItems});	
		}
});

});

app.post('/', function(req,res){
	
    const itemName = req.body.newItem;
	const listName = req.body.list;
	
	const item = new Item({
		name: itemName
	});
	
	//handling default list and other custom lsits differently 
	if(listName === "Today")
	{
		//shortcut insttead of insertOne/insertMany
	item.save();
    res.redirect("/");
	}
	else{
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			
			res.redirect("/" + listName);
		});
	}
	
});

//express route paramters feature
app.get("/:customListName", function(req,res){
	
	const customListName = _.capitalize(req.params.customListName);
	
	List.findOne({name:customListName}, function(err,results){
		if(!err){
			if(!results){
				const list = new List({
		
					name: customListName,
					items: defaultItems
				});
	
				list.save();
				res.redirect("/" + customListName);
			}
			else{
				res.render("index",{thisDay:results.name,newData:results.items});
			}
		}

	});
});


app.get("/about", function(req,res){

    res.render("about");
});


app.post('/delete', function(req,res){
	const checkedItem = req.body.deletedItem;
	const listName = req.body.listName;
	
	if(listName==="Today"){
	Item.findByIdAndRemove(checkedItem, function(err){
		if(!err)
		{
			console.log("Checked item deleted!");
			res.redirect("/");
		}
	});	
	}
	else{
		List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,results){
			if(!err){
				res.redirect("/"+listName);
			}
		});
	}
	
});

app.listen(3000,function(){
    console.log('Server is listening at Port 3000..')
});