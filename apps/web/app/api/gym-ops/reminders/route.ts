import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

function buildWhatsAppMessage(memberName: string, gymName: string, endDate: Date, renewalLink: string): string {
  const formattedDate = endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return (
    `Hi ${memberName}! 👋\n\n` +
    `Your membership at *${gymName}* is expiring on *${formattedDate}*.\n\n` +
    `Don't break your streak! Renew now to keep your progress going 💪\n\n` +
    `🔗 *Renew here:* ${renewalLink}\n\n` +
    `Need help? Reply to this message or call us directly.`
  );
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const now = new Date();
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const expiring = await prisma.gymMember.findMany({
    where: {
      status: { in: ["ACTIVE", "AT_RISK"] },
      membershipEnd: { gte: now, lte: sevenDaysOut },
    },
    include: { gym: { select: { name: true, phone: true } } },
    orderBy: { membershipEnd: "asc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vedicneev.com";

  const reminders = expiring.map((member) => {
    const renewalLink = `${baseUrl}/gym-ops/renew?member=${member.id}&gym=${member.gymId}`;
    const message = buildWhatsAppMessage(member.name, member.gym.name, member.membershipEnd, renewalLink);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${member.phone.replace(/\D/g, "")}?text=${encodedMessage}`;

    return {
      memberId: member.id,
      memberName: member.name,
      phone: member.phone,
      gymName: member.gym.name,
      membershipEnd: member.membershipEnd,
      daysLeft: Math.ceil((member.membershipEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      messageSnippet: message,
      whatsappUrl,
      renewalLink,
    };
  });

  return NextResponse.json({ success: true, count: reminders.length, reminders });
}
