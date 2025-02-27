import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Container, 
  Table, 
  Button, 
  Pagination, 
  Spinner, 
  Alert, 
  Offcanvas, 
  Form, 
  Row, 
  Col,
  Navbar,
  Nav,
  Accordion,
  ListGroup
} from 'react-bootstrap'

function App() {
  const [tipoPessoas, setTipoPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ valor: '', descricao: '' })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const limit = 5

  // Sample menu data structure
  const menuData = [
    {
      id: 1,
      title: 'Cadastros',
      submenus: [
        {
          id: 11,
          title: 'Pessoas',
          items: [
            { id: 111, title: 'Tipos de Pessoa', link: '#tipos-pessoa' },
            { id: 112, title: 'Clientes', link: '#clientes' },
            { id: 113, title: 'Fornecedores', link: '#fornecedores', 
              subitems: [
                { id: 1131, title: 'Nacionais', link: '#fornecedores-nacionais' },
                { id: 1132, title: 'Internacionais', link: '#fornecedores-internacionais' }
              ] 
            }
          ]
        },
        {
          id: 12,
          title: 'Produtos',
          items: [
            { id: 121, title: 'Categorias', link: '#categorias' },
            { id: 122, title: 'Estoque', link: '#estoque' }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Relatórios',
      submenus: [
        {
          id: 21,
          title: 'Financeiros',
          items: [
            { id: 211, title: 'Vendas', link: '#vendas' },
            { id: 212, title: 'Compras', link: '#compras' }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Configurações',
      submenus: [
        {
          id: 31,
          title: 'Sistema',
          items: [
            { id: 311, title: 'Usuários', link: '#usuarios' },
            { id: 312, title: 'Permissões', link: '#permissoes' }
          ]
        }
      ]
    }
  ]

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/v1/tipopessoa?limit=${limit}&page=${currentPage}`)
      setTipoPessoas(response.data)
      
      // For json-server, we need to get the total count from headers
      const totalCount = response.headers['x-total-count'] || 12 // Fallback to our sample data count
      setTotalPages(Math.ceil(totalCount / limit))
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erro ao carregar os dados. Verifique se o servidor está rodando.')
      setLoading(false)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      valor: item.valor,
      descricao: item.descricao
    })
    setSidebarOpen(true)
  }

  const handleDelete = async (codigo) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await axios.delete(`http://localhost:5000/v1/tipopessoa/${codigo}`)
        setMessage({ text: 'Item excluído com sucesso!', type: 'success' })
        fetchData() // Refresh data
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' })
        }, 3000)
      } catch (err) {
        console.error('Error deleting item:', err)
        setMessage({ text: 'Erro ao excluir o item.', type: 'error' })
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' })
        }, 3000)
      }
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ valor: '', descricao: '' })
    setSidebarOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingItem) {
        // Update existing item
        await axios.put(`http://localhost:5000/v1/tipopessoa/${editingItem.codigo}`, formData)
        setMessage({ text: 'Item atualizado com sucesso!', type: 'success' })
      } else {
        // Create new item
        await axios.post('http://localhost:5000/v1/tipopessoa', formData)
        setMessage({ text: 'Item criado com sucesso!', type: 'success' })
      }
      
      // Close sidebar and refresh data
      setSidebarOpen(false)
      fetchData()
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' })
      }, 3000)
    } catch (err) {
      console.error('Error saving item:', err)
      setMessage({ 
        text: editingItem ? 'Erro ao atualizar o item.' : 'Erro ao criar o item.', 
        type: 'error' 
      })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' })
      }, 3000)
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen)
  }

  // Render subitems if they exist
  const renderSubItems = (subitems) => {
    if (!subitems) return null
    
    return (
      <ListGroup variant="flush" className="ms-3 border-start ps-2">
        {subitems.map(subitem => (
          <ListGroup.Item key={subitem.id} action href={subitem.link} className="border-0 py-1">
            {subitem.title}
          </ListGroup.Item>
        ))}
      </ListGroup>
    )
  }

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="border" variant="primary" />
    </Container>
  )
  
  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  )

  return (
    <div className="d-flex flex-column vh-100">
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container fluid>
          <Button 
            variant="outline-light" 
            className="me-2" 
            onClick={toggleLeftSidebar}
          >
            {leftSidebarOpen ? '←' : '→'}
          </Button>
          <Navbar.Brand href="#home">Sistema de Gestão</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Início</Nav.Link>
              <Nav.Link href="#profile">Perfil</Nav.Link>
              <Nav.Link href="#logout">Sair</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        {/* Left Sidebar */}
        <div 
          className={`bg-light border-end ${leftSidebarOpen ? 'd-block' : 'd-none'}`} 
          style={{ width: '250px', overflowY: 'auto', transition: 'width 0.3s' }}
        >
          <Accordion defaultActiveKey="0" alwaysOpen flush>
            {menuData.map((menu, index) => (
              <Accordion.Item key={menu.id} eventKey={index.toString()}>
                <Accordion.Header>{menu.title}</Accordion.Header>
                <Accordion.Body className="p-0">
                  <Accordion defaultActiveKey="0" flush>
                    {menu.submenus.map((submenu, subIndex) => (
                      <Accordion.Item key={submenu.id} eventKey={subIndex.toString()}>
                        <Accordion.Header>{submenu.title}</Accordion.Header>
                        <Accordion.Body className="p-0">
                          <ListGroup variant="flush">
                            {submenu.items.map(item => (
                              <div key={item.id}>
                                <ListGroup.Item action href={item.link} className="border-0">
                                  {item.title}
                                </ListGroup.Item>
                                {renderSubItems(item.subitems)}
                              </div>
                            ))}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 p-3">
          <h1 className="mb-4">Lista de Tipos de Pessoa</h1>
          
          {message.text && (
            <Alert variant={message.type === 'success' ? 'success' : 'danger'} 
                  dismissible 
                  onClose={() => setMessage({ text: '', type: '' })}>
              {message.text}
            </Alert>
          )}
          
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={handleAdd}>
              Adicionar Novo
            </Button>
          </div>
          
          <Table striped bordered hover responsive>
            <thead className="bg-primary text-white">
              <tr>
                <th>Código</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipoPessoas.length > 0 ? (
                tipoPessoas.map((pessoa) => (
                  <tr key={pessoa.codigo}>
                    <td>{pessoa.codigo}</td>
                    <td>{pessoa.valor}</td>
                    <td>{pessoa.descricao}</td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleEdit(pessoa)}
                        className="me-2"
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(pessoa.codigo)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">Nenhum dado encontrado</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
              />
              
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item 
                  key={index + 1} 
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              
              <Pagination.Next 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Offcanvas) */}
      <Offcanvas show={sidebarOpen} onHide={closeSidebar} placement="end" style={{ width: '25%' }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {editingItem ? 'Editar Tipo de Pessoa' : 'Adicionar Tipo de Pessoa'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Valor:</Form.Label>
              <Form.Control
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                required
                maxLength="1"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição:</Form.Label>
              <Form.Control
                type="text"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Row className="mt-4">
              <Col>
                <Button variant="secondary" onClick={closeSidebar} className="w-100">
                  Cancelar
                </Button>
              </Col>
              <Col>
                <Button variant="success" type="submit" className="w-100">
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

export default App