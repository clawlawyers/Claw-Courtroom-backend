const express = require('express');
const { ServerConfig, ConnectDB } = require('../src/config');
const apiRoutes = require('../src/routes')
const cors = require('cors');
const app = express();
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())

app.use('/api', apiRoutes);

app.use('/verify', (req, res) => {
    const url = `http://localhost:3001` + req.originalUrl;
    proxy.web(req, res, { target: url });
});


app.use('/fetchHeadlines/*', (req, res) => {
    const url = `http://localhost:3001` + req.originalUrl;
    proxy.web(req, res, { target: url });
}
);

app.use('', (req, res) => {
    res.status(200).json({
        message: "Server is live."
    })
})

app.listen(ServerConfig.PORT, async () => {
    //mongoDB connection
    await ConnectDB();
    console.log(`Server is up at ${ServerConfig.PORT}`);
})