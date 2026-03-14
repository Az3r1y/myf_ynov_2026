# Scenario Bruno - Create user -> Login -> Get profile

## 1) Prerequisites
- Start API server:
  - `cd server`
  - `yarn dev`
- In Bruno, select environment: `Local development server`

## 2) Variables used
Defined in `environments/Local development server.yml`:
- `baseUrl`
- `userEmail`
- `userPassword`
- `token`

## 3) Request order
1. `Create a user`
2. `Get an authentication token`
3. `Get current user`

## 4) Optional scripts (post-response)

### A) `Create a user` -> test status/email
```js
test("status should be 200", function () {
  expect(res.getStatus()).to.equal(200);
});

const json = res.getBody();
test("response should contain created user email", function () {
  expect(json.item.email).to.equal(bru.getEnvVar("userEmail"));
});
```

### B) `Get an authentication token` -> store token
```js
test("status should be 200", function () {
  expect(res.getStatus()).to.equal(200);
});

const json = res.getBody();
bru.setEnvVar("token", json.token);

test("token should be present", function () {
  expect(json.token).to.be.a("string");
  expect(json.token.length > 0).to.equal(true);
});
```

### C) `Get current user` -> verify identity
```js
test("status should be 200", function () {
  expect(res.getStatus()).to.equal(200);
});

const json = res.getBody();
test("current user email should match scenario userEmail", function () {
  expect(json.item.email).to.equal(bru.getEnvVar("userEmail"));
});
```

## 5) Randomized data (exercise bonus)
If you want random credentials at each run, set `userEmail` / `userPassword` in env before running requests.
