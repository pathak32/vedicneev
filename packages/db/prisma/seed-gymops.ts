import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding GymOps sample data...");

  // ── Gyms ─────────────────────────────────────────────────────────────────

  const [ironForge, zenFit] = await Promise.all([
    prisma.gym.upsert({
      where: { id: "gym-iron-forge-01" },
      update: {},
      create: {
        id: "gym-iron-forge-01",
        name: "Iron Forge Gym",
        ownerName: "Rajesh Sharma",
        phone: "919876543210",
        city: "Mumbai",
        subscriptionStatus: "ACTIVE",
      },
    }),
    prisma.gym.upsert({
      where: { id: "gym-zen-fit-01" },
      update: {},
      create: {
        id: "gym-zen-fit-01",
        name: "Zen Fit Studio",
        ownerName: "Priya Menon",
        phone: "919812345678",
        city: "Pune",
        subscriptionStatus: "ACTIVE",
      },
    }),
  ]);

  console.log(`  ✔ Gyms: ${ironForge.name}, ${zenFit.name}`);

  // ── Members ───────────────────────────────────────────────────────────────

  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

  const memberData = [
    // Iron Forge — active members
    {
      id: "gm-aniket-01",
      gymId: ironForge.id,
      name: "Aniket Verma",
      phone: "919988776655",
      membershipStart: daysAgo(60),
      membershipEnd: daysFromNow(30),
      assignedTrainer: "Suresh Kumar",
      status: "ACTIVE" as const,
    },
    {
      id: "gm-deepa-01",
      gymId: ironForge.id,
      name: "Deepa Nair",
      phone: "919977665544",
      membershipStart: daysAgo(25),
      membershipEnd: daysFromNow(5),
      assignedTrainer: "Suresh Kumar",
      status: "AT_RISK" as const,
    },
    {
      id: "gm-rohan-01",
      gymId: ironForge.id,
      name: "Rohan Desai",
      phone: "919966554433",
      membershipStart: daysAgo(90),
      membershipEnd: daysFromNow(3),
      assignedTrainer: "Meena Joshi",
      status: "AT_RISK" as const,
    },
    {
      id: "gm-kavya-01",
      gymId: ironForge.id,
      name: "Kavya Iyer",
      phone: "919955443322",
      membershipStart: daysAgo(120),
      membershipEnd: daysAgo(10),
      assignedTrainer: "Meena Joshi",
      status: "EXPIRED" as const,
    },
    {
      id: "gm-arjun-01",
      gymId: ironForge.id,
      name: "Arjun Patel",
      phone: "919944332211",
      membershipStart: daysAgo(10),
      membershipEnd: daysFromNow(50),
      assignedTrainer: "Suresh Kumar",
      status: "ACTIVE" as const,
    },
    // Zen Fit — members
    {
      id: "gm-sneha-01",
      gymId: zenFit.id,
      name: "Sneha Kulkarni",
      phone: "919933221100",
      membershipStart: daysAgo(15),
      membershipEnd: daysFromNow(45),
      assignedTrainer: "Aisha Raut",
      status: "ACTIVE" as const,
    },
    {
      id: "gm-vikram-01",
      gymId: zenFit.id,
      name: "Vikram Bose",
      phone: "919922110099",
      membershipStart: daysAgo(45),
      membershipEnd: daysFromNow(6),
      assignedTrainer: "Aisha Raut",
      status: "AT_RISK" as const,
    },
    {
      id: "gm-pooja-01",
      gymId: zenFit.id,
      name: "Pooja Mehta",
      phone: "919911009988",
      membershipStart: daysAgo(180),
      membershipEnd: daysAgo(30),
      assignedTrainer: null,
      status: "EXPIRED" as const,
    },
    {
      id: "gm-kiran-01",
      gymId: zenFit.id,
      name: "Kiran Reddy",
      phone: "919900998877",
      membershipStart: daysAgo(5),
      membershipEnd: daysFromNow(25),
      assignedTrainer: "Aisha Raut",
      status: "ACTIVE" as const,
    },
  ];

  await Promise.all(
    memberData.map((m) =>
      prisma.gymMember.upsert({
        where: { id: m.id },
        update: {},
        create: m,
      })
    )
  );

  console.log(`  ✔ Members: ${memberData.length} seeded`);

  // ── Diet & Workout Plans ──────────────────────────────────────────────────

  const plans = [
    {
      id: "gdp-aniket-01",
      gymId: ironForge.id,
      memberId: "gm-aniket-01",
      title: "12-Week Muscle Gain Plan",
      assignedBy: "Suresh Kumar",
      details: {
        meals: [
          { time: "7:00 AM", meal: "Oats + 4 egg whites + banana", calories: "450" },
          { time: "10:30 AM", meal: "Whey protein shake + almonds", calories: "300" },
          { time: "1:00 PM", meal: "Brown rice + chicken breast + salad", calories: "650" },
          { time: "4:00 PM", meal: "Paneer sandwich + green tea", calories: "350" },
          { time: "7:30 PM", meal: "Dal + roti + vegetables", calories: "500" },
        ],
        workouts: [
          { day: "Mon", exercise: "Bench Press", sets: "4", reps: "10" },
          { day: "Mon", exercise: "Incline Dumbbell Press", sets: "3", reps: "12" },
          { day: "Wed", exercise: "Deadlift", sets: "4", reps: "8" },
          { day: "Wed", exercise: "Barbell Row", sets: "3", reps: "10" },
          { day: "Fri", exercise: "Squat", sets: "4", reps: "10" },
          { day: "Fri", exercise: "Leg Press", sets: "3", reps: "12" },
        ],
      },
    },
    {
      id: "gdp-sneha-01",
      gymId: zenFit.id,
      memberId: "gm-sneha-01",
      title: "8-Week Fat Loss & Tone",
      assignedBy: "Aisha Raut",
      details: {
        meals: [
          { time: "6:30 AM", meal: "Warm lemon water + soaked almonds", calories: "80" },
          { time: "8:00 AM", meal: "Vegetable upma + curd", calories: "320" },
          { time: "12:30 PM", meal: "Quinoa salad + grilled tofu", calories: "420" },
          { time: "4:00 PM", meal: "Fruit bowl + green tea", calories: "200" },
          { time: "7:00 PM", meal: "Soup + 2 roti + sabzi", calories: "400" },
        ],
        workouts: [
          { day: "Mon/Wed/Fri", exercise: "HIIT Circuit (20 min)", sets: "3", reps: "rounds" },
          { day: "Tue/Thu", exercise: "Yoga flow + core work", sets: "1", reps: "45 min" },
          { day: "Sat", exercise: "Long walk / light jog", sets: "1", reps: "5 km" },
        ],
      },
    },
  ];

  await Promise.all(
    plans.map((p) =>
      prisma.gymDietPlan.upsert({
        where: { id: p.id },
        update: {},
        create: p,
      })
    )
  );

  console.log(`  ✔ Diet/workout plans: ${plans.length} seeded`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
