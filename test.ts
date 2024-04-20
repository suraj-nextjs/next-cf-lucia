import { pbkdf2, pbkdf2Verify } from "./src/webcrypto-hash";

async function test() {
  const hash = await pbkdf2("test");

  console.log(hash);
}

async function test2() {
  const verify = await pbkdf2Verify(
    "djAxv+AXVJ704rtU4kDhFM4HJg9CQG1MM1Tq2gqFfUmdNHRouRoIVNXNZOdboWvVZL9zMzVl",
    "test"
  );

  console.log(verify);
}

test();

test2();
