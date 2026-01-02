# 🧾 Receipt Tracker

A neo-brutalist finance tracker with thermal receipt printer aesthetics. Built with Next.js, TypeScript, and Tailwind CSS.

![Demo](https://user-images.githubusercontent.com/your-username/receipt-tracker-demo.gif)

## ✨ Features

- **Smart Command Bar** - Loose Indonesian input parsing (`kopi 25k`, `gajian 5jt`, `saldo 1jt`)
- **Thermal Print Aesthetic** - Monochrome design with torn paper edges and JetBrains Mono typography
- **Per-Card Reset** - Individual reset buttons for Balance, Week, Month, and Income cards
- **Spreadsheet View** - Sortable & filterable transaction table
- **Print to Image** - Export receipts as PNG
- **Sound Effects** - Thermal printer audio feedback
- **100% Client-Side** - All data stored in localStorage

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Shadcn/UI**

## 📝 Usage

| Command | Result |
|---------|--------|
| `kopi 25k` | Add expense Rp 25.000 |
| `gajian 5jt` | Add income Rp 5.000.000 |
| `saldo 1jt` | Set initial balance |
| `reset` | Clear all data |

## 📄 License

MIT
