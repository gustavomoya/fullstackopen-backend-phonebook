require("dotenv").config();
const express = require('express')
const morgan  = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.json())

app.use(express.static('dist'))

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'));

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', async (request, response) => {
    const total = await Person.countDocuments({});
    response.send(`<div><p>Phonebook has info for ${total} people</p><p>${new Date()}</p></div>`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(p => {
            if (p) {
                response.json(p);
            } else {
                response.status(404).end();
            }
        }).catch(error => next(error));
})

app.post('/api/persons', async (request, response, next) => {
    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: 'Name is missing',
        });
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'Number is missing',
        });
    }

    const savedPerson = await Person.find({name: body.name});

    if (savedPerson.length > 0) {
        return response.status(400).json({
            error: 'A person with this name already exist',
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save().then(p => {
        response.json(p);
    });
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(p => {
            response.json(p)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})