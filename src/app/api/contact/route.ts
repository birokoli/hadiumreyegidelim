import { NextResponse, after } from 'next/server';
import { notifyNewLead } from '@/lib/lead-notify';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { ticketOf } from '@/lib/help';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(ip, 'contact', 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen 10 dakika bekleyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, phone, package: selectedPackage, message, subject, email, website } = body;
    // Bot tuzağı (yardım merkezi formu): doluysa sessizce kabul edilmiş gibi dön
    if (website) return NextResponse.json({ success: true, ticket: "HUG-000000" });

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'İsim ve telefon numarası zorunludur.' },
        { status: 400 }
      );
    }

    const newContact = await prisma.contactRequest.create({
      data: {
        name,
        phone,
        package: selectedPackage || subject || null,
        message: [email ? `E-posta: ${email}` : "", message || ""].filter(Boolean).join("\n") || null,
      },
    });

    // Yöneticiye WhatsApp bildirimi yanıtı bekletmeden gönderilir
    after(() => notifyNewLead(newContact));

    return NextResponse.json({ success: true, ticket: ticketOf(newContact.id) });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası. Talebiniz alınamadı.' },
      { status: 500 }
    );
  }
}
