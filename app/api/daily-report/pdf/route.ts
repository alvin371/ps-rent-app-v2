import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const auth = await requireAuth("finance:read");
    if (auth.response) {
      return auth.response;
    }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam);
  } else {
    targetDate = new Date();
  }
  
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      occurredAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { occurredAt: "desc" },
    include: {
      session: {
        select: { paymentMethod: true },
      },
    },
  });

  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalOutcome = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalIncome - totalOutcome;

  const cashRevenue = transactions.filter((t) => t.session?.paymentMethod === "cash" && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const qrisRevenue = transactions.filter((t) => t.session?.paymentMethod === "qris" && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = cashRevenue + qrisRevenue;

  const rentalIncome = transactions.filter((t) => t.type === "Rental").reduce((sum, t) => sum + t.amount, 0);
  const snackIncome = transactions.filter((t) => t.type === "Snack").reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatRupiah = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    .container { 
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 48px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #f04747;
    }
    .logo { flex: 1; }
    .logo-title { 
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .logo-game { color: #f04747; }
    .logo-center { color: #1f2433; }
    .logo-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .logo-address {
      font-size: 11px;
      color: #9aa2b1;
      margin-top: 2px;
    }
    .report-title {
      text-align: right;
      flex: 1;
    }
    .report-title h1 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2433;
      letter-spacing: 0.5px;
    }
    .report-date {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      padding-left: 8px;
      border-left: 3px solid #4f5bff;
    }
    .highlights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .highlight-card {
      border: 1px solid #e6eaf2;
      border-radius: 8px;
      padding: 16px;
      position: relative;
    }
    .highlight-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }
    .highlight-value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2433;
    }
    .highlight-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 0 0 8px 8px;
    }
    .bar-gray { background: #e6eaf2; }
    .bar-blue { background: #3b82f6; }
    .bar-orange { background: #f59e0b; }
    .bar-green { background: #22c55e; }
    .bar-purple { background: #8b5cf6; }
    .bar-red { background: #f04747; }
    .label-blue { color: #3b82f6; }
    .label-orange { color: #f59e0b; }
    .label-green { color: #22c55e; }
    .label-purple { color: #8b5cf6; }
    .label-red { color: #f04747; }
    .payment-breakdown {
      background: #f9fafb;
      border: 1px solid #e6eaf2;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 32px;
      font-size: 11px;
      color: #6b7280;
    }
    .payment-breakdown-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .payment-items {
      display: flex;
      gap: 24px;
    }
    .payment-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-green { background: #22c55e; }
    .dot-purple { background: #8b5cf6; }
    .transactions-section {
      margin-bottom: 32px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .table thead {
      background: #f9fafb;
      border-top: 1px solid #e6eaf2;
      border-bottom: 1px solid #e6eaf2;
    }
    .table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .table td {
      padding: 12px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }
    .table tbody tr:last-child td {
      border-bottom: none;
    }
    .category-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .badge-rental { background: #dbeafe; color: #3b82f6; }
    .badge-snack { background: #fef3c7; color: #f59e0b; }
    .badge-expense { background: #fee2e2; color: #f04747; }
    .method-qris { color: #8b5cf6; font-weight: 600; }
    .method-cash { color: #22c55e; font-weight: 600; }
    .method-none { color: #9aa2b1; }
    .amount-positive { color: #1f2433; font-weight: 600; }
    .amount-negative { color: #f04747; font-weight: 600; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e6eaf2;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #9aa2b1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-title">
          <span class="logo-game">GAME</span><span class="logo-center">CENTER</span>
        </div>
        <div class="logo-subtitle">PlayStation Rental & Snack Bar</div>
        <div class="logo-address">Jl. Merdeka No. 45, Jakarta Selatan</div>
      </div>
      <div class="report-title">
        <h1>DAILY FINANCIAL SUMMARY</h1>
        <div class="report-date">📅 ${formatDate(targetDate)}</div>
      </div>
    </div>

    <div class="section-title">FINANCIAL HIGHLIGHTS</div>
    <div class="highlights">
      <div class="highlight-card">
        <div class="highlight-label">TOTAL REVENUE</div>
        <div class="highlight-value">${formatRupiah(totalRevenue)}</div>
        <div class="highlight-bar bar-gray"></div>
      </div>
      <div class="highlight-card">
        <div class="highlight-label label-blue">RENTAL INCOME</div>
        <div class="highlight-value">${formatRupiah(rentalIncome)}</div>
        <div class="highlight-bar bar-blue"></div>
      </div>
      <div class="highlight-card">
        <div class="highlight-label label-orange">SNACK SALES</div>
        <div class="highlight-value">${formatRupiah(snackIncome)}</div>
        <div class="highlight-bar bar-orange"></div>
      </div>
      <div class="highlight-card">
        <div class="highlight-label label-green">TOTAL CASH</div>
        <div class="highlight-value">${formatRupiah(cashRevenue)}</div>
        <div class="highlight-bar bar-green"></div>
      </div>
      <div class="highlight-card">
        <div class="highlight-label label-purple">TOTAL QRIS</div>
        <div class="highlight-value">${formatRupiah(qrisRevenue)}</div>
        <div class="highlight-bar bar-purple"></div>
      </div>
      <div class="highlight-card">
        <div class="highlight-label label-red">EXPENSES</div>
        <div class="highlight-value">- ${formatRupiah(totalOutcome)}</div>
        <div class="highlight-bar bar-red"></div>
      </div>
    </div>

    <div class="payment-breakdown">
      <div class="payment-breakdown-title">PAYMENT BREAKDOWN:</div>
      <div class="payment-items">
        <div class="payment-item">
          <span class="dot dot-green"></span>
          <span>Cash: ${formatRupiah(cashRevenue)}</span>
        </div>
        <div class="payment-item">
          <span class="dot dot-purple"></span>
          <span>QRIS: ${formatRupiah(qrisRevenue)}</span>
        </div>
        <div class="payment-item">
          <span>Total In: ${formatRupiah(totalRevenue)}</span>
        </div>
      </div>
    </div>

    <div class="section-title">DAILY TRANSACTION LOG</div>
    <div class="transactions-section">
      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Category</th>
            <th>Description</th>
            <th>Method</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map((t) => `
            <tr>
              <td>${formatTime(t.occurredAt)}</td>
              <td>
                <span class="category-badge badge-${t.type.toLowerCase()}">
                  ${t.type}
                </span>
              </td>
              <td>${t.description}</td>
              <td class="${t.session?.paymentMethod === "qris" ? "method-qris" : t.session?.paymentMethod === "cash" ? "method-cash" : "method-none"}">
                ${t.session?.paymentMethod === "qris" ? "QRIS" : t.session?.paymentMethod === "cash" ? "CASH" : "—"}
              </td>
              <td class="${t.amount < 0 ? "amount-negative" : "amount-positive"}" style="text-align: right;">
                ${t.amount < 0 ? "- " : ""}${formatRupiah(Math.abs(t.amount))}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div>OFFICIAL REPORT • Generated on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
      <div>Page 1 of 1</div>
    </div>
  </div>
</body>
</html>
  `;

    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="daily-report-${targetDate.toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
