module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, clinicInfo } = req.body;

  const systemPrompt = `Eres un asistente virtual de atención al cliente para ${clinicInfo?.nombre || 'una clínica médica'}.
INFORMACIÓN: Especialidades: ${clinicInfo?.especialidades || 'Medicina general, Cardiología, Dermatología, Pediatría'}, Horarios: ${clinicInfo?.horarios || 'Lunes a Viernes 8am-8pm'}, Teléfono: ${clinicInfo?.telefono || '800-CLINICA'}, Precios: ${clinicInfo?.precios || 'desde $350'}, Seguros: ${clinicInfo?.seguros || 'GNP, AXA, Metlife'}.
Responde siempre en español, sé amable y conciso (máximo 3 oraciones). Para agendar citas pide especialidad, nombre y fecha. Para emergencias indica llamar al 911. No des diagnósticos médicos.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Error de API' });
    res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
