const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const { createRemoteJWKSet, jwtVerify } = require("jose");

dotenv.config()


const uri = process.env.MONGODB_URI;


const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));



const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })

    }

    try {
        const { payload } = await jwtVerify(token, JWKS)
        next()
    } catch (error) {
        // next()
        return res.status(403).json({ message: "Forbidden" })

    }



}

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


        // fetch("https//:localhost:5000/rooms?limit=6")
        // .then(res=>res.json())
        // .then(data=>{
        //     setStat()
        // })


        // rooms api
        app.get("/rooms",  async (req, res) => {

            // all data of room
            // searching by roomName

            // searching by amenities
            // searching by  min / max cost
            // filtering by userEmail

            const { roomName, amenities, min, max, userEmail, limit } = req.query
            // const { id } = req.params


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



            const result = await roomsCollection.find(query).limit(Number(limit) || 0).toArray()

            res.send(result)
        })




        app.get("/room/:id", verifyToken, async (req, res) => {
            const { id } = req.params
            // const token = req.headers.authorization
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query)
            res.send(result)
        })





        app.post("/rooms", verifyToken, async (req, res) => {
            const roomData = req.body
            console.log(roomData)
            const result = await roomsCollection.insertOne(roomData)
            res.send(result)
        })

        // {_id: ObjectId('6a0c21647e4fed0551ccbfa6)}

        app.delete("/room/:id", verifyToken, async (req, res) => {
            const id = req.params

            const query = { _id: new ObjectId(id.id) }
            console.log(query)



            const result = await roomsCollection.deleteOne(query)
            // { deletedCount: 1 }
            res.send(result)

        })

        // user api


        app.get("/user", verifyToken, async (req, res) => {

            const { email } = req.query
            const query = { email }
            const result = await userCollection.findOne(query)
            res.send(result)



        })






        // booking api

        app.get('/booking/:id', verifyToken, async (req, res) => {
            const { id } = req.params
            const query = { userId: id }
            console.log(query)
            const result = await bookingCollection.find(query).toArray()
            console.log(result)
            res.send(result)
        })


        app.patch("/booking", verifyToken, async (req, res) => {
            const updateData = req.body
            console.log(updateData)

            const query = { _id: new ObjectId(updateData.roomId) }


            const update = {
                $set: updateData

            }

            const result = await roomsCollection.updateOne(query, update)


            res.send(result)


        })

        app.post("/booking", verifyToken, async (req, res) => {
            const booking = req.body

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
            res.send(result)
        })


        app.delete("/booking/:id", verifyToken, async (req, res) => {
            const { id } = req.params
            const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result)
        })





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("server is running fine")
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
// module.exports = app