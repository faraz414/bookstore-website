// This function checks the payment form before it's sent
function validatePayment(event) {
  event.preventDefault(); 
  // Get the values the user typed in
  const cardNumber = document.getElementById('card-number').value.trim();
  const expiry = document.getElementById('expiry').value;
  const cvv = document.getElementById('cvv').value.trim();
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = ''; // Clear any old error message

  // this removes any spaces in the card number
  const digitsOnly = cardNumber.replace(/\s+/g, '');

  // for checking if card has exactly 16 digits
  if (!/^\d{16}$/.test(digitsOnly)) {
    messageDiv.textContent = "Card number must be exactly 16 digits.";
    return;
  }

  // Checks if the card number starts with 51 to 55 (for MasterCard)
  const prefix = parseInt(digitsOnly.substring(0, 2), 10);
  if (prefix < 51 || prefix > 55) {
    messageDiv.textContent = "Card number must start with 51-55 for Mastercard.";
    return;
  }

  // this makes sure expiry date is filled in
  if (!expiry) {
    messageDiv.textContent = "Please enter the expiry date.";
    return;
  }

  // Split expiry into year and month 
  const [expYear, expMonth] = expiry.split('-').map(Number);
  const today = new Date();
  if (expYear < today.getFullYear() || (expYear === today.getFullYear() && expMonth < today.getMonth() + 1)) {
    messageDiv.textContent = "The card is expired.";
    return;
  }

  // Checks that CVV is 3 or 4 digits
  if (!/^\d{3,4}$/.test(cvv)) {
    messageDiv.textContent = "CVV must be 3 or 4 digits.";
    return;
  }

  // This is the data we send to the server
  const paymentData = {
    master_card: parseInt(digitsOnly, 10),
    exp_year: expYear,
    exp_month: expMonth,
    cvv_code: cvv
  };

  // Send the payment info to the server
  fetch('https://mudfoot.doc.stu.mmu.ac.uk/node/api/creditcard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  })
  .then(response => {
    // If something went wrong, show the error message
    if (!response.ok) {
      return response.text().then(text => { throw new Error(text); });
    }
    return response.json();
  })
  .then(data => {
    // If payment works, go to success page and show last 4 digits
    const last4 = digitsOnly.slice(-4);
    window.location.href = "success.html?last4=" + last4;
  })
  .catch(error => {
    // Show any error message to the user
    messageDiv.textContent = "Error: " + error.message;
  });
}

document.getElementById('payment-form').addEventListener('submit', validatePayment);
