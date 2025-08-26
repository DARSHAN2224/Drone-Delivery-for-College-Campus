import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
import http from 'http';
import { initSocket } from './services/socket.js';
import { seedStaticPages } from './utils/seedStaticPages.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') })

connectDB()
.then(() => {
    const server = http.createServer(app);
    initSocket(server);
    // Seed static pages if missing
    seedStaticPages();
    server.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
