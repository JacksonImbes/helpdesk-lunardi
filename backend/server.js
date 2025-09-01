const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

const PORT = process.env.PORT || 3333;

app.use(cors());

app.use(express.json());
app.use(routes);

// app.get('/', (request, response) => {
//     response.json({ message: 'Olá! A API do Helpdesk Lunardi está no ar!'});
// });

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

