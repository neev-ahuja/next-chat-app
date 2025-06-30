import { Server } from "socket.io";

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let dict = {};

io.on("connection", (socket) => {
    console.log(`Connected to ${socket.id}`);


    socket.on('email', (email) => {
        console.log(email);
        dict[email] = socket;
    });

    socket.on('update' , (email) => {
        console.log(email + " update");
        dict[email].emit('update');
    });

    socket.on('disconnect' , ()=> {
        console.log(`Disconnected :: ${socket.id}`)
    })

});

io.listen(5000);