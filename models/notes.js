const mongoose = require('mongoose')
const Schema = mongoose.Schema 
const notesSchema = new Schema({ 
        title:String , 
        description:String,
        createdAt: {
                type: Date,
                default: Date.now(),
              },
        user: {
        type:String, 
        required:true}
})
module.exports=mongoose.model('Notes',notesSchema)