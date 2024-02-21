
const socket = io();

socket.on('messages', (data) => {
  const divChat = document.getElementById('chat');
  divChat.innerHTML = '';
  data.forEach((message) => {
    divChat.innerHTML += `
      <p><b>${message.user}:</b> ${message.message}</p>`
  })
});

const user = document.getElementById('user');
const rol = document.getElementById('rol');
const message = document.getElementById('message');
const buttonChat = document.getElementById('chat-button');
const formChat = document.getElementById('chatForm');


buttonChat.addEventListener('click', (e) => {
  e.preventDefault();
  const newMessage = {
    user: user.value,
    message: message.value,
    rol: rol.value
  };

  const isAdmin = (newMessage.rol === 'admin');
  
  if (!newMessage.message) {
    const errorMessage = 'Debe escribir algo para poder enviar el mensaje.';
    Swal.fire({
      icon: 'error',
      title: 'Mensaje vacío',
      text: errorMessage,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  };

  if (isAdmin) {
    const errorMessage = 'Usted es administrador y no puede enviar mensajes.';
    Swal.fire({
      icon: 'error',
      title: 'Acceso restringido',
      text: errorMessage,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  };

  socket.emit('newMessage', newMessage);
  formChat.reset();
});



const addProduct = document.getElementById('addProductButton');
const deleteProduct = document.getElementById('deleteProductButton');
const formAddProduct = document.getElementById('addProduct');
const formDeleteProduct = document.getElementById('deleteProduct');

addProduct.addEventListener('click', (e) => {
  e.preventDefault();
  let title = document.getElementById('title').value;
  let description = document.getElementById('description').value;
  let code = document.getElementById('code').value;
  let price = document.getElementById('price').value;
  let stock = document.getElementById('stock').value;
  let thumbnail = document.getElementById('thumbnail').value;
  let category = document.getElementById('category').value;
  if (!title || !description || !code || !price || !stock || !category) {
    Swal.fire({
      icon: 'error',
      title: 'Información incompleta',
      text: 'Alguno de los campos se encuentra vacío, por favor completar',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  }

  const newProduct = {
    title: title,
    description: description,
    code: code,
    price: price,
    stock: stock,
    category: category,
    thumbnail: thumbnail || 'Sin imagen'
  };
  socket.emit('addProduct', newProduct);
  Swal.fire({
    icon: 'success',
    title: 'Producto Agregado',
    text: `El producto ${newProduct.title} fue agregado exitosamente`,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
  formAddProduct.reset();
});

deleteProduct.addEventListener('click', (e) => {
  e.preventDefault();
  let idToDelete = document.getElementById('id').value;
  Swal.fire({
    title: 'Desea eliminar el producto?',
    text: 'Está a punto de eliminar un producto',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Borrar'
  }).then((result) => {
    if (result.isConfirmed) {
      socket.emit('deleteProduct', idToDelete);
      socket.on('idDeleted', (data) => {
        if (!data) {
          Swal.fire({
            title: 'Error',
            text: `El producto no existe o no se ha encontrado`,
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
          });
        }
        else {
          Swal.fire({
            title: 'Producto Borrado',
            text: `El producto bajo el ID ${idToDelete} ha sido eliminado`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          formDeleteProduct.reset();
        }
      })
    }
  })
});