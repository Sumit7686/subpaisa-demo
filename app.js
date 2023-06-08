const express = require("express");
const app = express();
var cors = require("cors");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

app.get("/data", (req, res) => {
  return res.status(200).json({ status: true });
});

// sub-paisa
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);
const crypto = require("crypto");

// const algorithm = "aes-128-cbc";
// var authKey = "x0xzPnXsgTq0QqXx";
// var authIV = "oLA38cwT6IYNGqb3";

const algorithm = "aes-128-cbc";
var authKey = "x0xzPnXsgTq0QqXx";
var authIV = "oLA38cwT6IYNGqb3";

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(authKey), authIV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64");
}

function decrypt(text) {
  // let iv = Buffer.from(text.iv, 'hex');
  // let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(authKey),
    authIV
  );
  let decrypted = decipher.update(Buffer.from(text, "base64"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

//generate random string
function randomStr(len, arr) {
  var ans = "";
  for (var i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

// server your css as static
app.use(express.static(__dirname));

app.get("/initPgReq", (req, res) => {
  var payerName = "Nasir Salmani";
  var payerEmail = "nasir.salmani@sabpaisa.in";
  var payerMobile = "9821890122";
  var clientTxnId = randomStr(20, "12345abcde");
  var amount = 1;
  var clientCode = "LPSD1";
  var transUserName = "Abh789@sp";
  var transUserPassword = "P8c3WQ7ei";
  const callbackUrl = "http://127.0.0.1:5005/getPgRes";
  // const callbackUrl = "http://127.0.0.1:5005/sub-paisa/callback-url";
  // const callbackUrl = "https://api.bigpremierleague.com/sub-paisa/callback-url";
  const channelId = "W";
  // const spURL =
  //   "https://txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId"; // live url
  // const spURL =
  //   "https://txnenquiry.sabpaisa.in/SPTxtnEnquiry/getTxnStatusByClientxnId"; // test url
  const spURL = "https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1";

  var mcc = "5666";
  var transData = new Date();

  var stringForRequest =
    "payerName=" +
    payerName +
    "&payerEmail=" +
    payerEmail +
    "&payerMobile=" +
    payerMobile +
    "&clientTxnId=" +
    clientTxnId +
    "&amount=" +
    amount +
    "&clientCode=" +
    clientCode +
    "&transUserName=" +
    transUserName +
    "&transUserPassword=" +
    transUserPassword +
    "&callbackUrl=" +
    callbackUrl +
    "&channelId=" +
    channelId +
    "&mcc=" +
    mcc +
    "&transData=" +
    transData;

  // console.log("stringForRequest :: ", stringForRequest);

  var encryptedStringForRequest = encrypt(stringForRequest);
  console.log("encryptedStringForRequest :: " + encryptedStringForRequest);

  const formData = {
    spURL: spURL,
    encData: encryptedStringForRequest,
    clientCode: clientCode,
  };

  res.render(__dirname + "/pg-form-request.html", { formData: formData });
});

app.post("/getPgRes", (req, res) => {
  let body = "";
  console.log("1 ---", res);
  req.on("data", (data) => {
    console.log("2");
    body += data;
    console.log("sabpaisa response :: " + body);
    var decryptedResponse = decrypt(
      decodeURIComponent(body.split("&")[1].split("=")[1])
    );
    console.log("decryptedResponse :: " + decryptedResponse);

    res.render(__dirname + "/pg-form-response.html", {
      decryptedResponse: decryptedResponse,
    });
  });
});
// end sub-paisa

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});
