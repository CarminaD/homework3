const express = require('express')
const {json}=require('sequelize')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
//TODO
app.use(express.json())

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/food-items', async (req, res) => {
    try{
        let foodItem=new FoodItem(req.body)

        if(foodItem.name==null&&foodItem.category==null&&foodItem.calories==null)
            throw new Error('body is missing')
        
        else if(foodItem.name==null||foodItem.category==null||foodItem.calories==null)
            throw new Error("malformed request")

        else if (foodItem.calories<0)
            throw new Error('calories should be a positive number')

        else if(foodItem.category!='MEAT'&&foodItem.category!='DAIRY'&&foodItem.category!='VEGETABLE')
            throw new Error('not a valid category')

        await foodItem.validate()
        await foodItem.save()
        res.status(201).json({message:'created'})
    }
    catch(err){
        if(err.message=='body is missing')
            res.status(400).json({message : 'body is missing'})
        
        else if(err.message=="malformed request")
            res.status(400).json({message : "malformed request"})
        
        else if(err.message=='calories should be a positive number')
            res.status(400).json({message : "calories should be a positive number"})
        
        else if(err.message=='not a valid category')
            res.status(400).json({message : "not a valid category"})
        else
            res.status(500).json({message : 'server error'})
    }
})

module.exports = app