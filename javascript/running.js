// running.js - Show success message when product is added to cart

document.addEventListener('DOMContentLoaded', function() {
    const successMsg = document.createElement('div');
    successMsg.className = 'cart-success-message';
    successMsg.innerHTML = '<span>Product added to cart successfully!</span>';
    successMsg.style.display = 'none';
    document.body.appendChild(successMsg);

    function showSuccessMessage() {
        successMsg.style.display = 'flex';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 1800);
    }

    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            showSuccessMessage();
        });
    });
});