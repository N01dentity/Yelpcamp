const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect('mongodb://rashid:rashidakhtar@goodday-shard-00-00.qg1bn.mongodb.net:27017,goodday-shard-00-01.qg1bn.mongodb.net:27017,goodday-shard-00-02.qg1bn.mongodb.net:27017/Yelpcamp?ssl=true&replicaSet=atlas-111zz3-shard-0&authSource=admin&retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, })
    .then(() => {
        console.log("Connected to MONGODB")
    }).catch(err => {
        console.log("Connection failed");
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i <20; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const newCamp = new Campground({
            author: "6043cd92d4c19f0e54b5ca0f",
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Thank you so much for coming to this page. I hope that you will enjoy here the most because this is the most amazing and cheapest campground",
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random].longitude, cities[random].latitude]
            },
            images: [{
                url: 'https://res.cloudinary.com/dvftglxqk/image/upload/v1616783129/Yelpcamp/o1llz1fj1t1mi66wydmf.jpg',
                filename: "Yelpcamp/o1llz1fj1t1mi66wydmf"
            },
            {
                url: 'https://res.cloudinary.com/dvftglxqk/image/upload/v1616856084/Yelpcamp/huk2zvspe9piga3dfgxl.jpg',
                filename: "Yelpcamp/huk2zvspe9piga3dfgxl"
            }
            ]
        });
        console.log(newCamp)
        await newCamp.save();

    }

}
seedDb().then(() => {
    mongoose.connection.close();
});