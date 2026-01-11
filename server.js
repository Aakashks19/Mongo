

const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'product_crud';
let db;

MongoClient.connect(url)
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error(err));

const server = http.createServer(async (req, res) => {
  const filePath = path.join(__dirname, 'index.html');

  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(filePath, (err, data) => {
      if (err) return res.end('Error loading HTML');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  else if (req.method === 'GET' && req.url === '/products') {
    const products = await db.collection('products').find().toArray();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
  }

  else if (req.method === 'POST' && req.url === '/products') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const product = JSON.parse(body);
      const result = await db.collection('products').insertOne(product);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }

  else if (req.method === 'PUT' && req.url.startsWith('/products/')) {
    const id = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      const product = JSON.parse(body);
      await db.collection('products').updateOne(
        { _id: new ObjectId(id) },
        { $set: product }
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  }

  else if (req.method === 'DELETE' && req.url.startsWith('/products/')) {
    const id = req.url.split('/')[2];
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }

  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4000, () => {
  console.log('Server running at http://localhost:4000');
});

