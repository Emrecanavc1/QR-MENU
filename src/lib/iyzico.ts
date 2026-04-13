// İyzico ödeme entegrasyonu
// Gerçek implementasyon için iyzipay npm paketi kullanılır
// npm install iyzipay

const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
const IYZICO_API_KEY = process.env.IYZICO_API_KEY ?? "";
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY ?? "";

export interface IyzicoPaymentRequest {
  price: string;
  paidPrice: string;
  currency: "TRY";
  installment: "1";
  basketId: string;
  paymentChannel: "WEB";
  paymentGroup: "PRODUCT";
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: { id: string; name: string; category1: string; itemType: "PHYSICAL"; price: string }[];
}

export async function initiateIyzicoPayment(orderId: string, amount: number, callbackUrl: string) {
  // İyzico CheckoutForm initialize
  // Gerçek implementasyon iyzipay SDK ile yapılır
  // Bu placeholder implementasyondur
  return {
    status: "success",
    token: `iyzico-token-${orderId}`,
    checkoutFormContent: `<form><!-- İyzico form ${orderId} --></form>`,
    tokenExpireTime: 1800,
  };
}

export async function verifyIyzicoPayment(token: string) {
  // Token ile ödeme doğrulama
  return {
    status: "success",
    paymentId: `pay-${Date.now()}`,
    price: "100.00",
    paidPrice: "100.00",
  };
}
