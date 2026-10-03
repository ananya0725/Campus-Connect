import supertest from 'supertest';
import app from './src/server.js';

const request = supertest(app);

const runTests = async () => {
  try {
    console.log("=== Starting Backend API Tests ===");

    // 1️⃣ USER LOGIN
    const userLogin = await request.post('/api/auth/login').send({
      email: "user1@gmail.com",
      password: "123456"
    });
    const userToken = userLogin.body.token;
    if (!userToken) return console.log("❌ User login failed");
    console.log("✅ User login successful");

    // 2️⃣ ORGANIZER LOGIN
    const organizerLogin = await request.post('/api/auth/login').send({
      email: "ananya@gmail.com",
      password: "123456"
    });
    const organizerToken = organizerLogin.body.token;
    if (!organizerToken) return console.log("❌ Organizer login failed");
    console.log("✅ Organizer login successful");

    // 3️⃣ ADMIN LOGIN
    const adminLogin = await request.post('/api/auth/login').send({
      email: "admin@gmail.com",
      password: "123456"
    });
    const adminToken = adminLogin.body.token;
    if (!adminToken) return console.log("❌ Admin login failed");
    console.log("✅ Admin login successful");

    // 4️⃣ CREATE EVENT
    let res = await request
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: "Organizer Event",
        description: "Created by organizer",
        date: "2026-04-05",
        location: "Main Hall",
        category: "Workshop"
      });

    const eventId = res.body?.event?._id;
    if (!eventId) return console.log("❌ Event creation failed");

    console.log("✅ Event created:", eventId);

    // 5️⃣ ADMIN APPROVES EVENT
    await request
      .post(`/api/admin/events/${eventId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log("✅ Event approved by admin");

    // 6️⃣ REGISTER
    res = await request
      .post(`/api/registrations/${eventId}/register`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ tickets: 2 });

    const registrationId = res.body?._id || res.body?.registration?._id;
    console.log("REG:", res.status, res.body);

    // 7️⃣ REVIEW
    res = await request
      .post(`/api/reviews/${eventId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: "Great event!" });

    const reviewId = res.body?._id || res.body?.review?._id;
    console.log("REVIEW:", res.status, res.body);

    // 8️⃣ CLEANUP
    if (reviewId) {
      res = await request
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`);
      console.log("DELETE review:", res.status);
    }

    if (registrationId) {
      res = await request
        .delete(`/api/registrations/${registrationId}`)
        .set('Authorization', `Bearer ${userToken}`);
      console.log("DELETE registration:", res.status);
    }

    res = await request
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${organizerToken}`);
    console.log("DELETE event:", res.status);

    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY");

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
};

runTests();