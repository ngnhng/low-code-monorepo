import { faker } from "@faker-js/faker";
import { ColumnDef } from "types/table-data";

export const columns: ColumnDef[] = [
  {
    id: "id",
    label: "ID",
    name: "",
    type: "number",
    isActive: true,
    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "name",
    label: "Name",
    name: "",
    type: "text",
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "username",
    label: "Username",
    name: "",

    type: "text",
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "phone",
    label: "Phone",
    name: "",

    type: "text",
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "website",
    label: "Website",
    type: "text",
    name: "",

    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
];

export const addresses: ColumnDef[] = [
  {
    id: "id",
    label: "ID",
    type: "number",
    isActive: true,
    name: "",

    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "city",
    label: "City",
    type: "text",
    name: "",

    isActive: true,
    isPrimaryKey: false,
    isForeignKey: true,
    foreignKeyId: "",
  },
  {
    id: "country",
    label: "Country",
    type: "text",
    name: "",

    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "userID",
    label: "User",
    type: "number",
    name: "",

    isActive: true,
    isPrimaryKey: false,
    isForeignKey: true,
    foreignKeyId: "id",
  },
];

export const posts: ColumnDef[] = [
  {
    id: "id",
    label: "ID",
    type: "number",
    name: "",

    isActive: true,
    isPrimaryKey: true,
    isForeignKey: false,
    foreignKeyId: "",
  },
  {
    id: "title",
    label: "Title",
    type: "text",
    name: "",

    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignKeyId: "",
  },
];

export function createRandomAddresses() {
  return {
    city: faker.location.city(),
    country: faker.location.country(),
  };
}

export function createRandomPosts() {
  return {
    title: faker.lorem.sentence(),
  };
}

export function createRandomUser() {
  return {
    name: faker.person.fullName(),
    username: faker.person.lastName(),
    phone: faker.phone.number(),
    website: faker.internet.domainName(),
  };
}

export function generateMockAddresses(size: number) {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomAddresses(),
    });
  }

  return data;
}

export function generateMockPosts(size: number) {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomPosts(),
    });
  }

  return data;
}

export function generateMockData(size: number): any[] {
  const data: any = [];
  for (let i = 1; i < size; i++) {
    data.push({
      id: i,
      ...createRandomUser(),
    });
  }

  return data;
}
