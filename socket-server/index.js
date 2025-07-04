import { Server } from "socket.io";

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let dict = new Map();
let socketId = new Map();

io.on("connection", (socket) => {
    console.log(`Connected to ${socket.id}`);

    socket.on('email', (email) => {
        console.log(email);
        dict.set(email, socket);
        socketId.set(socket.id, email);
    });

    socket.on('update' , (email) => {
        console.log(email + " update");
        dict.get(email).emit('update');
    });

    socket.on('call' , (data) => {
        const mail = socketId.get(socket.id);
        console.log(`Call from ${mail} to ${data.email}`);
        const {email , offer} = data;
        dict.get(email).emit('incoming-call', {email : mail , offer});
    });

    socket.on('answer-call' , (data)=> {
        const email2 = socketId.get(socket.id);
        const {email , ans} = data;
        dict.get(email).emit('call-answered' , {email : email2 , ans});
    });

    socket.on('disconnect' , ()=> {
        console.log(`Disconnected :: ${socket.id}`);
        dict.delete(socketId.get(socket.id));
        socketId.delete(socket.id);
    });
});

io.listen(5000);