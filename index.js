const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()
const app = express()


const uri = process.env.MONGODB_URI;


app.use(cors())
app.use(express.json())


const PORT = process.env.PORT
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
    try {
        // await client.connect();
        const db = await client.db("focushub")
        const focushubCollection = db.collection("focushub")
        const roomsCollection = db.collection("rooms")
        const userCollection = db.collection("user")
        const bookingCollection = db.collection("booking")

        // ## body {data}
        // ## query api?nameOfQuery=valueOfQuery
        // ## params api/${id}

        // rooms api
        app.get("/rooms", async (req, res) => {
            const { roomName, amenities, min, max, userEmail } = req.query
            // const { id } = req.params

            // console.log(roomName)
            let query = {}
            // if roomName exist
            if (roomName) {
                query.roomName = { $regex: roomName, $options: "i" }
            }
            if (amenities) {
                query.amenities = { $in: [amenities] }

            }
            if (min || max) {
                query.hourlyRate = {}
                if (min) {
                    query.hourlyRate.$gte = Number(min)
                }
                if (max) {
                    query.hourlyRate.$lte = Number(max)
                }
            }
            if (userEmail) {
                query = { userEmail }
            }

            // if (id) {
            //     query = { _id: new ObjectId(id) }
            // }

            // console.log(query)
            const result = await roomsCollection.find(query).toArray()
            setTimeout(() => {

                res.send(result)
            }, 2000);
        })
        app.get("/room/:id", async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query)
            // console.log(result)
            res.send(result)
        })





        app.post("/rooms", async (req, res) => {
            const roomData = req.body
            // console.log(roomData)
            const result = await roomsCollection.insertOne(roomData)
            // console.log(result)
            res.send(result)
        })

        // user api


        app.get("/user", async (req, res) => {

            const { email } = req.query
            console.log(email)
            const query = { email }
            const result = await userCollection.findOne(query)
            console.log(result)
            res.send(result)

            // email
            // query
            // return data


        })


        // update api
        // const data = {
        //     name: "jerin"

        // }

        // const query = { _id: ObjectId(nhlj) }



        app.patch("/booking", async (req, res) => {
            const updateData = req.body
            console.log(updateData)
            const query = { _id: new ObjectId(updateData.roomId) }
            console.log(query)

            const update = {
                $set: updateData

            }

            const result = await roomsCollection.updateOne(query, update)
            console.log(result)

            res.send(result)


        })


        // booking api

        app.post("/booking", async (req, res) => {
            const booking = req.body
            console.log(booking)

            const query = {
                date: booking.date
            }
            const bookedOnSameDate = await bookingCollection.find(query).toArray()
            const sameTime = bookedOnSameDate.filter(booked => booked.startTime == booking.startTime)
            if (sameTime[0]) {
                res.status(409).json({ error: "Room is already booked on this schedule please choose another time or date" })
                return

            }
            // check is this time already booked
            // conditionally res.send(result)
            const result = await bookingCollection.insertOne(booking)
            console.log(result)
            res.send(result)
        })








        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("server is running fine")
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})