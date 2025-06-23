let cart = [];

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const orderTotal = document.getElementById('order-total');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');

    if (!cartCount || !cartItems || !orderTotal || !emptyCart || !cartContent) {
        console.error('Required DOM elements not found');
        return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.setAttribute('aria-live', 'polite');

    if (cart.length === 0) {
        emptyCart.classList.add('active');
        cartContent.classList.remove('active');
        return;
    }

    emptyCart.classList.remove('active');
    cartContent.classList.add('active');

    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        const itemInfo = document.createElement('div');
        itemInfo.className = 'cart-item-info';

        const itemName = document.createElement('div');
        itemName.className = 'cart-item-name';
        itemName.textContent = item.name;

        const itemDetails = document.createElement('div');
        itemDetails.className = 'cart-item-details';

        const itemQuantity = document.createElement('span');
        itemQuantity.className = 'cart-item-quantity';
        itemQuantity.textContent = `${item.quantity}x`;

        const itemUnitPrice = document.createElement('span');
        itemUnitPrice.className = 'cart-item-unit-price';
        itemUnitPrice.textContent = `@ $${item.price.toFixed(2)}`;

        const itemTotal = document.createElement('span');
        itemTotal.className = 'cart-item-total';
        itemTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-item';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', `Remove ${item.name} from cart`);
        removeBtn.onclick = () => removeFromCart(index);

        itemDetails.append(itemQuantity, itemUnitPrice, itemTotal);
        itemInfo.append(itemName, itemDetails);
        cartItem.append(itemInfo, removeBtn);
        cartItems.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `$${total.toFixed(2)}`;
    orderTotal.setAttribute('aria-live', 'polite');
}

function addToCart(name, price, button) {
    if (typeof name !== 'string' || !name.trim()) {
        console.error('Invalid item name');
        return;
    }
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        console.error('Invalid price');
        return;
    }

    const existingItemIndex = cart.findIndex(item => item.name === name);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ name: name.trim(), price, quantity: 1 });
    }

    updateButtonState(button, true);
    updateCartDisplay();
}

function updateQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        const itemName = cart[index].name;
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        buttons.forEach(button => {
            const card = button.closest('.dessert-card');
            if (card && card.querySelector('.dessert-name').textContent === itemName) {
                updateButtonState(button, false);
            }
        });
        cart.splice(index, 1);
    }

    updateCartDisplay();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;

    const itemName = cart[index].name;
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => {
        const card = button.closest('.dessert-card');
        if (card && card.querySelector('.dessert-name').textContent === itemName) {
            updateButtonState(button, false);
        }
    });

    cart.splice(index, 1);
    updateCartDisplay();
}

function updateButtonState(button, inCart) {
    const card = button.closest('.dessert-card');
    if (!card) return;

    const itemName = card.querySelector('.dessert-name').textContent;
    button.classList.toggle('in-cart', inCart);

    if (inCart) {
        const item = cart.find(cartItem => cartItem.name === itemName);
        if (item) {
            button.innerHTML = '';
            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'quantity-btn';
            decreaseBtn.textContent = '−';
            decreaseBtn.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
            decreaseBtn.onclick = (e) => {
                e.stopPropagation();
                updateQuantityFromButton(item.name, -1);
            };

            const quantityDisplay = document.createElement('span');
            quantityDisplay.className = 'quantity-display';
            quantityDisplay.textContent = item.quantity;

            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'quantity-btn';
            increaseBtn.textContent = '+';
            increaseBtn.setAttribute('aria-label', `Increase quantity of ${item.name}`);
            increaseBtn.onclick = (e) => {
                e.stopPropagation();
                updateQuantityFromButton(item.name, 1);
            };

            button.append(decreaseBtn, quantityDisplay, increaseBtn);
        }
    } else {
        button.innerHTML = `
            <span class="cart-icon">🛒</span>
            Add to Cart
        `;
    }
}

function updateQuantityFromButton(itemName, change) {
    const itemIndex = cart.findIndex(item => item.name === itemName);
    if (itemIndex > -1) {
        updateQuantity(itemIndex, change);
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        buttons.forEach(button => {
            const card = button.closest('.dessert-card');
            if (card && card.querySelector('.dessert-name').textContent === itemName) {
                if (cart.find(item => item.name === itemName)) {
                    updateButtonState(button, true);
                }
            }
        });
    }
}

function confirmOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const modal = document.getElementById('order-modal');
    const orderItems = document.getElementById('order-items');
    const modalOrderTotal = document.getElementById('modal-order-total');

    orderItems.innerHTML = '';

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <span>${item.quantity}x @ $${item.price.toFixed(2)} $${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItems.appendChild(itemDiv);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    modalOrderTotal.textContent = `$${total.toFixed(2)}`;

    modal.style.display = 'flex';

    document.getElementById('confirm-order-btn').style.display = 'none';
}

function startNewOrder() {
    const modal = document.getElementById('order-modal');
    modal.style.display = 'none';
    cart = [];
    document.getElementById('confirm-order-btn').style.display = 'block';
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => updateButtonState(button, false));
    updateCartDisplay();
}

document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();

        const card = this.closest('.dessert-card');
        if (!card) {
            console.error('Dessert card not found');
            return;
        }

        const nameElement = card.querySelector('.dessert-name');
        const priceElement = card.querySelector('.dessert-price');
        if (!nameElement || !priceElement) {
            console.error('Name or price element not found');
            return;
        }

        const name = nameElement.textContent.trim();
        const priceText = priceElement.textContent.trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        if (isNaN(price) || price <= 0) {
            console.error(`Invalid price for ${name}`);
            return;
        }

        addToCart(name, price, this);
    });
});

updateCartDisplay();

document.getElementById('confirm-order-btn').addEventListener('click', confirmOrder);
document.getElementById('start-new-order-btn').addEventListener('click', startNewOrder);

function toggleDropdown() {
            const dropdown = document.getElementById('statsDropdown');
            const arrow = document.querySelector('.dropdown-arrow');
            
            dropdown.classList.toggle('open');
            arrow.classList.toggle('rotated');
        }