// REEMPLAZA CON EL TOKEN DE 'CREDENCIALES DE PRUEBA' DE TU APP
const APP_TEST_TOKEN = "TEST-4385485484892713-031300-d695df56a1fdfac866c34ab7b4c86ba6-433173310"; 

async function crearPlan(nombre, monto, frecuencia) {
    console.log(`Intentando crear plan: ${nombre}...`);
    try {
        const response = await fetch("https://api.mercadopago.com/preapproval_plan", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${APP_TEST_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reason: nombre,
                auto_recurring: {
                    frequency: frecuencia,
                    frequency_type: "months",
                    transaction_amount: monto,
                    currency_id: "ARS"
                },
                back_url: "https://koda-maker.vercel.app/dashboard",
                status: "active"
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ÉXITO: ${nombre}`);
            console.log(`ID: ${data.id}`);
            console.log(`URL de pago: ${data.init_point}\n`);
        } else {
            console.error(`❌ ERROR en ${nombre}:`, data.message || data);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

async function ejecutar() {
    await crearPlan("Koda Maker Mensual", 20000, 1);
    await crearPlan("Koda Maker Anual", 200000, 12);
}

ejecutar();