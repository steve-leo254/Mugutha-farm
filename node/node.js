const express = require('express');
const unirest = require('unirest');
const app = express();

app.use(express.json());

// M-Pesa credentials (replace with your own)
const consumerKey = 'YOUR_CONSUMER_KEY';
const consumerSecret = 'YOUR_CONSUMER_SECRET';
const shortCode = '174379'; // Sandbox Paybill
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Sandbox Passkey
const callbackURL = 'https://yourdomain.com/mpesa/callback';

// Get OAuth token
async function getMpesaToken() {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
        .headers({ 'Authorization': `Basic ${auth}` })
        .then(res => res.body);

    if (response.error) throw new Error(response.error);
    return response.access_token;
}

// STK Push endpoint
app.post('/mpesa/stkpush', async (req, res) => {
    const { phoneNumber, amount } = req.body;

    try {
        const token = await getMpesaToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

        const stkResponse = await unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
            .headers({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            })
            .send({
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: callbackURL,
                AccountReference: 'FarmFresh',
                TransactionDesc: 'Payment for FarmFresh order'
            })
            .then(res => res.body);

        if (stkResponse.errorCode) {
            return res.status(400).json({ errorMessage: stkResponse.errorMessage });
        }

        res.json({ message: 'STK Push initiated', response: stkResponse });
    } catch (error) {
        console.error('M-Pesa Error:', error);
        res.status(500).json({ errorMessage: 'Server error' });
    }
});

// Callback endpoint (for M-Pesa to confirm payment)
app.post('/mpesa/callback', (req, res) => {
    console.log('M-Pesa Callback:', req.body);
    // Process callback to confirm payment (e.g., update order status)
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));