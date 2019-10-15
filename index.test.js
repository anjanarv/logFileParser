const { findMostVisitedIpAddress, findMostVisitedURL } = require("./index");

let testIPAddressList = [
  "203.46.78.200",
  null,
  undefined,
  "173.46.78.100",
  "100.46.78.200",
  "23.46.78.200",
  "23.46.78.200",
  "173.46.78.100",
  "173.46.78.100"
];

let testUrlList = [
  "GET /download/counter/ HTTP/1.1",
  null,
  undefined,
  "GET /newsletter/ HTTP/1.1",
  "GET /docs/manage-websites/ HTTP/1.1",
  "GET /faq/ HTTP/1.1",
  "GET /faq/ HTTP/1.1",
  "GET /faq/ HTTP/1.1",
  "GET /newsletter/ HTTP/1.1"
];

test("find most visited ip address", async () => {
  const returnedIPAddressList = findMostVisitedIpAddress(testIPAddressList);
  expect(returnedIPAddressList).toMatchSnapshot();
});

test("find most visited url patterns", async () => {
  const returnedURLList = findMostVisitedURL(testUrlList);
  expect(returnedURLList).toMatchSnapshot();
});
