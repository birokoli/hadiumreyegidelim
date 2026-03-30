import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const trains = [
  {
    name: "Cidde Havalimanı - Mekke (Business)",
    type: "TRAIN",
    price: 38.62,
    description: "Business Class konforunda, Haremeyn Hızlı Treni ile Cidde Havalimanı'ndan Mekke'ye direkt ulaşım.",
    extraData: JSON.stringify({ departure: "Cidde Hvl.", arrival: "Mekke", stops: 0 })
  },
  {
    name: "Cidde Havalimanı - Mekke (Economy)",
    type: "TRAIN",
    price: 23.90,
    description: "Economy Class konforunda, Haremeyn Hızlı Treni ile Cidde Havalimanı'ndan Mekke'ye direkt ulaşım.",
    extraData: JSON.stringify({ departure: "Cidde Hvl.", arrival: "Mekke", stops: 0 })
  },
  {
    name: "Mekke - Cidde Havalimanı (Business)",
    type: "TRAIN",
    price: 38.62,
    description: "Business Class konforunda, Haremeyn Hızlı Treni ile Mekke'den Cidde Havalimanı'na direkt ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Cidde Hvl.", stops: 0 })
  },
  {
    name: "Mekke - Cidde Havalimanı (Economy)",
    type: "TRAIN",
    price: 23.90,
    description: "Economy Class konforunda, Haremeyn Hızlı Treni ile Mekke'den Cidde Havalimanı'na direkt ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Cidde Hvl.", stops: 0 })
  },
  {
    name: "Mekke - Medine (Business) [1-2 Duraklı]",
    type: "TRAIN",
    price: 131.64,
    description: "Business Class konforunda, ara duraklamalı Haremeyn Hızlı Treni ile Mekke'den Medine'ye ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Medine", stops: 2 })
  },
  {
    name: "Mekke - Medine (Economy) [1-2 Duraklı]",
    type: "TRAIN",
    price: 59.56,
    description: "Economy Class konforunda, ara duraklamalı Haremeyn Hızlı Treni ile Mekke'den Medine'ye ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Medine", stops: 2 })
  },
  {
    name: "Mekke - Medine (Business) [Non-Stop]",
    type: "TRAIN",
    price: 131.64,
    description: "Business Class konforunda, duraksız (non-stop) Haremeyn Hızlı Treni ile Mekke'den Medine'ye hızlı ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Medine", stops: 0 })
  },
  {
    name: "Mekke - Medine (Economy) [Non-Stop]",
    type: "TRAIN",
    price: 77.59,
    description: "Economy Class konforunda, duraksız (non-stop) Haremeyn Hızlı Treni ile Mekke'den Medine'ye hızlı ulaşım.",
    extraData: JSON.stringify({ departure: "Mekke", arrival: "Medine", stops: 0 })
  },
  {
    name: "Medine - Mekke (Business) [1-2 Duraklı]",
    type: "TRAIN",
    price: 131.64,
    description: "Business Class konforunda, ara duraklamalı Haremeyn Hızlı Treni ile Medine'den Mekke'ye ulaşım.",
    extraData: JSON.stringify({ departure: "Medine", arrival: "Mekke", stops: 2 })
  },
  {
    name: "Medine - Mekke (Economy) [1-2 Duraklı]",
    type: "TRAIN",
    price: 59.56,
    description: "Economy Class konforunda, ara duraklamalı Haremeyn Hızlı Treni ile Medine'den Mekke'ye ulaşım.",
    extraData: JSON.stringify({ departure: "Medine", arrival: "Mekke", stops: 2 })
  },
  {
    name: "Medine - Mekke (Business) [Non-Stop]",
    type: "TRAIN",
    price: 131.64,
    description: "Business Class konforunda, duraksız (non-stop) Haremeyn Hızlı Treni ile Medine'den Mekke'ye hızlı ulaşım.",
    extraData: JSON.stringify({ departure: "Medine", arrival: "Mekke", stops: 0 })
  },
  {
    name: "Medine - Mekke (Economy) [Non-Stop]",
    type: "TRAIN",
    price: 77.59,
    description: "Economy Class konforunda, duraksız (non-stop) Haremeyn Hızlı Treni ile Medine'den Mekke'ye hızlı ulaşım.",
    extraData: JSON.stringify({ departure: "Medine", arrival: "Mekke", stops: 0 })
  }
];

async function seed() {
  console.log("Deleting old trains...");
  await prisma.service.deleteMany({ where: { type: 'TRAIN' }});
  
  console.log("Seeding new trains...");
  for (const t of trains) {
    await prisma.service.create({ data: t });
  }
  
  console.log("12 Train routes seeded successfully!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
