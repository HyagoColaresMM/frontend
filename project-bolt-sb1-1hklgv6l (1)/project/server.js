import jsonServer from 'json-server'

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)
server.use(jsonServer.bodyParser)

// Add custom routes before JSON Server router
server.get('/v1/tipopessoa', (req, res) => {
  const db = router.db
  const tipopessoa = db.get('tipopessoa').value()
  
  // Get pagination parameters
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  
  // Calculate start and end indices
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  
  // Get paginated results
  const results = tipopessoa.slice(startIndex, endIndex)
  
  // Set total count header for pagination
  res.header('X-Total-Count', tipopessoa.length)
  res.header('Access-Control-Expose-Headers', 'X-Total-Count')
  
  res.jsonp(results)
})

// Custom PUT route
server.put('/v1/tipopessoa/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const db = router.db
  const tipopessoa = db.get('tipopessoa').value()
  
  const index = tipopessoa.findIndex(item => item.codigo === id)
  
  if (index !== -1) {
    // Update only valor and descricao fields
    const updatedItem = {
      ...tipopessoa[index],
      valor: req.body.valor,
      descricao: req.body.descricao
    }
    
    // Update the item in the array
    db.get('tipopessoa').splice(index, 1, updatedItem).write()
    
    res.jsonp(updatedItem)
  } else {
    res.status(404).jsonp({ error: "Item not found" })
  }
})

// Custom POST route
server.post('/v1/tipopessoa', (req, res) => {
  const db = router.db
  const tipopessoa = db.get('tipopessoa').value()
  
  // Find the highest codigo to generate a new one
  const maxCodigo = tipopessoa.reduce((max, item) => Math.max(max, item.codigo), 0)
  
  const newItem = {
    codigo: maxCodigo + 1,
    valor: req.body.valor,
    descricao: req.body.descricao
  }
  
  // Add the new item
  db.get('tipopessoa').push(newItem).write()
  
  res.status(201).jsonp(newItem)
})

// Custom DELETE route
server.delete('/v1/tipopessoa/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const db = router.db
  const tipopessoa = db.get('tipopessoa').value()
  
  const index = tipopessoa.findIndex(item => item.codigo === id)
  
  if (index !== -1) {
    // Remove the item
    const removedItem = db.get('tipopessoa').splice(index, 1).write()[0]
    
    res.jsonp(removedItem)
  } else {
    res.status(404).jsonp({ error: "Item not found" })
  }
})

// Use default router
server.use(router)

// Start server
server.listen(5000, () => {
  console.log('JSON Server is running on port 5000')
  console.log('Access the API at http://localhost:5000/v1/tipopessoa?limit=5&page=1')
})