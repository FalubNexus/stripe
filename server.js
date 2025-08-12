// server.js
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route : créer une session de paiement
app.post('/paiement', async (req, res) => {
  const { amount, email } = req.body; // amount en cents

  if (!amount || !email) {
    return res.status(400).json({ message: 'Données manquantes.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'zar',
            product_data: {
              name: 'Abonnement Membre',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://yoco-jsrb.onrender.com/merci.html',
      cancel_url: 'https://yoco-jsrb.onrender.com/',
      customer_email: email,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error.message);
    res.status(500).json({ message: 'Erreur de paiement.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});