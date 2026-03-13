const { MercadoPagoConfig, PreApprovalPlan } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: 'TEST-4385485484892713-031300-d695df56a1fdfac866c34ab7b4c86ba6-433173310' });
const plan = new PreApprovalPlan(client);

plan.create({
  body: {
    reason: "Suscripción Mensual Koda Maker PRO",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 20000,
      currency_id: "ARS"
    },
    back_url: "https://koda-maker.vercel.app/dashboard", // A donde vuelve el cliente
    status: "active"
  }
}).then(console.log).catch(console.error);