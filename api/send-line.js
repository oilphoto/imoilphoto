export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, phone, packageType, date, time, location, total, deposit, pending } = req.body;
    const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!LINE_TOKEN) {
        return res.status(500).json({ error: 'Missing LINE Token in Vercel settings.' });
    }

    const flexPayload = {
        "type": "flex",
        "altText": "📸 I'M OIL PHOTO - สรุปคิวงานจองออกกองด่วน!",
        "contents": {
            "type": "bubble",
            "styles": { "header": { "backgroundColor": "#111827" }, "body": { "backgroundColor": "#1e2530" }, "footer": { "backgroundColor": "#1e2530" } },
            "header": {
                "type": "box", "layout": "vertical",
                "contents": [
                    { "type": "text", "text": "I'M OIL PHOTO", "color": "#f59e0b", "size": "xs", "weight": "bold" },
                    { "type": "text", "text": "📸 สรุปจองงาน", "color": "#ffffff", "size": "md", "weight": "bold", "margin": "sm" }
                ]
            },
            "body": {
                "type": "box", "layout": "vertical",
                "contents": [
                    { "type": "box", "layout": "horizontal", "margin": "md", "contents": [{ "type": "text", "text": "ประเภทงาน", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": "🎓 " + packageType, "color": "#38bdf8", "size": "sm", "weight": "bold", "flex": 8 }] },
                    { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "คุณลูกค้า", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": name, "color": "#ffffff", "size": "sm", "weight": "bold", "flex": 8 }] },
                    { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "วันถ่ายงาน", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": "📅 " + date, "color": "#ffffff", "size": "sm", "flex": 8 }] },
                    { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "เวลาทำงาน", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": "⏱️ " + time, "color": "#ffffff", "size": "sm", "flex": 8 }] },
                    { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "สถานที่นัด", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": "📍 " + location, "color": "#ffffff", "size": "sm", "wrap": true, "flex": 8 }] },
                    { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "เบอร์โทร", "color": "#8a9aa8", "size": "sm", "flex": 4 }, { "type": "text", "text": "📞 " + phone, "color": "#ffffff", "size": "sm", "flex": 8 }] },
                    { "type": "separator", "margin": "lg", "color": "#2d3848" },
                    {
                        "type": "box", "layout": "vertical", "margin": "lg", "backgroundColor": "#161b24", "cornerRadius": "md", "paddingAll": "md",
                        "contents": [
                            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "ราคาแพ็กเกจรวม", "color": "#8a9aa8", "size": "xs" }, { "type": "text", "text": "฿" + total.toLocaleString(), "color": "#ffffff", "size": "sm", "align": "end" }] },
                            { "type": "box", "layout": "horizontal", "margin": "xs", "contents": [{ "type": "text", "text": "ชำระมัดจำแล้ว", "color": "#8a9aa8", "size": "xs" }, { "type": "text", "text": "- ฿" + deposit.toLocaleString(), "color": "#34d399", "size": "sm", "align": "end" }] },
                            { "type": "separator", "margin": "sm", "color": "#2d3848" },
                            { "type": "box", "layout": "horizontal", "margin": "sm", "contents": [{ "type": "text", "text": "ยอดเก็บหน้างาน", "color": "#f87171", "size": "sm", "weight": "bold" }, { "type": "text", "text": "฿" + pending.toLocaleString(), "color": "#f87171", "size": "md", "weight": "bold", "align": "end" }] }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box", "layout": "vertical", "spacing": "sm",
                "contents": [
                    { "type": "button", "style": "primary", "color": "#f59e0b", "height": "sm", "action": { "type": "uri", "label": "🗺️ นำทาง Google Maps", "uri": "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location) } },
                    { "type": "button", "style": "secondary", "color": "#fafbfd", "height": "sm", "action": { "type": "uri", "label": "📞 โทรออกหาลูกค้า", "uri": "tel:" + phone } }
                ]
            }
        }
    };

    try {
        const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_TOKEN}`
            },
            body: JSON.stringify({ "messages": [flexPayload] })
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}