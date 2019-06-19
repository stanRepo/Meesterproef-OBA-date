const fs = require('fs')

// Declare socket api
const postModel = require('../data/models/post')

postObject = {
    socket: '',
    postArray: [],
}

////////// SOCKET IO CODE //////////
// setup socket.io
const serverSocket = function (io) {
    io.on('connection', function (socket) {
        console.log('a user connected');
        console.log('socket.id = ' + socket.id)


        // Send user disconnected log + socket.id
        socket.on('disconnect', function () {
            console.log('user disconnected');
            console.log('socket.id = ' + socket.id);

        });

        // catch maak een nieuwe oproep van de client
        socket.on('nieuweOproep', function (data) {
            console.log(data)
            fs.writeFile('../data/oproepen.json', data, (error) => {
                if (error) throw error;
                console.log('oproep saved')
            })

        })


        // listen for input message from client
        socket.on('input', function (input) {
            if (postObject.socket === '') {
                postObject.socket = socket.id
            }
            // push input to the sockets data object
            postObject.postArray.push(input)
            // console.log(postObject.postArray.length)
            fs.writeFile('dummyTest.txt', input.data, (err) => {  
                // throws an error, you could also catch it here
                if (err) throw err;
                // success case, the file was saved
                console.log('file saved!');
            });
            
            
        })
        
        
        // when the user clicks POST button to POST 
        socket.on('postRequest', function () {
            // console.log('posting ' + postObject.postArray[1])
            console.log(postObject)
            
        })

        // send back input data 
        socket.on('askData', function () {

            console.log('------------------------')
            // add timestamp
            postObject.postArray[postObject.postArray.push({
                name: 'time',
                data: Date()
            })]
            // send to the client
            socket.emit('emitData', postObject)
            //console.log(postObject)
            // reset the postArray
            postObject.postArray = []

        })
        socket.on('savePost', function (data) {
            console.log('saving post')
            console.log(data.postArray)
            const formattedData = {}
            data.postArray.forEach(data=>{
                const dataName = data.name
                formattedData[dataName] = data.data
            console.log(formattedData)
            })
            
            const newPost = new postModel({
                // tags
                tags: formattedData.tag,
                // title of the post
                postName: formattedData.postName,
                // description
                postContent: formattedData.postContent,
                // user profile pic = base64Encoded
                profilePic: formattedData.imageBase64Encoded,
                // creator's username
                username: formattedData.username,
                // reactions of other users:
                reactions: "",
                // favorite by user:
                favorites: "",
                // tijd
                date: formattedData.time,
            })
            try{newPost.save()
            console.log('succesfully Saved Post')}
            catch(error){console.log(error)}
            

        })
    })
};


module.exports = serverSocket;