document.querySelectorAll('.addToCartButton').forEach(button => {
    button.addEventListener('click', async (event) => {
        try {
            const productId = event.target.dataset.productId; 
                        
            const quantity = 1; 
            

            const response = await fetch(`/api/carts/add/${productId}/${quantity}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
            const data = await response.json();
            console.log(data)

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Producto agregado al carrito',
                    text: 'El producto se agregó al carrito correctamente',
                    showCancelButton: true, 
                    confirmButtonText: 'Añadir', 
                    cancelButtonText: 'Cancelar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Producto añadido', 'El producto fue añadido correctamente al carrito', 'success');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire('Producto no añadido', 'El producto no fue añadido al carrito', 'error');
                    }
                });
            } else {
                alert('Error al agregar producto al carrito');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});


