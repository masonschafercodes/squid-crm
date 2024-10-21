import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
const db = new PrismaClient();

async function main() {
  const contacts: any[] = [];
  for (let i = 0; i < 10; i++) {
    contacts.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      suffix: faker.person.suffix(),
      salutation: faker.person.prefix(),
      workEmail: faker.internet.email(),
      personalEmail: faker.internet.email(),
      workPhone: faker.phone.number(),
      personalPhone: faker.phone.number(),
      workAddress: faker.location.streetAddress(),
      personalAddress: faker.location.streetAddress(),
      jobTitle: faker.person.jobTitle(),
      backgroundInfo: faker.lorem.paragraph(),
      birthday: faker.date.birthdate(),
      userId: "cm2gx4tr50000nrjubf4uvw6t",
    });
  }

  await db.contact.createMany({
    data: contacts,
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
  });
