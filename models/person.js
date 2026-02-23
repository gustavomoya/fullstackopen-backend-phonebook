const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name : {
        type: String,
        minLength: [3, 'The name must have at least 3 characters'],
        required: [true, 'The name is required']
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                // Regex to check valid phone number.
                const pattern = /^\d{2,3}-\d{4,}$/;

                return pattern.test(v) && v.length >= 8;
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'The phone number required']
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)