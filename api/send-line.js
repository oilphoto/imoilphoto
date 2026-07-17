// 📁 api/send-line.js (สคริปต์ระบบเลขาแจ้งเตือนหลังบ้าน Vercel Serverless)
const FIXED_LINE_TOKEN = "FEp9jFAgrN7QTSehZbFBaxLbWzo4i3Bcbxl6xm9rJXCxjZ/tFzyNpk7ZoQvaNsT60wUKILv9I8P1XL5HEOg661ODgPcJkGvW77RKpt7iUYy4a93/ZCzkrCtY/JlHfO/2XLSdm/TFP4c0WI9vdtlElQdB04t89/1O/w1cDnyilFU=";
const FIXED_LINE_USER_ID = "U8cc52a7dc02f7a0260b509861030b794";

export default async function handler(req, res) {
    // ปลดล็อกหัวข้อความปลอดภัยรองรับคำสั่งหน้าบ้าน
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        let textMessage = "";

        // ตรวจสอบว่าเป็นโหมดบอทสแกนเตือนงานล่วงหน้าอัตโนมัติหรือไม่
        if (body.isReminder) {
            textMessage = `🚨 [I'M OIL PHOTO] แจ้งเตือนคิวงานวันพรุ่งนี้ครับคุณออย!\n━━━━━━━━━━━━━━━━━━━━\n👤 คุณลูกค้า: ${body.name}\n🎓 ประเภท: งาน${body.packageType}\n🕒 เวลาเริ่ม: ${body.time} น.\n📍 สถานที่: ${body.location}\n\n💰 ยอดคงเหลือเก็บหน้างาน: ฿${Number(body.pending).toLocaleString()} บาท\n━━━━━━━━━━━━━━━━━━━━\nเตรียมอุปกรณ์คิวงานร่างทองวันพรุ่งนี้นะครับช่างภาพ! 🔥📸`;
        } else {
            // โหมดข้อความบิลปกติ
            textMessage = `📸 [I'M OIL PHOTO] ใบยืนยันการจองคิวงานถ่ายภาพ\n━━━━━━━━━━━━━━━━━━━━\n🎫 ข้อมูลนัดหมายคุณลูกค้า\n• ชื่อผู้จอง: ${body.name}\n• เบอร์ติดต่อ: ${body.phone}\n• ประเภทงาน: ${body.packageType}\n• วันที่ถ่ายงาน: ${body.date}\n• ช่วงเวลา: ${body.time}\n• สถานที่นัดกอง: ${body.location}\n\n💰 รายละเอียดค่าบริการการเงิน\n• ราคาเต็มแพ็กเกจ: ฿${Number(body.total).toLocaleString()} บาท\n• มัดจำล็อคคิวแล้ว: ฿${Number(body.deposit).toLocaleString()} บาท\n• 🚨 ยอดคงเหลือจ่ายหน้างาน: ฿${Number(body.pending).toLocaleString()} บาท\n━━━━━━━━━━━━━━━━━━━━\nขอบพระคุณที่ไว้วางใจให้ดูแลความทรงจำสำคัญครับ! 📸✨`;
        }

        // ยิงคำสั่งทะลวงตรงเข้า Server ของ LINE มั่นใจผ่านฉลุย 100%
        const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIXED_LINE_TOKEN}`
            },
            body: JSON.stringify({
                to: FIXED_LINE_USER_ID,
                messages: [{ type: 'text', text: textMessage }]
            })
        });

        if (lineResponse.ok) {
            return res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            const errData = await lineResponse.text();
            return res.status(500).json({ success: false, error: 'LINE API Error', details: errData });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}