// newCollection.js - Gestione messaggio successo aggiunta al carrello

document.addEventListener('DOMContentLoaded', function() {
    // Success message element
    const successMsg = document.createElement('div');
    successMsg.className = 'cart-success-message';
    successMsg.innerHTML = '<span>Prodotto aggiunto al carrello con successo!</span>';
    successMsg.style.display = 'none';
    document.body.appendChild(successMsg);

    // Show message function
    function showSuccessMessage() {
        successMsg.style.display = 'flex';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 1800);
    }

    // Add event to all add-to-cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            // Qui va la logica di aggiunta al carrello (già esistente)
            showSuccessMessage();
        });
    });
});
