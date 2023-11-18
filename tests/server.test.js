const server = require("../src/server");
const supertest = require("supertest");

describe("Server ok", () => {
  it("Debe responder con un status 200 al hacer una req GET a '/'", async () => {
    const response = await supertest(server).get("/teams");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Debe responder con un status 404 al hacer un req GET a '/uruguay'", async () => {
    const response = await supertest(server).get("/uruguay");
    expect(response.statusCode).toEqual(404);
  });

  it("Debe enviar información de los drivers al hacer req GET a '/drivers'", async () => {
    const response = await supertest(server).get("/drivers");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Debe devolver un conductor específico por ID", async () => {
    const driverId = 1;
    const response = await supertest(server).get(`/drivers/${driverId}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.id).toBe(driverId);
  });
});
